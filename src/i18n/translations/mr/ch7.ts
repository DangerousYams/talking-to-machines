// MR translations for Chapter 7
const translations: Record<string, Record<string, string>> = {
  ch7: {
  // === TerminalPlayground ===
  terminalTitle: 'टर्मिनल प्लेग्राउंड',
  terminalSubtitle: 'Claude Code विचार करताना, लिहिताना, आणि चालवताना पहा',
  terminalPickTask: 'एक कार्य निवडा आणि Claude Code ते कसे विभागतो, कोड लिहितो, आणि ते काम करते हे सत्यापित करतो ते पहा.',
  tryAnotherTask: 'दुसरे कार्य वापरा',
  filesLabel: 'FILES',
  filesMobileButton: 'फाइल्स',
  writeLabel: 'WRITE',

  // Terminal presets
  presetCountdownLabel: 'React काउंटडाउन टायमर बनवा',
  presetCountdownDesc: 'Start/pause नियंत्रणांसह पुनर्वापरयोग्य काउंटडाउन कंपोनंट बनवा',
  presetBugLabel: 'लॉगिन बग दुरुस्त करा',
  presetBugDesc: 'बिघडलेल्या authentication फ्लोचे निदान करा आणि दुरुस्त करा',
  presetDarkmodeLabel: 'अॅपमध्ये डार्क मोड जोडा',
  presetDarkmodeDesc: 'Persistence सह system-aware डार्क मोड टॉगल लागू करा',

  // Terminal step texts (thinking only - code/commands stay in English)
  thinkingReadingProject: 'प्रोजेक्ट रचना वाचतो आणि कोडबेस समजून घेतो...',
  thinkingPlanCountdown: 'योजना: useState आणि useEffect hooks, start/pause/reset नियंत्रणे, आणि स्वरूपित वेळ प्रदर्शनासह CountdownTimer कंपोनंट तयार करा.',
  successCountdown: 'CountdownTimer कंपोनंट start, pause, आणि reset नियंत्रणांसह तयार. localhost:5173 वर सज्ज.',
  thinkingReadingLogin: 'src/auth/login.ts आणि src/auth/session.ts वाचतो...',
  thinkingFoundBug: 'बग सापडला: login handler fetchUser() ची वाट पाहतो पण session token सेट करण्यापूर्वी null प्रतिसाद तपासत नाही. API 401 परत केल्यावर कोड क्रॅश होतो.',
  successBugFix: 'बग दुरुस्त: अयशस्वी API प्रतिसादांसाठी null तपासणी आणि योग्य error handling जोडले. सर्व ३ चाचण्या पास.',
  thinkingReadingStyles: 'विद्यमान स्टाइल्स आणि कंपोनंट रचना वाचतो...',
  thinkingPlanDarkMode: 'योजना: 1) localStorage persistence सह useDarkMode hook तयार करा, 2) डार्क थीमसाठी CSS custom properties जोडा, 3) टॉगल बटण कंपोनंट बनवा.',
  successDarkMode: 'System preference ओळख, localStorage persistence, आणि सहज CSS transitions सह डार्क मोड जोडला.',

  // === SkillBuilder ===
  skillBuilderTitle: 'स्किल बिल्डर',
  skillBuilderSubtitle: 'Claude Code साठी पुनर्वापरयोग्य सूचना लिहा',
  claudeMdLabel: 'CLAUDE.md',
  editedLabel: 'संपादित',
  validationLabel: 'प्रमाणीकरण',
  triggerLabel: 'ट्रिगर',
  stepsLabel: 'टप्पे',
  examplesLabel: 'उदाहरणे',
  hasClearTrigger: 'स्पष्ट ट्रिगर आहे',
  stepsAreSpecific: 'टप्पे विशिष्ट आहेत',
  includesExamples: 'उदाहरणे समाविष्ट आहेत',
  testLabel: 'चाचणी',
  testScenarioLabel: 'चाचणी परिस्थिती',
  userRequestLabel: 'वापरकर्ता विनंती',
  requestPrefix: 'विनंती:',
  viewFullOutput: 'संपूर्ण आउटपुट पहा',

  // Skill templates
  templateReactComponent: 'React Component Generator',
  templateTestWriter: 'Test Writer',
  templateDocGenerator: 'Documentation Generator',

  // Test tasks (prompt content - stays in English)
  testTaskReact: 'Create a UserProfile component that shows an avatar, name, and bio',
  testTaskTest: 'Write tests for utils/formatDate.ts',
  testTaskDoc: 'Document the auth module',

  // === RefactorRace ===
  refactorRaceTitle: 'रिफॅक्टर रेस',
  refactorRaceSubtitle: 'तुम्ही vs. Claude Code — ही गोंधळलेली फंक्शन स्वच्छ करा',
  refactorRaceIntro: 'खाली एक फंक्शन आहे ज्यात गूढ व्हेरिएबल नावे, कोणतेही types नाहीत, आणि हाताने लिहिलेला bubble sort आहे. तुमचे काम: ते वाचनीय बनवा. Claude Code तुमच्या शेजारी हेच करत असेल.',
  startRefactoring: 'रिफॅक्टरिंग सुरू करा',
  yourTurn: 'तुमची पाळी',
  doneButton: 'पूर्ण',
  finishedAt: 'पूर्ण वेळ',
  claudeCodeLabel: 'Claude Code',
  imDone: "मी पूर्ण केले",
  yourCodeTab: 'तुमचा कोड',
  aiTab: 'AI',

  // Done phase
  yourVersion: 'तुमची आवृत्ती',
  claudeCodeVersion: 'Claude Code आवृत्ती (~5.5s)',
  readabilityLabel: 'वाचनीयता',
  linesOfCode: 'कोड ओळी',
  namingLabel: 'नामकरण',
  youDecide: 'तुम्ही ठरवा',
  typesAndComments: 'Types + टिप्पण्या',
  linesLabel: 'ओळी',
  yourChoice: 'तुमची निवड',
  descriptiveNames: 'वर्णनात्मक नावे',
  youLabel: 'तुम्ही',
  aiLabel: 'AI',
  pointNotSpeed: 'मुद्दा हा नाही की कोण आधी संपवतो.',
  pointNotSpeedBody: "Claude Code वेगवान आहे, पण वेग हे कौशल्य नाही. कौशल्य म्हणजे दोन्ही आवृत्त्या पाहणे आणि तुम्ही कोणती खरोखर शिप कराल याचा निर्णय घेणे. ते वाचता येते का? ते edge cases हाताळतो का? तुमचा सहकारी रात्री २ वाजता ते समजेल का? तो निर्णय फक्त तुमचा आहे.",
  pointNotSpeedMobile: 'वेग हे कौशल्य नाही. कौशल्य म्हणजे कोणती आवृत्ती शिप कराल याचा निर्णय. तो निर्णय फक्त तुमचा आहे.',
  compareCode: 'कोड तुलना करा',
  retryButton: 'पुन्हा प्रयत्न',
  tryAgain: 'पुन्हा प्रयत्न',
  codeComparison: 'कोड तुलना',

  // Metrics (mobile)
  metricLines: 'ओळी',
  metricTime: 'वेळ',
  metricNames: 'नावे',
  metricTyped: 'टाइप',

  // === WhatWouldYouBuild ===
  whatWouldYouBuildTitle: 'तुम्ही काय बनवाल?',
  projectsCount: 'तुमच्यासारख्या लोकांनी बनवलेले प्रोजेक्ट्स',
  noProjectsInCategory: 'या श्रेणीत अजून प्रोजेक्ट्स नाहीत.',
  yourTurnHeading: 'तुमची पाळी',
  yourTurnPromptMobile: 'वैयक्तिक सॉफ्टवेअरने तुम्ही कोणती समस्या सोडवाल?',
  yourTurnPromptDesktop: 'तुमच्या आयुष्यातील कोणती समस्या तुम्ही वैयक्तिक सॉफ्टवेअरने सोडवाल? तुम्हाला हवे असलेले साधन वर्णन करा.',
  ideaPlaceholder: "मी एक अॅप बनवीन जो...",
  saveIdea: 'कल्पना जतन करा',
  savedConfirmationMobile: "जतन झाले! तुम्ही ही अध्याय ११ मध्ये वापराल.",
  savedConfirmationDesktop: "कल्पना जतन झाली! तुम्ही ही अध्याय ११ मध्ये वापराल.",
  builderLabel: 'बिल्डर',
  builtBy: 'निर्माता',
  techStack: 'टेक स्टॅक',
  timeEstimate: 'वेळ अंदाज:',
  feasibilityWeekend: 'वीकेंड बिल्ड',
  feasibilityWeek: 'एक आठवडा प्रोजेक्ट',
  feasibilityMonth: 'महिनाभराचा बिल्ड',
  footerInspiration: 'यातील प्रत्येक गोष्ट एखाद्या व्यक्तीने बनवली ज्याने फक्त एका कल्पनेने सुरुवात केली.',

  // === Ch7FlipCards ===
  claudeCodeKeyFact: "Claude Code एका लूपमध्ये काम करतो: तुमचा कोडबेस वाचा \u2192 बदल योजना करा \u2192 कोड लिहा \u2192 चालवा \u2192 चुका दुरुस्त करा. CLAUDE.md हा कायमचा सूचना संच आहे जो प्रत्येक संवाद घडवतो.",
  skillsKeyFact: "स्किलचे तीन भाग असतात: ट्रिगर (कधी सक्रिय करायचे), टप्पे (काय करायचे), उदाहरणे (चांगले आउटपुट कसे दिसते). एक स्किल व्याख्या शेकडो पुनरावृत्त स्पष्टीकरणांची जागा घेते.",

  flipLabelClaudeCode: 'ते का काम केले? Claude Code कसे विचार करतो',
  flipLabelSkills: 'ते का काम केले? स्किल्स बनवणे',
  flipLabelSkillParadox: 'ते का काम केले? स्किल पॅराडॉक्स',
  backTitleClaudeCode: 'Claude Code कसे विचार करतो',
  backTitleSkills: 'स्किल्स बनवणे (T-S-E फ्रेमवर्क)',
  backTitleSkillParadox: 'स्किल पॅराडॉक्स',

  // ClaudeCode Back
  ccBackIntro: "Claude Code कोड लिहिणारा चॅटबॉट नाही. तो एक एजेंटिक लूप आहे — एक प्रणाली जी वाचते, योजना करते, लिहिते, चालवते, आणि दुरुस्त करते, कार्य पूर्ण होईपर्यंत सायकल करते.",
  ccReadName: 'वाचा',
  ccReadText: 'तुमच्या फाइल्स स्कॅन करतो, तुमची आर्किटेक्चर समजून घेतो, प्रोजेक्ट नियमांसाठी CLAUDE.md वाचतो.',
  ccPlanName: 'योजना',
  ccPlanText: 'कार्य टप्प्यांमध्ये विभागतो, कोणत्या फाइल्स कोणत्या क्रमाने बदलायच्या ते ठरवतो.',
  ccWriteName: 'लिहा',
  ccWriteText: 'अनेक फाइल्समध्ये कोड तयार करतो — तुकडे नव्हे, तर सुसंगत, जोडलेले बदल.',
  ccRunName: 'चालवा',
  ccRunText: 'कोड अंमलात आणतो, चाचण्या चालवतो, चुका तपासतो. काही बिघडले तर दुरुस्त करण्यासाठी लूपमध्ये परततो.',
  ccFixName: 'दुरुस्त',
  ccFixText: 'चूक वाचतो, कारण शोधतो, पॅच लिहितो, आणि पुन्हा चालवतो. आपोआप.',
  ccBackNote: "तो तुमचा संपूर्ण प्रोजेक्ट पाहतो — फक्त तुम्ही संपादित करत असलेली फाइल नव्हे. आणि CLAUDE.md तुमच्या प्रोजेक्टचे संविधान आहे: कायमच्या सूचना ज्या प्रत्येक संवाद घडवतात. तुमच्या कोडबेससाठी system prompt समजा.",

  // Skills Back
  skillsBackIntro: "स्किल हा पुनर्वापरयोग्य सूचना संच आहे — एक रेसिपी जी Claude Code ला एखाद्या प्रकारचे कार्य नक्की कसे हाताळायचे ते सांगते. प्रत्येक स्किल T-S-E फ्रेमवर्क पाळतो:",
  skillsTriggerName: 'ट्रिगर',
  skillsTriggerText: 'ही स्किल कधी सक्रिय व्हावी? उदा., "जेव्हा React कंपोनंट बनवायला सांगितले जाते"',
  skillsStepsName: 'टप्पे',
  skillsStepsText: 'काय करायचे? विशिष्ट कृतींची क्रमवारी लावलेली यादी.',
  skillsExamplesName: 'उदाहरणे',
  skillsExamplesText: 'चांगले आउटपुट कसे दिसते? ठोस इनपुट/आउटपुट जोड्या ज्या गुणवत्ता अँकर करतात.',
  skillsTemplatesLabel: 'सुरू करण्यासाठी पूर्व-लोड टेम्पलेट्स:',
  skillsBackFooter: 'एक स्किल व्याख्या शेकडो पुनरावृत्त स्पष्टीकरणांची जागा घेते. एकदा लिहा, कायम वापरा.',

  // Skill Paradox Back
  paradoxIntro: "कोणीही सांगत नाही तो पॅराडॉक्स: AI कोडिंग वेगवान करतो, पण कोड समजून घेण्याची गरज संपवत नाही.",
  paradoxQuote: "साधन तितकेच चांगले आहे जितके ते चालवणारा माणूस. Claude काय तयार करतो ते तुम्ही वाचू शकत नसाल, तर कार्यरत कोड आणि विश्वासार्ह दिसणारा कचरा यातला फरक तुम्ही ओळखू शकत नाही.",
  paradoxWorkflowLabel: 'मूलभूत कार्यपद्धती:',
  paradoxSpecify: 'स्पष्ट करा.',
  paradoxSpecifyDesc: 'तुम्हाला काय हवे ते निर्दयपणे स्पष्ट सांगा. अस्पष्टता हा शत्रू आहे.',
  paradoxGenerate: 'तयार करा.',
  paradoxGenerateDesc: 'Claude Code ला टायपिंग करू द्या. तो boilerplate, syntax, wiring हाताळतो.',
  paradoxVerify: 'सत्यापित करा.',
  paradoxVerifyDesc: 'वाचा, चाचणी करा, आणि निकालाचा निर्णय घ्या. इथे तुमचे ज्ञान सर्वांत जास्त महत्त्वाचे आहे.',
  paradoxMiddle: "आउटपुटचे मूल्यांकन करण्यासाठी पुरेसे ज्ञान हवे, प्रत्येक ओळ लिहिण्यासाठी नाही. हा स्किल पॅराडॉक्स आहे — AI कोड तयार करण्याची किमान पातळी कमी करतो, पण त्याचा न्याय करण्याची पातळी वाढवतो.",
  paradoxClosing: "AI कोडिंग साधनांसह जे लोक भरभराट करतात ते सर्वांत कमी टाइप करणारे नाहीत. ते असे लोक आहेत जे काय अस्तित्वात असायला हवे याबद्दल सर्वांत स्पष्टपणे विचार करतात — आणि आउटपुट योग्य आहे हे ओळखू शकतात.",
  },
};

export default translations;
