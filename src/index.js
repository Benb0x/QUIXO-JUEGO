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
                'sounds/sounds_1 (1).mp3',
                'sounds/sounds_2 (1).mp3',
                'sounds/sounds_3 (1).mp3',
                'sounds/sounds_4 (1).mp3'
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
                // Establecer el color inactivo inicial al cargar la página
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
                this.sonidosBoton[indice].play();
                this.alternarEstiloBoton(this.botones[indice]);
                if (this.rondaActual === this.posicionUsuario) {
                    this.posicionUsuario = 0;
                    this.rondaActual++;
                    this.display.ronda.textContent = `Ronda ${this.rondaActual}`;
                    this.mostrarSecuencia();
                } else {
                    this.posicionUsuario++;
                }
            } else {
                this.perderJuego();
            }
        }

        mostrarSecuencia() {
            this.botonesBloqueados = true;
            let indiceSecuencia = 0;
            const temporizador = setInterval(() => {
                const boton = this.botones[this.secuencia[indiceSecuencia]];
                this.sonidosBoton[this.secuencia[indiceSecuencia]].play();
                this.alternarEstiloBoton(boton, true); // Activar el botón
                setTimeout(() => {
                    this.alternarEstiloBoton(boton, false); // Desactivar el botón
                }, this.velocidad / 2);
        
                indiceSecuencia++;
                if (indiceSecuencia > this.rondaActual) {
                    clearInterval(temporizador);
                    this.botonesBloqueados = false;
                }
            }, this.velocidad);
        }

        alternarEstiloBoton(boton) {
            const estaActivo = boton.classList.contains('boton-activo');
            boton.classList.toggle('boton-activo'); // Alternar la clase para activar/desactivar el estilo
            if (estaActivo) {
                // Si estaba activo, ahora se desactiva, aplicar color "apagado"
                boton.style.fill = boton.getAttribute('data-color-inactivo'); // Usar un atributo data para guardar el color inactivo
            } else {
                // Si estaba inactivo, ahora se activa, aplicar color "activo"
                boton.style.fill = boton.getAttribute('data-color-activo'); // Usar un atributo data para guardar el color activo
            }
        }

        perderJuego() {
            this.display.botonEmpezar.disabled = false;
            this.botonesBloqueados = true;
            this.actualizarEstadoJuego('Perdiste. Intenta de nuevo.');
        }

        ganarJuego() {
            this.display.botonEmpezar.disabled = false;
            this.botonesBloqueados = true;
            this.actualizarEstadoJuego('¡Ganaste!');
            this.botones.forEach(boton => boton.classList.add('ganador'));
        }

        actualizarEstadoJuego(mensaje) {
            this.display.estadoJuego.textContent = mensaje;
        }
    }

    const juegoQuixo = new Quixo(botonesJuego, botonEmpezar, ronda, estadoJuego);
});