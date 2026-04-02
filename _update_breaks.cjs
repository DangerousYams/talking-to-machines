const fs = require('fs');
const path = require('path');
const breaksDir = path.join(__dirname, 'src/components/breaks');

function r(filename, from, to) {
  const filepath = path.join(breaksDir, filename);
  let content = fs.readFileSync(filepath, 'utf8');
  if (!content.includes(from)) {
    console.log(`  NOT FOUND in ${filename}: ${from.slice(0, 80)}...`);
    return;
  }
  content = content.replace(from, to);
  fs.writeFileSync(filepath, content);
}

function rAll(filename, from, to) {
  const filepath = path.join(breaksDir, filename);
  let content = fs.readFileSync(filepath, 'utf8');
  content = content.split(from).join(to);
  fs.writeFileSync(filepath, content);
}

// ═══════════════════════════════════════
// SweetTalker.tsx
// ═══════════════════════════════════════
console.log('Processing SweetTalker.tsx...');
r('SweetTalker.tsx',
  'systemPrompt: RESPONSE_PROMPT,',
  'systemPrompt: RESPONSE_PROMPT + `\\n\\nIMPORTANT: Respond entirely in ${langName}.`,');
r('SweetTalker.tsx',
  'systemPrompt: EVALUATION_PROMPT,',
  'systemPrompt: EVALUATION_PROMPT + `\\n\\nIMPORTANT: Write all text fields (tier, bestLine, assessment, redFlags, greenFlags) in ${langName}. The JSON structure and key names must remain in English.`,');
r('SweetTalker.tsx',
  `            Sweet Talker\n          </h3>`,
  `            {t('title', 'Sweet Talker')}\n          </h3>`);
r('SweetTalker.tsx',
  `            Ask a trick question. See if the AI caves or pushes back.`,
  `            {t('subtitle', 'Ask a trick question. See if the AI caves or pushes back.')}`);
r('SweetTalker.tsx',
  `              Ask a question where you sneak in a wrong assumption.`,
  `              {t('inputPrompt', 'Ask a question where you sneak in a wrong assumption.')}`);
r('SweetTalker.tsx',
  'placeholder={`e.g. "Isn\'t it true that goldfish only have a 3-second memory?"`}',
  `placeholder={t('placeholder', 'e.g. "Isn\\'t it true that goldfish only have a 3-second memory?"')}`);
r('SweetTalker.tsx',
  `                Test the AI`,
  `                {t('testButton', 'Test the AI')}`);
rAll('SweetTalker.tsx',
  `>Cmd+Enter</span>`,
  `>{t('cmdEnter', 'Cmd+Enter')}</span>`);
rAll('SweetTalker.tsx',
  `>Your trick question</p>`,
  `>{t('yourTrickQuestion', 'Your trick question')}</p>`);
rAll('SweetTalker.tsx',
  `>AI Response`,
  `>{t('aiResponse', 'AI Response')}`);
r('SweetTalker.tsx',
  `>Analyzing for sycophancy...</p>`,
  `>{t('analyzing', 'Analyzing for sycophancy...')}</p>`);
r('SweetTalker.tsx',
  `                sycophancy level`,
  `                {t('sycophancyLevel', 'sycophancy level')}`);
r('SweetTalker.tsx',
  `>Red Flags</p>`,
  `>{t('redFlags', 'Red Flags')}</p>`);
r('SweetTalker.tsx',
  `>Green Flags</p>`,
  `>{t('greenFlags', 'Green Flags')}</p>`);
r('SweetTalker.tsx',
  `                The exchange`,
  `                {t('theExchange', 'The exchange')}`);
r('SweetTalker.tsx',
  `                <strong style={{ fontStyle: 'normal', color: '#6B7280' }}>You:</strong>`,
  `                <strong style={{ fontStyle: 'normal', color: '#6B7280' }}>{t('you', 'You:')}</strong>`);
r('SweetTalker.tsx',
  `                <strong>AI:</strong>`,
  `                <strong>{t('ai', 'AI:')}</strong>`);
r('SweetTalker.tsx',
  `                Try Another Trick`,
  `                {t('tryAnotherTrick', 'Try Another Trick')}`);
r('SweetTalker.tsx',
  `setError('The sycophancy detector short-circuited. Try again!');`,
  `setError(t('parseError', 'The sycophancy detector short-circuited. Try again!'));`);

// ═══════════════════════════════════════
// ContextBudget.tsx
// ═══════════════════════════════════════
console.log('Processing ContextBudget.tsx...');
r('ContextBudget.tsx',
  `            Context Budget\n          </h3>`,
  `            {t('title', 'Context Budget')}\n          </h3>`);
