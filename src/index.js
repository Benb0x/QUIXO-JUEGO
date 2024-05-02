document.addEventListener('DOMContentLoaded', function() {
    const botonEmpezar = document.getElementById("botonEmpezar");
    const estadoJuego = document.getElementById("estadoJuego");
    const ronda = document.getElementById("ronda");
    const botonesJuego = document.querySelectorAll("#grupoInteractivo use");

    class Quixo {
        constructor(botonesJuego, botonEmpezar, ronda, estadoJuego) {
            this.rondaActual = 0;
            this.posicionUsuario = 0;
            this.rondasTotales = 10;
            this.secuencia = [];
            this.velocidad = 1000;
            this.botonesBloqueados = true;
            this.botones = Array.from(botonesJuego);
            this.display = {
                botonEmpezar,
                ronda,
                estadoJuego
            };
            this.sonidosBoton = [];
            this.cargarSonidos().then(() => {
                this.iniciar();
                this.display.botonEmpezar.disabled = false; // Habilita el botón cuando todos los sonidos estén cargados
            }).catch(error => console.error("Error al cargar sonidos:", error));
        }
    
        async cargarSonidos() {
            const sonidos = [
                'src/sounds/sounds_1 (1).mp3',
                'src/sounds/sounds_2 (1).mp3',
                'src/sounds/sounds_3 (1).mp3',
                'src/sounds/sounds_4 (1).mp3'
            ];
            const promesas = sonidos.map((sonido, indice) => {
                return new Promise((resolve, reject) => {
                    const audio = new Audio();
                    audio.src = sonido;
                    audio.addEventListener('canplaythrough', () => {
                        this.sonidosBoton[indice] = audio;
                        resolve();
                    }, { once: true });
                    audio.addEventListener('error', () => reject(new Error(`Failed to load sound: ${sonido}`)));
                });
            });
            await Promise.all(promesas);
        }
    
        iniciar() {
            this.display.botonEmpezar.onclick = () => this.iniciarJuego();
            this.botones.forEach(boton => {
                boton.addEventListener('click', () => {
                    if (!this.botonesBloqueados) {
                        const indice = this.botones.indexOf(boton);
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

        validarColorElegido(valor) {
            if (this.secuencia[this.posicionUsuario] === valor) {
                this.sonidosBoton[valor].play();
                if (this.rondaActual === this.posicionUsuario) {
                    this.actualizarRonda(this.rondaActual + 1);
                    this.velocidad *= 0.98;
                    this.verificarFinJuego();
                } else {
                    this.posicionUsuario++;
                }
            } else {
                this.perderJuego();
            }
        }

        verificarFinJuego() {
            if (this.rondaActual === this.rondasTotales) {
                this.ganarJuego();
            } else {
                this.posicionUsuario = 0;
                this.mostrarSecuencia();
            }
        }

        mostrarSecuencia() {
            this.botonesBloqueados = true;
            let indiceSecuencia = 0;
            const temporizador = setInterval(() => {
                const boton = this.botones[this.secuencia[indiceSecuencia]];
                this.sonidosBoton[this.secuencia[indiceSecuencia]].play();
                this.alternarEstiloBoton(boton);
                setTimeout(() => this.alternarEstiloBoton(boton), this.velocidad / 2);
                indiceSecuencia++;
                if (indiceSecuencia > this.rondaActual) {
                    clearInterval(temporizador);
                    this.botonesBloqueados = false;
                }
            }, this.velocidad);
        }

        alternarEstiloBoton(boton) {
            boton.classList.toggle('boton-activo');
        }

        perderJuego() {
            // Asegúrate de que el sonido de error esté correctamente inicializado y cargado.
            if (this.sonidoError) {
                this.sonidoError.play();
            }
            this.display.botonEmpezar.disabled = false;
            this.botonesBloqueados = true;
            this.actualizarEstadoJuego('Perdiste. Intenta de nuevo.');
        }

        ganarJuego() {
            this.display.botonEmpezar.disabled = false;
            this.botonesBloqueados = true;
            this.actualizarEstadoJuego('¡Ganaste!');
            this.botones.forEach(elemento => elemento.classList.add('ganador'));
            this.actualizarRonda('🏆');
        }

        actualizarEstadoJuego(mensaje) {
            this.display.estadoJuego.textContent = mensaje;
        }
    }

    const juegoQuixo = new Quixo(botonesJuego, botonEmpezar, ronda, estadoJuego);
});