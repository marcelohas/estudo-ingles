import {
  askTutor,
  currentUser,
  enterWithGoogle,
  evaluateProductiveSkills,
  generateAdaptiveWeek,
  isGoogleConfigured,
  leaveAccount,
  observeUser,
} from "./google-gemini-client.js";
import { fixedVideoCatalog } from "./fixed-video-catalog.js";

const initialWeeks = [
  {
    title: "Ouvir para entender o contexto",
    lessons: [
      lesson(1,"Apresentar-se","Identificar nomes, cumprimentos e apresentações.","WR9_nsLyaEY","I am → I'm · You are → You're · Are you...?",q("Quem está chegando ao novo apartamento?",["Pete","Anna","Marsha"],1),q("Qual frase é usada ao conhecer alguém?",["See you tomorrow","Nice to meet you","Good night"],1),q("Complete: ___ you Anna?",["Is","Are","Am"],1)),
      lesson(2,"Pessoas e lugares","Entender quem é uma pessoa e de onde ela vem.","1-U7o9xjWQc","I am · you are · he/she is · Where are you from?",q("Anna é nova em qual cidade?",["D.C.","Boston","São Paulo"],0),q("Quem é a colega de apartamento de Anna?",["Pete","Marsha","Jonathan"],1),q("Complete: She ___ nice.",["am","are","is"],2)),
      lesson(3,"Entender pelo contexto","Usar pistas para compreender a situação.","IEA9LMy-N3M","I want to... · Is there...? · This is...",q("Por que Anna telefona?",["Procura um supermercado","Procura um hotel","Quer trabalhar"],0),q("O que acontece na primeira ligação?",["Ninguém atende","É o número errado","Marsha não entende"],1),q("O supermercado fica...",["longe","fechado","na mesma rua"],2)),
      lesson(4,"Identificar objetos","Distinguir is, have e objetos comuns.","Z5PF-vJdUdc","It is... · It isn't... · I have...",q("O que Anna procura?",["Uma caneta","Um telefone","Uma chave"],0),q("Qual objeto mostra o mundo?",["pillow","map","toy"],1),q("I ___ a pen in my bag.",["am","is","have"],2)),
      lesson(5,"Cômodos e ações","Inferir um lugar pela ação realizada.","lDaZB5BBw7M","I am in... · I cook/sleep/wash in...",q("Onde as pessoas cozinham?",["bedroom","kitchen","bathroom"],1),q("Qual ação indica o quarto?",["sleep","cook","wash"],0),q("I wash in this room. Qual lugar?",["living room","bathroom","bedroom"],1)),
      lesson(6,"Pedir direções","Entender uma localização usando palavras-chave.","T3AJ29_2IX8","Where is...? · next to · Go straight · Turn...",q("Qual pergunta pede localização?",["Who is the gym?","Where is the gym?","What time is the gym?"],1),q("Next to significa...",["ao lado de","longe de","em frente"],0),q("Complete: ___ left.",["Turn","Sleep","Have"],0)),
      lesson(7,"Revisão semanal","Verificar retenção e reconhecer ações em andamento.","Ka33lX-kbMg","I am studying · What are you doing?",q("I ___ from Brazil.",["is","am","are"],1),q("Qual pergunta pede localização?",["Where is it?","Who is it?","How old is it?"],0),q("I am ___ English now.",["study","studying","studies"],1))
    ]
  },
  {
    title: "Rotina, clima e convites",
    lessons: [
      simple(1,"Você está ocupado?","sp0cwcd1fGE","Are you busy? · I am working."),
      simple(2,"Como está o tempo?","ZfdNbSe7Prw","It is cold/hot/sunny today."),
      simple(3,"Venha à minha casa","1Lo_ICJYxZI","Come over · This is my place."),
      simple(4,"Minha vizinhança","8_npDNRKGIE","There is/are · near · across from."),
      simple(5,"Falar da família","ncA2an5c1_g","This is my... · He/She is..."),
      simple(6,"Datas e aniversários","oJOdrnPlSUE","When is...? · It is on..."),
      simple(7,"Escolhas e preferências","4Xn1Ysdmuvg","How about this? · I prefer..."),
    ]
  },
  {
    title: "Interesses, frequência e trabalho",
    lessons: [
      simple(1,"Observar pessoas","c6_7RYaNgdA","He is walking · They are talking."),
      simple(2,"De onde você é?","QQavoMYmMVE","Where are you from? · I am from..."),
      simple(3,"Combinar um horário","91sCUUVTDV8","Are you free on Friday? · Yes, I am."),
      simple(4,"Falar de frequência","he12VfXp5Ec","always · usually · sometimes · never"),
      simple(5,"Começar no trabalho","lgEodUvA5Po","When do I start? · You start at..."),
      simple(6,"Habilidades","2juFXfLsSJk","I can/can't... · Can you...?"),
      simple(7,"Convites e revisão","A9lwBqNZEh8","Can you come? · I'd love to."),
    ]
  }
];

function q(text, options, answer, skill){ return {text,options,answer,skill}; }
function lesson(day,title,goal,videoId,structure,...qs){ return {day,title,goal,videoId,structure,qs}; }
function simple(day,title,videoId,structure){
  const keyPhrase = structure.split(" · ")[0];
  return lesson(day,title,`Compreender ${title.toLowerCase()} em uma conversa curta.`,videoId,structure,
    q(`Qual frase-chave pertence ao vídeo “${title}”?`,[keyPhrase,"Nice to meet you.","Where is the supermarket?"],0,"listening"),
    q("Qual é o assunto principal desta conversa?",[title,"Pedir direções","Apresentar-se pela primeira vez"],0,"vocabulary"),
    q("Qual estrutura deve ser repetida em voz alta nesta aula?",[structure,"I am Anna. · Nice to meet you.","Turn left. · Go straight."],0,"grammar"));
}

const videoCatalog = fixedVideoCatalog;
const curatedVideos = videoCatalog.map((item) => item.videoId);
function videoCatalogForLevel(level) {
  if (level === "A1") return videoCatalog.filter((item) => item.phase === "A1-A2");
  return videoCatalog.filter((item) => item.phase === "A2-B1");
}
const skillLabels = {
  listening: "Compreensão",
  vocabulary: "Vocabulário",
  grammar: "Gramática",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};