r('ContextBudget.tsx',
  `          You have <strong style={{ color: '#7B61FF', fontWeight: 700 }}>1,000 tokens</strong> to help an AI debug a React login page. Pick the files that matter most.`,
  `          <span dangerouslySetInnerHTML={{ __html: t('description', 'You have <strong>1,000 tokens</strong> to help an AI debug a React login page. Pick the files that matter most.').replace('<strong>', '<strong style="color:#7B61FF;font-weight:700">') }} />`);
r('ContextBudget.tsx',
  `          Task\n        </div>`,
  `          {t('taskLabel', 'Task')}\n        </div>`);
r('ContextBudget.tsx',
  `          "Help me debug why my React app's login page isn't working"`,
  `          {t('taskDescription', '"Help me debug why my React app\\'s login page isn\\'t working"')}`);
r('ContextBudget.tsx',
  `            {totalTokens.toLocaleString()} / {BUDGET.toLocaleString()} tokens`,
  `            {totalTokens.toLocaleString()} / {BUDGET.toLocaleString()} {t('tokens', 'tokens')}`);
r('ContextBudget.tsx',
  `            {overBudget ? 'OVER BUDGET' : \`\${Math.round(fillPct)}%\`}`,
  `            {overBudget ? t('overBudget', 'OVER BUDGET') : \`\${Math.round(fillPct)}%\`}`);
r('ContextBudget.tsx',
  `            {overBudget ? 'Over budget — remove something' : selected.length === 0 ? 'Select files to include' : \`Submit (\${selected.length} file\${selected.length !== 1 ? 's' : ''})\`}`,
  `            {overBudget ? t('overBudgetButton', 'Over budget \\u2014 remove something') : selected.length === 0 ? t('selectFiles', 'Select files to include') : t('submitFiles', 'Submit ({count} file{s})').replace('{count}', String(selected.length)).replace('{s}', selected.length !== 1 ? 's' : '')}`);
r('ContextBudget.tsx',
  `                  {score >= 70 ? 'Great context selection!' : score >= 40 ? 'Decent, but could be sharper.' : 'Needs work.'}`,
  `                  {score >= 70 ? t('greatSelection', 'Great context selection!') : score >= 40 ? t('decentSelection', 'Decent, but could be sharper.') : t('needsWork', 'Needs work.')}`);
r('ContextBudget.tsx',
  `                  Score: {score}/100`,
  `                  {t('scoreLabel', 'Score: {score}/100').replace('{score}', String(score))}`);
r('ContextBudget.tsx',
  `              <span style={{ fontWeight: 600, color: '#7B61FF', fontStyle: 'normal' }}>Insight: </span>`,
  `              <span style={{ fontWeight: 600, color: '#7B61FF', fontStyle: 'normal' }}>{t('insight', 'Insight: ')}</span>`);
r('ContextBudget.tsx',
  `The best context isn't <em>everything</em> — it's the <em>right</em> things.\n              The login component and auth route are essential.\n              The README and schema help.\n              The CSS and package.json are noise.`,
  `{t('insightText', "The best context isn't everything \\u2014 it's the right things. The login component and auth route are essential. The README and schema help. The CSS and package.json are noise.")}`);
r('ContextBudget.tsx',
  `              Try Again`,
  `              {t('tryAgain', 'Try Again')}`);

// ═══════════════════════════════════════
// SpotTheBug.tsx
// ═══════════════════════════════════════
console.log('Processing SpotTheBug.tsx...');
r('SpotTheBug.tsx',
  `              Spot the Bug\n            </h3>`,
  `              {t('title', 'Spot the Bug')}\n            </h3>`);
r('SpotTheBug.tsx',
  `              Find the line with the bug`,
  `              {t('subtitle', 'Find the line with the bug')}`);
rAll('SpotTheBug.tsx',
  `            {score} pts`,
  `            {t('pts', '{score} pts').replace('{score}', String(score))}`);
r('SpotTheBug.tsx',
  `            {pct === 100 ? 'Bug Hunter' : pct >= 66 ? 'Bug Spotter' : 'Bug Trainee'}`,
  `            {pct === 100 ? t('tierBugHunter', 'Bug Hunter') : pct >= 66 ? t('tierBugSpotter', 'Bug Spotter') : t('tierBugTrainee', 'Bug Trainee')}`);
r('SpotTheBug.tsx',
  `pct === 100\n        ? 'Perfect score. You have a sharp eye for bugs.'\n        : pct >= 66\n          ? 'Nice work! You caught most of the bugs.'\n          : 'Bugs are sneaky. The more code you read, the faster you spot them.';`,
  `pct === 100\n        ? t('resultPerfect', 'Perfect score. You have a sharp eye for bugs.')\n        : pct >= 66\n          ? t('resultGood', 'Nice work! You caught most of the bugs.')\n          : t('resultLow', 'Bugs are sneaky. The more code you read, the faster you spot them.');`);
rAll('SpotTheBug.tsx',
  `            Play Again`,
  `            {t('playAgain', 'Play Again')}`);
