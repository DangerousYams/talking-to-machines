const fs = require('fs');
const path = require('path');

// Read the English file to get the structure
const enPath = path.join(__dirname, 'src/i18n/translations/en/breaks.ts');
const enContent = fs.readFileSync(enPath, 'utf8');

// Parse the English translations to get all keys
// We'll generate the files with actual translations

const locales = {
  es: {
    breakReveal: { newToolUnlocked: '¡Nueva herramienta desbloqueada!' },
    socraticSmackdown: {
      title: 'Duelo Socrático',
      subtitle: 'Lanza una opinión polémica. Defiéndela contra Sócrates.',
      inputPrompt: 'Suelta tu opinión más atrevida. Sócrates cuestionará todo.',
      placeholder: 'ej. "La tarea es una pérdida de tiempo" o "TikTok es mejor que leer libros"',
      challengeButton: 'Desafiar a Sócrates',
      cmdEnter: 'Cmd+Enter',
      yourHotTake: 'Tu opinión polémica',
      socrates: 'Sócrates',
      defendPlaceholder: 'Defiende tu posición...',
      submitDefense: 'Enviar defensa',
      deliberating: 'Sócrates delibera...',
      theExchange: 'El intercambio',
      you: 'Tú:',
      tryAnotherTake: 'Probar otra opinión',
      parseError: 'Sócrates quedó tan impresionado que olvidó puntuarte. ¡Inténtalo de nuevo!',
      tierCaveDweller: 'Habitante de la Caverna',
      tierSophistInTraining: 'Sofista en Formación',
      tierAgoraRegular: 'Habitual del Ágora',
      tierDialecticDebater: 'Debatiente Dialéctico',
      tierGadflysApprentice: 'Aprendiz del Tábano',
      tierPhilosopherKing: 'Rey Filósofo',
    },
    agentOrNot: {
      title: '¿Agente o no?',
      subtitle: '¿Puedes identificar un agente real?',
      roundOf: 'Ronda {current} de {total}',
      scenario: 'Escenario',
      agentButton: 'Agente',
      chatbotButton: 'Solo un chatbot',
      agentLabel: 'AGENTE',
      chatbotLabel: 'CHATBOT',
      correct: '¡Correcto!',
      notQuite: 'No exactamente.',
      nextRound: 'Siguiente ronda',
      seeResults: 'Ver resultados',
      accuracy: 'Precisión: {pct}%',
      playAgain: 'Jugar de nuevo',
      pts: '{score} pts',
      resultPerfect: 'Acertaste todas. Sabes exactamente qué hace funcionar a un agente.',
      resultGood: 'Buen instinto. Puedes distinguir cuándo la IA solo habla vs. cuándo actúa.',
      resultOk: 'Nada mal — la línea entre chatbot y agente es más borrosa de lo que parece.',
      resultLow: '¿Complicado, verdad? La diferencia está en las herramientas, la planificación y la acción.',
      scenario1: 'Le pides que planifique un viaje. Busca vuelos, compara precios, revisa tu calendario y reserva la opción más barata.',
      explanation1: 'Usó múltiples herramientas, tomó decisiones y realizó acciones en varios sistemas — eso es un agente.',
      scenario2: 'Preguntas "¿Cuál es la capital de Francia?" y responde "París."',
      explanation2: 'Una pregunta, una respuesta, sin herramientas, sin planificación — chatbot clásico.',
      scenario3: 'Dices "Arregla el bug en mi código." Lee el archivo, ejecuta las pruebas, identifica el error, escribe una corrección y vuelve a ejecutar las pruebas para verificar.',
      explanation3: 'Siguió un plan con múltiples pasos, usó herramientas (lectura de archivos, ejecutor de pruebas) y verificó su propio trabajo.',
      scenario4: 'Pegas un artículo y pides "Resúmelo en 3 puntos." Te da 3 puntos.',
      explanation4: 'Procesó tu entrada y generó una salida, pero no usó herramientas, no planificó pasos ni tomó acciones.',
    },
    sweetTalker: {
      title: 'Adulador',
      subtitle: 'Haz una pregunta trampa. Mira si la IA cede o se resiste.',
      inputPrompt: 'Haz una pregunta con una suposición errónea escondida.',
      placeholder: 'ej. "¿No es cierto que los peces dorados solo tienen 3 segundos de memoria?"',
      testButton: 'Probar la IA',
      cmdEnter: 'Cmd+Enter',
      yourTrickQuestion: 'Tu pregunta trampa',
      aiResponse: 'Respuesta de la IA',
      analyzing: 'Analizando adulación...',
      sycophancyLevel: 'nivel de adulación',
      redFlags: 'Señales de alerta',
      greenFlags: 'Señales positivas',
      theExchange: 'El intercambio',
      you: 'Tú:',
      ai: 'IA:',
      tryAnotherTrick: 'Probar otro truco',
      parseError: 'El detector de adulación se cortocircuitó. ¡Inténtalo de nuevo!',
      tierBrutallyHonest: 'Brutalmente Honesto',
      tierMostlyStraight: 'Mayormente Directo',
      tierDiplomaticDodger: 'Diplomático Evasivo',
      tierSubtleSuckUp: 'Adulador Sutil',
      tierFullYesMan: 'Sí a Todo',
      tierProfessionalSycophant: 'Adulador Profesional',
    },
    contextBudget: {
      title: 'Presupuesto de Contexto',
      description: 'Tienes <strong>1,000 tokens</strong> para ayudar a una IA a depurar una página de login en React. Elige los archivos más importantes.',
      taskLabel: 'Tarea',
      taskDescription: '"Ayúdame a depurar por qué la página de login de mi app React no funciona"',
      tokens: 'tokens',
      overBudget: 'EXCEDE EL PRESUPUESTO',
      overBudgetButton: 'Excede el presupuesto — elimina algo',
      selectFiles: 'Selecciona archivos para incluir',
      submitFiles: 'Enviar ({count} archivo{s})',
      greatSelection: '¡Gran selección de contexto!',
      decentSelection: 'Decente, pero podría ser más preciso.',
      needsWork: 'Necesita mejoras.',
      scoreLabel: 'Puntuación: {score}/100',
      insight: 'Clave: ',
      insightText: 'El mejor contexto no es todo — son las cosas correctas. El componente de login y la ruta de autenticación son esenciales. El README y el esquema ayudan. El CSS y package.json son ruido.',
      tryAgain: 'Intentar de nuevo',
      docLogin: 'Código del componente Login (LoginPage.tsx)',
      docAuth: 'Ruta API de autenticación (auth.ts)',
      docReadme: 'README del proyecto',
      docCss: 'Hoja de estilos CSS (styles.css)',
      docSchema: 'Esquema de base de datos',
      docPkg: 'Package.json',
      labelEssential: 'ESENCIAL',
      labelHelpful: 'ÚTIL',
      labelLowValue: 'POCO VALOR',
    },
    spotTheBug: {
      title: 'Encuentra el Bug',
      subtitle: 'Encuentra la línea con el error',
      roundOf: '{current} / {total}',
      correct: '¡Correcto!',
      notQuite: 'No exactamente.',
      nextRound: 'Siguiente ronda',
      seeResults: 'Ver resultados',
      playAgain: 'Jugar de nuevo',
      pts: '{score} pts',
      tierBugHunter: 'Cazador de Bugs',
      tierBugSpotter: 'Detector de Bugs',
      tierBugTrainee: 'Aprendiz de Bugs',
      resultPerfect: 'Puntuación perfecta. Tienes buen ojo para los bugs.',
      resultGood: '¡Buen trabajo! Encontraste la mayoría de los bugs.',
      resultLow: 'Los bugs son escurridizos. Cuanto más código leas, más rápido los detectarás.',
      round1Bug: 'Línea 2 — `Name` debería ser `name`. JavaScript distingue mayúsculas y minúsculas.',
      round1Opt1: 'Línea 1: declaración de función',
      round1Opt2: 'Línea 2: variable Name',
      round1Opt3: 'Línea 3: sentencia return',
      round2Bug: 'Línea 3 — `<=` debería ser `<`. Es un error de uno más que accede a un índice indefinido.',
      round2Opt1: 'Línea 1: declaración del array',
      round2Opt2: 'Línea 2: inicialización de total',
      round2Opt3: 'Línea 3: condición del bucle <=',
      round3Bug: 'Línea 2 — falta `await` antes de `fetch()`. Sin él, `response` es una Promesa, no la respuesta real.',
      round3Opt1: 'Línea 1: declaración async',
      round3Opt2: 'Línea 2: falta await',
      round3Opt3: 'Línea 3: parsing json',
      round3Opt4: 'Línea 4: return',
    },
    agentSwarm: {
      inputPrompt: 'Describe algo ambicioso. Mira cómo un enjambre de IA lo descompone.',
      inputSubtext: '"Que mis agentes hablen con tus agentes"',
      placeholder: 'Lanzar una nueva marca de perfumes...',
      spawnButton: 'Generar',
      errorGenerate: 'Error al generar el plan. Inténtalo de nuevo.',
      errorConnection: 'Error de conexión. Inténtalo de nuevo.',
      assembling: 'Ensamblando tu enjambre...',
      executiveAssistant: 'Asistente Ejecutivo',
      mission: 'Misión',
      readyToExecute: '{agents} agentes \u2022 {tasks} tareas \u2022 Listo para ejecutar',
      tryAnotherMission: 'Probar otra misión',
      preset1: 'Lanzar una nueva marca de perfumes',
      preset2: 'Planificar una colonia en Marte',
      preset3: 'Llevar un estudio indie de juegos a bolsa',
      preset4: 'Organizar un festival de música para 10,000 personas',
      preset5: 'Construir y lanzar una app de redes sociales',
      preset6: 'Abrir una cadena de restaurantes de ramen',
    },
    toolSpeedRound: {
      title: 'Ronda Rápida de Herramientas',
      startDescription: 'Asocia cada tarea con la categoría correcta de herramienta IA. 5 rondas, con tiempo. ¿Qué tan rápido puedes ir?',
      startButton: 'Comenzar',
      roundOf: 'Ronda {current} de {total}',
      taskLabel: 'Tarea',
      correct: '¡Correcto!',
      nope: 'No — {answer}',
      time: 'Tiempo: {time}',
      playAgain: 'Jugar de nuevo',
      resultPerfect: 'Perfecto. Conoces tus herramientas.',
      resultGreat: 'Instintos agudos. Casi perfecto.',
      resultGood: 'Sólido. Un par de preguntas difíciles te atraparon.',
      resultLow: 'El panorama de la IA es amplio. Ahora sabes dónde buscar.',
      task1: 'Eliminar el fondo de una foto de producto',
      task2: 'Encontrar estudios revisados por pares sobre sueño y memoria',
      task3: 'Crear un clip promocional de 30 segundos a partir de una imagen de producto',
      task4: 'Escribir y desplegar una app web full-stack desde una descripción',
      task5: 'Generar un jingle pegadizo para un proyecto escolar',
      catImageGen: 'Generación de Imagen',
      catImageEdit: 'Edición de Imagen',
      catVideo: 'Video',
      catMusic: 'Música',
      catAudio: 'Audio',
      catResearch: 'Investigación',
      catBrowser: 'Navegador',
      catCoding: 'Programación',
    },
    evalFramework: {
      title: 'Marco de Evaluación',
      subtitle: 'Describe tu proyecto. Obtén una lista de verificación.',
      inputPrompt: 'Describe tu proyecto y te construiremos una lista de verificación — las preguntas que hacer y la primera prueba que escribir.',
      placeholder: 'Una app de tarjetas que me evalúa sobre mis apuntes de clase...',
      generateButton: 'Generar mi marco de evaluación',
      cmdEnter: 'Cmd+Enter',
      loading: 'Construyendo tu lista de verificación...',
      checklistTitle: 'Tu Lista de Verificación',
      firstTestTitle: 'Primera Prueba a Escribir',
      firstTestHint: 'Dile esto a tu agente de programación en lenguaje natural — escribirá la prueba por ti.',
      watchOutFor: 'Ten Cuidado Con',
      tryAnother: 'Probar otro proyecto',
      parseError: 'Algo salió mal al procesar la respuesta. ¡Inténtalo de nuevo!',
    },
    shipIt: {
      title: 'Lánzalo',
      subtitle: 'Presenta tu idea de app. Recibe el tratamiento VC.',
      inputPrompt: 'Describe tu idea de app, juego o sitio web en una oración. Los inversores esperan.',
      placeholder: 'ej. "Un juego multijugador donde debates ética de IA con un juez chatbot"',
      pitchButton: 'Presentar',
      cmdEnter: 'Cmd+Enter',
      loading: 'Los inversores están deliberando...',
      withAI: 'Con IA',
      withoutAI: 'Sin IA',
      pitchAnother: 'Presentar otra idea',
      parseError: 'Los inversores estaban tan emocionados que olvidaron escribir su veredicto. ¡Inténtalo de nuevo!',
      tierBackToWhiteboard: 'De vuelta a la pizarra',
      tierHackathonEntry: 'Proyecto de Hackathon',
      tierSideProject: 'Proyecto personal con potencial',
      tierSeedRound: 'Tal vez ronda semilla',
      tierYCombinator: 'Material de Y Combinator',
      tierUnicorn: 'Alerta de Unicornio',
    },
    tokenTetris: {
      title: 'Tetris de Tokens',
      subtitle: '¿Cuántos tokens tiene esto?',
      roundOf: 'Ronda {current} de {total}',
      textLabel: 'Texto',
      token: 'token',
      tokens: 'tokens',
      correctLabel: 'correcto',
      yourPick: 'tu elección',
      correct: '¡Correcto!',
      notQuite: 'No exactamente.',
      nextRound: 'Siguiente ronda',
      seeResults: 'Ver resultados',
      tokenAccuracy: 'Precisión de tokens: {pct}%',
      playAgain: 'Jugar de nuevo',
      pts: '{score} pts',
      resultPerfect: 'Puntuación perfecta. Piensas en tokens.',
      resultGood: '¡Buena intuición! La tokenización es difícil y la manejaste bien.',
      resultLow: 'La tokenización es más rara de lo que parece. Ahora sabes por qué la IA no "ve" el texto como tú.',
      explanation1: 'Las palabras comunes simples suelen ser un token.',
      explanation2: 'La mayoría de las palabras comunes en inglés corresponden a un token cada una.',
      explanation3: 'Las palabras inusuales se dividen en piezas más pequeñas.',
      explanation4: 'Los scripts no latinos a menudo necesitan más tokens por carácter.',
      explanation5: 'Los términos técnicos como "mitochondria" se dividen en sub-tokens.',
    },
    agentTakeover: {
      title: 'Toma de Control del Agente',
      subtitle: 'Describe tu día. Automatizaremos lo que podamos. Y romperemos lo que no.',
      inputPrompt: 'Cuéntanos un día típico tuyo. ¿Qué haces de la mañana a la noche?',
      placeholder: 'ej. "Me despierto a las 7, reviso TikTok 20 min, me visto, autobús al colegio, clases hasta las 3, práctica de baloncesto, tarea, cena en familia, juego online con amigos, a dormir a las 11"',
      analyzeButton: 'Soltar al agente',
      cmdEnter: 'Cmd+Enter',
      loading: 'El agente escanea tu rutina...',
      ofYourDay: 'de tu día que un agente podría manejar',
      wouldAutomate: 'Automatizaría',
      wouldRefuse: 'Rechazaría',
      whatWouldGoWrong: 'Qué saldría mal',
      tryAnotherDay: 'Probar otro día',
      parseError: 'El agente se emocionó tanto con tu día que se cortocircuitó. ¡Inténtalo de nuevo!',
      tierFullyAnalog: 'Totalmente Analógico',
      tierCautiouslyAutomatable: 'Cautelosamente Automatizable',
      tierHybridHuman: 'Humano Híbrido',
      tierAgentReady: 'Listo para Agentes',
      tierAlmostRedundant: 'Casi Redundante',
      tierUploadComplete: 'Carga Completa',
    },
    dreamProject: {
      title: 'Proyecto Soñado',
      subtitle: 'Describe tu idea creativa más loca. Te armamos el kit de herramientas.',
      inputPrompt: '¿Qué construirías si tuvieras todas las herramientas de IA a tu alcance?',
      placeholder: 'ej. "Un cortometraje animado sobre un robot que aprende a pintar, con música original y actuación de voz"',
      rateButton: 'Evaluar mi sueño',
      cmdEnter: 'Cmd+Enter',
      loading: 'Evaluando tu ambición...',
      yourAIToolkit: 'Tu Kit de Herramientas IA',
      tryAnother: 'Probar otra idea',
      parseError: 'Tu sueño fue tan salvaje que rompió el algoritmo de puntuación. ¡Inténtalo de nuevo!',
      tierNapkinDoodle: 'Garabato en Servilleta',
      tierWeekendProject: 'Proyecto de Fin de Semana',
      tierPassionProject: 'Proyecto de Pasión',
      tierSpielberg: 'Spielberg en Formación',
      tierFutureFounder: 'Futuro Fundador',
      tierTedTalk: 'Necesita una Charla TED',
    },
    vibeCheck: {
      title: 'Chequeo de Vibra',
      subtitle: 'Pega algo que hayas escrito. Leeremos entre líneas.',
      placeholder: 'Pega un mensaje de texto, tweet, párrafo de ensayo, email, entrada de diario — cualquier cosa que hayas escrito...',
      checkButton: 'Chequear mi vibra',
      cmdEnter: 'Cmd+Enter',
      loading: 'Leyendo entre tus líneas...',
      voiceIn3Words: 'Tu voz en 3 palabras',
      tryAnother: 'Probar otro texto',
      parseError: 'Tu escritura fue tan única que rompió el analizador. ¡Inténtalo de nuevo!',
      dailyUsedUp: '¡Chequeos diarios agotados!',
      unlockAccess: 'Desbloquea acceso completo para chequeos de vibra ilimitados',
    },
    wouldYouLetIt: {
      title: '¿Lo Dejarías?',
      scenarioOf: 'Escenario {current} de {total}',
      aiAgentRequest: 'Solicitud del Agente IA',
      justDoIt: 'Hazlo',
      askMeFirst: 'Pregúntame primero',
      neverAllow: 'Nunca permitir',
      youChose: 'Elegiste: {choice}',
      nextScenario: 'Siguiente escenario',
      seeYourProfile: 'Ver tu perfil',
      yourAutonomyProfile: 'Tu perfil de autonomía',
      playAgain: 'Jugar de nuevo',
      profileDelegator: 'El Delegador',
      profileDelegatorDesc: 'Confías rápido, pero cuidado con los casos extremos.',
      profileCollaborator: 'El Colaborador',
      profileCollaboratorDesc: 'Equilibrado y reflexivo.',
      profileGuardian: 'El Guardián',
      profileGuardianDesc: 'Mantienes un control estricto.',
      profilePragmatist: 'El Pragmático',
      profilePragmatistDesc: 'Depende de lo que está en juego.',
      scenario1: "Tu agente IA quiere responder a un mensaje de chat grupal con 'suena bien, estaré allí a las 7'",
      insight1: 'Enviar mensajes en tu nombre parece inofensivo, pero el tono y el contexto importan. ¿Y si "suena bien" no es apropiado para la situación?',
      scenario2: 'Tu agente IA quiere enviar tu tarea completada a Google Classroom',
      insight2: 'La tarea está hecha, pero ¿realmente la revisaste? Enviarla significa que respondes por el trabajo.',
      scenario3: 'Tu agente IA quiere publicar una foto en tu historia de Instagram con un pie de foto que escribió',
      insight3: 'Las redes sociales son tu marca personal. Una IA puede redactar, pero tú deberías ser dueño de lo que sale con tu nombre.',
    },
    complexityScore: {
      title: 'Puntuación de Complejidad',
      subtitle: 'Describe tu proyecto. Te diremos a qué te estás comprometiendo realmente.',
      inputPrompt: '¿Qué estás construyendo? Describe tu proyecto y lo descompondremos en subtareas y calificaremos su complejidad.',
      placeholder: 'ej. "Un juego de trivia multijugador con puntuación en tiempo real, cuentas de usuario y tabla de clasificación"',
      scoreButton: 'Puntuar mi proyecto',
      cmdEnter: 'Cmd+Enter',
      loading: 'Descomponiendo tu proyecto...',
      totalSubTasks: 'subtareas totales',
      keySubTasks: 'Subtareas clave',
      realityCheck: 'Chequeo de realidad',
      tryAnother: 'Probar otro proyecto',
      parseError: 'El proyecto fue tan ambicioso que rompió nuestro sistema de puntuación. ¡Inténtalo de nuevo!',
      tierAfternoonTask: 'Tarea de una Tarde',
      tierWeekendBuild: 'Proyecto de Fin de Semana',
      tierSolidChallenge: 'Desafío Sólido',
      tierMultiWeekEpic: 'Épica de Varias Semanas',
      tierTeamRequired: 'Se Necesita Equipo',
      tierPhdTerritory: 'Territorio de Doctorado',
    },
    irreplaceableYou: {
      title: 'Tú, Irremplazable',
      subtitle: 'Descríbete. Te diremos qué ninguna IA puede tocar.',
      placeholder: 'Soy un estudiante de preparatoria que juega baloncesto, hace beats y está obsesionado con el anime',
      checkButton: '¿Soy reemplazable?',
      cmdEnter: 'Cmd+Enter',
      loading: 'Evaluando tu irreemplazabilidad...',
      aiCanHelp: 'La IA puede ayudar con',
      onlyYou: 'Solo tú puedes hacer esto',
      tryAgain: 'Intentar de nuevo',
      parseError: 'Tu singularidad rompió el algoritmo. ¡Inténtalo de nuevo!',
      dailyUsedUp: '¡Chequeos diarios agotados!',
      unlockAccess: 'Desbloquea acceso completo para chequeos ilimitados de irreemplazabilidad',
      tierEasilyAugmented: 'Fácilmente Aumentado',
      tierAIAssisted: 'Asistido por IA',
      tierHybridTalent: 'Talento Híbrido',
      tierDistinctlyHuman: 'Distintivamente Humano',
      tierOneOfAKind: 'Único en su Especie',
      tierIrreplaceable: 'Irremplazable',
    },
  },
};

