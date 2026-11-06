"use strict";

/* ===== Datos ===== */
const PERSONAJES = [
  { id: "jinx", nombre: "Jinx" },
  { id: "vi", nombre: "Vi" },
  { id: "caitlyn", nombre: "Caitlyn" },
  { id: "jayce", nombre: "Jayce" },
  { id: "viktor", nombre: "Viktor" },
  { id: "ekko", nombre: "Ekko" },
  { id: "heimerdinger", nombre: "Heimerdinger" },
  { id: "silco", nombre: "Silco" },
  { id: "vander", nombre: "Vander" },
  { id: "sevika", nombre: "Sevika" },
  { id: "mel", nombre: "Mel" },
  { id: "ambessa", nombre: "Ambessa" },
  { id: "leblanc", nombre: "LeBlanc" },
  { id: "singed", nombre: "Singed" },
  { id: "warwick", nombre: "Warwick" }
];

const RETARDO_OCULTAR = 1500; // ms que se ven dos cartas distintas antes de ocultarse
const NIVELES = { 6: "facil", 10: "medio", 15: "dificil" };

/* ===== Elementos del DOM ===== */
const pantallaInicio = document.getElementById("pantalla-inicio");
const pantallaJuego = document.getElementById("pantalla-juego");
const tablero = document.getElementById("tablero");
const elIntentos = document.getElementById("intentos");
const elParejas = document.getElementById("parejas");
const elTiempo = document.getElementById("tiempo");
const elEstado = document.getElementById("estado");
const dialogo = document.getElementById("dialogo-fin");
const resumenFin = document.getElementById("resumen-fin");
const recordFin = document.getElementById("record-fin");

/* ===== Estado ===== */
let numParejas = 6;
let primera = null;       // primera carta volteada del turno
let bloqueado = false;    // evita pulsar mientras se comparan/ocultan cartas
let intentos = 0;
let encontradas = 0;
let segundos = 0;
let temporizador = null;
let temporizadorOcultar = null;