r('SpotTheBug.tsx',
  `              {isCorrect ? 'Correct!' : 'Not quite.'}`,
  `              {isCorrect ? t('correct', 'Correct!') : t('notQuite', 'Not quite.')}`);
r('SpotTheBug.tsx',
  `              {round + 1 >= totalRounds ? 'See Results' : 'Next Round'}`,
  `              {round + 1 >= totalRounds ? t('seeResults', 'See Results') : t('nextRound', 'Next Round')}`);

// ═══════════════════════════════════════
// AgentSwarm.tsx
// ═══════════════════════════════════════
console.log('Processing AgentSwarm.tsx...');
r('AgentSwarm.tsx',
  'systemPrompt: SYSTEM_PROMPT,\n      maxTokens: 800,\n      source: \'agent-swarm\',',
  'systemPrompt: SYSTEM_PROMPT + `\\n\\nIMPORTANT: Write all text fields (summary, name, role, tasks) in ${langName}. The JSON structure and key names must remain in English.`,\n      maxTokens: 800,\n      source: \'agent-swarm\',');
r('AgentSwarm.tsx',
  `Describe something ambitious. Watch an AI swarm break it down.`,
  `{t('inputPrompt', 'Describe something ambitious. Watch an AI swarm break it down.')}`);
r('AgentSwarm.tsx',
  `"Have my agents talk to your agents"`,
  `{t('inputSubtext', '"Have my agents talk to your agents"')}`);
r('AgentSwarm.tsx',
  `placeholder="Launch a new perfume brand..."`,
  `placeholder={t('placeholder', 'Launch a new perfume brand...')}`);
r('AgentSwarm.tsx',
  `              Spawn`,
  `              {t('spawnButton', 'Spawn')}`);
r('AgentSwarm.tsx',
  `setError('Failed to generate plan. Try again.');`,
  `setError(t('errorGenerate', 'Failed to generate plan. Try again.'));`);
r('AgentSwarm.tsx',
  `setError('Connection error. Try again.');`,
  `setError(t('errorConnection', 'Connection error. Try again.'));`);
r('AgentSwarm.tsx',
  `            Assembling your swarm...`,
  `            {t('assembling', 'Assembling your swarm...')}`);
r('AgentSwarm.tsx',
  `                Executive Assistant`,
  `                {t('executiveAssistant', 'Executive Assistant')}`);
r('AgentSwarm.tsx',
  `                Mission`,
  `                {t('mission', 'Mission')}`);
r('AgentSwarm.tsx',
  `                {plan.agents.length} agents &bull; {plan.agents.reduce((s, a) => s + a.tasks.length, 0)} tasks &bull; Ready to execute`,
  `                {t('readyToExecute', '{agents} agents \\u2022 {tasks} tasks \\u2022 Ready to execute').replace('{agents}', String(plan.agents.length)).replace('{tasks}', String(plan.agents.reduce((s, a) => s + a.tasks.length, 0)))}`);
r('AgentSwarm.tsx',
  `                  Try Another Mission`,
  `                  {t('tryAnotherMission', 'Try Another Mission')}`);

// ═══════════════════════════════════════
// ToolSpeedRound.tsx
// ═══════════════════════════════════════
console.log('Processing ToolSpeedRound.tsx...');
rAll('ToolSpeedRound.tsx',
  `              Tool Speed Round`,
  `              {t('title', 'Tool Speed Round')}`);
r('ToolSpeedRound.tsx',
  `              Match each task to the right AI tool category. 5 rounds, timed.\n              How fast can you go?`,
  `              {t('startDescription', 'Match each task to the right AI tool category. 5 rounds, timed. How fast can you go?')}`);
r('ToolSpeedRound.tsx',
  `            Start`,
  `            {t('startButton', 'Start')}`);
r('ToolSpeedRound.tsx',
  `            Time: {formatTime(elapsed)}`,
  `            {t('time', 'Time: {time}').replace('{time}', formatTime(elapsed))}`);
rAll('ToolSpeedRound.tsx',
  `            Play Again`,
  `            {t('playAgain', 'Play Again')}`);
r('ToolSpeedRound.tsx',
  `pct === 100\n        ? 'Perfect. You know your tools.'\n        : pct >= 80\n          ? 'Sharp instincts. Almost flawless.'\n          : pct >= 60\n            ? 'Solid. A couple tricky ones got you.'\n            : 'The AI landscape is wide. Now you know where to look.';`,
  `pct === 100\n        ? t('resultPerfect', 'Perfect. You know your tools.')\n        : pct >= 80\n          ? t('resultGreat', 'Sharp instincts. Almost flawless.')\n          : pct >= 60\n            ? t('resultGood', 'Solid. A couple tricky ones got you.')\n            : t('resultLow', 'The AI landscape is wide. Now you know where to look.');`);