const blank = {
  week: 1,
  day: 1,
  completed: [],
  answers: {},
  scores: {},
  minutes: 0,
  evaluations: {},
  confidence: {},
  chatHistory: {},
  generatedWeeks: {},
  lessonReports: {},
  weeklyReports: {},
  skillStats: {
    listening: { correct: 0, total: 0 },
    vocabulary: { correct: 0, total: 0 },
    grammar: { correct: 0, total: 0 },
    reading: { correct: 0, total: 0 },
    writing: { correct: 0, total: 0 },
    speaking: { correct: 0, total: 0 },
  },
  currentLevel: "A1",
  levelStartedWeek: 1,
  levelAssessments: {},
  productiveAnswers: {},
  startedAt: new Date().toISOString(),
};
let stored = JSON.parse(localStorage.getItem("inglesNoRitmo")||"{}");
let state = {
  ...blank,
  ...stored,
  generatedWeeks: stored.generatedWeeks || {},
  lessonReports: stored.lessonReports || {},
  weeklyReports: stored.weeklyReports || {},
  skillStats: {...blank.skillStats, ...(stored.skillStats || {})},
  levelAssessments: stored.levelAssessments || {},
  productiveAnswers: stored.productiveAnswers || {},
};
if(!state.week) state.week=1;
const key=(w,d)=>`${w}-${d}`;
const save=()=>localStorage.setItem("inglesNoRitmo",JSON.stringify(state));
const weekAt=(number)=>state.generatedWeeks[number]||initialWeeks[number-1];
const currentWeek=()=>weekAt(state.week);
function normalizeLesson(item) {
  if (!item) return item;
  const questions = [...(item.qs || [])];
  if (!questions.some((question, index) => questionSkill(question, index) === "reading")) {
    const keyPhrase = String(item.structure || "Use English in context.").split(" · ")[0];
    questions.push(q(
      `Leia a frase “${keyPhrase}”. Qual opção pertence ao mesmo contexto da aula?`,
      [item.title, "Uma situação sem relação com a aula", "Uma instrução em português"],
      0,
      "reading",
    ));
  }
  return {
    ...item,
    qs: questions,
    writingPrompt: item.writingPrompt ||
      `Escreva de 3 a 5 frases em inglês sobre “${item.title}” usando a estrutura: ${item.structure}`,
    speakingPrompt: item.speakingPrompt ||
      `Fale de 20 a 40 segundos sobre “${item.title}”. Use pelo menos uma estrutura da aula.`,
    practiceTasks: Array.isArray(item.practiceTasks)
      ? item.practiceTasks.map((task) => typeof task === "string"
        ? { skill: "writing", prompt: task }
        : task)
      : [],
  };
}
const currentLesson=()=>normalizeLesson(currentWeek().lessons[state.day-1]);
function toast(text){const el=document.querySelector("#toast");el.textContent=text;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2400)}
function escapeHTML(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function questionSkill(question, index) {
  return question.skill || ["listening", "vocabulary", "grammar", "reading"][index] || "grammar";
}

function percent(correct, total) {
  return total ? Math.round((correct / total) * 100) : 0;
}

function performanceBand(value) {
  if (value >= 85) return "domínio forte";
  if (value >= 70) return "bom progresso";
  if (value >= 50) return "em consolidação";
  return "precisa de reforço";
}

function buildLessonReport(lesson, id, answers, confidence, productive = null) {
  const bySkill = {};
  lesson.qs.forEach((question, index) => {
    const skill = questionSkill(question, index);
    bySkill[skill] = bySkill[skill] || { correct: 0, total: 0 };
    bySkill[skill].total += 1;
    if (answers[index] === question.answer) bySkill[skill].correct += 1;
  });
  const correct = lesson.qs.filter((question, index) => answers[index] === question.answer).length;
  if (productive) {
    bySkill.writing = { correct: productive.writing.score, total: 100 };
    bySkill.speaking = { correct: productive.speaking.score, total: 100 };
  }
  const skillPercentages = Object.values(bySkill).map((result) => percent(result.correct, result.total));
  const accuracy = Math.round(
    skillPercentages.reduce((sum, value) => sum + value, 0) / Math.max(skillPercentages.length, 1),
  );
  const weakest = Object.entries(bySkill)
    .sort(([, a], [, b]) => percent(a.correct, a.total) - percent(b.correct, b.total))[0]?.[0];
  const recommendation = accuracy >= 85 && confidence >= 2
    ? "Avance mantendo uma revisão curta desta estrutura."
    : `Revise ${skillLabels[weakest]?.toLowerCase() || "o conteúdo"} antes da próxima aula.`;
  return {
    lessonId: id,
    title: lesson.title,
    accuracy,
    correct,
    total: lesson.qs.length,
    confidence,
    bySkill,
    productive,
    corrections: lesson.qs.map((question, index) => ({
      question: question.text,
      skill: questionSkill(question, index),
      correct: answers[index] === question.answer,
      selectedAnswer: question.options[answers[index]] || "Sem resposta",
      correctAnswer: question.options[question.answer],
    })),
    recommendation,
    completedAt: new Date().toISOString(),
  };
}

function lessonReportMarkup(report) {
  if (!report) return "";
  const hasDetailedCorrection = Array.isArray(report.corrections);
  const corrections = (report.corrections || []).filter((item) => !item.correct);
  return `<div class="lesson-report">
    <strong>Relatório da aula</strong>
    <p>${report.accuracy}% de acerto · ${performanceBand(report.accuracy)} · confiança ${report.confidence}/3.</p>
    <p>${report.recommendation}</p>
    ${!hasDetailedCorrection
      ? "<p><strong>Corrija novamente esta aula para gerar o detalhamento das respostas.</strong></p>"
      : corrections.length
      ? `<div class="lesson-corrections"><strong>Respostas para revisar</strong>${corrections.map((item) =>
        `<p><span class="question-skill">${escapeHTML(skillLabels[item.skill] || item.skill)}</span> ${escapeHTML(item.question)}<br><small>Sua resposta: ${escapeHTML(item.selectedAnswer)} · Correta: ${escapeHTML(item.correctAnswer)}</small></p>`).join("")}</div>`
      : "<p><strong>✓ Todas as questões objetivas estão corretas.</strong></p>"}
    ${report.productive ? `<p><strong>Writing ${report.productive.writing.score}%:</strong> ${escapeHTML(report.productive.writing.feedback)}</p><p><strong>Speaking ${report.productive.speaking.score}%:</strong> ${escapeHTML(report.productive.speaking.feedback)}</p>` : ""}
  </div>`;
}

function youtubeEmbedUrl(videoId, captions) {
  const params = new URLSearchParams({
    rel: "0",
    cc_load_policy: captions ? "1" : "0",
    cc_lang_pref: "en",
    hl: "en",
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
}

function setListeningPass(mode, lessonItem) {
  const captions = false;
  const iframe = document.querySelector("#lessonVideo");
  iframe.src = youtubeEmbedUrl(lessonItem.videoId, captions);
  document.querySelectorAll(".listen-mode").forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  const status = document.querySelector("#listeningModeStatus");
  status.textContent = mode === "captions"
    ? `2ª escuta: acompanhe as frases-chave abaixo — ${lessonItem.structure}`
    : "1ª escuta: assista ao vídeo inteiro sem apoio e identifique a situação geral.";
}

function needsCurrentAdaptation() {
  return state.week > 1 && !state.generatedWeeks[state.week] && weekCompleted(state.week - 1);
}

function rebuildDerivedReports() {
  let changed = false;
  state.completed.forEach((lessonId) => {
    if (state.lessonReports[lessonId] || !state.answers[lessonId]) return;
    const [weekNumber, dayNumber] = lessonId.split("-").map(Number);
    const plan = weekAt(weekNumber);
    const lessonItem = normalizeLesson(plan?.lessons?.find((item) => item.day === dayNumber));
    if (!lessonItem) return;
    state.lessonReports[lessonId] = buildLessonReport(
      lessonItem,
      lessonId,
      state.answers[lessonId],
      state.confidence[lessonId] || 2,
      state.productiveAnswers[lessonId]?.evaluation || null,
    );
    changed = true;
  });
  state.skillStats = {
    listening: { correct: 0, total: 0 },
    vocabulary: { correct: 0, total: 0 },
    grammar: { correct: 0, total: 0 },
    reading: { correct: 0, total: 0 },
    writing: { correct: 0, total: 0 },
    speaking: { correct: 0, total: 0 },
  };
  Object.values(state.lessonReports).forEach((report) => {
    Object.entries(report.bySkill || {}).forEach(([skill, result]) => {
      state.skillStats[skill] = state.skillStats[skill] || { correct: 0, total: 0 };
      state.skillStats[skill].correct += result.correct;
      state.skillStats[skill].total += result.total;
    });
  });
  if (changed) save();
}

function renderLesson(){
  const l=currentLesson(), id=key(state.week,l.day), done=state.completed.includes(id);
  const productive = state.productiveAnswers[id] || {};
  document.querySelector("#todayTitle").textContent=`Olá, Marcelo. Vamos ouvir?`;
  document.querySelector("#lessonCard").innerHTML=`
    <div class="lesson-head"><div><span class="lesson-number">SEMANA ${state.week} · DIA ${l.day} DE 7</span><h2>${l.title}</h2><p>${l.goal}</p></div><span class="time-badge">◷ 30 minutos</span></div>
    ${needsCurrentAdaptation()?`<div class="adaptive-warning"><div><strong>Esta semana ainda usa o plano básico antigo.</strong><span>Gere uma versão personalizada usando seu desempenho da semana anterior.</span></div><button type="button" class="primary" id="adaptCurrentWeek">Adaptar esta semana com IA</button></div>`:""}
    <div class="lesson-body"><div class="media-panel">
      <div class="video-frame online-only"><iframe id="lessonVideo" src="${youtubeEmbedUrl(l.videoId, false)}" title="Vídeo: ${l.title}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>
      <div class="offline-note">Sem conexão: revise a estrutura e faça os exercícios. O vídeo ficará disponível quando a internet voltar.</div>
      <div class="listen-controls online-only" aria-label="Escolha a etapa da escuta">
        <button type="button" class="listen-mode active" data-mode="no-captions" aria-pressed="true"><strong>1ª escuta</strong><span>Sem legenda</span></button>
        <button type="button" class="listen-mode" data-mode="captions" aria-pressed="false"><strong>2ª escuta</strong><span>Com frases-chave</span></button>
      </div>
      <p class="listen-tip" id="listeningModeStatus" aria-live="polite">1ª escuta: assista ao vídeo inteiro sem apoio e identifique a situação geral.</p>
      <div class="structure"><strong>Estrutura do dia</strong><br>${l.structure}</div>
    </div><form class="exercise-panel" id="quizForm"><h3>Verifique sua compreensão</h3>
      <p class="quiz-instruction">Responda somente depois das duas escutas. As questões abaixo usam o tema e as frases-chave deste vídeo.</p>
      ${l.qs.map((question,i)=>`<div class="question"><span class="question-skill">${skillLabels[questionSkill(question,i)]}</span><p>${i+1}. ${question.text}</p>${question.options.map((o,j)=>`<label class="option"><input type="radio" name="q${i}" value="${j}" ${state.answers[id]?.[i]==j?"checked":""}> ${o}</label>`).join("")}</div>`).join("")}
      <div class="productive-exercise">
        <span class="question-skill">Writing</span>
        <label for="writingAnswer"><strong>${l.writingPrompt}</strong></label>
        <textarea id="writingAnswer" rows="5" minlength="30" placeholder="Escreva sua resposta em inglês...">${escapeHTML(productive.writing)}</textarea>
      </div>
      <div class="productive-exercise">
        <span class="question-skill">Speaking</span>
        <p><strong>${l.speakingPrompt}</strong></p>
        <button type="button" class="secondary" id="recordSpeaking">🎙️ Começar a falar</button>
        <label for="speakingTranscript" class="transcript-label">Transcrição reconhecida</label>
        <textarea id="speakingTranscript" rows="3" placeholder="A transcrição aparecerá aqui. Você também pode corrigi-la antes de enviar.">${escapeHTML(productive.speakingTranscript)}</textarea>
        <small>A avaliação automática mede conteúdo, vocabulário e clareza da transcrição; não substitui uma avaliação humana de pronúncia.</small>
      </div>
      ${l.practiceTasks.length ? `<div class="extra-practice"><strong>Reforço desta aula</strong>${l.practiceTasks.map((task,index) => `<label for="extraPractice${index}"><span class="question-skill">${escapeHTML(task.skill)}</span>${escapeHTML(task.prompt)}</label><textarea id="extraPractice${index}" data-skill="${escapeHTML(task.skill)}" rows="3" placeholder="Registre sua resposta ou a transcrição da sua fala...">${escapeHTML(productive.extraPractice?.[index]?.answer)}</textarea>`).join("")}</div>` : ""}
      <div class="confidence"><label>Como foi a audição hoje? <select id="confidence"><option value="">Escolha</option><option value="1">Difícil</option><option value="2">Razoável</option><option value="3">Boa</option></select></label></div>
      <div class="feedback ${done?"show":""}">${done?lessonReportMarkup(state.lessonReports[id]):""}</div>
      <div class="actions"><button type="submit" class="primary">${done?"Corrigir novamente e atualizar relatório":"Corrigir aula e gerar relatório"}</button><button type="button" class="primary whatsapp" id="whatsapp">Enviar pelo WhatsApp</button></div>

      <button type="button" class="secondary chat-toggle" id="chatToggle" style="margin-top:24px">💬 Tirar dúvida com a IA</button>
      <div class="chat-panel" id="chatPanel" style="display:none">
        <div class="chat-messages" id="chatMessages"></div>
        <div class="chat-input-area">
          <input type="text" id="chatInput" placeholder="${currentUser() ? "Pergunte sobre a aula..." : "Conecte sua conta Google para usar o tutor"}" autocomplete="off" ${currentUser() ? "" : "disabled"}>
          <button type="button" class="primary" id="sendChat" ${currentUser() ? "" : "disabled"}>Enviar</button>
        </div>
      </div>
    </form></div>`;
  document.querySelector("#quizForm").onsubmit=e=>finishLesson(e,l,id);
  document.querySelector("#whatsapp").onclick=()=>shareLesson(l);
  document.querySelectorAll(".listen-mode").forEach((button) => {
    button.onclick = () => setListeningPass(button.dataset.mode, l);
  });
  document.querySelector("#recordSpeaking").onclick = startSpeakingRecognition;
  const adaptButton = document.querySelector("#adaptCurrentWeek");
  if (adaptButton) adaptButton.onclick = regenerateCurrentWeek;

  // Setup chat
  document.querySelector("#chatToggle").onclick=()=>{
    const panel = document.querySelector("#chatPanel");
    if(panel.style.display==="none") {
      panel.style.display="flex";
      renderChat(id);
    } else {
      panel.style.display="none";
    }
  };

  document.querySelector("#sendChat").onclick=()=>handleSendChat(id, l);
  document.querySelector("#chatInput").onkeydown=e=>{if(e.key==="Enter") {e.preventDefault();handleSendChat(id, l);}};
}

function renderChat(id){
  const msgs = state.chatHistory[id] || [];
  const container = document.querySelector("#chatMessages");
  container.replaceChildren();
  if(msgs.length === 0) {
    appendChatMessage(container, "ai", currentUser()
      ? "Olá! Sou seu tutor de inglês. O que você quer praticar ou entender nesta aula?"
      : "Entre com sua conta Google para conversar com o tutor.");
  } else {
    msgs.forEach(m => appendChatMessage(
      container,
      m.role === "user" ? "user" : "ai",
      m.parts?.[0]?.text || ""
    ));
  }
  container.scrollTop = container.scrollHeight;
}

function appendChatMessage(container, role, text) {
  const message = document.createElement("div");
  message.className = `chat-msg ${role}`;
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  message.append(paragraph);
  container.append(message);
}

async function handleSendChat(id, l){
  const input = document.querySelector("#chatInput");
  const text = input.value.trim();
  if(!text) return;
  if(!currentUser()) {
    toast("Entre com o Google para usar o tutor.");
    return;
  }
  input.value = "";

  if(!state.chatHistory[id]) state.chatHistory[id] = [];
  state.chatHistory[id].push({role: "user", parts: [{text}]});
  save();
  renderChat(id);

  const container = document.querySelector("#chatMessages");
  const typingId = "typing-" + Date.now();
  const typing = document.createElement("div");
  typing.className = "chat-msg ai";
  typing.id = typingId;
  const typingText = document.createElement("p");
  typingText.textContent = "Pensando...";
  typing.append(typingText);
  container.append(typing);
  container.scrollTop = container.scrollHeight;

  try {
    const historyWithoutCurrentMessage = state.chatHistory[id].slice(0, -1);
    const reply = await askTutor({
      lessonId: id,
      lesson: l,
      message: text,
      history: historyWithoutCurrentMessage,
    });

    document.getElementById(typingId).remove();
    state.chatHistory[id].push({role: "model", parts: [{text: reply}]});
    save();
    renderChat(id);
  } catch(e) {
    document.getElementById(typingId).remove();
    if (e.message === "AUTH_REQUIRED" || e.message === "AUTH_EXPIRED") {
      toast("Entre com o Google para usar o tutor.");
    } else {
      console.error(e);
      toast("O tutor não conseguiu responder agora. Tente novamente.");
    }
    state.chatHistory[id].pop(); // remove user message so they can try again
    save();
    renderChat(id);
  }
}

const signInButton = document.querySelector("#signInButton");
const signOutButton = document.querySelector("#signOutButton");
const authUser = document.querySelector("#authUser");

signInButton.onclick = async () => {
  if (!isGoogleConfigured()) {
    toast("O login Google ainda não foi configurado.");
    return;
  }
  try {
    await enterWithGoogle();
  } catch (error) {
    console.error(error);
    toast("Não foi possível entrar com o Google.");
  }
};

signOutButton.onclick = async () => {
  try {
    await leaveAccount();
  } catch (error) {
    console.error(error);
    toast("Não foi possível sair agora.");
  }
};

observeUser((user) => {
  authUser.hidden = !user;
  authUser.textContent = user ? user.displayName : "";
  signInButton.hidden = Boolean(user);
  signOutButton.hidden = !user;
  document.querySelectorAll("#chatInput, #sendChat").forEach((element) => {
    element.disabled = !user;
  });
  const chatInput = document.querySelector("#chatInput");
  if (chatInput) {
    chatInput.placeholder = user
      ? "Pergunte sobre a aula..."
      : "Conecte sua conta Google para usar o tutor";
  }
  if (document.querySelector("#assessmentCard")?.children.length) renderWeek();
});

function startSpeakingRecognition() {
  const Recognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
  if (!Recognition) {
    toast("O reconhecimento de voz não está disponível. Digite a transcrição do que você falou.");
    return;
  }
  const button = document.querySelector("#recordSpeaking");
  const transcript = document.querySelector("#speakingTranscript");
  const recognition = new Recognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.onstart = () => {
    button.disabled = true;
    button.textContent = "Ouvindo...";
  };
  recognition.onresult = (event) => {
    transcript.value = Array.from(event.results)
      .map((result) => result[0]?.transcript || "")
      .join(" ")
      .trim();
  };
  recognition.onerror = () => toast("Não foi possível reconhecer a fala. Tente novamente ou digite a transcrição.");
  recognition.onend = () => {
    button.disabled = false;
    button.textContent = "🎙️ Falar novamente";
  };
  recognition.start();
}

async function finishLesson(e,l,id){
  e.preventDefault();const data=new FormData(e.target),rawAnswers=l.qs.map((_,i)=>data.get(`q${i}`)),ans=rawAnswers.map(Number),confidence=Number(document.querySelector("#confidence").value);
  const writing = document.querySelector("#writingAnswer").value.trim();
  const speakingTranscript = document.querySelector("#speakingTranscript").value.trim();
  const extraPractice = Array.from(document.querySelectorAll("[id^='extraPractice']")).map((field) => ({
    skill: field.dataset.skill,
    prompt: l.practiceTasks[Number(field.id.replace("extraPractice", ""))]?.prompt || "",
    answer: field.value.trim(),
  }));
  if(rawAnswers.some((answer)=>answer===null)||ans.some(Number.isNaN)||!confidence){toast("Responda às questões e avalie a audição.");return}
  if (writing.length < 30 || speakingTranscript.length < 10) {
    toast("Complete o Writing e registre sua fala antes de concluir.");
    return;
  }
  if (extraPractice.some((task) => task.answer.length < 10)) {
    toast("Complete também os exercícios extras de reforço.");
    return;
  }
  if (!currentUser()) {
    toast("Conecte o Google para a IA avaliar Writing e Speaking.");
    return;
  }
  const submitButton = e.submitter || e.target.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Corrigindo aula...";
  let productive;
  try {
    productive = await evaluateProductiveSkills({ lesson: l, writing, speakingTranscript, extraPractice });
  } catch (error) {
    console.error(error);
    submitButton.disabled = false;
    submitButton.textContent = state.lessonReports[id]
      ? "Corrigir novamente e atualizar relatório"
      : "Corrigir aula e gerar relatório";
    toast(error.message === "RATE_LIMITED"
      ? "O limite temporário do Gemini foi atingido. Aguarde e tente novamente."
      : "A IA não conseguiu avaliar Writing e Speaking agora.");
    return;
  }
  const previousReport = state.lessonReports[id];
  if (previousReport) {
    Object.entries(previousReport.bySkill || {}).forEach(([skill, result]) => {
      state.skillStats[skill].correct -= result.correct;
      state.skillStats[skill].total -= result.total;
    });
  }
  const report = buildLessonReport(l, id, ans, confidence, productive);
  Object.entries(report.bySkill).forEach(([skill, result]) => {
    state.skillStats[skill] = state.skillStats[skill] || { correct: 0, total: 0 };
    state.skillStats[skill].correct += result.correct;
    state.skillStats[skill].total += result.total;
  });
  state.answers[id]=ans;state.scores[id]=report.correct;state.confidence[id]=confidence;state.lessonReports[id]=report;
  state.productiveAnswers[id]={writing,speakingTranscript,extraPractice,evaluation:productive};
  if(!state.completed.includes(id)){state.completed.push(id);state.minutes+=30}
  if(l.day<7) state.day=l.day+1;save();renderAll();toast("Aula corrigida e relatório gerado!");
}

function shareLesson(l){
  const msg=`Inglês — Semana ${state.week}, Dia ${l.day}\n${l.title}\nObjetivo: ${l.goal}\nDuração: 30 minutos.\nAbrir portal: ${location.href.split("#")[0]}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank","noopener");
}

function weekCompleted(w){return weekAt(w).lessons.every(l=>state.completed.includes(key(w,l.day)))}
function lessonReportsReady(w) {
  return weekAt(w).lessons.every((lessonItem) =>
    Boolean(state.lessonReports[key(w, lessonItem.day)]));
}
function renderWeek(){
  const w=currentWeek();document.querySelector("#weekTitle").textContent=w.assessmentMode?`Avaliação geral ${nextLevel[state.currentLevel] || ""}`:`Semana ${state.week}`;document.querySelector("#weekGrid").innerHTML=w.lessons.map(l=>{const done=state.completed.includes(key(state.week,l.day));return `<article class="day-card ${done?"done":""}" data-day="${l.day}"><strong>${done?"✓ ":""}Dia ${l.day}</strong><span>${l.title}</span></article>`}).join("");
  document.querySelector("#semana .subtitle").textContent = `${w.title} · ${w.level || state.currentLevel}`;
  document.querySelectorAll(".day-card").forEach(c=>c.onclick=()=>{state.day=Number(c.dataset.day);save();switchView("hoje")});
  const unlocked=lessonReportsReady(state.week), evaluated=Boolean(state.evaluations[state.week]);
  const readyReports = w.lessons.filter((lessonItem) =>
    state.lessonReports[key(state.week, lessonItem.day)]).length;
  document.querySelector("#assessmentCard").className=`assessment-card ${unlocked?"":"locked"}`;
  const report = state.weeklyReports[state.week];
  const authMessage = currentUser()
    ? "A IA usará os sete relatórios das aulas para criar a próxima semana."
    : "Conecte sua conta Google para a IA criar a próxima semana.";
  document.querySelector("#assessmentCard").innerHTML=`<p class="eyebrow">${w.assessmentMode?"CERTIFICAÇÃO DE NÍVEL":"RELATÓRIOS DA SEMANA"}</p><h2>${evaluated?"Nova semana gerada":unlocked?"Sete relatórios prontos":"Corrija as sete aulas"}</h2><p>${report?`${report.accuracy}% de desempenho geral · ${report.summary}`:unlocked?authMessage:`${readyReports} de 7 relatórios gerados.`}</p>${unlocked&&!evaluated?`<div class="actions"><button class="primary" id="evaluate">${currentUser()?w.assessmentMode?"Gerar próxima semana após certificação":"Gerar próxima semana com os relatórios":"Conectar Google para continuar"}</button></div>`:""}`;
  if(unlocked&&!evaluated) document.querySelector("#evaluate").onclick=evaluateWeek;
}

function buildWeeklyReport(weekNumber) {
  const weekLessons = weekAt(weekNumber).lessons;
  const reports = weekLessons
    .map((item) => state.lessonReports[key(weekNumber, item.day)]);
  if (reports.length !== 7 || reports.some((report) => !report)) {
    throw new Error("LESSON_REPORTS_INCOMPLETE");
  }
  const bySkill = {};
  reports.forEach((report) => {
    Object.entries(report.bySkill || {}).forEach(([skill, result]) => {
      bySkill[skill] = bySkill[skill] || { correct: 0, total: 0 };
      bySkill[skill].correct += result.correct;
      bySkill[skill].total += result.total;
    });
  });
  const weakestSkill = Object.entries(bySkill)
    .sort(([, a], [, b]) => percent(a.correct, a.total) - percent(b.correct, b.total))[0]?.[0] || "listening";
  const strongestSkill = Object.entries(bySkill)
    .sort(([, a], [, b]) => percent(b.correct, b.total) - percent(a.correct, a.total))[0]?.[0] || "grammar";
  const accuracy = Math.round(
    reports.reduce((sum, report) => sum + report.accuracy, 0) / Math.max(reports.length, 1),
  );
  const averageConfidence = reports.reduce((sum, report) => sum + report.confidence, 0) / Math.max(reports.length, 1);
  const summary = accuracy >= 85 && averageConfidence >= 2
    ? `Bom domínio. A próxima semana avançará gradualmente, preservando revisão de ${skillLabels[weakestSkill].toLowerCase()}.`
    : `A próxima semana reforçará ${skillLabels[weakestSkill].toLowerCase()} antes de aumentar a dificuldade.`;
  return {
    week: weekNumber,
    accuracy,
    averageConfidence: Number(averageConfidence.toFixed(1)),
    bySkill,
    weakestSkill,
    strongestSkill,
    summary,
    lessonReports: reports,
    completedAt: new Date().toISOString(),
  };
}

const nextLevel = { A1: "A2", A2: "B1", B1: "B2", B2: "C1" };
const minimumWeeksAtLevel = { A1: 4, A2: 16, B1: 32, B2: 48 };

function skillPercentages(report) {
  return Object.fromEntries(Object.entries(skillLabels).map(([skill]) => {
    const result = report.bySkill?.[skill] || { correct: 0, total: 0 };
    return [skill, percent(result.correct, result.total)];
  }));
}

function assessmentPassed(report) {
  const values = skillPercentages(report);
  return Object.values(values).every((value) => value >= 70);
}

function shouldScheduleLevelAssessment(weekNumber) {
  const weeksAtLevel = weekNumber - (state.levelStartedWeek || 1) + 1;
  const supportedTarget = ["A2", "B1"].includes(nextLevel[state.currentLevel]);
  return supportedTarget &&
    weeksAtLevel >= (minimumWeeksAtLevel[state.currentLevel] || 999) &&
    !currentWeek().assessmentMode;
}

function adaptiveSummary(report) {
  const skills = skillPercentages(report);
  const recentVideoIds = state.completed.map((lessonId) => {
    const [weekNumber, dayNumber] = lessonId.split("-").map(Number);
    return weekAt(weekNumber)?.lessons?.find((item) => item.day === dayNumber)?.videoId;
  }).filter(Boolean).slice(-14);
  return {
    previousWeek: report.week,
    accuracy: report.accuracy,
    averageConfidence: report.averageConfidence,
    skills,
    weakSkills: Object.entries(skills)
      .filter(([, value]) => value < 70)
      .map(([skill, value]) => ({ skill, value })),
    recentVideoIds,
    weakestSkill: report.weakestSkill,
    strongestSkill: report.strongestSkill,
    recentLessonReports: weekAt(report.week).lessons.map((lessonItem) => {
      const item = state.lessonReports[key(report.week, lessonItem.day)];
      return {
        day: lessonItem.day,
        title: lessonItem.title,
        accuracy: item.accuracy,
        confidence: item.confidence,
        skills: Object.fromEntries(Object.entries(item.bySkill || {}).map(
          ([skill, result]) => [skill, percent(result.correct, result.total)])),
        recommendation: item.recommendation,
        writingFeedback: item.productive?.writing?.feedback || "",
        speakingFeedback: item.productive?.speaking?.feedback || "",
      };
    }),
    weeksCompleted: Object.keys(state.weeklyReports).length + 1,
    target: "C1 em 156 semanas (3 anos)",
  };
}

function sanitizeGeneratedWeek(raw, weekNumber, level, assessmentMode = false) {
  if (!raw || !Array.isArray(raw.lessons) || raw.lessons.length !== 7) {
    throw new Error("INVALID_WEEK_RESPONSE");
  }
  const allowedSkills = ["listening", "vocabulary", "grammar", "reading"];
  const allowedVideoIds = new Set(curatedVideos);
  const usedVideoIds = new Set();
  const seenQuestions = new Set();
  const lessons = raw.lessons.map((item, lessonIndex) => {
    if (!allowedVideoIds.has(item.videoId) || usedVideoIds.has(item.videoId)) {
      throw new Error("INVALID_VIDEO_SELECTION");
    }
    usedVideoIds.add(item.videoId);
    if (!Array.isArray(item.questions) || item.questions.length < 4 || item.questions.length > 8) {
      throw new Error("INVALID_WEEK_RESPONSE");
    }
    const questions = item.questions.map((question, questionIndex) => {
      const options = Array.isArray(question.options)
        ? question.options.map((option) => String(option).slice(0, 180)).slice(0, 3)
        : [];
      const answer = Number(question.answer);
      if (options.length !== 3 || !Number.isInteger(answer) || answer < 0 || answer > 2) {
        throw new Error("INVALID_WEEK_RESPONSE");
      }
      const questionText = String(question.text || "Escolha a melhor resposta.").slice(0, 300);
      const fingerprint = questionText.trim().toLocaleLowerCase("pt-BR");
      if (seenQuestions.has(fingerprint)) throw new Error("DUPLICATE_WEEK_QUESTIONS");
      const evidence = String(question.evidence || "").trim().slice(0, 300);
      if (!evidence) throw new Error("UNGROUNDED_WEEK_QUESTION");
      seenQuestions.add(fingerprint);
      return {
        ...q(
        questionText,
        options,
        answer,
        allowedSkills.includes(question.skill) ? question.skill : allowedSkills[questionIndex % allowedSkills.length],
        ),
        evidence,
      };
    });
    if (!allowedSkills.every((skill) =>
      questions.some((question, index) => questionSkill(question, index) === skill))) {
      throw new Error("INVALID_WEEK_RESPONSE");
    }
    const lessonItem = lesson(
      lessonIndex + 1,
      String(item.title || `Prática ${lessonIndex + 1}`).slice(0, 90),
      String(item.goal || "Praticar inglês em contexto.").slice(0, 220),
      item.videoId,
      String(item.structure || "Revise a estrutura em contexto.").slice(0, 350),
      ...questions,
    );
    lessonItem.writingPrompt = String(item.writingPrompt || "").slice(0, 500);
    lessonItem.speakingPrompt = String(item.speakingPrompt || "").slice(0, 500);
    lessonItem.practiceTasks = Array.isArray(item.practiceTasks)
      ? item.practiceTasks.map((task) => ({
        skill: ["writing", "speaking"].includes(task?.skill) ? task.skill : "writing",
        prompt: String(task?.prompt || task || "").slice(0, 350),
      })).filter((task) => task.prompt).slice(0, 8)
      : [];
    return lessonItem;
  });
  return {
    title: String(raw.title || `Semana adaptativa ${weekNumber}`).slice(0, 100),
    level,
    rationale: String(raw.rationale || "Semana adaptada ao desempenho recente.").slice(0, 400),
    generatedByAI: true,
    generatedAt: new Date().toISOString(),
    assessmentMode,
    lessons,
  };
}

async function regenerateCurrentWeek() {
  const currentNumber = state.week;
  const startedIds = currentWeek().lessons
    .map((item) => key(currentNumber, item.day))
    .filter((id) => state.completed.includes(id));
  if (startedIds.length && !confirm("Você já concluiu aula(s) desta semana. Substituí-las apagará apenas o progresso desta semana. Continuar?")) {
    return;
  }
  if (!currentUser()) {
    try {
      await enterWithGoogle();
    } catch (error) {
      console.error(error);
      toast("Conecte sua conta Google para adaptar esta semana.");
      return;
    }
  }
  const button = document.querySelector("#adaptCurrentWeek");
  if (button) {
    button.disabled = true;
    button.textContent = "Criando semana...";
  }
  const previousNumber = currentNumber - 1;
  const report = state.weeklyReports[previousNumber] || buildWeeklyReport(previousNumber);
  const targetLevel = state.currentLevel;
  const assessmentMode = Boolean(currentWeek().assessmentMode);
  try {
    const generated = await generateAdaptiveWeek({
      weekNumber: currentNumber,
      level: targetLevel,
      summary: adaptiveSummary(report),
      videoCatalog: videoCatalogForLevel(targetLevel),
      assessmentMode,
      onProgress: (completed, total) => {
        if (button) button.textContent = completed === total
          ? "Validando semana..."
          : `Analisando vídeo ${completed + 1} de ${total}...`;
      },
    });
    const plan = sanitizeGeneratedWeek(generated, currentNumber, targetLevel, assessmentMode);
    startedIds.forEach((id) => {
      state.completed = state.completed.filter((completedId) => completedId !== id);
      delete state.answers[id];
      delete state.scores[id];
      delete state.confidence[id];
      delete state.lessonReports[id];
      delete state.chatHistory[id];
      delete state.productiveAnswers[id];
    });
    state.minutes = Math.max(0, state.minutes - startedIds.length * 30);
    state.weeklyReports[previousNumber] = report;
    state.evaluations[previousNumber] = {
      pct: report.accuracy,
      avg: report.averageConfidence,
      support: report.accuracy < 80 || report.averageConfidence < 2,
      message: report.summary,
    };
    state.generatedWeeks[currentNumber] = plan;
    state.day = 1;
    rebuildDerivedReports();
    save();
    renderAll();
    toast(`Semana ${currentNumber} adaptada ao seu desempenho!`);
  } catch (error) {
    console.error(error);
    const validationErrors = [
      "DUPLICATE_WEEK_QUESTIONS",
      "INVALID_VIDEO_SELECTION",
      "UNGROUNDED_WEEK_QUESTION",
      "VIDEO_CONTENT_MISMATCH",
    ];
    toast(validationErrors.includes(error.message)
      ? "A relação entre vídeo, conteúdo e questões não passou na validação. Tente gerar novamente."
      : error.message === "RATE_LIMITED"
        ? "O limite temporário do Gemini foi atingido. Aguarde alguns minutos e tente novamente."
        : error.message === "GEMINI_TEMPORARILY_UNAVAILABLE"
          ? "O Gemini está temporariamente indisponível. Tente novamente em alguns minutos."
          : "Não foi possível adaptar a semana agora. Seu progresso foi preservado.");
    renderAll();
  }
}

async function evaluateWeek() {
  if (!lessonReportsReady(state.week)) {
    toast("Corrija as sete aulas e gere todos os relatórios primeiro.");
    renderWeek();
    return;
  }
  if (!currentUser()) {
    try {
      await enterWithGoogle();
    } catch (error) {
      console.error(error);
      toast("Conecte sua conta Google para gerar a próxima semana.");
      return;
    }
  }
  const button = document.querySelector("#evaluate");
  if (button) {
    button.disabled = true;
    button.textContent = "Lendo os sete relatórios...";
  }
  const weekNumber = state.week;
  const report = buildWeeklyReport(weekNumber);
  const nextWeek = weekNumber + 1;
  const completedAssessment = Boolean(currentWeek().assessmentMode);
  const passed = completedAssessment && assessmentPassed(report);
  const assessmentMode = !completedAssessment && shouldScheduleLevelAssessment(weekNumber);
  const previousLevel = state.currentLevel;
  const targetLevel = passed && nextLevel[previousLevel] ? nextLevel[previousLevel] : previousLevel;
  try {
    const generated = await generateAdaptiveWeek({
      weekNumber: nextWeek,
      level: targetLevel,
      summary: adaptiveSummary(report),
      videoCatalog: videoCatalogForLevel(targetLevel),
      assessmentMode,
      onProgress: (completed, total) => {
        if (button) button.textContent = completed === total
          ? "Validando semana..."
          : `Analisando vídeo ${completed + 1} de ${total}...`;
      },
    });
    const nextPlan = sanitizeGeneratedWeek(generated, nextWeek, targetLevel, assessmentMode);
    state.weeklyReports[weekNumber] = report;
    if (completedAssessment) {
      state.levelAssessments[weekNumber] = {
        targetLevel: nextLevel[previousLevel],
        passed,
        skills: skillPercentages(report),
        completedAt: new Date().toISOString(),
      };
      if (passed) {
        state.currentLevel = targetLevel;
        state.levelStartedWeek = nextWeek;
      }
    }
    state.evaluations[weekNumber] = {
      pct: report.accuracy,
      avg: report.averageConfidence,
      support: report.accuracy < 80 || report.averageConfidence < 2,
      message: report.summary,
    };
    state.generatedWeeks[nextWeek] = nextPlan;
    state.week = nextWeek;
    state.day = 1;
    save();
    renderAll();
    switchView("progresso");
    toast(assessmentMode
      ? `Avaliação geral para certificação ${nextLevel[targetLevel]} criada!`
      : completedAssessment && !passed
        ? "O nível ainda não foi certificado. A próxima semana reforçará os pontos abaixo de 70%."
        : completedAssessment && passed
          ? `Nível ${targetLevel} certificado!`
          : `Semana ${nextWeek} criada pela IA!`);
  } catch (error) {
    console.error(error);
    if (error.message === "AUTH_REQUIRED" || error.message === "AUTH_EXPIRED") {
      toast("Sua sessão expirou. Conecte o Google e tente novamente.");
    } else if ([
      "DUPLICATE_WEEK_QUESTIONS",
      "INVALID_VIDEO_SELECTION",
      "UNGROUNDED_WEEK_QUESTION",
      "VIDEO_CONTENT_MISMATCH",
    ].includes(error.message)) {
      toast("A semana foi rejeitada porque vídeo, conteúdo e questões não ficaram coerentes. Gere novamente.");
    } else if (error.message === "RATE_LIMITED") {
      toast("O limite temporário do Gemini foi atingido. Aguarde alguns minutos e tente novamente.");
    } else if (error.message === "GEMINI_TEMPORARILY_UNAVAILABLE") {
      toast("O Gemini está temporariamente indisponível. Tente novamente em alguns minutos.");
    } else {
      toast("A IA não conseguiu criar a semana. Seu progresso foi preservado.");
    }
    renderWeek();
  }
}

function renderStats(){
  const reports=Object.values(state.lessonReports);
  const overallAccuracy=reports.length?Math.round(reports.reduce((sum,report)=>sum+report.accuracy,0)/reports.length):null;
  document.querySelector("#completedStat").textContent=state.completed.length;document.querySelector("#minutesStat").textContent=`${state.minutes} min`;document.querySelector("#accuracyStat").textContent=overallAccuracy!==null?`${overallAccuracy}%`:"—";
  const last=state.weeklyReports[Math.max(1,state.week-1)];
  document.querySelector("#adaptiveMessage").textContent=last
    ? `${last.summary} Trajetória: semana ${state.week} de 156.`
    : "Conclua a primeira semana para receber uma recomendação adaptativa.";
  document.querySelector("#currentLevel").textContent=`${state.currentLevel} em desenvolvimento`;
  document.querySelectorAll(".levels .level").forEach((element) => {
    element.classList.toggle("current", element.textContent === state.currentLevel);
  });
  document.querySelector("#skillGrid").innerHTML = Object.entries(skillLabels).map(([skill, label]) => {
    const result = state.skillStats[skill] || { correct: 0, total: 0 };
    const value = percent(result.correct, result.total);
    return `<article><span>${label}</span><strong>${result.total ? `${value}%` : "—"}</strong><small>${result.total ? performanceBand(value) : "Ainda sem dados"}</small></article>`;
  }).join("");
  const weekly = Object.values(state.weeklyReports).sort((a,b)=>b.week-a.week).slice(0,3);
  const lessons = Object.values(state.lessonReports).sort((a,b)=>new Date(b.completedAt)-new Date(a.completedAt)).slice(0,4);
  document.querySelector("#reportsList").innerHTML = [
    ...Object.entries(state.levelAssessments).sort(([a],[b])=>Number(b)-Number(a)).slice(0,2).map(([week,assessment]) => `<article class="report-item weekly"><strong>Avaliação geral · semana ${week}</strong><span>${assessment.passed?`✓ ${assessment.targetLevel} certificado`:`Ainda não aprovado para ${assessment.targetLevel}`} · corte de 70% por competência</span></article>`),
    ...weekly.map((report) => `<article class="report-item weekly"><strong>Semana ${report.week}</strong><span>${report.accuracy}% · ${report.summary}</span></article>`),
    ...lessons.map((report) => `<article class="report-item"><strong>${report.title}</strong><span>${report.accuracy}% · ${report.recommendation}</span></article>`),
  ].join("") || `<p class="empty-state">Os relatórios aparecerão após a primeira aula concluída.</p>`;
}
function renderAll(){const done=currentWeek().lessons.filter(l=>state.completed.includes(key(state.week,l.day))).length;document.querySelector("#streakValue").textContent=state.completed.length;document.querySelector("#progressFill").style.width=`${done/7*100}%`;document.querySelector("#progressText").textContent=`${done} de 7 aulas concluídas`;document.querySelector("#hoje .eyebrow").textContent=`SEMANA ${state.week} · ${state.currentLevel} · META C1`;renderLesson();renderWeek();renderStats()}
function switchView(id){document.querySelectorAll(".view,.nav-link").forEach(x=>x.classList.remove("active"));document.querySelector(`#${id}`).classList.add("active");document.querySelector(`[data-view="${id}"]`).classList.add("active");scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll(".nav-link").forEach(b=>b.onclick=()=>switchView(b.dataset.view));
function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="progresso-ingles-marcelo.json";a.click();URL.revokeObjectURL(a.href);toast("Backup exportado.")}
document.querySelector("#exportButton").onclick=exportData;document.querySelector("#backupButton").onclick=exportData;
document.querySelector("#importInput").onchange=async e=>{try{const imported=JSON.parse(await e.target.files[0].text());state={...blank,...imported,generatedWeeks:imported.generatedWeeks||{},lessonReports:imported.lessonReports||{},weeklyReports:imported.weeklyReports||{},levelAssessments:imported.levelAssessments||{},productiveAnswers:imported.productiveAnswers||{},skillStats:{...blank.skillStats,...(imported.skillStats||{})}};rebuildDerivedReports();save();renderAll();toast("Progresso restaurado.")}catch{toast("Não foi possível ler esse backup.")}};
document.querySelector("#resetButton").onclick=()=>{if(confirm("Apagar todo o progresso salvo neste navegador?")){state={...blank,completed:[],answers:{},scores:{},evaluations:{},confidence:{},chatHistory:{},generatedWeeks:{},lessonReports:{},weeklyReports:{},levelAssessments:{},productiveAnswers:{},skillStats:JSON.parse(JSON.stringify(blank.skillStats)),startedAt:new Date().toISOString()};save();renderAll();toast("Progresso reiniciado.")}};

window.addEventListener("online",()=>{document.body.classList.remove("offline");toast("Conexão restabelecida.")});
window.addEventListener("offline",()=>{document.body.classList.add("offline");toast("Modo offline: exercícios continuam disponíveis.")});
if(!navigator.onLine) document.body.classList.add("offline");
if("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js?v=11", { updateViaCache: "none" })
    .then((registration) => registration.update())
    .catch((error) => console.error("Falha ao atualizar o portal.", error));
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (sessionStorage.getItem("portalReloadedForUpdate")) return;
    sessionStorage.setItem("portalReloadedForUpdate", "1");
    location.reload();
  });
}
let installPrompt;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;document.querySelector("#installButton").hidden=false});
document.querySelector("#installButton").onclick=async()=>{if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;document.querySelector("#installButton").hidden=true}else toast("Use o menu do navegador e escolha ‘Adicionar à tela inicial’. ")};

rebuildDerivedReports();
renderAll();
