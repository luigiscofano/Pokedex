import model.Pokemon;
import model.enums.Tipo;

import java.util.ArrayList;
import java.util.List;

/** Demonstra construção, cópia, alteração de estado e coleção de objetos. */
public class Main {
    public static void main(String[] args) {
        // Os construtores completos informam os dois tipos e o treinador.
        Pokemon infernape = new Pokemon("Infernape", Tipo.FOGO, Tipo.LUTADOR, "Ash", 200);
        Pokemon torterra = new Pokemon("Torterra", Tipo.GRAMA, Tipo.TERRA, "Ash", 300);
        Pokemon starmie = new Pokemon("Starmie", Tipo.AGUA, 160);

        // A cópia é outro objeto; mudar seus campos não altera Starmie.
        Pokemon empoleon = new Pokemon(starmie);
        empoleon.setEspecie("Empoleon");
        empoleon.setTipoSecundario(Tipo.METAL);
        empoleon.receberDano(50);

        // O método retorna uma razão: 110 / 160 = 0,6875, equivalente a 68,75%.
        System.out.println(empoleon.porcentagemVida());
        System.out.println(empoleon.getVidaAtual());

        List<Pokemon> pokedex = new ArrayList<>(List.of(infernape, torterra, starmie, empoleon));
        pokedex.forEach(System.out::println);
    }
}