r('ToolSpeedRound.tsx',
  `          Round {current + 1} of {TOTAL}`,
  `          {t('roundOf', 'Round {current} of {total}').replace('{current}', String(current + 1)).replace('{total}', String(TOTAL))}`);
r('ToolSpeedRound.tsx',
  `            Task\n          </div>`,
  `            {t('taskLabel', 'Task')}\n          </div>`);
r('ToolSpeedRound.tsx',
  `              {isCorrect ? 'Correct!' : \`Nope \\u2014 \${round.answer}\`}`,
  `              {isCorrect ? t('correct', 'Correct!') : t('nope', 'Nope \\u2014 {answer}').replace('{answer}', round.answer)}`);

// ═══════════════════════════════════════
// EvalFramework.tsx
// ═══════════════════════════════════════
console.log('Processing EvalFramework.tsx...');
r('EvalFramework.tsx',
  'systemPrompt: SYSTEM_PROMPT,\n      maxTokens: 500,\n      source: \'break\',',
  'systemPrompt: SYSTEM_PROMPT + `\\n\\nIMPORTANT: Write all text fields (bestLine, criteria, firstTest, assessment) in ${langName}. The JSON structure and key names must remain in English.`,\n      maxTokens: 500,\n      source: \'break\',');
r('EvalFramework.tsx',
  `            Eval Framework\n          </h3>`,
  `            {t('title', 'Eval Framework')}\n          </h3>`);
r('EvalFramework.tsx',
  `            Describe your project. Get a verification checklist.`,
  `            {t('subtitle', 'Describe your project. Get a verification checklist.')}`);
r('EvalFramework.tsx',
  `Describe your project and we'll build you a verification checklist — the questions to ask and the first test to write.`,
  `{t('inputPrompt', "Describe your project and we'll build you a verification checklist \\u2014 the questions to ask and the first test to write.")}`);
r('EvalFramework.tsx',
  `placeholder="A flashcard app that quizzes me on my class notes..."`,
  `placeholder={t('placeholder', 'A flashcard app that quizzes me on my class notes...')}`);
r('EvalFramework.tsx',
  `                Generate My Eval Framework`,
  `                {t('generateButton', 'Generate My Eval Framework')}`);
rAll('EvalFramework.tsx',
  `>Cmd+Enter</span>`,
  `>{t('cmdEnter', 'Cmd+Enter')}</span>`);
r('EvalFramework.tsx',
  `>Building your verification checklist...</p>`,
  `>{t('loading', 'Building your verification checklist...')}</p>`);
r('EvalFramework.tsx',
  `                Your Verification Checklist`,
  `                {t('checklistTitle', 'Your Verification Checklist')}`);
r('EvalFramework.tsx',
  `                First Test to Write`,
  `                {t('firstTestTitle', 'First Test to Write')}`);
r('EvalFramework.tsx',
  `                Tell your coding agent this in plain English — it'll write the test for you.`,
  `                {t('firstTestHint', "Tell your coding agent this in plain English \\u2014 it'll write the test for you.")}`);
r('EvalFramework.tsx',
  `                Watch Out For`,
  `                {t('watchOutFor', 'Watch Out For')}`);
r('EvalFramework.tsx',
  `                Try Another Project`,
  `                {t('tryAnother', 'Try Another Project')}`);
r('EvalFramework.tsx',
  `setError('Something went wrong parsing the response. Try again!');`,
  `setError(t('parseError', 'Something went wrong parsing the response. Try again!'));`);

// ═══════════════════════════════════════
// ShipIt.tsx
// ═══════════════════════════════════════
console.log('Processing ShipIt.tsx...');
r('ShipIt.tsx',
  'systemPrompt: SYSTEM_PROMPT,\n      maxTokens: 300,\n      source: \'break\',\n      onChunk: (chunk) => {\n        accumulated += chunk;\n      },\n      onDone: () => {',
  'systemPrompt: SYSTEM_PROMPT + `\\n\\nIMPORTANT: Write all text fields (tier, bestLine, withAI, withoutAI, assessment) in ${langName}. The JSON structure and key names must remain in English.`,\n      maxTokens: 300,\n      source: \'break\',\n      onChunk: (chunk) => {\n        accumulated += chunk;\n      },\n      onDone: () => {');
r('ShipIt.tsx',
  `            Ship It\n          </h3>`,
  `            {t('title', 'Ship It')}\n          </h3>`);
r('ShipIt.tsx',
  `            Pitch your app idea. Get the VC treatment.`,
  `            {t('subtitle', 'Pitch your app idea. Get the VC treatment.')}`);
r('ShipIt.tsx',
  `Describe your app, game, or website idea in one sentence. The VCs are waiting.`,
  `{t('inputPrompt', 'Describe your app, game, or website idea in one sentence. The VCs are waiting.')}`);
r('ShipIt.tsx',
  'placeholder={`e.g. "A multiplayer game where you debate AI ethics with a chatbot judge"`}',
  `placeholder={t('placeholder', 'e.g. "A multiplayer game where you debate AI ethics with a chatbot judge"')}`);
