document.getElementById("ronda").style.display = "none";   // Para ocultar
document.addEventListener('DOMContentLoaded', function() {
    const botonEmpezar = document.getElementById("botonEmpezar");
    const estadoJuego = document.getElementById("estadoJuego");
    const ronda = document.getElementById("ronda");
    const botonesJuego = document.querySelectorAll("#grupoInteractivo use");

    class Quixo {
        constructor() {
            this.rondaActual = 0;
            this.posicionUsuario = 0;
            this.rondasTotales = 10;
            this.secuencia = [];
            this.velocidad = 1000;
            this.botonesBloqueados = true;
            this.botones = Array.from(botonesJuego);
            this.sonidosBoton = [];
            this.cargarSonidos();
            this.display = {
                botonEmpezar,
                ronda,
                estadoJuego
            };
            this.iniciar();
        }

        async cargarSonidos() {
            const sonidos = [
                'sounds/sounds_1 (1).mp3',
                'sounds/sounds_2 (1).mp3',
                'sounds/sounds_3 (1).mp3',
                'sounds/sounds_4 (1).mp3'
            ];
            const promesas = sonidos.map((sonido, indice) => {
                return new Promise((resolve, reject) => {
                    const audio = new Audio(sonido);
                    audio.addEventListener('canplaythrough', () => {
                        this.sonidosBoton[indice] = audio;
                        resolve();
                    }, { once: true });
                    audio.addEventListener('error', () => reject(new Error(`Failed to load sound: ${sonido}`)));
                });
            });
            try {
                await Promise.all(promesas);
            } catch (error) {
                console.error("Error loading sounds:", error);
            }
        }

        iniciar() {
            this.display.botonEmpezar.addEventListener('click', () => this.iniciarJuego());
            this.botones.forEach(boton => {
                boton.style.fill = boton.getAttribute('data-color-inactivo');
                boton.addEventListener('click', (event) => {
                    if (!this.botonesBloqueados) {
                        const indice = this.botones.indexOf(event.currentTarget);
                        this.validarColorElegido(indice);
                    }
                });
            });
        }

        iniciarJuego() {
            this.display.botonEmpezar.disabled = true;
            this.actualizarRonda(0);
            this.posicionUsuario = 0;
            this.secuencia = this.crearSecuencia();
            this.mostrarSecuencia();
        }

        actualizarRonda(valor) {
            this.rondaActual = valor;
            this.display.ronda.textContent = `Ronda ${this.rondaActual}`;
        }

        crearSecuencia() {
            return Array.from({length: this.rondasTotales}, () => Math.floor(Math.random() * this.botones.length));
        }

        validarColorElegido(indice) {
            if (this.secuencia[this.posicionUsuario] === indice) {
                this.alternarEstiloBoton(this.botones[indice], true);
                if (this.sonidosBoton[indice]) {
                    this.sonidosBoton[indice].play();
                }
                setTimeout(() => {
                    this.alternarEstiloBoton(this.botones[indice], false);
                }, this.velocidad / 2);
        
                if (this.rondaActual === this.posicionUsuario) {
                    this.posicionUsuario = 0;
                    this.rondaActual++;
                    if (this.rondaActual < this.rondasTotales) {
                        this.display.estadoJuego.textContent = `¡Bien hecho! Siguiente ronda: ${this.rondaActual + 1}`;
                        setTimeout(() => this.mostrarSecuencia(), this.velocidad);
                    } else {
                        this.ganarJuego();
                    }
                } else {
                    this.posicionUsuario++;
                    this.display.estadoJuego.textContent = `Correcto! Sigue así.`;
                }
            } else {
                this.display.estadoJuego.textContent = `¡Error! Incorrecto.`;
                setTimeout(() => this.perderJuego(), 500);
            }
        }
        mostrarSecuencia() {
            this.botonesBloqueados = true;
            let indiceSecuencia = 0;
            const intervalo = setInterval(() => {
                if (indiceSecuencia > 0) {
                    this.alternarEstiloBoton(this.botones[this.secuencia[indiceSecuencia - 1]], false);
                }
                if (indiceSecuencia < this.rondaActual + 1) {
                    this.alternarEstiloBoton(this.botones[this.secuencia[indiceSecuencia]], true);
                    if (this.sonidosBoton[this.secuencia[indiceSecuencia]]) {
                        this.sonidosBoton[this.secuencia[indiceSecuencia]].play();
                    }
                    indiceSecuencia++;
                } else {
                    clearInterval(intervalo);
                    this.botonesBloqueados = false;
                }
            }, this.velocidad);
        }

        alternarEstiloBoton(boton, activar) {
            if (activar) {
                boton.classList.add('boton-activo');
                boton.style.fill = boton.getAttribute('data-color-activo');
            } else {
                boton.classList.remove('boton-activo');
                boton.style.fill = boton.getAttribute('data-color-inactivo');
            }
        }

        perderJuego() {
            this.display.estadoJuego.textContent = 'Perdiste. Intenta de nuevo.';
            this.display.botonEmpezar.disabled = false;
            this.botonesBloqueados = true;
            this.resetJuego();
        }

        ganarJuego() {
            this.display.estadoJuego.textContent = '¡Ganaste!';
            this.display.botonEmpezar.disabled = false;
            this.botonesBloqueados = true;
            this.resetJuego();
        }

        resetJuego() {
            this.botones.forEach(boton => this.alternarEstiloBoton(boton, false));
        }
    }

    new Quixo();
});