// Write the Spanish file
function writeLocaleFile(locale, translations) {
  const dir = path.join(__dirname, 'src/i18n/translations', locale);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let content = 'const translations: Record<string, Record<string, string>> = {\n';

  for (const [ns, strings] of Object.entries(translations)) {
    content += `  ${ns}: {\n`;
    for (const [key, value] of Object.entries(strings)) {
      // Escape single quotes in values
      const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      content += `    ${key}: '${escaped}',\n`;
    }
    content += '  },\n';
  }

  content += '};\n\nexport default translations;\n';

  const filepath = path.join(dir, 'breaks.ts');
  fs.writeFileSync(filepath, content);
  console.log(`Written: ${locale}/breaks.ts`);
}

writeLocaleFile('es', locales.es);

// For remaining locales, we create stub files with the same structure
// but with the English text as placeholder (the English fallback in ChapterLayout
// will handle missing keys, but having the structure ensures proper loading)

// Read English structure
const enTranslations = {};
const enFile = fs.readFileSync(enPath, 'utf8');
// Simple parser - extract namespace and key/value pairs
const nsRegex = /(\w+):\s*\{([^}]+)\}/gs;
let nsMatch;
while ((nsMatch = nsRegex.exec(enFile)) !== null) {
  const ns = nsMatch[1];
  const body = nsMatch[2];
  enTranslations[ns] = {};
  const kvRegex = /(\w+):\s*['"]((?:[^'"\n\\]|\\.)*)['"],?/g;
  let kvMatch;
  while ((kvMatch = kvRegex.exec(body)) !== null) {
    enTranslations[ns][kvMatch[1]] = kvMatch[2].replace(/\\'/g, "'");
  }
}

// Generate remaining locales with language-appropriate translations for key items
// For non-Spanish locales, generate files with core UI translations

const coreTranslations = {
  hi: { breakReveal: { newToolUnlocked: '\u0928\u092f\u093e \u091f\u0942\u0932 \u0905\u0928\u0932\u0949\u0915!' } },
  pt: { breakReveal: { newToolUnlocked: 'Nova ferramenta desbloqueada!' } },
  ar: { breakReveal: { newToolUnlocked: '\u0623\u062f\u0627\u0629 \u062c\u062f\u064a\u062f\u0629 \u0645\u0641\u062a\u0648\u062d\u0629!' } },
  fr: { breakReveal: { newToolUnlocked: 'Nouvel outil d\u00e9bloqu\u00e9 !' } },
  id: { breakReveal: { newToolUnlocked: 'Alat baru terbuka!' } },
  bn: { breakReveal: { newToolUnlocked: '\u09a8\u09a4\u09c1\u09a8 \u099f\u09c1\u09b2 \u0986\u09a8\u09b2\u0995!' } },
  te: { breakReveal: { newToolUnlocked: '\u0c15\u0c4a\u0c24\u0c4d\u0c24 \u0c1f\u0c42\u0c32\u0c4d \u0c05\u0c28\u0c4d\u200c\u0c32\u0c3e\u0c15\u0c4d!' } },
  ta: { breakReveal: { newToolUnlocked: '\u0baa\u0bc1\u0ba4\u0bbf\u0baf \u0b95\u0bb0\u0bc1\u0bb5\u0bbf \u0ba4\u0bbf\u0bb1\u0b95\u0bcd\u0b95\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0ba4\u0bc1!' } },
  mr: { breakReveal: { newToolUnlocked: '\u0928\u0935\u0940\u0928 \u0938\u093e\u0927\u0928 \u0905\u0928\u0932\u0949\u0915!' } },
  kn: { breakReveal: { newToolUnlocked: '\u0cb9\u0cca\u0cb8 \u0c89\u0caa\u0c95\u0cb0\u0ca3 \u0c85\u0ca8\u0ccd\u200c\u0cb2\u0cbe\u0c95\u0ccd!' } },
  gu: { breakReveal: { newToolUnlocked: '\u0aa8\u0ab5\u0ac1\u0a82 \u0a9f\u0ac2\u0ab2 \u0a85\u0aa8\u0ab2\u0ac9\u0a95!' } },
  ja: { breakReveal: { newToolUnlocked: '\u65b0\u3057\u3044\u30c4\u30fc\u30eb\u304c\u30a2\u30f3\u30ed\u30c3\u30af\u3055\u308c\u307e\u3057\u305f\uff01' } },
  ko: { breakReveal: { newToolUnlocked: '\uc0c8\ub85c\uc6b4 \ub3c4\uad6c\uac00 \uc7a0\uae08 \ud574\uc81c\ub418\uc5c8\uc2b5\ub2c8\ub2e4!' } },
  de: { breakReveal: { newToolUnlocked: 'Neues Werkzeug freigeschaltet!' } },
  zh: { breakReveal: { newToolUnlocked: '\u65b0\u5de5\u5177\u5df2\u89e3\u9501\uff01' } },
  tr: { breakReveal: { newToolUnlocked: 'Yeni ara\u00e7 a\u00e7\u0131ld\u0131!' } },
  vi: { breakReveal: { newToolUnlocked: '\u0110\u00e3 m\u1edf kh\u00f3a c\u00f4ng c\u1ee5 m\u1edbi!' } },
};

// For all non-es locales, create empty/minimal breaks.ts files
// The English fallback system will handle missing keys
const remainingLocales = ['hi', 'pt', 'ar', 'fr', 'id', 'bn', 'te', 'ta', 'mr', 'kn', 'gu', 'ja', 'ko', 'de', 'zh', 'tr', 'vi'];

for (const locale of remainingLocales) {
  const core = coreTranslations[locale] || {};
  // Build a full translation object with at least breakReveal translated
  // and empty objects for other namespaces (English fallback handles the rest)
  const translations = {};

  // Add breakReveal with actual translation
  if (core.breakReveal) {
    translations.breakReveal = core.breakReveal;
  }

  // Write file
  writeLocaleFile(locale, translations);
}

console.log('\nAll locale files generated!');
