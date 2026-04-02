// TE translations for Chapter 7
const translations: Record<string, Record<string, string>> = {
  ch7: {
  // === TerminalPlayground ===
  terminalTitle: 'టెర్మినల్ ప్లేగ్రౌండ్',
  terminalSubtitle: 'Claude Code ఆలోచించడం, రాయడం, రన్ చేయడం చూడండి',
  terminalPickTask: 'ఒక పని ఎంచుకుని Claude Code దాన్ని ఎలా విభజిస్తుందో, కోడ్ రాస్తుందో, పని చేస్తుందో ధృవీకరిస్తుందో చూడండి.',
  tryAnotherTask: 'మరో పని ప్రయత్నించండి',
  filesLabel: 'FILES',
  filesMobileButton: 'ఫైల్స్',
  writeLabel: 'WRITE',

  // Terminal presets
  presetCountdownLabel: 'React కౌంట్‌డౌన్ టైమర్ తయారు చేయి',
  presetCountdownDesc: 'స్టార్ట్/పాజ్ కంట్రోల్స్‌తో పునర్వినియోగ కౌంట్‌డౌన్ కాంపోనెంట్ నిర్మించు',
  presetBugLabel: 'లాగిన్ బగ్ సరిచేయి',
  presetBugDesc: 'విరిగిన ఆథెంటికేషన్ ఫ్లోను నిర్ధారించి సరిచేయి',
  presetDarkmodeLabel: 'యాప్‌కు డార్క్ మోడ్ జోడించు',
  presetDarkmodeDesc: 'సిస్టమ్-అవేర్ డార్క్ మోడ్ టోగుల్‌ను పర్సిస్టెన్స్‌తో ఇంప్లిమెంట్ చేయి',

  // Terminal step texts (thinking only - code/commands stay in English)
  thinkingReadingProject: 'ప్రాజెక్ట్ నిర్మాణం చదివి కోడ్‌బేస్ అర్థం చేసుకుంటోంది...',
  thinkingPlanCountdown: 'ప్లానింగ్: useState మరియు useEffect హుక్స్, స్టార్ట్/పాజ్/రీసెట్ కంట్రోల్స్, మరియు ఫార్మాటెడ్ టైమ్ డిస్‌ప్లేతో CountdownTimer కాంపోనెంట్ తయారు చేయాలి.',
  successCountdown: 'CountdownTimer కాంపోనెంట్ స్టార్ట్, పాజ్, మరియు రీసెట్ కంట్రోల్స్‌తో తయారైంది. localhost:5173 లో సిద్ధంగా ఉంది.',
  thinkingReadingLogin: 'src/auth/login.ts మరియు src/auth/session.ts చదువుతోంది...',
  thinkingFoundBug: 'బగ్ కనుగొన్నాం: లాగిన్ హ్యాండ్లర్ fetchUser() కోసం వేచి ఉంటుంది కానీ సెషన్ టోకెన్ సెట్ చేయడానికి ముందు null ప్రతిస్పందనను తనిఖీ చేయదు. API 401 ఇచ్చినప్పుడు, కోడ్ క్రాష్ అవుతుంది.',
  successBugFix: 'బగ్ సరిచేశాం: విఫలమైన API ప్రతిస్పందనలకు null చెక్ మరియు సరైన ఎర్రర్ హ్యాండ్లింగ్ జోడించాం. 3 టెస్ట్‌లు అన్నీ పాస్ అవుతున్నాయి.',
  thinkingReadingStyles: 'ఉన్న స్టైల్స్ మరియు కాంపోనెంట్ నిర్మాణం చదువుతోంది...',
  thinkingPlanDarkMode: 'ప్లాన్: 1) localStorage పర్సిస్టెన్స్‌తో useDarkMode హుక్ తయారు చేయి, 2) డార్క్ థీమ్ కోసం CSS కస్టమ్ ప్రాపర్టీలు జోడించు, 3) టోగుల్ బటన్ కాంపోనెంట్ నిర్మించు.',
  successDarkMode: 'సిస్టమ్ ప్రాధాన్యత గుర్తింపు, localStorage పర్సిస్టెన్స్, మరియు సజావుగా CSS ట్రాన్సిషన్లతో డార్క్ మోడ్ జోడించాం.',

  // === SkillBuilder ===
  skillBuilderTitle: 'స్కిల్ బిల్డర్',
  skillBuilderSubtitle: 'Claude Code కోసం పునర్వినియోగ సూచనలు రాయండి',
  claudeMdLabel: 'CLAUDE.md',
  editedLabel: 'ఎడిట్ చేయబడింది',
  validationLabel: 'ధృవీకరణ',
  triggerLabel: 'ట్రిగ్గర్',
  stepsLabel: 'స్టెప్‌లు',
  examplesLabel: 'ఉదాహరణలు',
  hasClearTrigger: 'స్పష్టమైన ట్రిగ్గర్ ఉంది',
  stepsAreSpecific: 'స్టెప్‌లు నిర్దిష్టమైనవి',
  includesExamples: 'ఉదాహరణలు చేర్చబడ్డాయి',
  testLabel: 'టెస్ట్',
  testScenarioLabel: 'టెస్ట్ సినారియో',
  userRequestLabel: 'వినియోగదారు రిక్వెస్ట్',
  requestPrefix: 'రిక్వెస్ట్:',
  viewFullOutput: 'పూర్తి అవుట్‌పుట్ చూడండి',

  // Skill templates
  templateReactComponent: 'React కాంపోనెంట్ జనరేటర్',
  templateTestWriter: 'టెస్ట్ రైటర్',
  templateDocGenerator: 'డాక్యుమెంటేషన్ జనరేటర్',

  // Test tasks
  testTaskReact: 'Create a UserProfile component that shows an avatar, name, and bio',
  testTaskTest: 'Write tests for utils/formatDate.ts',
  testTaskDoc: 'Document the auth module',

  // === RefactorRace ===
  refactorRaceTitle: 'రీఫ్యాక్టర్ రేస్',
  refactorRaceSubtitle: 'మీరు vs. Claude Code -- ఈ గజిబిజి ఫంక్షన్‌ను శుభ్రం చేయండి',
  refactorRaceIntro: 'కింద అర్థంకాని వేరియబుల్ పేర్లు, టైప్‌లు లేని, మరియు హ్యాండ్-రిటెన్ బబుల్ సార్ట్ ఉన్న ఫంక్షన్ ఉంది. మీ పని: చదవగలిగేలా రీఫ్యాక్టర్ చేయడం. Claude Code మీ పక్కనే అదే చేస్తుంది.',
  startRefactoring: 'రీఫ్యాక్టరింగ్ మొదలుపెట్టు',
  yourTurn: 'మీ వంతు',
  doneButton: 'పూర్తయింది',
  finishedAt: 'పూర్తయిన సమయం',
  claudeCodeLabel: 'Claude Code',
  imDone: 'నేను పూర్తి చేశాను',
  yourCodeTab: 'మీ కోడ్',
  aiTab: 'AI',

  // Done phase
  yourVersion: 'మీ వెర్షన్',
  claudeCodeVersion: 'Claude Code వెర్షన్ (~5.5s)',
  readabilityLabel: 'చదవదగినత',
  linesOfCode: 'కోడ్ లైన్లు',
  namingLabel: 'నేమింగ్',
  youDecide: 'మీరు నిర్ణయించండి',
  typesAndComments: 'టైప్‌లు + కామెంట్లు',
  linesLabel: 'లైన్లు',
  yourChoice: 'మీ ఎంపిక',
  descriptiveNames: 'వివరణాత్మక పేర్లు',
  youLabel: 'మీరు',
  aiLabel: 'AI',
  pointNotSpeed: 'ఎవరు ముందు పూర్తి చేశారనేది ముఖ్యం కాదు.',
  pointNotSpeedBody: 'Claude Code వేగవంతం, కానీ వేగం నైపుణ్యం కాదు. నైపుణ్యం ఏమిటంటే రెండు వెర్షన్లను చూసి మీరు నిజంగా ఏది షిప్ చేస్తారో నిర్ణయించడం. మీరు దాన్ని చదవగలరా? ఎడ్జ్ కేసులు హ్యాండిల్ చేస్తుందా? రాత్రి 2 గంటలకు మీ టీమ్‌మేట్ అర్థం చేసుకుంటాడా? ఆ తీర్పు మీదే.',
  pointNotSpeedMobile: 'వేగం నైపుణ్యం కాదు. మీరు ఏ వెర్షన్ షిప్ చేస్తారో నిర్ణయించడమే నైపుణ్యం. ఆ తీర్పు మీదే.',
  compareCode: 'కోడ్ పోల్చండి',
  retryButton: 'మళ్ళీ ప్రయత్నించు',
  tryAgain: 'మళ్ళీ ప్రయత్నించు',
  codeComparison: 'కోడ్ పోలిక',

  // Metrics (mobile)
  metricLines: 'లైన్లు',
  metricTime: 'సమయం',
  metricNames: 'పేర్లు',
  metricTyped: 'టైప్ చేసిన',

  // === WhatWouldYouBuild ===
  whatWouldYouBuildTitle: 'మీరు ఏమి నిర్మిస్తారు?',
  projectsCount: 'మీలాంటి వాళ్ళు నిర్మించిన ప్రాజెక్ట్‌లు',
  noProjectsInCategory: 'ఈ కేటగిరీలో ఇంకా ప్రాజెక్ట్‌లు లేవు.',
  yourTurnHeading: 'మీ వంతు',
  yourTurnPromptMobile: 'పర్సనల్ సాఫ్ట్‌వేర్‌తో మీరు ఏ సమస్య పరిష్కరిస్తారు?',
  yourTurnPromptDesktop: 'మీ జీవితంలో పర్సనల్ సాఫ్ట్‌వేర్‌తో ఏ సమస్య పరిష్కరిస్తారు? మీకు ఉంటే బాగుండేది అనుకునే టూల్ వివరించండి.',
  ideaPlaceholder: 'నేను ఇలాంటి యాప్ నిర్మిస్తాను...',
  saveIdea: 'ఐడియా సేవ్ చేయి',
  savedConfirmationMobile: 'సేవ్ అయింది! Chapter 11 లో ఉపయోగిస్తారు.',
  savedConfirmationDesktop: 'ఐడియా సేవ్ అయింది! Chapter 11 లో ఉపయోగిస్తారు.',
  builderLabel: 'బిల్డర్',
  builtBy: 'నిర్మించినది',
  techStack: 'టెక్ స్టాక్',
  timeEstimate: 'సమయ అంచనా:',
  feasibilityWeekend: 'వీకెండ్ బిల్డ్',
  feasibilityWeek: 'ఒక వారపు ప్రాజెక్ట్',
  feasibilityMonth: 'నెల రోజుల బిల్డ్',
  footerInspiration: 'వీటిలో ప్రతి ఒక్కటి కేవలం ఒక ఐడియాతో మొదలుపెట్టిన ఎవరో నిర్మించింది.',

  // === Ch7FlipCards ===
  claudeCodeKeyFact: 'Claude Code ఒక లూప్ అనుసరిస్తుంది: మీ కోడ్‌బేస్ చదవడం \u2192 మార్పులు ప్లాన్ చేయడం \u2192 కోడ్ రాయడం \u2192 రన్ చేయడం \u2192 ఎర్రర్లు సరిచేయడం. CLAUDE.md అనేది ప్రతి ఇంటరాక్షన్‌ను రూపొందించే శాశ్వత సూచనల సెట్.',
  skillsKeyFact: 'ఒక స్కిల్‌కు మూడు భాగాలు ఉన్నాయి: ట్రిగ్గర్ (ఎప్పుడు యాక్టివేట్ కావాలి), స్టెప్‌లు (ఏమి చేయాలి), ఉదాహరణలు (మంచిది ఎలా ఉంటుంది). ఒక స్కిల్ నిర్వచనం వందల పునరావృత వివరణలను భర్తీ చేస్తుంది.',

  flipLabelClaudeCode: 'ఇది ఎందుకు పనిచేసింది? Claude Code ఎలా ఆలోచిస్తుంది',
  flipLabelSkills: 'ఇది ఎందుకు పనిచేసింది? స్కిల్స్ నిర్మించడం',
  flipLabelSkillParadox: 'ఇది ఎందుకు పనిచేసింది? స్కిల్ పారడాక్స్',
  backTitleClaudeCode: 'Claude Code ఎలా ఆలోచిస్తుంది',
  backTitleSkills: 'స్కిల్స్ నిర్మించడం (T-S-E ఫ్రేమ్‌వర్క్)',
  backTitleSkillParadox: 'స్కిల్ పారడాక్స్',

  // ClaudeCode Back
  ccBackIntro: 'Claude Code కోడ్ రాసే చాట్‌బాట్ కాదు. ఇది ఏజెంటిక్ లూప్ \u2014 చదివే, ప్లాన్ చేసే, రాసే, రన్ చేసే, మరియు సరిచేసే వ్యవస్థ, పని పూర్తయ్యే వరకు సైకిల్ చేస్తూ ఉంటుంది.',
  ccReadName: 'చదువు',
  ccReadText: 'మీ ఫైల్స్ స్కాన్ చేస్తుంది, మీ ఆర్కిటెక్చర్ అర్థం చేసుకుంటుంది, ప్రాజెక్ట్ రూల్స్ కోసం CLAUDE.md చదువుతుంది.',
  ccPlanName: 'ప్లాన్',
  ccPlanText: 'పనిని స్టెప్‌లుగా విభజిస్తుంది, ఏ ఫైల్స్ మార్చాలో మరియు ఏ క్రమంలో నిర్ణయిస్తుంది.',
  ccWriteName: 'రాయి',
  ccWriteText: 'అనేక ఫైల్స్‌లో కోడ్ జనరేట్ చేస్తుంది \u2014 స్నిప్పెట్లు కాదు, సమన్వయమైన, అనుసంధానమైన మార్పులు.',
  ccRunName: 'రన్',
  ccRunText: 'కోడ్ ఎగ్జిక్యూట్ చేస్తుంది, టెస్ట్‌లు రన్ చేస్తుంది, ఎర్రర్లు తనిఖీ చేస్తుంది. ఏదైనా విరిగితే, సరిచేయడానికి తిరిగి వెళ్తుంది.',
  ccFixName: 'సరిచేయి',
  ccFixText: 'ఎర్రర్ చదువుతుంది, కారణం నిర్ధారిస్తుంది, ప్యాచ్ రాస్తుంది, మరియు మళ్ళీ రన్ చేస్తుంది. ఆటోమేటిక్‌గా.',
  ccBackNote: 'మీ మొత్తం ప్రాజెక్ట్ చూస్తుంది \u2014 మీరు ఎడిట్ చేస్తున్న ఫైల్ మాత్రమే కాదు. CLAUDE.md మీ ప్రాజెక్ట్ యొక్క రాజ్యాంగం: ప్రతి ఇంటరాక్షన్‌ను రూపొందించే శాశ్వత సూచనలు. మీ కోడ్‌బేస్ కోసం సిస్టమ్ ప్రాంప్ట్ అని భావించండి.',

  // Skills Back
  skillsBackIntro: 'స్కిల్ అనేది పునర్వినియోగ సూచనల సెట్ \u2014 ఒక రకమైన పనిని Claude Code ఎలా హ్యాండిల్ చేయాలో చెప్పే రెసిపీ. ప్రతి స్కిల్ T-S-E ఫ్రేమ్‌వర్క్ అనుసరిస్తుంది:',
  skillsTriggerName: 'ట్రిగ్గర్',
  skillsTriggerText: 'ఈ స్కిల్ ఎప్పుడు యాక్టివేట్ కావాలి? ఉదా., "React కాంపోనెంట్ తయారు చేయమని అడిగినప్పుడు"',
  skillsStepsName: 'స్టెప్‌లు',
  skillsStepsText: 'ఏమి చేయాలి? క్రమంలో నిర్దిష్ట చర్యల నంబర్ చేసిన జాబితా.',
  skillsExamplesName: 'ఉదాహరణలు',
  skillsExamplesText: 'మంచి అవుట్‌పుట్ ఎలా ఉంటుంది? నాణ్యతను స్థిరపరిచే నిర్దిష్ట ఇన్‌పుట్/అవుట్‌పుట్ జతలు.',
  skillsTemplatesLabel: 'మొదలుపెట్టడానికి ప్రీ-లోడెడ్ టెంప్లేట్లు:',
  skillsBackFooter: 'ఒక స్కిల్ నిర్వచనం వందల పునరావృత వివరణలను భర్తీ చేస్తుంది. ఒకసారి రాయండి, ఎప్పటికీ ఉపయోగించండి.',

  // Skill Paradox Back
  paradoxIntro: 'ఇక్కడ ఎవరూ హెచ్చరించని పారడాక్స్ ఉంది: AI కోడింగ్‌ను వేగవంతం చేస్తుంది, కానీ కోడ్ అర్థం చేసుకోవలసిన అవసరాన్ని తొలగించదు.',
  paradoxQuote: 'టూల్ దాన్ని నడిపే మానవుడు ఎంత బాగా ఉంటే అంతే బాగుంటుంది. Claude జనరేట్ చేసేది చదవలేకపోతే, పనిచేసే కోడ్ మరియు నమ్మదగినట్లు కనిపించే అర్థంలేని విషయాల మధ్య తేడా మీకు తెలియదు.',
  paradoxWorkflowLabel: 'ప్రాథమిక వర్క్‌ఫ్లో:',
  paradoxSpecify: 'స్పెసిఫై చేయి.',
  paradoxSpecifyDesc: 'మీకు ఏమి కావాలో నిర్దాక్షిణ్యంగా స్పష్టంగా చెప్పండి. అస్పష్టత శత్రువు.',
  paradoxGenerate: 'జనరేట్ చేయి.',
  paradoxGenerateDesc: 'Claude Code టైపింగ్ చేయనివ్వండి. బాయిలర్‌ప్లేట్, సింటాక్స్, వైరింగ్ హ్యాండిల్ చేస్తుంది.',
  paradoxVerify: 'ధృవీకరించు.',
  paradoxVerifyDesc: 'చదవండి, టెస్ట్ చేయండి, ఫలితాన్ని తీర్పు చెప్పండి. ఇక్కడే మీ జ్ఞానం ఎక్కువగా ముఖ్యం.',
  paradoxMiddle: 'ప్రతి లైన్ రాయడానికి కాదు, అవుట్‌పుట్ మూల్యాంకనం చేయడానికి తగినంత జ్ఞానం మీకు అవసరం. అదే స్కిల్ పారడాక్స్ \u2014 AI కోడ్ ఉత్పత్తికి ఫ్లోర్ తగ్గిస్తుంది, కానీ దాన్ని విమర్శనాత్మకంగా చూడటానికి బార్ పెంచుతుంది.',
  paradoxClosing: 'AI కోడింగ్ టూల్స్‌తో అభివృద్ధి చెందే వాళ్ళు తక్కువ టైప్ చేసేవాళ్ళు కాదు. ఏమి ఉండాలో అత్యంత స్పష్టంగా ఆలోచించేవాళ్ళు \u2014 మరియు అవుట్‌పుట్ సరిగ్గా ఉందని చెప్పగలిగేవాళ్ళు.',
  },
};

export default translations;
