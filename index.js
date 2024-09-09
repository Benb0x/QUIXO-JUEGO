document.addEventListener('DOMContentLoaded', function() {
    class Quixo {
        constructor() {
            const botonEmpezar = document.getElementById("botonEmpezar");
            const estadoJuego = document.getElementById("estadoJuego");
            const ronda = document.getElementById("ronda");
            const botonesJuego = document.querySelectorAll("#grupoInteractivo use");

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

            this.iniciar();  // Iniciar el juego
        }

        iniciar() {
            // Cargar sonidos solo después de que el usuario haga clic o toque
            this.display.botonEmpezar.addEventListener('touchstart', async () => {
                await this.cargarSonidos();  // Cargar los sonidos en iPhone
                this.iniciarJuego();
            }, { once: true });

            this.display.botonEmpezar.addEventListener('click', async () => {
                await this.cargarSonidos();  // Cargar los sonidos en otras plataformas
                this.iniciarJuego();
            }, { once: true });

            // Configuración de los botones interactivos
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
            this.display.estadoJuego.style.color = '#4682B4';  // Color predeterminado
            this.display.estadoJuego.classList.remove('ganador'); // Quita la clase ganador
            this.display.estadoJuego.style.marginLeft = '20px'; // Resetea el margen izquierdo
        }

        actualizarRonda(valor) {
            this.rondaActual = valor;
        }

        crearSecuencia() {
            return Array.from({ length: this.rondasTotales }, () => Math.floor(Math.random() * this.botones.length));
        }

        validarColorElegido(indice) {
            if (this.secuencia[this.posicionUsuario] === indice) {
                clearTimeout(this.inactividadTimeout);  // Limpiar el temporizador de inactividad
                this.alternarEstiloBoton(this.botones[indice], true);

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
            clearTimeout(this.inactividadTimeout); // Limpiar el temporizador de inactividad
            this.display.estadoJuego.innerHTML = '¡F E L I C I D A D E S &nbsp;&nbsp;&nbsp; G A N A S T E!';
            this.display.estadoJuego.style.color = 'gold';
            this.display.estadoJuego.classList.add('ganador');
            this.display.estadoJuego.style.marginLeft = '195px'; // Ajusta el valor según lo necesites
            this.display.ronda.style.display = 'none';
            this.botonesBloqueados = true;
        
            // Reproduce el sonido de victoria
            if (this.sonidosBoton[5]) {  // Asumiendo que el sonido de victoria es el índice 5
                this.sonidosBoton[5].play();
            }
        
            // Cambia el color de los elementos especificados
            const nuevoColor = '#FFD700'; // Dorado, ajusta según sea necesario
            const elementos = [cascoS, cascoI, ojos, bigote];
        
            elementos.forEach((elemento, index) => {
                setTimeout(() => {
                    elemento.style.fill = nuevoColor;
                    elemento.classList.add('animacion-ganador');
                }, index * 250); // Ajusta el tiempo entre cada animación
            });
        
            setTimeout(() => {
                elementos.reverse().forEach((elemento, index) => {
                    setTimeout(() => {
                        elemento.style.fill = '';
                        elemento.classList.add('animacion-ganador');
                    }, index * 100); // Ajusta el tiempo entre cada animación
                });
            }, elementos.length * 100); // Espera a que termine la primera secuencia
        
            setTimeout(() => {
                this.display.botonEmpezar.disabled = false;
                this.resetJuego();
            }, (elementos.length * 2 * 100) + 1000); // Espera a que termine la animación para habilitar el botón
        }
        resetJuego() {
            this.botones.forEach(boton => this.alternarEstiloBoton(boton, false));
        }

    }
    new Quixo();
});