const ronda = document.getElementById("ronda");
const botonEmpezar = document.getElementById("empezar");
const botonesJuego = document.getElementById("grupoInteractivo")

class contenedorJuego{
    constructor(ronda, botonEmpezar, botonesJuego){
        this.ronda=0;
        this.posicionDelUsuario=0;
        this.totalDeRondas=10;
        this.secuencia=[];
        this.velocidad=1000;
        this.blockedButtons = true;
        this.botones=Array.from(botonesJuego);
        this.display={
            ronda, botonEmpezar
        }
        this.error=this.mostrarError;
    }


iniciar(){
    this.display.botonEmpezar.onclick = () => this.empezarElJuego();
}

empezarElJuego(){
    this.display.botonEmpezar.disable = true;
}


}


//const quixo = new quixo(ronda, botonEmpezar, botonesJuego);
//quixo