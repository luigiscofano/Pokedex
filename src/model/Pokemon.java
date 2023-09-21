package model;

import model.enums.Tipo;

public class Pokemon {
    private String especie;
    private Tipo tipoPrincipal;
    private Tipo tipoSecundario;
    private String nomeTreinador;
    private int vidaAtual;
    private int vidaTotal;

    public Pokemon(String especie, Tipo tipoPrincipal, Tipo tipoSecundario, String nomeTreinador, int vidaTotal) {
        this.especie = especie;
        this.tipoPrincipal = tipoPrincipal;
        this.tipoSecundario = tipoSecundario;
        this.nomeTreinador = nomeTreinador;
        this.vidaAtual = vidaTotal;
        this.vidaTotal = vidaTotal;
    }

    public Pokemon(String especie, Tipo tipoPrincipal, int vidaTotal) {
        this.especie = especie;
        this.tipoPrincipal = tipoPrincipal;
        this.vidaAtual = vidaTotal;
        this.vidaTotal = vidaTotal;
    }

    public Pokemon(Pokemon copy){
        this.especie = copy.especie;
        this.tipoPrincipal = copy.tipoPrincipal;
        this.tipoSecundario = copy.tipoSecundario;
        this.nomeTreinador = copy.nomeTreinador;
        this.vidaAtual = copy.vidaTotal;
        this.vidaTotal = copy.vidaTotal;
    }

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

    public double porcentagemVida(){
        return (double)vidaAtual/(double)vidaTotal;
    }

    public void receberDano(int dano){
        vidaAtual = vidaAtual - dano;
    }

    @Override
    public String toString() {
        return "Espécie: " + especie + " - " + tipoPrincipal + " + " + tipoSecundario;
    }
}
