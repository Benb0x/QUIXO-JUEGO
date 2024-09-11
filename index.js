document.addEventListener('DOMContentLoaded', function () {
    const audioPermissionModal = document.getElementById("audioPermissionModal");
    const acceptAudioButton = document.getElementById("acceptAudio");
    const botonEmpezar = document.getElementById("botonEmpezar");
    const estadoJuego = document.getElementById("estadoJuego");
    const ronda = document.getElementById("ronda");
    const botonesJuego = document.querySelectorAll("#grupoInteractivo use");

    // Crear área de depuración
    const debugArea = document.createElement('div');
    debugArea.id = 'debug';
    debugArea.style.color = 'red';
    debugArea.style.fontWeight = 'bold';
    debugArea.style.marginTop = '20px';
    document.body.appendChild(debugArea); // Añadir al final del body

    // Al hacer clic en "Aceptar", habilitamos los sonidos del juego
    acceptAudioButton.addEventListener('click', function() {
        const audio = new Audio('https://quixo-sonidos.vercel.app/sounds_1.m4a');
        audio.play().then(() => {
            console.log("Sonido habilitado");
            audioPermissionModal.style.display = 'none'; // Ocultar el modal
            document.getElementById('debug').textContent = "Sonido habilitado correctamente.";
        }).catch(error => {
            console.error("Error al reproducir el sonido:", error);
            document.getElementById('debug').textContent = "Error al habilitar el sonido.";
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
            this.botones = Array.from(botonesJuego);
            this.sonidosBoton = [];
            this.inactividadTimeout = null;
            this.secuenciaInterval = null;
            this.secuenciaActiva = false;

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
                this.iniciarJuego();
            });

            this.botones.forEach(boton => {
                boton.setAttribute('fill', boton.getAttribute('data-color-inactivo'));

                // Escuchar tanto 'click' como 'touchend' para mejorar compatibilidad con iOS
                boton.addEventListener('touchend', (event) => {
                    if (!this.botonesBloqueados && !this.secuenciaActiva) {
                        const indice = this.botones.indexOf(event.currentTarget);
                        this.validarColorElegido(indice);
                    }
                });

                boton.addEventListener('click', (event) => {
                    if (!this.botonesBloqueados && !this.secuenciaActiva) {
                        const indice = this.botones.indexOf(event.currentTarget);
                        this.validarColorElegido(indice);
                    }
                });
            });
        }

        iniciarJuego() {
            this.limpiarEstado();
            this.display.botonEmpezar.disabled = true;
            this.actualizarRonda(0);
            this.posicionUsuario = 0; // Asegurar que se reinicie la posición del usuario
            this.secuencia = this.crearSecuencia();
            this.resetEstadoJuego();
            this.mostrarSecuencia();
        }

        limpiarEstado() {
            clearTimeout(this.inactividadTimeout);
            clearInterval(this.secuenciaInterval);
            this.secuenciaActiva = false;
            this.botones.forEach(boton => this.alternarEstiloBoton(boton, false));
            this.botonesBloqueados = true;
            this.posicionUsuario = 0; // Reiniciar la posición del usuario en cada ronda
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
            if (this.secuenciaActiva) return; // Evitar que se valide mientras la secuencia se está mostrando

            // Validación correcta de la entrada del usuario
            if (this.secuencia[this.posicionUsuario] === indice) {
                clearTimeout(this.inactividadTimeout);
                this.alternarEstiloBoton(this.botones[indice], true);

                this.reproducirSonido(indice);

                setTimeout(() => {
                    this.alternarEstiloBoton(this.botones[indice], false);
                }, this.velocidad / 2);

                if (this.posicionUsuario < this.rondaActual) {
                    this.posicionUsuario++; // Aumentar la posición del usuario
                    this.display.estadoJuego.textContent = 'Correcto! Sigue así.';
                    this.inactividadTimeout = setTimeout(() => this.perderJuego(), 15000);
                } else {
                    this.posicionUsuario = 0; // Reiniciar posición del usuario
                    this.rondaActual++;
                    if (this.rondaActual < this.rondasTotales) {
                        this.display.estadoJuego.textContent = `¡Bien hecho! Ronda: ${this.rondaActual + 1}`;
                        setTimeout(() => this.mostrarSecuencia(), this.velocidad);
                    } else {
                        this.ganarJuego();
                    }
                }
            } else {
                this.perderJuego(); // Si el usuario se equivoca
            }
        }

        mostrarSecuencia() {
            this.botonesBloqueados = true; // Bloquear los botones mientras se muestra la secuencia
            let indiceSecuencia = 0;

            clearInterval(this.secuenciaInterval);

            this.secuenciaActiva = true;

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
                    this.botonesBloqueados = false; // Permitir al usuario interactuar solo después de que la secuencia termine
                    this.posicionUsuario = 0; // Reiniciar la posición del usuario para la nueva ronda
                    this.inactividadTimeout = setTimeout(() => this.perderJuego(), 15000);
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
            document.getElementById("debug").textContent = `Intentando reproducir sonido: ${indice}`;
            if (audio) {
                audio.currentTime = 0;  // Reinicia el audio
                audio.play().then(() => {
                    document.getElementById("debug").textContent = `Reproduciendo sonido: ${indice}`;
                    console.log(`Reproduciendo sonido: ${indice}`);
                }).catch(error => {
                    console.error('Error al reproducir el audio, reintentando:', error);
                    document.getElementById("debug").textContent = 'Reintentando reproducir sonido...';
                    setTimeout(() => {
                        audio.play().catch(err => console.error('Error al reintentar reproducir el sonido:', err));
                    }, 500);  // Intentar nuevamente después de 500ms
                });
            }
        }

        perderJuego() {
            this.limpiarEstado();
            this.display.estadoJuego.textContent = 'Perdiste. Intenta de nuevo.';
            this.display.estadoJuego.style.color = 'red';
            this.display.botonEmpezar.disabled = false;

            this.reproducirSonido(4); // Sonido de error
        }

        ganarJuego() {
            this.limpiarEstado();
            this.display.estadoJuego.innerHTML = '¡F E L I C I D A D E S &nbsp;&nbsp;&nbsp; G A N A S T E!';
            this.display.estadoJuego.style.color = 'green';
            this.display.estadoJuego.classList.add('ganador');
            this.display.estadoJuego.style.marginLeft = '195px';
            this.display.ronda.style.display = 'none';
            this.botonesBloqueados = true;

            this.reproducirSonido(5); // Sonido de victoria
        }
    }

    new Quixo();
});