/* ===== Utilidades ===== */
function barajar(lista) {
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatoTiempo(total) { /* funcion desarrollada con claude */
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function anunciar(texto) {
  elEstado.textContent = texto;
}

/* Distribución del tablero: en pantallas verticales hay más filas que columnas */
function ajustarColumnas() {
  const total = numParejas * 2;
  const opciones = { 12: [4, 3], 20: [5, 4], 30: [6, 5] }[total];
  const vertical = window.matchMedia("(orientation: portrait)").matches;
  const [ancho, alto] = opciones;
  tablero.style.setProperty("--columnas", vertical ? alto : ancho);
  tablero.style.setProperty("--filas", vertical ? ancho : alto);
}

/* ===== Récords (localStorage, opcional) ===== */
function leerRecord() { /* funcion desarrollada con claude */
  try {
    const v = localStorage.getItem("arcane-memory-" + NIVELES[numParejas]);
    return v ? JSON.parse(v) : null;
  } catch (e) {
    return null;
  }
}

function guardarRecord(datos) { /* funcion desarrollada con claude */
  try {
    localStorage.setItem("arcane-memory-" + NIVELES[numParejas], JSON.stringify(datos));
  } catch (e) { /* el juego funciona igual sin guardado */ }
}

/* ===== Temporizador ===== */
function arrancarTiempo() {
  if (temporizador) return;
  temporizador = setInterval(() => {
    segundos++;
    elTiempo.textContent = formatoTiempo(segundos);
  }, 1000);
}

function pararTiempo() {
  clearInterval(temporizador);
  temporizador = null;
}

/* ===== Creación del tablero ===== */
function crearCarta(personaje, indice) {
  const carta = document.createElement("button");
  carta.type = "button";
  carta.className = "carta";
  carta.dataset.id = personaje.id;
  carta.setAttribute("aria-label", `Carta ${indice + 1}, boca abajo`);

  carta.innerHTML = `
    <span class="carta-interior">
      <span class="cara cara-trasera"><img src="img/reverso.jpg" alt="" draggable="false"></span>
      <span class="cara cara-frontal"><img src="img/cartas/${personaje.id}.jpg" alt="${personaje.nombre}" draggable="false"></span>
    </span>`;

  carta.addEventListener("click", () => voltear(carta));
  return carta;
}

function nuevaPartida() {
  clearTimeout(temporizadorOcultar);
  pararTiempo();

  primera = null;
  bloqueado = false;
  intentos = 0;
  encontradas = 0;
  segundos = 0;

  elIntentos.textContent = "0";
  elParejas.textContent = `0 / ${numParejas}`;
  elTiempo.textContent = "00:00";
  anunciar("");

  // Elegimos personajes al azar, los duplicamos y barajamos
  const elegidos = barajar(PERSONAJES).slice(0, numParejas);
  const mazo = barajar([...elegidos, ...elegidos]);

  tablero.replaceChildren(...mazo.map(crearCarta));
  ajustarColumnas();
}

/* ===== Lógica de juego ===== */
function voltear(carta) {
  if (bloqueado) return;
  if (carta.classList.contains("volteada") || carta.classList.contains("acertada")) return;

  arrancarTiempo();
  carta.classList.add("volteada");
  carta.setAttribute("aria-label", `Carta descubierta: ${carta.querySelector("img[alt]:not([alt=''])").alt}`);

  if (!primera) {
    primera = carta;
    return;
  }

  // Segunda carta del turno
  intentos++;
  elIntentos.textContent = intentos;
  comparar(primera, carta);
  primera = null;
}

function comparar(a, b) {
  if (a.dataset.id === b.dataset.id) {
    [a, b].forEach(c => {
      c.classList.remove("volteada");
      c.classList.add("acertada");
      c.disabled = true;
    });
    encontradas++;
    elParejas.textContent = `${encontradas} / ${numParejas}`;
    anunciar(`Pareja encontrada: ${a.querySelector("img[alt]:not([alt=''])").alt}`);

    if (encontradas === numParejas) terminar();
    return;
  }

  // Son distintas: se ven un momento y se vuelven a ocultar
  bloqueado = true;
  [a, b].forEach(c => c.classList.add("error"));
  anunciar("No coinciden");

  temporizadorOcultar = setTimeout(() => {
    [a, b].forEach(c => {
      c.classList.remove("volteada", "error");
      c.setAttribute("aria-label", "Carta boca abajo");
    });
    bloqueado = false;
  }, RETARDO_OCULTAR);
}

function terminar() {
  pararTiempo();

  const record = leerRecord();
  const esRecord = !record || intentos < record.intentos ||
    (intentos === record.intentos && segundos < record.segundos);

  resumenFin.textContent =
    `Lo has conseguido en ${intentos} intentos y ${formatoTiempo(segundos)}.`;

  if (esRecord) {
    guardarRecord({ intentos, segundos });
    recordFin.textContent = "¡Nuevo récord en esta dificultad!";
  } else {
    recordFin.textContent =
      `Tu mejor marca: ${record.intentos} intentos en ${formatoTiempo(record.segundos)}.`;
  }

  // Pequeña pausa para ver la última pareja antes de mostrar el diálogo
  setTimeout(() => dialogo.showModal(), 700);
}

/* ===== Navegación entre pantallas ===== */
function mostrarJuego(parejas) {
  numParejas = parejas;
  pantallaInicio.hidden = true;
  pantallaJuego.hidden = false;
  nuevaPartida();
}

function mostrarMenu() {
  clearTimeout(temporizadorOcultar);
  pararTiempo();
  if (dialogo.open) dialogo.close();
  pantallaJuego.hidden = true;
  pantallaInicio.hidden = false;
}

/* ===== Eventos ===== */
document.querySelectorAll("[data-parejas]").forEach(boton => {
  boton.addEventListener("click", () => mostrarJuego(Number(boton.dataset.parejas)));
});

document.getElementById("btn-reiniciar").addEventListener("click", nuevaPartida);
document.getElementById("btn-menu").addEventListener("click", mostrarMenu);

document.getElementById("btn-otra").addEventListener("click", () => {
  dialogo.close();
  nuevaPartida();
});
document.getElementById("btn-salir").addEventListener("click", mostrarMenu);

window.matchMedia("(orientation: portrait)").addEventListener("change", ajustarColumnas);
