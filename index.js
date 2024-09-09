document.addEventListener('DOMContentLoaded', function() {
    const botonEmpezar = document.getElementById("botonEmpezar");
    const estadoJuego = document.getElementById("estadoJuego");
    const ronda = document.getElementById("ronda");
    const botonesJuego = document.querySelectorAll("#grupoInteractivo use");

    botonEmpezar.addEventListener('click', function() {
        new Quixo();
    });

    class Quixo {
        constructor() {
            this.rondaActual = 0;
            this.posicionUsuario = 0;
            this.rondasTotales = 15;
            this.secuencia = [];
            this.velocidad = 700;
            this.botonesBloqueados = true;
            this.botones = Array.from(botonesJuego);
            this.sonidosBoton = [];
            this.inactividadTimeout = null;

            this.display = {
                botonEmpezar,
                ronda,
                estadoJuego
            };

            this.cargarSonidos();
            this.iniciar();
        }

        iniciar() {
            // Cargar sonidos y configurar los botones
            this.display.botonEmpezar.addEventListener('click', this.iniciarJuego.bind(this));
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

        async cargarSonidos() {
            const sonidos = [
                'sounds/sounds_1 (1).mp3',
                'sounds/sounds_2 (1).mp3',
                'sounds/sounds_3 (1).mp3',
                'sounds/sounds_4 (1).mp3',
                'sounds/sounds_error (1).wav',
                'sounds/win.ogg'
            ];

            const promesas = sonidos.map((sonido, indice) => {
                return new Promise((resolve, reject) => {
                    const audio = new Audio(sonido);
                    audio.addEventListener('canplaythrough', () => {
                        this.sonidosBoton[indice] = audio;
                        resolve();
                    }, { once: true });
                    audio.addEventListener('error', () => reject(new Error(`Error al cargar el sonido: ${sonido}`)));
                });
            });

            try {
                await Promise.all(promesas);
                console.log('Todos los sonidos se han cargado correctamente.');
            } catch (error) {
                console.error('Error al cargar los sonidos:', error);
            }
        }

        iniciarJuego() {
            this.display.botonEmpezar.disabled = true;
            this.actualizarRonda(0);
            this.posicionUsuario = 0;
            this.secuencia = this.crearSecuencia();
            this.resetEstadoJuego();
            this.mostrarSecuencia();
        }

        resetEstadoJuego() {
            this.display.estadoJuego.textContent = 'Listo para comenzar!';
            this.display.estadoJuego.style.color = '#4682B4';
            this.display.estadoJuego.classList.remove('ganador');
            this.display.estadoJuego.style.marginLeft = '20px';
        }

        actualizarRonda(valor) {
            this.rondaActual = valor;
        }

        crearSecuencia() {
            return Array.from({ length: this.rondasTotales }, () => Math.floor(Math.random() * this.botones.length));
        }

        validarColorElegido(indice) {
            if (this.secuencia[this.posicionUsuario] === indice) {
                clearTimeout(this.inactividadTimeout);
                this.alternarEstiloBoton(this.botones[indice], true);

                // Reproducir el sonido
                if (this.sonidosBoton[indice]) {
                    this.sonidosBoton[indice].play().catch(error => {
                        console.error('Error al reproducir el audio:', error);
                    });
                }

                setTimeout(() => {
                    this.alternarEstiloBoton(this.botones[indice], false);
                }, this.velocidad / 2);

                if (this.rondaActual === this.posicionUsuario) {
                    this.posicionUsuario = 0;
                    this.rondaActual++;
                    if (this.rondaActual < this.rondasTotales) {
                        this.display.estadoJuego.textContent = `¡Bien hecho! Ronda: ${this.rondaActual + 1}`;
                        setTimeout(() => this.mostrarSecuencia(), this.velocidad);
                    } else {
                        this.ganarJuego();
                    }
                } else {
                    this.posicionUsuario++;
                    this.display.estadoJuego.textContent = `Correcto! Sigue así.`;
                    this.inactividadTimeout = setTimeout(() => this.perderJuego(), 15000);
                }
            } else {
                setTimeout(() => this.perderJuego(), 250);
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
                    this.inactividadTimeout = setTimeout(() => this.perderJuego(), 15000);
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
            clearTimeout(this.inactividadTimeout);
            this.display.estadoJuego.textContent = 'Perdiste. Intenta de nuevo.';
            this.display.estadoJuego.style.color = 'red';
            this.display.botonEmpezar.disabled = false;
            this.botonesBloqueados = true;
            this.resetJuego();

            if (this.sonidosBoton[4]) {
                this.sonidosBoton[4].play();
            }
        }

        ganarJuego() {
            clearTimeout(this.inactividadTimeout);
            this.display.estadoJuego.innerHTML = '¡F E L I C I D A D E S &nbsp;&nbsp;&nbsp; G A N A S T E!';
            this.display.estadoJuego.style.color = 'green';
            this.display.estadoJuego.classList.add('ganador');
            this.display.estadoJuego.style.marginLeft = '195px';
            this.display.ronda.style.display = 'none';
            this.botonesBloqueados = true;

            if (this.sonidosBoton[5]) {
                this.sonidosBoton[5].play();
            }

            setTimeout(() => {
                this.display.botonEmpezar.disabled = false;
                this.resetJuego();
            }, 1000);
        }

        resetJuego() {
            this.botones.forEach(boton => this.alternarEstiloBoton(boton, false));
        }
    }

    new Quixo();
});
