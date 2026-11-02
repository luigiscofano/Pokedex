"""Importa CSVs públicos da PokéAPI de um commit fixo, sem dependências externas."""
import csv
import hashlib
import io
import json
import os
from pathlib import Path
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = Path(__file__).resolve().parents[1]
REVISION = os.environ.get('POKEAPI_REVISION', 'e5b79b2e15d7c50735a945936afd4cd1cfd94eae')
CACHE = ROOT / '.cache' / REVISION
OUT = ROOT / 'web' / 'data'
TABLES = '''pokemon pokemon_species pokemon_species_names pokemon_types pokemon_stats stats
pokemon_abilities abilities ability_names ability_prose pokemon_forms pokemon_form_names pokemon_form_types
pokemon_species_flavor_text pokemon_evolution evolution_triggers items item_names locations location_names
location_areas location_area_prose encounters encounter_slots encounter_methods encounter_method_prose
encounter_condition_value_map encounter_condition_values encounter_condition_value_prose
pokemon_moves moves move_names move_effect_prose move_damage_classes pokemon_move_methods
version_groups versions version_names pokedexes pokemon_dex_numbers type_efficacy types
egg_groups pokemon_egg_groups languages'''.split()

def download(name):
    path = CACHE / f'{name}.csv'
    if path.exists(): return name, path.stat().st_size
    url = f'https://raw.githubusercontent.com/PokeAPI/pokeapi/{REVISION}/data/v2/csv/{name}.csv'
    for attempt in range(4):
        try:
            with urllib.request.urlopen(url, timeout=90) as response:
                content = response.read()
            temporary = path.with_suffix('.tmp')
            temporary.write_bytes(content)
            temporary.replace(path)
            return name, len(content)
        except Exception:
            if attempt == 3: raise
            time.sleep(1 + attempt)

def rows(name):
    with (CACHE / f'{name}.csv').open(encoding='utf-8', newline='') as stream:
        yield from csv.DictReader(stream)

def number(value):
    return int(value) if value else None

def write(name, value):
    path = OUT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix('.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    temporary.replace(path)

def localized(table, id_column, value_column='name', language=9):
    return {int(r[id_column]): r[value_column] for r in rows(table) if int(r.get('local_language_id', 0)) == language}

def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=6) as pool:
        for name, size in pool.map(download, TABLES):
            print(f'{name}: {size:,} bytes', flush=True)
    # O processamento fica separado do download para permitir reconstrução sem rede.
    import_data()

