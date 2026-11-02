"""Importa CSVs públicos da PokéAPI de um commit fixo, sem dependências externas."""

import csv
import hashlib
import json
import os
from pathlib import Path
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor

PROJECT_ROOT = Path(__file__).resolve().parents[1]
MAX_SPECIES_ID = 1025
SHARD_SIZE = 50
DOWNLOAD_WORKERS = 6
DOWNLOAD_ATTEMPTS = 4
DOWNLOAD_TIMEOUT_SECONDS = 90

SOURCE_REVISION = os.environ.get(
    "POKEAPI_REVISION", "e5b79b2e15d7c50735a945936afd4cd1cfd94eae"
)
CACHE_DIRECTORY = PROJECT_ROOT / ".cache" / SOURCE_REVISION
OUTPUT_DIRECTORY = PROJECT_ROOT / "web" / "data"
# Tabelas da revisão fixa, na mesma ordem usada para registrar os hashes de origem.
TABLES = (
    "pokemon",
    "pokemon_species",
    "pokemon_species_names",
    "pokemon_types",
    "pokemon_stats",
    "stats",
    "pokemon_abilities",
    "abilities",
    "ability_names",
    "ability_prose",
    "pokemon_forms",
    "pokemon_form_names",
    "pokemon_form_types",
    "pokemon_species_flavor_text",
    "pokemon_evolution",
    "evolution_triggers",
    "items",
    "item_names",
    "locations",
    "location_names",
    "location_areas",
    "location_area_prose",
    "encounters",
    "encounter_slots",
    "encounter_methods",
    "encounter_method_prose",
    "encounter_condition_value_map",
    "encounter_condition_values",
    "encounter_condition_value_prose",
    "pokemon_moves",
    "moves",
    "move_names",
    "move_effect_prose",
    "move_damage_classes",
    "pokemon_move_methods",
    "version_groups",
    "versions",
    "version_names",
    "pokedexes",
    "pokemon_dex_numbers",
    "type_efficacy",
    "types",
    "egg_groups",
    "pokemon_egg_groups",
    "languages",
)


def download(name):
    """Reutiliza o cache da revisão ou baixa o CSV com até quatro tentativas."""
    path = CACHE_DIRECTORY / f"{name}.csv"
    if path.exists():
        return (name, path.stat().st_size)
    url = f"https://raw.githubusercontent.com/PokeAPI/pokeapi/{SOURCE_REVISION}/data/v2/csv/{name}.csv"
    for attempt in range(DOWNLOAD_ATTEMPTS):
        try:
            with urllib.request.urlopen(
                url, timeout=DOWNLOAD_TIMEOUT_SECONDS
            ) as response:
                content = response.read()
            temporary = path.with_suffix(".tmp")
            temporary.write_bytes(content)
            temporary.replace(path)
            return (name, len(content))
        except Exception:
            if attempt == DOWNLOAD_ATTEMPTS - 1:
                raise
            time.sleep(1 + attempt)


def read_rows(name):
    """Percorre o CSV sem carregar uma segunda cópia completa em memória."""
    with (CACHE_DIRECTORY / f"{name}.csv").open(encoding="utf-8", newline="") as stream:
        yield from csv.DictReader(stream)


def optional_integer(value):
    """Distingue campo ausente de zero, que é um valor válido na fonte."""
    return int(value) if value else None


