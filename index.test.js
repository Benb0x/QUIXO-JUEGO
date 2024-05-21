const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const Quixo = require('./index.js');

const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');

describe('Pruebas de Quixo', () => {
  let window, document;

  beforeEach((done) => {
    const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
    window = dom.window;
    document = window.document;
    global.document = document;
    global.window = window;
    window.Quixo = Quixo; // Asegurar que Quixo esté disponible en el contexto global

    // Crear y añadir los elementos al DOM
    const btnEmpezar = document.createElement('button');
    btnEmpezar.id = 'btnEmpezar';
    document.body.appendChild(btnEmpezar);

    const celeste = document.createElement('div');
    celeste.id = 'celeste';
    document.body.appendChild(celeste);

    const violeta = document.createElement('div');
    violeta.id = 'violeta';
    document.body.appendChild(violeta);

    const naranja = document.createElement('div');
    naranja.id = 'naranja';
    document.body.appendChild(naranja);

    const verde = document.createElement('div');
    verde.id = 'verde';
    document.body.appendChild(verde);

    setTimeout(() => {
      done();
    }, 100); // Esperar un poco para asegurar que el DOM se haya cargado completamente
  });

  test('Prueba de crear secuencia', () => {
    const quixo = new window.Quixo();
    expect(quixo.secuencia.length).toBe(10);
  });

  test('Prueba de mostrar secuencia', () => {
    jest.useFakeTimers();
    const quixo = new window.Quixo();
    jest.advanceTimersByTime(500);
    expect(quixo.nivel).toBe(1);
    jest.useRealTimers();
  });

  
});