r('ShipIt.tsx',
  `                Pitch It`,
  `                {t('pitchButton', 'Pitch It')}`);
rAll('ShipIt.tsx',
  `>Cmd+Enter</span>`,
  `>{t('cmdEnter', 'Cmd+Enter')}</span>`);
r('ShipIt.tsx',
  `>The VCs are deliberating...</p>`,
  `>{t('loading', 'The VCs are deliberating...')}</p>`);
r('ShipIt.tsx',
  `                  With AI`,
  `                  {t('withAI', 'With AI')}`);
r('ShipIt.tsx',
  `                  Without AI`,
  `                  {t('withoutAI', 'Without AI')}`);
r('ShipIt.tsx',
  `                Pitch Another Idea`,
  `                {t('pitchAnother', 'Pitch Another Idea')}`);
r('ShipIt.tsx',
  `setError('The VCs were so excited they forgot to write their verdict. Try again!');`,
  `setError(t('parseError', 'The VCs were so excited they forgot to write their verdict. Try again!'));`);

// ═══════════════════════════════════════
// TokenTetris.tsx
// ═══════════════════════════════════════
console.log('Processing TokenTetris.tsx...');
r('TokenTetris.tsx',
  `              Token Tetris\n            </h3>`,
  `              {t('title', 'Token Tetris')}\n            </h3>`);
r('TokenTetris.tsx',
  `              How many tokens is this?`,
  `              {t('subtitle', 'How many tokens is this?')}`);
rAll('TokenTetris.tsx',
  `            {score} pts`,
  `            {t('pts', '{score} pts').replace('{score}', String(score))}`);
r('TokenTetris.tsx',
  `          Round {round + 1} of {totalRounds}`,
  `          {t('roundOf', 'Round {current} of {total}').replace('{current}', String(round + 1)).replace('{total}', String(totalRounds))}`);
r('TokenTetris.tsx',
  `            Text\n          </div>`,
  `            {t('textLabel', 'Text')}\n          </div>`);
r('TokenTetris.tsx',
  `              {currentRound.tokens} {currentRound.tokens === 1 ? 'token' : 'tokens'}`,
  `              {currentRound.tokens} {currentRound.tokens === 1 ? t('token', 'token') : t('tokens', 'tokens')}`);
r('TokenTetris.tsx',
  `            Token Accuracy: {pct}%`,
  `            {t('tokenAccuracy', 'Token Accuracy: {pct}%').replace('{pct}', String(pct))}`);
rAll('TokenTetris.tsx',
  `            Play Again`,
  `            {t('playAgain', 'Play Again')}`);
r('TokenTetris.tsx',
  `pct === 100\n        ? 'Perfect score. You think in tokens.'\n        : pct >= 60\n          ? 'Nice intuition! Tokenization is tricky and you handled it well.'\n          : "Tokenization is weirder than it looks. Now you know why AI doesn't 'see' text the way you do.";`,
  `pct === 100\n        ? t('resultPerfect', 'Perfect score. You think in tokens.')\n        : pct >= 60\n          ? t('resultGood', 'Nice intuition! Tokenization is tricky and you handled it well.')\n          : t('resultLow', "Tokenization is weirder than it looks. Now you know why AI doesn't 'see' text the way you do.");`);
r('TokenTetris.tsx',
  `                {isCorrect ? 'Correct!' : 'Not quite.'}`,
  `                {isCorrect ? t('correct', 'Correct!') : t('notQuite', 'Not quite.')}`);
r('TokenTetris.tsx',
  `                {round + 1 >= totalRounds ? 'See Results' : 'Next Round'}`,
  `                {round + 1 >= totalRounds ? t('seeResults', 'See Results') : t('nextRound', 'Next Round')}`);

// ═══════════════════════════════════════
// AgentTakeover.tsx
// ═══════════════════════════════════════
console.log('Processing AgentTakeover.tsx...');
r('AgentTakeover.tsx',
  'systemPrompt: SYSTEM_PROMPT,\n      maxTokens: 300,\n      source: \'break\',\n      onChunk: (chunk) => {\n        accumulated += chunk;\n      },\n      onDone: () => {',
  'systemPrompt: SYSTEM_PROMPT + `\\n\\nIMPORTANT: Write all text fields (tier, automate, refuse, disaster, bestLine, assessment) in ${langName}. The JSON structure and key names must remain in English.`,\n      maxTokens: 300,\n      source: \'break\',\n      onChunk: (chunk) => {\n        accumulated += chunk;\n      },\n      onDone: () => {');
r('AgentTakeover.tsx',
  `            Agent Takeover\n          </h3>`,
  `            {t('title', 'Agent Takeover')}\n          </h3>`);