def import_data():
    species_names = localized('pokemon_species_names', 'pokemon_species_id')
    genera = localized('pokemon_species_names', 'pokemon_species_id', 'genus')
    species = {}
    for r in rows('pokemon_species'):
        sid = int(r['id'])
        if sid > 1025: continue
        species[sid] = {
            'id': sid, 'name': species_names.get(sid, r['identifier']), 'slug': r['identifier'],
            'genus': genera.get(sid, ''), 'generation': int(r['generation_id']),
            'parent': number(r['evolves_from_species_id']), 'chain': int(r['evolution_chain_id']),
            'legendary': r['is_legendary'] == '1', 'mythical': r['is_mythical'] == '1',
            'baby': r['is_baby'] == '1', 'captureRate': number(r['capture_rate']),
            'genderRate': number(r['gender_rate']), 'hatchCounter': number(r['hatch_counter']),
            'baseHappiness': number(r['base_happiness']), 'eggGroups': [], 'dexes': [],
            'flavor': [], 'evolutions': [], 'varieties': []
        }
    pokemon = {}
    for r in rows('pokemon'):
        sid, pid = int(r['species_id']), int(r['id'])
        if sid not in species: continue
        pokemon[pid] = {
            'id': pid, 'species': sid, 'slug': r['identifier'], 'height': int(r['height']) / 10,
            'weight': int(r['weight']) / 10, 'experience': number(r['base_experience']),
            'default': r['is_default'] == '1', 'types': [], 'stats': [0]*6,
            'effort': [0]*6, 'abilities': [], 'moves': [], 'encounters': []
        }
        species[sid]['varieties'].append(pokemon[pid])
    for r in rows('pokemon_types'):
        pid = int(r['pokemon_id'])
        if pid in pokemon: pokemon[pid]['types'].append(int(r['type_id']))
    for r in rows('pokemon_stats'):
        pid, stat = int(r['pokemon_id']), int(r['stat_id'])
        if pid in pokemon and 1 <= stat <= 6:
            pokemon[pid]['stats'][stat-1] = int(r['base_stat'])
            pokemon[pid]['effort'][stat-1] = int(r['effort'])
    for r in rows('pokemon_abilities'):
        pid = int(r['pokemon_id'])
        if pid in pokemon: pokemon[pid]['abilities'].append([int(r['ability_id']), int(r['is_hidden'])])
    for r in rows('pokemon_species_flavor_text'):
        sid = int(r['species_id'])
        if sid in species:
            species[sid]['flavor'].append([int(r['version_id']), int(r['language_id']), ' '.join(r['flavor_text'].split())])
    for r in rows('pokemon_egg_groups'):
        sid = int(r['species_id'])
        if sid in species: species[sid]['eggGroups'].append(int(r['egg_group_id']))
    for r in rows('pokemon_dex_numbers'):
        sid = int(r['species_id'])
        if sid in species: species[sid]['dexes'].append([int(r['pokedex_id']), int(r['pokedex_number'])])
    for r in rows('pokemon_evolution'):
        sid = int(r['evolved_species_id'])
        if sid in species:
            species[sid]['evolutions'].append({k: (int(v) if v.lstrip('-').isdigit() else v) for k,v in r.items() if v != '' and k not in ('id', 'evolved_species_id')})
    # Aprende-se por versão do jogo: nenhuma união silenciosa entre gerações.
    for r in rows('pokemon_moves'):
        pid = int(r['pokemon_id'])
        if pid in pokemon:
            pokemon[pid]['moves'].append([int(r['version_group_id']), int(r['move_id']), int(r['pokemon_move_method_id']), int(r['level']), number(r['mastery'])])
    slots = {int(r['id']): r for r in rows('encounter_slots')}
    encounter_conditions = {}
    for r in rows('encounter_condition_value_map'):
        encounter_conditions.setdefault(int(r['encounter_id']), []).append(int(r['encounter_condition_value_id']))
    for r in rows('encounters'):
        pid = int(r['pokemon_id'])
        if pid in pokemon:
            slot = slots[int(r['encounter_slot_id'])]
            pokemon[pid]['encounters'].append([int(r['version_id']), int(r['location_area_id']), int(slot['encounter_method_id']), int(r['min_level']), int(r['max_level']), number(slot['rarity']), encounter_conditions.get(int(r['id']), [])])
    form_names = localized('pokemon_form_names', 'pokemon_form_id', 'form_name')
    full_form_names = localized('pokemon_form_names', 'pokemon_form_id', 'pokemon_name')
    form_types = {}
    for r in rows('pokemon_form_types'):
        form_types.setdefault(int(r['pokemon_form_id']), []).append(int(r['type_id']))
    catalog = []
    for r in rows('pokemon_forms'):
        pid, fid = int(r['pokemon_id']), int(r['id'])
        if pid not in pokemon: continue
        p, s = pokemon[pid], species[pokemon[pid]['species']]
        form = form_names.get(fid) or r['form_identifier'].replace('-', ' ').title()
        default = p['default'] and r['is_default'] == '1'
        catalog.append({
            'id': fid, 'pokemon': pid, 'species': s['id'], 'slug': r['identifier'],
            'name': s['name'], 'form': form, 'label': full_form_names.get(fid) or (s['name'] + (' · '+form if form else '')),
            'default': default, 'battleOnly': r['is_battle_only'] == '1', 'mega': r['is_mega'] == '1',
            'generation': s['generation'], 'introduced': int(r['introduced_in_version_group_id']),
            'types': form_types.get(fid, p['types']), 'stats': p['stats'],
            'legendary': s['legendary'], 'mythical': s['mythical'], 'baby': s['baby'], 'chain': s['chain']
        })
    catalog.sort(key=lambda f: (f['species'], not f['default'], f['id']))
    ability_names = localized('ability_names', 'ability_id')
    ability_effects = localized('ability_prose', 'ability_id', 'effect')
    abilities = {int(r['id']): {'name': ability_names.get(int(r['id']), r['identifier']), 'effect': ability_effects.get(int(r['id']), '')} for r in rows('abilities')}
    move_names = localized('move_names', 'move_id')
    move_effects = localized('move_effect_prose', 'move_effect_id', 'short_effect')
    moves = {int(r['id']): {'name': move_names.get(int(r['id']), r['identifier']), 'type': int(r['type_id']), 'power': number(r['power']), 'accuracy': number(r['accuracy']), 'pp': number(r['pp']), 'priority': int(r['priority']), 'class': int(r['damage_class_id']), 'effect': move_effects.get(number(r['effect_id']), '').replace('$effect_chance', r['effect_chance'])} for r in rows('moves')}
    location_names = localized('location_names', 'location_id')
    area_names = localized('location_area_prose', 'location_area_id')
    areas = {int(r['id']): {'location': location_names.get(int(r['location_id']), str(r['location_id'])), 'area': area_names.get(int(r['id'])) or r['identifier'].replace('-', ' ')} for r in rows('location_areas')}
    version_names = localized('version_names', 'version_id')
    versions = {int(r['id']): {'name': version_names.get(int(r['id']), r['identifier']), 'group': int(r['version_group_id'])} for r in rows('versions')}
    version_groups = {int(r['id']): {'name': r['identifier'].replace('-', ' ').title(), 'generation': int(r['generation_id']), 'order': int(r['order'])} for r in rows('version_groups')}
    types = {int(r['id']): r['identifier'] for r in rows('types') if int(r['id']) <= 18}
    efficacy = {f"{r['damage_type_id']}/{r['target_type_id']}": int(r['damage_factor']) / 100 for r in rows('type_efficacy') if int(r['damage_type_id']) <= 18 and int(r['target_type_id']) <= 18}
    reference = {
        'abilities': abilities, 'moves': moves, 'areas': areas, 'versions': versions, 'versionGroups': version_groups,
        'types': types, 'efficacy': efficacy, 'locations': location_names,
        'items': localized('item_names', 'item_id'),
        'encounterMethods': localized('encounter_method_prose', 'encounter_method_id'),
        'encounterConditions': localized('encounter_condition_value_prose', 'encounter_condition_value_id'),
        'moveMethods': {int(r['id']): r['identifier'] for r in rows('pokemon_move_methods')},
        'evolutionTriggers': {int(r['id']): r['identifier'] for r in rows('evolution_triggers')},
        'eggGroups': {int(r['id']): r['identifier'] for r in rows('egg_groups')},
        'pokedexes': {int(r['id']): r['identifier'] for r in rows('pokedexes')},
        'languages': {int(r['id']): r['identifier'] for r in rows('languages')}
    }
    assert len(species) == 1025, f'Esperadas 1025 espécies; recebido {len(species)}'
    assert {f['species'] for f in catalog if f['default']} == set(range(1, 1026))
    assert len({f['id'] for f in catalog}) == len(catalog)
    write('catalog.json', catalog)
    write('reference.json', reference)
    for start in range(1, 1026, 50):
        write(f'species/{(start-1)//50:02d}.json', {sid: species[sid] for sid in range(start, min(start+50, 1026))})
    manifest = {
        'schemaVersion': 1, 'source': 'https://github.com/PokeAPI/pokeapi', 'revision': REVISION,
        'speciesCount': len(species), 'pokemonCount': len(pokemon), 'formCount': len(catalog),
        'descriptionCount': sum(len(s['flavor']) for s in species.values()),
        'encounterCount': sum(len(p['encounters']) for p in pokemon.values()),
        'learnsetCount': sum(len(p['moves']) for p in pokemon.values()),
        'shardSize': 50,
        'sourceFiles': {name: hashlib.sha256((CACHE / f'{name}.csv').read_bytes()).hexdigest() for name in TABLES},
        'files': {str(p.relative_to(OUT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(OUT.rglob('*.json')) if p.name != 'manifest.json'}
    }
    write('manifest.json', manifest)
    print(json.dumps({k:v for k,v in manifest.items() if k.endswith('Count')}, indent=2), flush=True)

if __name__ == '__main__': main()
