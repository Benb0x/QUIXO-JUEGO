document.addEventListener('DOMContentLoaded', function () {
    const audioPermissionModal = document.getElementById("audioPermissionModal");
    const acceptAudioButton = document.getElementById("acceptAudio");
    const botonEmpezar = document.getElementById("botonEmpezar");
    const estadoJuego = document.getElementById("estadoJuego");
    const ronda = document.getElementById("ronda");
    const botonesJuego = document.querySelectorAll("#grupoInteractivo use");

    const mensajesPositivos = ["¡Bien hecho!", "¡Excelente!", "¡Sigue así!", "¡Muy bien!", "¡Continúa!"];
    const tiempoInactividad = 126000; // 15 segundos sin actividad

    acceptAudioButton.addEventListener('click', function() {
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
            this.secuencia = [0, 1, 2, 3]; // Secuencia fija para facilitar la prueba
            this.velocidad = 700;
            this.botonesBloqueados = true;
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
                audio.preload = "auto";
                audio.crossOrigin = 'anonymous'; 
                this.sonidosBoton[indice] = audio;
            });
        }

        iniciar() {
            this.display.botonEmpezar.addEventListener('click', () => {
                this.reiniciarJuego(); // Llamamos a la función de reinicio aquí
            });

            this.botones = Array.from(botonesJuego);
            this.botones.forEach(boton => {
                boton.setAttribute('fill', boton.getAttribute('data-color-inactivo'));

                boton.addEventListener('click', (event) => {
                    if (!this.botonesBloqueados) {
                        const indice = this.botones.indexOf(event.currentTarget);
                        this.validarColorElegido(indice);
                    }
                });
            });
        }

        reiniciarJuego() {
            this.limpiarEstado();
            this.secuencia = [0, 1, 2, 3]; 
            this.rondaActual = 0;
            this.posicionUsuario = 0;
            this.botonesBloqueados = false;
            this.display.estadoJuego.textContent = ''; 
            this.display.estadoJuego.style.color = '#4682B4'; 
            this.display.botonEmpezar.disabled = true;
            this.actualizarEstado("¡Vamos a empezar!", 0);
            this.mostrarSecuencia();

            // Iniciar temporizador de inactividad
            this.establecerTemporizadorInactividad();
        }

        limpiarEstado() {
            clearTimeout(this.inactividadTimeout);
            this.botonesBloqueados = true;
            this.posicionUsuario = 0;
            this.rondaActual = 0;

            this.botones.forEach(boton => {
                boton.setAttribute('fill', boton.getAttribute('data-color-inactivo'));
            });
        }

        establecerTemporizadorInactividad() {
            // Si no hay actividad en 15 segundos, pierde el juego
            clearTimeout(this.inactividadTimeout); // Limpiar cualquier temporizador anterior
            this.inactividadTimeout = setTimeout(() => {
                this.perderJuego(); // Si no hay actividad en 15 segundos, pierde el juego
            }, tiempoInactividad);
        }

        actualizarEstado(mensaje, ronda) {
            const mensajePositivo = mensajesPositivos[Math.floor(Math.random() * mensajesPositivos.length)];
            this.display.estadoJuego.textContent = `${mensajePositivo} Siguiente ronda: ${ronda + 1}`;
            this.display.estadoJuego.style.display = 'block';
        }

        validarColorElegido(indice) {
            clearTimeout(this.inactividadTimeout); // Limpiar el temporizador de inactividad al hacer clic

            if (this.secuencia[this.posicionUsuario] === indice) {
                this.alternarEstiloBoton(this.botones[indice], true);
                this.reproducirSonido(indice);

                setTimeout(() => {
                    this.alternarEstiloBoton(this.botones[indice], false);
                }, this.velocidad / 2);

                this.posicionUsuario++;

                if (this.posicionUsuario > this.rondaActual) {
                    this.rondaActual++;
                    if (this.rondaActual < this.secuencia.length) {
                        this.actualizarEstado("¡Muy bien!", this.rondaActual);
                        setTimeout(() => this.mostrarSecuencia(), this.velocidad);
                        this.establecerTemporizadorInactividad(); // Reiniciar el temporizador al avanzar de ronda
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
            let indiceSecuencia = 0;

            const secuenciaInterval = setInterval(() => {
                if (indiceSecuencia > 0) {
                    this.alternarEstiloBoton(this.botones[this.secuencia[indiceSecuencia - 1]], false);
                }
                if (indiceSecuencia <= this.rondaActual) {
                    this.alternarEstiloBoton(this.botones[this.secuencia[indiceSecuencia]], true);
                    this.reproducirSonido(this.secuencia[indiceSecuencia]);
                    indiceSecuencia++;
                } else {
                    clearInterval(secuenciaInterval);
                    this.botonesBloqueados = false;
                    this.posicionUsuario = 0;
                    this.establecerTemporizadorInactividad(); // Reiniciar el temporizador después de mostrar la secuencia
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
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(error => {
                    console.error('Error al reproducir sonido.');
                });
            }
        }

        perderJuego() {
            this.limpiarEstado();
            this.display.estadoJuego.textContent = 'Perdiste. Intenta de nuevo.';
            this.display.estadoJuego.style.color = 'red';
            this.display.ronda.style.display = 'none';
            this.reproducirSonido(4);
            this.display.botonEmpezar.disabled = false; // Reactivar el botón después de perder
        }

        ganarJuego() {
            this.limpiarEstado();
        
            if (window.innerWidth <= 375) {
                this.display.estadoJuego.innerHTML = '¡F E L I C I D A D E S<br>G A N A S T E!';
            } else {
                this.display.estadoJuego.innerHTML = '¡F E L I C I D A D E S <span class="espacio-ganaste"></span> G A N A S T E!';
            }
        
            this.display.ronda.style.display = 'none';
            this.reproducirSonido(5);
            this.display.botonEmpezar.disabled = false; // Reactivar el botón después de ganar
        }
    }

    new Quixo();
});
