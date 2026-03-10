const fs = require('fs');
const CryptoJS = require("crypto-js");

const CLUES = [
  { id: 1, clue: "¿Qué herramienta principal permite automatizar interacciones en aplicaciones web?", answer: "PLAYWRIGHT" },
  { id: 2, clue: "¿Qué lenguaje, que actúa como un superconjunto de JavaScript, se recomienda habitualmente para Playwright?", answer: "TYPESCRIPT" },
  { id: 3, clue: "¿Cuál es el entorno de ejecución en el servidor necesario para correr el código de Playwright?", answer: "NODE" },
  { id: 4, clue: "¿Qué gestor de paquetes de Node se utiliza para instalar Playwright y sus dependencias?", answer: "NPM" },
  { id: 5, clue: "¿Qué editor de código (IDE) recomienda la documentación para trabajar con Playwright?", answer: "VSCODE" },
  { id: 6, clue: "¿Qué framework veterano de pruebas automatizadas utiliza el protocolo WebDriver?", answer: "SELENIUM" },
  { id: 7, clue: "¿Qué framework de pruebas es el favorito para equipos enfocados exclusivamente en JavaScript (SPAs)?", answer: "CYPRESS" },
  { id: 8, clue: "¿Qué plataforma de CI/CD utiliza archivos de flujo de trabajo en la carpeta .github/workflows?", answer: "GITHUB" },
  { id: 9, clue: "¿Qué extensión de archivo se usa para definir los flujos de trabajo de integración continua?", answer: "YML" },
  { id: 10, clue: "¿Qué acrónimo designa al patrón de diseño que separa la lógica de las pruebas de la estructura visual de la página?", answer: "POM" },
  { id: 11, clue: "¿Qué plataforma visual de pruebas fue migrada hacia Playwright en el caso de estudio de Berger-Levrault?", answer: "KATALON" },
  { id: 12, clue: "¿Qué acrónimo en inglés se usa para referirse a la Ingeniería Dirigida por Modelos utilizada en dicha migración?", answer: "MDE" },
  { id: 13, clue: "¿En qué lenguaje de programación están basados los scripts originales de la herramienta Katalon Studio?", answer: "GROOVY" },
  { id: 14, clue: "¿Qué entorno interactivo de Smalltalk se usó para construir el metamodelo durante el proceso de migración?", answer: "PHARO" },
  { id: 15, clue: "¿Qué analizador sintáctico (parser) se utilizó para leer e importar el código de Katalon?", answer: "TREESITTER" },
  { id: 16, clue: "¿Qué tipo de pruebas sirven para validar el estado de la interfaz de usuario sin tener que cargar o navegar por toda la aplicación?", answer: "COMPONENTES" },
  { id: 17, clue: "¿Qué método de Playwright se usa para interceptar peticiones de red (network mocking)?", answer: "ROUTE" },
  { id: 18, clue: "¿Qué método de intercepción reemplaza una respuesta de red real por datos simulados (mock)?", answer: "FULFILL" },
  { id: 19, clue: "¿Qué método bloquea por completo una solicitud de red interceptada simulando un fallo?", answer: "ABORT" },
  { id: 20, clue: "¿Qué formato de archivo permite guardar el tráfico HTTP para luego ser reproducido en las pruebas?", answer: "HAR" },
  { id: 21, clue: "¿Qué herramienta gráfica de Playwright permite explorar visualmente los tests grabados paso a paso?", answer: "TRACE" },
  { id: 22, clue: "¿En qué formato de archivo web se genera por defecto el reporte de ejecución de las pruebas?", answer: "HTML" },
  { id: 23, clue: "¿Qué motor de renderizado utilizado en Playwright simula el comportamiento del navegador Safari?", answer: "WEBKIT" },
  { id: 24, clue: "¿Qué concepto de Playwright permite configurar estados, datos y limpieza reutilizables (setup/teardown) para múltiples pruebas?", answer: "FIXTURES" },
  { id: 25, clue: "¿Qué acrónimo define a las pruebas que validan el flujo completo del usuario de extremo a extremo?", answer: "E2E" },
  { id: 26, clue: "¿Qué motor de renderizado de código abierto soporta Playwright de forma nativa para imitar a Google Chrome?", answer: "CHROMIUM" },
  { id: 27, clue: "¿Qué sistema operativo de código abierto es compatible con Playwright junto a Windows y macOS?", answer: "LINUX" },
  { id: 28, clue: "¿Qué clave dentro del archivo package.json define comandos personalizados como \"ci:e2e\"?", answer: "SCRIPTS" },
  { id: 29, clue: "¿Qué método se utiliza para reanudar una petición interceptada permitiendo que continúe hacia el servidor?", answer: "CONTINUE" },
  { id: 30, clue: "¿Qué navegador web de Mozilla está soportado de forma nativa por el motor de Playwright?", answer: "FIREFOX" },
];

const secretKey = process.env.NEXT_PUBLIC_CROSSWORD_SECRET || "plw_cr0ssw0rd_s3cur3_k3y_98Xq!";
const encrypted = CryptoJS.AES.encrypt(JSON.stringify(CLUES), secretKey).toString();

const content = `/**
 * Static data for the Playwright Automation crossword puzzle.
 * The clues are AES encrypted to prevent casual cheating via DevTools.
 * The secret key must be set in the environment or a default will be used during execution.
 */

export interface ClueEntry {
  id: number;
  clue: string;
  answer: string; // Always uppercase
}

export const ENCRYPTED_CLUES = "${encrypted}";
`;

fs.writeFileSync('./lib/crossword-data.ts', content, 'utf8');
console.log('Successfully updated crossword-data.ts');