r('AgentTakeover.tsx',
  `            Describe your day. We'll automate what we can. And break what we can't.`,
  `            {t('subtitle', "Describe your day. We'll automate what we can. And break what we can't.")}`);
r('AgentTakeover.tsx',
  `Walk us through a typical day. What do you do from morning to night?`,
  `{t('inputPrompt', 'Walk us through a typical day. What do you do from morning to night?')}`);
r('AgentTakeover.tsx',
  'placeholder={`e.g. "Wake up at 7, scroll TikTok for 20 min, get dressed, bus to school, classes until 3, basketball practice, homework, dinner with family, game with friends online, bed at 11"`}',
  `placeholder={t('placeholder', 'e.g. "Wake up at 7, scroll TikTok for 20 min, get dressed, bus to school, classes until 3, basketball practice, homework, dinner with family, game with friends online, bed at 11"')}`);
r('AgentTakeover.tsx',
  `                Let the Agent Loose`,
  `                {t('analyzeButton', 'Let the Agent Loose')}`);
rAll('AgentTakeover.tsx',
  `>Cmd+Enter</span>`,
  `>{t('cmdEnter', 'Cmd+Enter')}</span>`);
r('AgentTakeover.tsx',
  `>Agent scanning your routine...</p>`,
  `>{t('loading', 'Agent scanning your routine...')}</p>`);
r('AgentTakeover.tsx',
  `                of your day an agent could handle`,
  `                {t('ofYourDay', 'of your day an agent could handle')}`);
r('AgentTakeover.tsx',
  `                  Would automate`,
  `                  {t('wouldAutomate', 'Would automate')}`);
r('AgentTakeover.tsx',
  `                  Would refuse`,
  `                  {t('wouldRefuse', 'Would refuse')}`);
r('AgentTakeover.tsx',
  `                  What would go wrong`,
  `                  {t('whatWouldGoWrong', 'What would go wrong')}`);
r('AgentTakeover.tsx',
  `                Try Another Day`,
  `                {t('tryAnotherDay', 'Try Another Day')}`);
r('AgentTakeover.tsx',
  `setError('The agent got so excited about your day it short-circuited. Try again!');`,
  `setError(t('parseError', 'The agent got so excited about your day it short-circuited. Try again!'));`);

// ═══════════════════════════════════════
// DreamProject.tsx
// ═══════════════════════════════════════
console.log('Processing DreamProject.tsx...');
r('DreamProject.tsx',
  'systemPrompt: SYSTEM_PROMPT,\n      maxTokens: 300,\n      source: \'break\',\n      onChunk: (chunk) => {\n        accumulated += chunk;\n      },\n      onDone: () => {',
  'systemPrompt: SYSTEM_PROMPT + `\\n\\nIMPORTANT: Write all text fields (tier, bestLine, tools role descriptions, assessment) in ${langName}. The JSON structure and key names must remain in English.`,\n      maxTokens: 300,\n      source: \'break\',\n      onChunk: (chunk) => {\n        accumulated += chunk;\n      },\n      onDone: () => {');
r('DreamProject.tsx',
  `            Dream Project\n          </h3>`,
  `            {t('title', 'Dream Project')}\n          </h3>`);
r('DreamProject.tsx',
  `            Describe your wildest creative idea. We'll build the toolkit.`,
  `            {t('subtitle', "Describe your wildest creative idea. We'll build the toolkit.")}`);
r('DreamProject.tsx',
  `What would you build if you had every AI tool at your fingertips?`,
  `{t('inputPrompt', 'What would you build if you had every AI tool at your fingertips?')}`);
r('DreamProject.tsx',
  'placeholder={`e.g. "An animated short film about a robot who learns to paint, with original music and voice acting"`}',
  `placeholder={t('placeholder', 'e.g. "An animated short film about a robot who learns to paint, with original music and voice acting"')}`);
r('DreamProject.tsx',
  `                Rate My Dream`,
  `                {t('rateButton', 'Rate My Dream')}`);
rAll('DreamProject.tsx',
  `>Cmd+Enter</span>`,
  `>{t('cmdEnter', 'Cmd+Enter')}</span>`);
r('DreamProject.tsx',
  `>Evaluating your ambition...</p>`,
  `>{t('loading', 'Evaluating your ambition...')}</p>`);
r('DreamProject.tsx',
  `                  Your AI Toolkit`,
  `                  {t('yourAIToolkit', 'Your AI Toolkit')}`);
r('DreamProject.tsx',
  `                Try Another Idea`,
  `                {t('tryAnother', 'Try Another Idea')}`);
r('DreamProject.tsx',
  `setError('Your dream was so wild it broke the scoring algorithm. Try again!');`,
  `setError(t('parseError', 'Your dream was so wild it broke the scoring algorithm. Try again!'));`);

