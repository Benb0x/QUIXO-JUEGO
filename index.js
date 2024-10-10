document.addEventListener('DOMContentLoaded', function () {
    const audioPermissionModal = document.getElementById("audioPermissionModal");
    const acceptAudioButton = document.getElementById("acceptAudio");
    const botonEmpezar = document.getElementById("botonEmpezar");
    const estadoJuego = document.getElementById("estadoJuego");
    const ronda = document.getElementById("ronda");
    const botonesJuego = document.querySelectorAll("#grupoInteractivo use");

    const mensajesPositivos = ["¡Bien hecho!", "¡Excelente!", "¡Sigue así!", "¡Muy bien!", "¡Continúa!"];
    const tiempoInactividad = 15000; // 15 segundos sin actividad

    // Permitir el audio
    acceptAudioButton.addEventListener('click', function () {
        const audio = new Audio('https://quixo-sonidos.vercel.app/sounds_1.m4a');
        audio.play().then(() => {
            audioPermissionModal.style.display = 'none';
        }).catch(error => {
            console.error("Error al habilitar el sonido.");
        });
    });

    class Quixo {
        constructor() {
            this.rondaActual = 0;
            this.posicionUsuario = 0;
            this.rondasTotales = 15;
            this.secuencia = [];
            this.velocidad = 700;
            this.botonesBloqueados = true;
            this.secuenciaActiva = false;
            this.secuenciaCompletada = false;
            this.juegoPerdido = false;
            this.botones = Array.from(botonesJuego);
            this.sonidosBoton = [];
            this.inactividadTimeout = null;
            this.secuenciaInterval = null;

            this.display = {
                botonEmpezar,
                ronda,
                estadoJuego
            };

            this.cargarSonidos();
            this.iniciar();
        }

        cargarSonidos() {
            const sonidos = [
                'https://quixo-sonidos.vercel.app/sounds_1.m4a',
                'https://quixo-sonidos.vercel.app/sounds_2.m4a',
                'https://quixo-sonidos.vercel.app/sounds_3.m4a',
                'https://quixo-sonidos.vercel.app/sounds_4.m4a',
                'https://quixo-sonidos.vercel.app/sounds_error.m4a',
                'https://quixo-sonidos.vercel.app/win.m4a'
            ];

            sonidos.forEach((sonido, indice) => {
                const audio = new Audio(sonido);
                audio.preload = "auto";  // Precargar el audio
                audio.crossOrigin = 'anonymous'; 
                this.sonidosBoton[indice] = audio;
            });
        }

        iniciar() {
            this.display.botonEmpezar.addEventListener('click', () => {
                console.log("Botón de 'Empezar' clickeado.");
                this.iniciarJuego();
            });

            this.botones.forEach(boton => {
                boton.setAttribute('fill', boton.getAttribute('data-color-inactivo'));

                boton.addEventListener('touchstart', (event) => {
                    if (this.secuenciaCompletada && !this.botonesBloqueados) {
                        const indice = this.botones.indexOf(event.currentTarget);
                        this.validarColorElegido(indice);
                    }
                });

                boton.addEventListener('click', (event) => {
                    if (this.secuenciaCompletada && !this.botonesBloqueados) {
                        const indice = this.botones.indexOf(event.currentTarget);
                        this.validarColorElegido(indice);
                    }
                });
            });
        }

        iniciarJuego() {
            console.log("Iniciando el juego...");
            this.limpiarEstado();
            this.juegoPerdido = false; 
            this.display.botonEmpezar.disabled = true;
            this.actualizarRonda(0);
            this.posicionUsuario = 0;
            this.secuencia = this.crearSecuencia();
            this.resetEstadoJuego();
            this.mostrarSecuencia();
        }

        limpiarEstado() {
            clearTimeout(this.inactividadTimeout);
            clearInterval(this.secuenciaInterval);
            this.secuenciaActiva = false;
            this.secuenciaCompletada = false;
            this.botonesBloqueados = true;
            this.posicionUsuario = 0;
            console.log("Estado del juego limpiado. Posición del usuario reiniciada.");
        }

        resetEstadoJuego() {
            this.display.estadoJuego.textContent = '¡Listo para comenzar!';
            this.display.estadoJuego.style.color = '#4682B4';
            this.display.estadoJuego.classList.remove('ganador');
            this.display.estadoJuego.style.marginLeft = '20px';
        }

        actualizarRonda(valor) {
            this.rondaActual = valor;
            console.log(`Ronda actual: ${this.rondaActual}`);
        }

        crearSecuencia() {
            const secuenciaGenerada = Array.from({ length: this.rondasTotales }, () => Math.floor(Math.random() * this.botones.length));
            console.log(`Secuencia creada: ${secuenciaGenerada}`);
            return secuenciaGenerada;
        }

        validarColorElegido(indice) {
            clearTimeout(this.inactividadTimeout);

            if (this.secuenciaActiva || this.juegoPerdido) return;

            console.log(`Usuario eligió: ${indice}, se espera: ${this.secuencia[this.posicionUsuario]}`);
            
            if (this.secuencia[this.posicionUsuario] === indice) {
                this.alternarEstiloBoton(this.botones[indice], true);
                this.reproducirSonido(indice);

                setTimeout(() => {
                    this.alternarEstiloBoton(this.botones[indice], false);
                }, this.velocidad / 2);

                if (this.posicionUsuario < this.rondaActual) {
                    this.posicionUsuario++;
                    this.display.estadoJuego.textContent = 'Correcto! Sigue así.';
                    console.log(`Posición del usuario actualizada: ${this.posicionUsuario}`);
                    this.inactividadTimeout = setTimeout(() => this.perderJuego(), tiempoInactividad);
                } else {
                    this.posicionUsuario = 0; 
                    this.rondaActual++;
                    if (this.rondaActual < this.rondasTotales) {
                        this.display.estadoJuego.textContent = `¡Bien hecho! Ronda: ${this.rondaActual + 1}`;
                        setTimeout(() => this.mostrarSecuencia(), this.velocidad);
                    } else {
                        this.ganarJuego();
                    }
                }
            } else {
                this.perderJuego();
            }
        }

        mostrarSecuencia() {
            this.botonesBloqueados = true;
            this.secuenciaActiva = true;
            this.secuenciaCompletada = false;
            let indiceSecuencia = 0;

            console.log(`Mostrando secuencia: ${this.secuencia.slice(0, this.rondaActual + 1)}`);

            clearInterval(this.secuenciaInterval);

            this.secuenciaInterval = setInterval(() => {
                if (indiceSecuencia > 0) {
                    this.alternarEstiloBoton(this.botones[this.secuencia[indiceSecuencia - 1]], false);
                }
                if (indiceSecuencia < this.rondaActual + 1) {
                    this.alternarEstiloBoton(this.botones[this.secuencia[indiceSecuencia]], true);
                    this.reproducirSonido(this.secuencia[indiceSecuencia]);
                    indiceSecuencia++;
                } else {
                    clearInterval(this.secuenciaInterval);
                    this.secuenciaActiva = false;
                    this.botonesBloqueados = false;
                    this.secuenciaCompletada = true;
                    this.posicionUsuario = 0;
                    this.inactividadTimeout = setTimeout(() => this.perderJuego(), tiempoInactividad); 
                    console.log(`Secuencia completa. Usuario puede interactuar.`);
                }
            }, this.velocidad);
        }

        alternarEstiloBoton(boton, activar) {
            if (activar) {
                boton.setAttribute('fill', boton.getAttribute('data-color-activo'));
            } else {
                boton.setAttribute('fill', boton.getAttribute('data-color-inactivo'));
            }
        }

        reproducirSonido(indice) {
            const audio = this.sonidosBoton[indice];
            console.log(`Intentando reproducir sonido: ${indice}`);
            if (audio) {
                audio.currentTime = 0;
                audio.play().then(() => {
                    console.log(`Reproduciendo sonido: ${indice}`);
                }).catch(error => {
                    console.error('Error al reproducir sonido, reintentando...');
                    setTimeout(() => {
                        audio.play().catch(err => {
                            console.error('Error al reintentar reproducir el sonido.');
                        });
                    }, 500);  
                });
            }
        }

        perderJuego() {
            if (this.juegoPerdido) return;

            this.juegoPerdido = true;
            this.limpiarEstado();
            this.display.estadoJuego.textContent = 'Perdiste. Intenta de nuevo.';
            this.display.estadoJuego.style.color = 'red';
            this.display.botonEmpezar.disabled = false;
            this.reproducirSonido(4);
        }

        ganarJuego() {
            this.limpiarEstado();
            this.display.estadoJuego.innerHTML = '¡F E L I C I D A D E S &nbsp;&nbsp;&nbsp; G A N A S T E!';
            this.display.estadoJuego.style.color = 'green';
            this.display.estadoJuego.classList.add('ganador');
            this.display.ronda.style.display = 'none';
            this.botonesBloqueados = true;

            this.reproducirSonido(5);
        }
    }

    const quixo = new Quixo();
});