def write_json(name, value):
    """Mantém a serialização compacta e substitui o arquivo somente após gravá-lo."""
    path = OUTPUT_DIRECTORY / name
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(".tmp")
    temporary.write_text(
        json.dumps(value, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    temporary.replace(path)


def localized(table, id_column, value_column="name", language=9):
    """Seleciona o idioma da fonte sem criar traduções para campos ausentes."""
    return {
        int(row[id_column]): row[value_column]
        for row in read_rows(table)
        if int(row.get("local_language_id", 0)) == language
    }


def main():
    """Conclui os downloads antes de iniciar qualquer transformação do snapshot."""
    CACHE_DIRECTORY.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=DOWNLOAD_WORKERS) as pool:
        for name, size in pool.map(download, TABLES):
            print(f"{name}: {size:,} bytes", flush=True)
    import_data()


# Transformações: espécie → variedade → forma, com cada ID preservado.
def build_species():
    """Cria as espécies nacionais e os campos que serão preenchidos nas próximas etapas."""
    species_names = localized("pokemon_species_names", "pokemon_species_id")
    genera = localized("pokemon_species_names", "pokemon_species_id", "genus")
    species = {}
    for row in read_rows("pokemon_species"):
        species_id = int(row["id"])
        if species_id > MAX_SPECIES_ID:
            continue
        species[species_id] = {
            "id": species_id,
            "name": species_names.get(species_id, row["identifier"]),
            "slug": row["identifier"],
            "genus": genera.get(species_id, ""),
            "generation": int(row["generation_id"]),
            "parent": optional_integer(row["evolves_from_species_id"]),
            "chain": int(row["evolution_chain_id"]),
            "legendary": row["is_legendary"] == "1",
            "mythical": row["is_mythical"] == "1",
            "baby": row["is_baby"] == "1",
            "captureRate": optional_integer(row["capture_rate"]),
            "genderRate": optional_integer(row["gender_rate"]),
            "hatchCounter": optional_integer(row["hatch_counter"]),
            "baseHappiness": optional_integer(row["base_happiness"]),
            "eggGroups": [],
            "dexes": [],
            "flavor": [],
            "evolutions": [],
            "varieties": [],
        }
    return species


def build_varieties(species):
    """Relaciona variedades às espécies e preenche tipos, atributos e habilidades."""
    pokemon = {}
    for row in read_rows("pokemon"):
        species_id, variety_id = (int(row["species_id"]), int(row["id"]))
        if species_id not in species:
            continue
        pokemon[variety_id] = {
            "id": variety_id,
            "species": species_id,
            "slug": row["identifier"],
            "height": int(row["height"]) / 10,
            "weight": int(row["weight"]) / 10,
            "experience": optional_integer(row["base_experience"]),
            "default": row["is_default"] == "1",
            "types": [],
            "stats": [0] * 6,
            "effort": [0] * 6,
            "abilities": [],
            "moves": [],
            "encounters": [],
        }
        species[species_id]["varieties"].append(pokemon[variety_id])
    for row in read_rows("pokemon_types"):
        variety_id = int(row["pokemon_id"])
        if variety_id in pokemon:
            pokemon[variety_id]["types"].append(int(row["type_id"]))
    for row in read_rows("pokemon_stats"):
        variety_id, stat = (int(row["pokemon_id"]), int(row["stat_id"]))
        if variety_id in pokemon and 1 <= stat <= 6:
            pokemon[variety_id]["stats"][stat - 1] = int(row["base_stat"])
            pokemon[variety_id]["effort"][stat - 1] = int(row["effort"])
    for row in read_rows("pokemon_abilities"):
        variety_id = int(row["pokemon_id"])
        if variety_id in pokemon:
            pokemon[variety_id]["abilities"].append(
                [int(row["ability_id"]), int(row["is_hidden"])]
            )
    return pokemon


def attach_species_details(species):
    """Preserva descrições por jogo e idioma, criação e requisitos de evolução."""
    for row in read_rows("pokemon_species_flavor_text"):
        species_id = int(row["species_id"])
        if species_id in species:
            species[species_id]["flavor"].append(
                [
                    int(row["version_id"]),
                    int(row["language_id"]),
                    " ".join(row["flavor_text"].split()),
                ]
            )
    for row in read_rows("pokemon_egg_groups"):
        species_id = int(row["species_id"])
        if species_id in species:
            species[species_id]["eggGroups"].append(int(row["egg_group_id"]))
    for row in read_rows("pokemon_dex_numbers"):
        species_id = int(row["species_id"])
        if species_id in species:
            species[species_id]["dexes"].append(
                [int(row["pokedex_id"]), int(row["pokedex_number"])]
            )
    for row in read_rows("pokemon_evolution"):
        species_id = int(row["evolved_species_id"])
        if species_id in species:
            species[species_id]["evolutions"].append(
                {
                    key: int(value) if value.lstrip("-").isdigit() else value
                    for key, value in row.items()
                    if value != "" and key not in ("id", "evolved_species_id")
                }
            )


def attach_learnsets(pokemon):
    """Mantém cada aprendizado no seu grupo de versões, método e nível."""
    for row in read_rows("pokemon_moves"):
        variety_id = int(row["pokemon_id"])
        if variety_id in pokemon:
            pokemon[variety_id]["moves"].append(
                [
                    int(row["version_group_id"]),
                    int(row["move_id"]),
                    int(row["pokemon_move_method_id"]),
                    int(row["level"]),
                    optional_integer(row["mastery"]),
                ]
            )


def attach_encounters(pokemon):
    """Combina encontros com slots e condições sem somar chances de contextos distintos."""
    slots = {int(row["id"]): row for row in read_rows("encounter_slots")}
    encounter_conditions = {}
    for row in read_rows("encounter_condition_value_map"):
        encounter_conditions.setdefault(int(row["encounter_id"]), []).append(
            int(row["encounter_condition_value_id"])
        )
    for row in read_rows("encounters"):
        variety_id = int(row["pokemon_id"])
        if variety_id in pokemon:
            slot = slots[int(row["encounter_slot_id"])]
            pokemon[variety_id]["encounters"].append(
                [
                    int(row["version_id"]),
                    int(row["location_area_id"]),
                    int(slot["encounter_method_id"]),
                    int(row["min_level"]),
                    int(row["max_level"]),
                    optional_integer(slot["rarity"]),
                    encounter_conditions.get(int(row["id"]), []),
                ]
            )


def build_catalog(species, pokemon):
    """Cria uma entrada por forma, preservando os IDs de espécie e variedade."""
    form_names = localized("pokemon_form_names", "pokemon_form_id", "form_name")
    full_form_names = localized("pokemon_form_names", "pokemon_form_id", "pokemon_name")
    form_types = {}
    for row in read_rows("pokemon_form_types"):
        form_types.setdefault(int(row["pokemon_form_id"]), []).append(
            int(row["type_id"])
        )
    catalog = []
    for row in read_rows("pokemon_forms"):
        variety_id, form_id = (int(row["pokemon_id"]), int(row["id"]))
        if variety_id not in pokemon:
            continue
        variety, species_record = (
            pokemon[variety_id],
            species[pokemon[variety_id]["species"]],
        )
        form = (
            form_names.get(form_id) or row["form_identifier"].replace("-", " ").title()
        )
        default = variety["default"] and row["is_default"] == "1"
        catalog.append(
            {
                "id": form_id,
                "pokemon": variety_id,
                "species": species_record["id"],
                "slug": row["identifier"],
                "name": species_record["name"],
                "form": form,
                "label": full_form_names.get(form_id)
                or species_record["name"] + (" · " + form if form else ""),
                "default": default,
                "battleOnly": row["is_battle_only"] == "1",
                "mega": row["is_mega"] == "1",
                "generation": species_record["generation"],
                "introduced": int(row["introduced_in_version_group_id"]),
                "types": form_types.get(form_id, variety["types"]),
                "stats": variety["stats"],
                "legendary": species_record["legendary"],
                "mythical": species_record["mythical"],
                "baby": species_record["baby"],
                "chain": species_record["chain"],
            }
        )
    catalog.sort(
        key=lambda form_record: (
            form_record["species"],
            not form_record["default"],
            form_record["id"],
        )
    )
    return catalog


# Dicionários compartilhados: jogos, idiomas, golpes, locais e tipos.
def build_reference():
    """Resolve nomes e efeitos de referência sem alterar as chaves utilizadas pela interface."""
    ability_names = localized("ability_names", "ability_id")
    ability_effects = localized("ability_prose", "ability_id", "effect")
    abilities = {
        int(row["id"]): {
            "name": ability_names.get(int(row["id"]), row["identifier"]),
            "effect": ability_effects.get(int(row["id"]), ""),
        }
        for row in read_rows("abilities")
    }
    move_names = localized("move_names", "move_id")
    move_effects = localized("move_effect_prose", "move_effect_id", "short_effect")
    moves = {
        int(row["id"]): {
            "name": move_names.get(int(row["id"]), row["identifier"]),
            "type": int(row["type_id"]),
            "power": optional_integer(row["power"]),
            "accuracy": optional_integer(row["accuracy"]),
            "pp": optional_integer(row["pp"]),
            "priority": int(row["priority"]),
            "class": int(row["damage_class_id"]),
            "effect": move_effects.get(optional_integer(row["effect_id"]), "").replace(
                "$effect_chance", row["effect_chance"]
            ),
        }
        for row in read_rows("moves")
    }
    location_names = localized("location_names", "location_id")
    area_names = localized("location_area_prose", "location_area_id")
    areas = {
        int(row["id"]): {
            "location": location_names.get(
                int(row["location_id"]), str(row["location_id"])
            ),
            "area": area_names.get(int(row["id"]))
            or row["identifier"].replace("-", " "),
        }
        for row in read_rows("location_areas")
    }
    version_names = localized("version_names", "version_id")
    versions = {
        int(row["id"]): {
            "name": version_names.get(int(row["id"]), row["identifier"]),
            "group": int(row["version_group_id"]),
        }
        for row in read_rows("versions")
    }
    counts = {}
    for value in versions.values():
        counts[value["name"]] = counts.get(value["name"], 0) + 1
    for row in read_rows("versions"):
        version_id = int(row["id"])
        if counts[versions[version_id]["name"]] > 1:
            versions[version_id]["name"] += " · " + row["identifier"]
    version_groups = {
        int(row["id"]): {
            "name": row["identifier"].replace("-", " ").title(),
            "generation": int(row["generation_id"]),
            "order": int(row["order"]),
        }
        for row in read_rows("version_groups")
    }
    types = {
        int(row["id"]): row["identifier"]
        for row in read_rows("types")
        if int(row["id"]) <= 18
    }
    efficacy = {
        f"{row['damage_type_id']}/{row['target_type_id']}": int(row["damage_factor"])
        / 100
        for row in read_rows("type_efficacy")
        if int(row["damage_type_id"]) <= 18 and int(row["target_type_id"]) <= 18
    }
    reference = {
        "abilities": abilities,
        "moves": moves,
        "areas": areas,
        "versions": versions,
        "versionGroups": version_groups,
        "types": types,
        "efficacy": efficacy,
        "locations": location_names,
        "items": localized("item_names", "item_id"),
        "encounterMethods": {
            **{
                int(row["id"]): row["identifier"].replace("-", " ")
                for row in read_rows("encounter_methods")
            },
            **localized("encounter_method_prose", "encounter_method_id"),
        },
        "encounterConditions": {
            **{
                int(row["id"]): row["identifier"].replace("-", " ")
                for row in read_rows("encounter_condition_values")
            },
            **localized(
                "encounter_condition_value_prose", "encounter_condition_value_id"
            ),
        },
        "moveMethods": {
            int(row["id"]): row["identifier"]
            for row in read_rows("pokemon_move_methods")
        },
        "evolutionTriggers": {
            int(row["id"]): row["identifier"] for row in read_rows("evolution_triggers")
        },
        "eggGroups": {
            int(row["id"]): row["identifier"] for row in read_rows("egg_groups")
        },
        "pokedexes": {
            int(row["id"]): row["identifier"] for row in read_rows("pokedexes")
        },
        "languages": {
            int(row["id"]): row["identifier"] for row in read_rows("languages")
        },
    }
    return reference


# Auditoria e gravação: hashes verificam bytes, não a interpretação factual dos jogos.
def validate_snapshot(species, catalog):
    """Recusa catálogo parcial ou IDs de formas repetidos antes da gravação."""
    assert (
        len(species) == MAX_SPECIES_ID
    ), f"Esperadas 1025 espécies; recebido {len(species)}"
    assert {f["species"] for f in catalog if f["default"]} == set(
        range(1, MAX_SPECIES_ID + 1)
    )
    assert len({f["id"] for f in catalog}) == len(catalog)


def write_snapshot(species, pokemon, catalog, reference):
    """Grava o conjunto e seu manifesto; a substituição é atômica por arquivo, não por lote."""
    write_json("catalog.json", catalog)
    write_json("reference.json", reference)
    for start in range(1, MAX_SPECIES_ID + 1, SHARD_SIZE):
        write_json(
            f"species/{(start - 1) // SHARD_SIZE:02d}.json",
            {
                species_id: species[species_id]
                for species_id in range(
                    start, min(start + SHARD_SIZE, MAX_SPECIES_ID + 1)
                )
            },
        )
    manifest = {
        "schemaVersion": 1,
        "source": "https://github.com/PokeAPI/pokeapi",
        "revision": SOURCE_REVISION,
        "speciesCount": len(species),
        "pokemonCount": len(pokemon),
        "formCount": len(catalog),
        "descriptionCount": sum((len(s["flavor"]) for s in species.values())),
        "encounterCount": sum((len(p["encounters"]) for p in pokemon.values())),
        "learnsetCount": sum((len(p["moves"]) for p in pokemon.values())),
        "shardSize": SHARD_SIZE,
        "sourceFiles": {
            name: hashlib.sha256(
                (CACHE_DIRECTORY / f"{name}.csv").read_bytes()
            ).hexdigest()
            for name in TABLES
        },
        "files": {
            str(p.relative_to(OUTPUT_DIRECTORY)): hashlib.sha256(
                p.read_bytes()
            ).hexdigest()
            for p in sorted(OUTPUT_DIRECTORY.rglob("*.json"))
            if p.name != "manifest.json"
        },
    }
    write_json("manifest.json", manifest)
    print(
        json.dumps(
            {key: value for key, value in manifest.items() if key.endswith("Count")},
            indent=2,
        ),
        flush=True,
    )


def import_data():
    """Orquestra etapas independentes para tornar as relações da base auditáveis."""
    species = build_species()
    pokemon = build_varieties(species)
    attach_species_details(species)
    attach_learnsets(pokemon)
    attach_encounters(pokemon)
    catalog = build_catalog(species, pokemon)
    reference = build_reference()
    validate_snapshot(species, catalog)
    write_snapshot(species, pokemon, catalog, reference)


if __name__ == "__main__":
    main()