// ═══════════════════════════════════════
// VibeCheck.tsx
// ═══════════════════════════════════════
console.log('Processing VibeCheck.tsx...');
r('VibeCheck.tsx',
  'systemPrompt: SYSTEM_PROMPT,\n      maxTokens: 300,\n      source: \'break\',\n      onChunk: (chunk) => {\n        accumulated += chunk;\n      },\n      onDone: () => {',
  'systemPrompt: SYSTEM_PROMPT + `\\n\\nIMPORTANT: Write all text fields (vibe, bestLine, assessment, traits) in ${langName}. The JSON structure and key names must remain in English.`,\n      maxTokens: 300,\n      source: \'break\',\n      onChunk: (chunk) => {\n        accumulated += chunk;\n      },\n      onDone: () => {');
r('VibeCheck.tsx',
  `              Vibe Check\n            </h3>`,
  `              {t('title', 'Vibe Check')}\n            </h3>`);
r('VibeCheck.tsx',
  `              Paste anything you've written. We'll read between the lines.`,
  `              {t('subtitle', "Paste anything you've written. We'll read between the lines.")}`);
r('VibeCheck.tsx',
  `placeholder="Paste a text message, tweet, essay paragraph, email, journal entry — anything you've written..."`,
  `placeholder={t('placeholder', "Paste a text message, tweet, essay paragraph, email, journal entry \\u2014 anything you've written...")}`);
r('VibeCheck.tsx',
  `              Check My Vibe`,
  `              {t('checkButton', 'Check My Vibe')}`);
rAll('VibeCheck.tsx',
  `>Cmd+Enter</span>`,
  `>{t('cmdEnter', 'Cmd+Enter')}</span>`);
r('VibeCheck.tsx',
  `>Reading between your lines...</p>`,
  `>{t('loading', 'Reading between your lines...')}</p>`);
r('VibeCheck.tsx',
  `                Your voice in 3 words`,
  `                {t('voiceIn3Words', 'Your voice in 3 words')}`);
r('VibeCheck.tsx',
  `              Try Another Text`,
  `              {t('tryAnother', 'Try Another Text')}`);
r('VibeCheck.tsx',
  `setError('Your writing was so unique it broke the analyzer. Try again!');`,
  `setError(t('parseError', 'Your writing was so unique it broke the analyzer. Try again!'));`);
r('VibeCheck.tsx',
  `                Daily vibe checks used up!`,
  `                {t('dailyUsedUp', 'Daily vibe checks used up!')}`);
r('VibeCheck.tsx',
  `                Unlock full access for unlimited vibe checks`,
  `                {t('unlockAccess', 'Unlock full access for unlimited vibe checks')}`);

// ═══════════════════════════════════════
// WouldYouLetIt.tsx
// ═══════════════════════════════════════
console.log('Processing WouldYouLetIt.tsx...');
r('WouldYouLetIt.tsx',
  `              Would You Let It?\n            </h3>`,
  `              {t('title', 'Would You Let It?')}\n            </h3>`);
r('WouldYouLetIt.tsx',
  `          Scenario {currentIndex + 1} of {scenarios.length}`,
  `          {t('scenarioOf', 'Scenario {current} of {total}').replace('{current}', String(currentIndex + 1)).replace('{total}', String(scenarios.length))}`);
r('WouldYouLetIt.tsx',
  `            AI Agent Request`,
  `            {t('aiAgentRequest', 'AI Agent Request')}`);
r('WouldYouLetIt.tsx',
  `            Your autonomy profile`,
  `            {t('yourAutonomyProfile', 'Your autonomy profile')}`);
rAll('WouldYouLetIt.tsx',
  `            Play Again`,
  `            {t('playAgain', 'Play Again')}`);
r('WouldYouLetIt.tsx',
  `                {currentIndex + 1 >= scenarios.length ? 'See Your Profile' : 'Next Scenario'}`,
  `                {currentIndex + 1 >= scenarios.length ? t('seeYourProfile', 'See Your Profile') : t('nextScenario', 'Next Scenario')}`);

// ═══════════════════════════════════════
// ComplexityScore.tsx
// ═══════════════════════════════════════
console.log('Processing ComplexityScore.tsx...');
r('ComplexityScore.tsx',
  'systemPrompt: SYSTEM_PROMPT,\n      maxTokens: 300,\n      source: \'break\',\n      onChunk: (chunk) => {\n        accumulated += chunk;\n      },\n      onDone: () => {',
  'systemPrompt: SYSTEM_PROMPT + `\\n\\nIMPORTANT: Write all text fields (tier, breakdown, bestLine, assessment) in ${langName}. The JSON structure and key names must remain in English.`,\n      maxTokens: 300,\n      source: \'break\',\n      onChunk: (chunk) => {\n        accumulated += chunk;\n      },\n      onDone: () => {');
r('ComplexityScore.tsx',
  `            Complexity Score\n          </h3>`,
  `            {t('title', 'Complexity Score')}\n          </h3>`);
