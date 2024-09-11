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

        async cargarSonidos() {
            const sonidos = [
                'https://quixo-sonidos.vercel.app/sounds_1.m4a',
                'https://quixo-sonidos.vercel.app/sounds_2.m4a',
                'https://quixo-sonidos.vercel.app/sounds_3.m4a',
                'https://quixo-sonidos.vercel.app/sounds_4.m4a',
                'https://quixo-sonidos.vercel.app/sounds_error.m4a',
                'https://quixo-sonidos.vercel.app/win.m4a'
            ];

            const promesas = sonidos.map((sonido, indice) => {
                return new Promise((resolve, reject) => {
                    const audio = new Audio(sonido);
                    audio.crossOrigin = 'anonymous';  // Evitar problemas de CORS si los archivos están en otro dominio
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
                document.getElementById('debug').textContent = "Sonidos cargados correctamente.";
            } catch (error) {
                console.error('Error al cargar los sonidos:', error);
                document.getElementById('debug').textContent = "Error al cargar los sonidos.";
            }
        }

        iniciar() {
            this.display.botonEmpezar.addEventListener('click', () => {
                this.iniciarJuego();
            });

            this.botones.forEach(boton => {
                boton.setAttribute('fill', boton.getAttribute('data-color-inactivo'));

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
            this.posicionUsuario = 0;
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
            if (this.secuenciaActiva) return;

            if (this.secuencia[this.posicionUsuario] === indice) {
                clearTimeout(this.inactividadTimeout);
                this.alternarEstiloBoton(this.botones[indice], true);

                this.reproducirSonido(indice);

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
                    this.display.estadoJuego.textContent = 'Correcto! Sigue así.';
                    this.inactividadTimeout = setTimeout(() => this.perderJuego(), 15000);
                }
            } else {
                setTimeout(() => this.perderJuego(), 250);
            }
        }

        mostrarSecuencia() {
            this.botonesBloqueados = true;
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
                    this.botonesBloqueados = false;
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
                audio.play().then(() => {
                    document.getElementById("debug").textContent = `Reproduciendo sonido: ${indice}`;
                    console.log(`Reproduciendo sonido: ${indice}`);
                }).catch(error => {
                    document.getElementById("debug").textContent = 'Error al reproducir el sonido.';
                    console.error('Error al reproducir el audio:', error);
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
