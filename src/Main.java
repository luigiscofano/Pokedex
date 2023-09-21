import model.Pokemon;
import model.enums.Tipo;

import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        Pokemon p1 = new Pokemon("Infernape", Tipo.FOGO, Tipo.LUTADOR, "Ash", 200);
        Pokemon p2 = new Pokemon("Torterra", Tipo.GRAMA, Tipo.TERRA, "Ash", 300);
        Pokemon p3 = new Pokemon("Starmie", Tipo.AGUA, 160);
        Pokemon p4 = new Pokemon(p3);

        p4.setEspecie("Empoleon");
        p4.setTipoSecundario(Tipo.METAL);

        p4.receberDano(50);

        System.out.println(p4.porcentagemVida());
        System.out.println(p4.getVidaAtual());

        List<Pokemon> pokedex = new ArrayList<>();
        pokedex.add(p1);
        pokedex.add(p2);
        pokedex.add(p3);
        pokedex.add(p4);

        List<Integer> inteiros = new ArrayList<>(List.of(1,2,3,4)); // copy constructor

        pokedex.forEach(p -> System.out.println(p));
    }
}