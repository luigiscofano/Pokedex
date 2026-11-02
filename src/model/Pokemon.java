package model;

import model.enums.Tipo;

/**
 * Modelo didático do exercício original, independente da base de dados do site.
 * Os contratos de vida e cópia foram preservados para manter o comportamento histórico.
 */
public class Pokemon {
    // Estado privado: acesso e alteração passam pelos métodos públicos abaixo.
    private String especie;
    private Tipo tipoPrincipal;
    private Tipo tipoSecundario;
    private String nomeTreinador;
    private int vidaAtual;
    private int vidaTotal;

    /** Constrói um Pokémon com treinador, dois tipos e vida inicial completa. */
    public Pokemon(String especie, Tipo tipoPrincipal, Tipo tipoSecundario,
                   String nomeTreinador, int vidaTotal) {
        this.especie = especie;
        this.tipoPrincipal = tipoPrincipal;
        this.tipoSecundario = tipoSecundario;
        this.nomeTreinador = nomeTreinador;
        this.vidaAtual = vidaTotal;
        this.vidaTotal = vidaTotal;
    }

    /** No exemplo simplificado, treinador e tipo secundário permanecem nulos. */
    public Pokemon(String especie, Tipo tipoPrincipal, int vidaTotal) {
        this.especie = especie;
        this.tipoPrincipal = tipoPrincipal;
        this.vidaAtual = vidaTotal;
        this.vidaTotal = vidaTotal;
    }

    /**
     * Copia os dados descritivos e inicia a cópia com a vida total.
     * Não copia a vida atual de um original ferido: esse é o contrato do exercício.
     */
    public Pokemon(Pokemon original) {
        this.especie = original.especie;
        this.tipoPrincipal = original.tipoPrincipal;
        this.tipoSecundario = original.tipoSecundario;
        this.nomeTreinador = original.nomeTreinador;
        this.vidaAtual = original.vidaTotal;
        this.vidaTotal = original.vidaTotal;
    }

    // Consulta e alteração dos campos; os setters originais não validam limites.
    public String getEspecie() {
        return especie;
    }

    public void setEspecie(String especie) {
        this.especie = especie;
    }

    public Tipo getTipoPrincipal() {
        return tipoPrincipal;
    }

    public void setTipoPrincipal(Tipo tipoPrincipal) {
        this.tipoPrincipal = tipoPrincipal;
    }

    public Tipo getTipoSecundario() {
        return tipoSecundario;
    }

    public void setTipoSecundario(Tipo tipoSecundario) {
        this.tipoSecundario = tipoSecundario;
    }

    public String getNomeTreinador() {
        return nomeTreinador;
    }

    public void setNomeTreinador(String nomeTreinador) {
        this.nomeTreinador = nomeTreinador;
    }

    public int getVidaAtual() {
        return vidaAtual;
    }

    public void setVidaAtual(int vidaAtual) {
        this.vidaAtual = vidaAtual;
    }

    public int getVidaTotal() {
        return vidaTotal;
    }

    /**
     * Retorna a razão entre vida atual e total, sem multiplicar por 100.
     * Não valida vida total zero, preservando a divisão em ponto flutuante original.
     */
    public double porcentagemVida() {
        return (double) vidaAtual / (double) vidaTotal;
    }

    /** Subtrai o dano informado; não limita vida negativa nem rejeita dano negativo. */
    public void receberDano(int dano) {
        vidaAtual = vidaAtual - dano;
    }

    // A representação conserva o segundo tipo nulo quando ele não foi definido.
    @Override
    public String toString() {
        return "Espécie: " + especie + " - " + tipoPrincipal + " + " + tipoSecundario;
    }
}
