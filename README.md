# Arcane Memory Game

Juego de memoria (memory) con personajes de la serie *Arcane*, desarrollado con **HTML5, CSS3 y JavaScript puro**, sin librerías ni frameworks.

Autor: Alejandro Martinez

## Cómo jugar

1. Abre `main.html` en el navegador.
2. Elige la dificultad: fácil (6 parejas), medio (10) o difícil (15).
3. Pulsa dos cartas para descubrirlas.
   - Si son iguales, se quedan descubiertas.
   - Si son distintas, se vuelven a ocultar tras 1,5 segundos.
4. El juego termina cuando has descubierto todas las parejas.

## Características

- Tres niveles de dificultad.
- En cada partida se eligen y se barajan los personajes al azar.
- Contador de intentos, de parejas encontradas y cronómetro.
- Mejor marca guardada por dificultad (`localStorage`).
- Botones para reiniciar la partida y volver al menú.
- Diseño adaptable a ordenador y móvil.
- Cartas accesibles con teclado y animaciones reducidas si el sistema lo indica.

## Estructura del proyecto

```
ArcaneMemory/
├── main.html         Estructura de la página
├── css/styles.css    Estilos y animación de giro de las cartas
├── js/script.js      Lógica del juego
└── img/              Portada, fondo, reverso y cartas de los personajes
└── README.md         Información sobre el juego
```

## Tecnologías

- HTML5 (incluye el elemento `<dialog>` para el mensaje final)
- CSS3 (Grid, variables CSS y transformaciones 3D)
- JavaScript (ES6+, sin dependencias)


## Configuración

El tiempo que tardan en ocultarse dos cartas distintas se cambia en `js/script.js`, en la constante `RETARDO_OCULTAR` (en milisegundos).

## IA´s utilizadas

- Gemini (Imagenes de las cartas con los personajes)
- ChatGPT(Imagenes de fondo y portada)
-Claude (Apoyo para el desarrollo de las funcionones:  `function guardarRecord(datos)`, `function leerRecord()`, `function formatoTiempo(total)`)