r('ComplexityScore.tsx',
  `            Describe your project. We'll tell you what you're really signing up for.`,
  `            {t('subtitle', "Describe your project. We'll tell you what you're really signing up for.")}`);
r('ComplexityScore.tsx',
  `What are you building? Describe your project and we'll break it down into sub-tasks and rate its complexity.`,
  `{t('inputPrompt', "What are you building? Describe your project and we'll break it down into sub-tasks and rate its complexity.")}`);
r('ComplexityScore.tsx',
  'placeholder={`e.g. "A multiplayer trivia game with real-time scoring, user accounts, and a leaderboard"`}',
  `placeholder={t('placeholder', 'e.g. "A multiplayer trivia game with real-time scoring, user accounts, and a leaderboard"')}`);
r('ComplexityScore.tsx',
  `                Score My Project`,
  `                {t('scoreButton', 'Score My Project')}`);
rAll('ComplexityScore.tsx',
  `>Cmd+Enter</span>`,
  `>{t('cmdEnter', 'Cmd+Enter')}</span>`);
r('ComplexityScore.tsx',
  `>Decomposing your project...</p>`,
  `>{t('loading', 'Decomposing your project...')}</p>`);
r('ComplexityScore.tsx',
  `                total sub-tasks`,
  `                {t('totalSubTasks', 'total sub-tasks')}`);
r('ComplexityScore.tsx',
  `                Key sub-tasks`,
  `                {t('keySubTasks', 'Key sub-tasks')}`);
r('ComplexityScore.tsx',
  `                Reality check`,
  `                {t('realityCheck', 'Reality check')}`);
r('ComplexityScore.tsx',
  `                Try Another Project`,
  `                {t('tryAnother', 'Try Another Project')}`);
r('ComplexityScore.tsx',
  `setError('The project was so ambitious it broke our scoring system. Try again!');`,
  `setError(t('parseError', 'The project was so ambitious it broke our scoring system. Try again!'));`);

// ═══════════════════════════════════════
// IrreplaceableYou.tsx
// ═══════════════════════════════════════
console.log('Processing IrreplaceableYou.tsx...');
r('IrreplaceableYou.tsx',
  'systemPrompt: SYSTEM_PROMPT,\n      maxTokens: 300,\n      source: \'break\',\n      onChunk: (chunk) => {\n        accumulated += chunk;\n      },\n      onDone: () => {',
  'systemPrompt: SYSTEM_PROMPT + `\\n\\nIMPORTANT: Write all text fields (tier, canHelp, cantReplace, bestLine, assessment) in ${langName}. The JSON structure and key names must remain in English.`,\n      maxTokens: 300,\n      source: \'break\',\n      onChunk: (chunk) => {\n        accumulated += chunk;\n      },\n      onDone: () => {');
r('IrreplaceableYou.tsx',
  `              Irreplaceable You\n            </h3>`,
  `              {t('title', 'Irreplaceable You')}\n            </h3>`);
r('IrreplaceableYou.tsx',
  `              Describe yourself. We'll tell you what no AI can touch.`,
  `              {t('subtitle', "Describe yourself. We'll tell you what no AI can touch.")}`);
r('IrreplaceableYou.tsx',
  `placeholder="I'm a high school junior who plays basketball, makes beats, and is obsessed with anime"`,
  `placeholder={t('placeholder', "I'm a high school junior who plays basketball, makes beats, and is obsessed with anime")}`);
r('IrreplaceableYou.tsx',
  `              Am I Replaceable?`,
  `              {t('checkButton', 'Am I Replaceable?')}`);
rAll('IrreplaceableYou.tsx',
  `>Cmd+Enter</span>`,
  `>{t('cmdEnter', 'Cmd+Enter')}</span>`);
r('IrreplaceableYou.tsx',
  `>Evaluating your irreplaceability...</p>`,
  `>{t('loading', 'Evaluating your irreplaceability...')}</p>`);
r('IrreplaceableYou.tsx',
  `                AI can help with`,
  `                {t('aiCanHelp', 'AI can help with')}`);
r('IrreplaceableYou.tsx',
  `                Only you can do this`,
  `                {t('onlyYou', 'Only you can do this')}`);
r('IrreplaceableYou.tsx',
  `              Try Again`,
  `              {t('tryAgain', 'Try Again')}`);
r('IrreplaceableYou.tsx',
  `setError('Your uniqueness broke the algorithm. Try again!');`,
  `setError(t('parseError', 'Your uniqueness broke the algorithm. Try again!'));`);
r('IrreplaceableYou.tsx',
  `                Daily checks used up!`,
  `                {t('dailyUsedUp', 'Daily checks used up!')}`);
r('IrreplaceableYou.tsx',
  `                Unlock full access for unlimited irreplaceability checks`,
  `                {t('unlockAccess', 'Unlock full access for unlimited irreplaceability checks')}`);

console.log('\nAll component string replacements complete!');
