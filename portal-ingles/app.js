import {
  askTutor,
  currentUser,
  enterWithGoogle,
  generateAdaptiveWeek,
  isGoogleConfigured,
  leaveAccount,
  observeUser,
} from "./google-gemini-client.js";

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
  return lesson(day,title,`Compreender ${title.toLowerCase()} em uma conversa curta.`,videoId,structure,
    q("Qual é a melhor estratégia na primeira escuta?",["Traduzir cada palavra","Entender a situação geral","Ativar legenda em português"],1),
    q("Na segunda escuta, qual apoio usar?",["Legenda em inglês","Tradução automática","Nenhum áudio"],0),
    q("O que deve ser repetido em voz alta?",["Uma frase útil","Todo o vídeo de memória","Somente palavras em português"],0));
}

const curatedVideos = initialWeeks.flatMap((week) =>
  week.lessons.map((item) => item.videoId)
);
const skillLabels = {
  listening: "Compreensão",
  vocabulary: "Vocabulário",
  grammar: "Gramática",
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
  },
  currentLevel: "A1",
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
};
if(!state.week) state.week=1;
const key=(w,d)=>`${w}-${d}`;
const save=()=>localStorage.setItem("inglesNoRitmo",JSON.stringify(state));
const weekAt=(number)=>state.generatedWeeks[number]||initialWeeks[number-1];
const currentWeek=()=>weekAt(state.week);
const currentLesson=()=>currentWeek().lessons[state.day-1];
function toast(text){const el=document.querySelector("#toast");el.textContent=text;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2400)}

function questionSkill(question, index) {
  return question.skill || ["listening", "vocabulary", "grammar"][index] || "grammar";
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

function buildLessonReport(lesson, id, answers, confidence) {
  const bySkill = {};
  lesson.qs.forEach((question, index) => {
    const skill = questionSkill(question, index);
    bySkill[skill] = bySkill[skill] || { correct: 0, total: 0 };
    bySkill[skill].total += 1;
    if (answers[index] === question.answer) bySkill[skill].correct += 1;
  });
  const correct = lesson.qs.filter((question, index) => answers[index] === question.answer).length;
  const accuracy = percent(correct, lesson.qs.length);
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
    recommendation,
    completedAt: new Date().toISOString(),
  };
}

function lessonReportMarkup(report) {
  if (!report) return "";
  return `<div class="lesson-report">
    <strong>Relatório da aula</strong>
    <p>${report.accuracy}% de acerto · ${performanceBand(report.accuracy)} · confiança ${report.confidence}/3.</p>
    <p>${report.recommendation}</p>
  </div>`;
}

function rebuildDerivedReports() {
  let changed = false;
  state.completed.forEach((lessonId) => {
    if (state.lessonReports[lessonId] || !state.answers[lessonId]) return;
    const [weekNumber, dayNumber] = lessonId.split("-").map(Number);
    const plan = weekAt(weekNumber);
    const lessonItem = plan?.lessons?.find((item) => item.day === dayNumber);
    if (!lessonItem) return;
    state.lessonReports[lessonId] = buildLessonReport(
      lessonItem,
      lessonId,
      state.answers[lessonId],
      state.confidence[lessonId] || 2,
    );
    changed = true;
  });
  state.skillStats = {
    listening: { correct: 0, total: 0 },
    vocabulary: { correct: 0, total: 0 },
    grammar: { correct: 0, total: 0 },
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
  document.querySelector("#todayTitle").textContent=`Olá, Marcelo. Vamos ouvir?`;
  document.querySelector("#lessonCard").innerHTML=`
    <div class="lesson-head"><div><span class="lesson-number">SEMANA ${state.week} · DIA ${l.day} DE 7</span><h2>${l.title}</h2><p>${l.goal}</p></div><span class="time-badge">◷ 30 minutos</span></div>
    <div class="lesson-body"><div class="media-panel">
      <div class="video-frame online-only"><iframe src="https://www.youtube-nocookie.com/embed/${l.videoId}?rel=0" title="Vídeo: ${l.title}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>
      <div class="offline-note">Sem conexão: revise a estrutura e faça os exercícios. O vídeo ficará disponível quando a internet voltar.</div>
      <p class="listen-tip"><strong>1ª vez:</strong> sem legenda · <strong>2ª vez:</strong> legenda em inglês</p>
      <div class="structure"><strong>Estrutura do dia</strong><br>${l.structure}</div>
    </div><form class="exercise-panel" id="quizForm"><h3>Verifique sua compreensão</h3>
      ${l.qs.map((question,i)=>`<div class="question"><p>${i+1}. ${question.text}</p>${question.options.map((o,j)=>`<label class="option"><input type="radio" name="q${i}" value="${j}" ${state.answers[id]?.[i]==j?"checked":""}> ${o}</label>`).join("")}</div>`).join("")}
      <div class="confidence"><label>Como foi a audição hoje? <select id="confidence"><option value="">Escolha</option><option value="1">Difícil</option><option value="2">Razoável</option><option value="3">Boa</option></select></label></div>
      <div class="feedback ${done?"show":""}">${done?lessonReportMarkup(state.lessonReports[id]):""}</div>
      <div class="actions"><button type="submit" class="primary">${done?"Atualizar respostas":"Concluir aula"}</button><button type="button" class="primary whatsapp" id="whatsapp">Enviar pelo WhatsApp</button></div>

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

function finishLesson(e,l,id){
  e.preventDefault();const data=new FormData(e.target),ans=l.qs.map((_,i)=>Number(data.get(`q${i}`))),confidence=Number(document.querySelector("#confidence").value);
  if(ans.some(Number.isNaN)||!confidence){toast("Responda às questões e avalie a audição.");return}
  const previousReport = state.lessonReports[id];
  if (previousReport) {
    Object.entries(previousReport.bySkill || {}).forEach(([skill, result]) => {
      state.skillStats[skill].correct -= result.correct;
      state.skillStats[skill].total -= result.total;
    });
  }
  const report = buildLessonReport(l, id, ans, confidence);
  Object.entries(report.bySkill).forEach(([skill, result]) => {
    state.skillStats[skill] = state.skillStats[skill] || { correct: 0, total: 0 };
    state.skillStats[skill].correct += result.correct;
    state.skillStats[skill].total += result.total;
  });
  state.answers[id]=ans;state.scores[id]=report.correct;state.confidence[id]=confidence;state.lessonReports[id]=report;
  if(!state.completed.includes(id)){state.completed.push(id);state.minutes+=30}
  if(l.day<7) state.day=l.day+1;save();renderAll();toast("Aula concluída. Progresso salvo!");
}

function shareLesson(l){
  const msg=`Inglês — Semana ${state.week}, Dia ${l.day}\n${l.title}\nObjetivo: ${l.goal}\nDuração: 30 minutos.\nAbrir portal: ${location.href.split("#")[0]}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank","noopener");
}

function weekCompleted(w){return weekAt(w).lessons.every(l=>state.completed.includes(key(w,l.day)))}
function renderWeek(){
  const w=currentWeek();document.querySelector("#weekTitle").textContent=`Semana ${state.week}`;document.querySelector("#weekGrid").innerHTML=w.lessons.map(l=>{const done=state.completed.includes(key(state.week,l.day));return `<article class="day-card ${done?"done":""}" data-day="${l.day}"><strong>${done?"✓ ":""}Dia ${l.day}</strong><span>${l.title}</span></article>`}).join("");
  document.querySelector("#semana .subtitle").textContent = `${w.title} · ${w.level || state.currentLevel}`;
  document.querySelectorAll(".day-card").forEach(c=>c.onclick=()=>{state.day=Number(c.dataset.day);save();switchView("hoje")});
  const unlocked=weekCompleted(state.week), evaluated=Boolean(state.evaluations[state.week]);
  document.querySelector("#assessmentCard").className=`assessment-card ${unlocked?"":"locked"}`;
  const report = state.weeklyReports[state.week];
  const authMessage = currentUser()
    ? "A IA analisará seus acertos, confiança e competências para criar a próxima semana."
    : "Conecte sua conta Google para a IA criar a próxima semana.";
  document.querySelector("#assessmentCard").innerHTML=`<p class="eyebrow">AVALIAÇÃO SEMANAL</p><h2>${evaluated?"Semana avaliada":unlocked?"Pronto para adaptar":"Conclua as sete aulas"}</h2><p>${report?`${report.accuracy}% de acerto · ${report.summary}`:unlocked?authMessage:`${7-w.lessons.filter(l=>state.completed.includes(key(state.week,l.day))).length} aula(s) restante(s).`}</p>${unlocked&&!evaluated?`<div class="actions"><button class="primary" id="evaluate">${currentUser()?"Analisar e gerar próxima semana":"Conectar Google para continuar"}</button></div>`:""}`;
  if(unlocked&&!evaluated) document.querySelector("#evaluate").onclick=evaluateWeek;
}

function buildWeeklyReport(weekNumber) {
  const reports = weekAt(weekNumber).lessons
    .map((item) => state.lessonReports[key(weekNumber, item.day)])
    .filter(Boolean);
  const correct = reports.reduce((sum, report) => sum + report.correct, 0);
  const total = reports.reduce((sum, report) => sum + report.total, 0);
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
  const accuracy = percent(correct, total);
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
    completedAt: new Date().toISOString(),
  };
}

function levelForJourney(nextWeek, accuracy) {
  const gates = [
    { week: 120, level: "C1" },
    { week: 72, level: "B2" },
    { week: 36, level: "B1" },
    { week: 12, level: "A2" },
  ];
  const planned = gates.find((gate) => nextWeek >= gate.week)?.level || "A1";
  if (accuracy < 65) return state.currentLevel;
  return planned;
}

function adaptiveSummary(report) {
  return {
    previousWeek: report.week,
    accuracy: report.accuracy,
    averageConfidence: report.averageConfidence,
    skills: Object.fromEntries(
      Object.entries(report.bySkill).map(([skill, result]) => [
        skill,
        percent(result.correct, result.total),
      ])
    ),
    weakestSkill: report.weakestSkill,
    strongestSkill: report.strongestSkill,
    recentLessonReports: weekAt(report.week).lessons.map((lessonItem) => {
      const item = state.lessonReports[key(report.week, lessonItem.day)];
      return {
        title: lessonItem.title,
        accuracy: item?.accuracy || 0,
        confidence: item?.confidence || 0,
        recommendation: item?.recommendation || "",
      };
    }),
    weeksCompleted: Object.keys(state.weeklyReports).length + 1,
    target: "C1 em 156 semanas (3 anos)",
  };
}

function sanitizeGeneratedWeek(raw, weekNumber, level) {
  if (!raw || !Array.isArray(raw.lessons) || raw.lessons.length !== 7) {
    throw new Error("INVALID_WEEK_RESPONSE");
  }
  const allowedSkills = ["listening", "vocabulary", "grammar"];
  const lessons = raw.lessons.map((item, lessonIndex) => {
    if (!Array.isArray(item.questions) || item.questions.length !== 3) {
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
      return q(
        String(question.text || "Escolha a melhor resposta.").slice(0, 300),
        options,
        answer,
        allowedSkills.includes(question.skill) ? question.skill : allowedSkills[questionIndex],
      );
    });
    return lesson(
      lessonIndex + 1,
      String(item.title || `Prática ${lessonIndex + 1}`).slice(0, 90),
      String(item.goal || "Praticar inglês em contexto.").slice(0, 220),
      curatedVideos[((weekNumber - 1) * 7 + lessonIndex) % curatedVideos.length],
      String(item.structure || "Revise a estrutura em contexto.").slice(0, 350),
      ...questions,
    );
  });
  return {
    title: String(raw.title || `Semana adaptativa ${weekNumber}`).slice(0, 100),
    level,
    rationale: String(raw.rationale || "Semana adaptada ao desempenho recente.").slice(0, 400),
    generatedByAI: true,
    generatedAt: new Date().toISOString(),
    lessons,
  };
}

async function evaluateWeek() {
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
    button.textContent = "Analisando evolução...";
  }
  const weekNumber = state.week;
  const report = buildWeeklyReport(weekNumber);
  const nextWeek = weekNumber + 1;
  const nextLevel = levelForJourney(nextWeek, report.accuracy);
  try {
    const generated = await generateAdaptiveWeek({
      weekNumber: nextWeek,
      level: nextLevel,
      summary: adaptiveSummary(report),
    });
    const nextPlan = sanitizeGeneratedWeek(generated, nextWeek, nextLevel);
    state.weeklyReports[weekNumber] = report;
    state.evaluations[weekNumber] = {
      pct: report.accuracy,
      avg: report.averageConfidence,
      support: report.accuracy < 80 || report.averageConfidence < 2,
      message: report.summary,
    };
    state.generatedWeeks[nextWeek] = nextPlan;
    state.currentLevel = nextLevel;
    state.week = nextWeek;
    state.day = 1;
    save();
    renderAll();
    switchView("progresso");
    toast(`Semana ${nextWeek} criada pela IA!`);
  } catch (error) {
    console.error(error);
    if (error.message === "AUTH_REQUIRED" || error.message === "AUTH_EXPIRED") {
      toast("Sua sessão expirou. Conecte o Google e tente novamente.");
    } else {
      toast("A IA não conseguiu criar a semana. Seu progresso foi preservado.");
    }
    renderWeek();
  }
}

function renderStats(){
  const answered=Object.values(state.answers).reduce((n,a)=>n+a.length,0),correct=Object.values(state.scores).reduce((a,b)=>a+b,0);
  document.querySelector("#completedStat").textContent=state.completed.length;document.querySelector("#minutesStat").textContent=`${state.minutes} min`;document.querySelector("#accuracyStat").textContent=answered?`${Math.round(correct/answered*100)}%`:"—";
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
    ...weekly.map((report) => `<article class="report-item weekly"><strong>Semana ${report.week}</strong><span>${report.accuracy}% · ${report.summary}</span></article>`),
    ...lessons.map((report) => `<article class="report-item"><strong>${report.title}</strong><span>${report.accuracy}% · ${report.recommendation}</span></article>`),
  ].join("") || `<p class="empty-state">Os relatórios aparecerão após a primeira aula concluída.</p>`;
}
function renderAll(){const done=currentWeek().lessons.filter(l=>state.completed.includes(key(state.week,l.day))).length;document.querySelector("#streakValue").textContent=state.completed.length;document.querySelector("#progressFill").style.width=`${done/7*100}%`;document.querySelector("#progressText").textContent=`${done} de 7 aulas concluídas`;document.querySelector("#hoje .eyebrow").textContent=`SEMANA ${state.week} · ${state.currentLevel} · META C1`;renderLesson();renderWeek();renderStats()}
function switchView(id){document.querySelectorAll(".view,.nav-link").forEach(x=>x.classList.remove("active"));document.querySelector(`#${id}`).classList.add("active");document.querySelector(`[data-view="${id}"]`).classList.add("active");scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll(".nav-link").forEach(b=>b.onclick=()=>switchView(b.dataset.view));
function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="progresso-ingles-marcelo.json";a.click();URL.revokeObjectURL(a.href);toast("Backup exportado.")}
document.querySelector("#exportButton").onclick=exportData;document.querySelector("#backupButton").onclick=exportData;
document.querySelector("#importInput").onchange=async e=>{try{state={...blank,...JSON.parse(await e.target.files[0].text())};save();renderAll();toast("Progresso restaurado.")}catch{toast("Não foi possível ler esse backup.")}};
document.querySelector("#resetButton").onclick=()=>{if(confirm("Apagar todo o progresso salvo neste navegador?")){state={...blank,completed:[],answers:{},scores:{},evaluations:{},confidence:{},chatHistory:{},generatedWeeks:{},lessonReports:{},weeklyReports:{},skillStats:{listening:{correct:0,total:0},vocabulary:{correct:0,total:0},grammar:{correct:0,total:0}},startedAt:new Date().toISOString()};save();renderAll();toast("Progresso reiniciado.")}};

window.addEventListener("online",()=>{document.body.classList.remove("offline");toast("Conexão restabelecida.")});
window.addEventListener("offline",()=>{document.body.classList.add("offline");toast("Modo offline: exercícios continuam disponíveis.")});
if(!navigator.onLine) document.body.classList.add("offline");
if("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");
let installPrompt;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;document.querySelector("#installButton").hidden=false});
document.querySelector("#installButton").onclick=async()=>{if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;document.querySelector("#installButton").hidden=true}else toast("Use o menu do navegador e escolha ‘Adicionar à tela inicial’. ")};

rebuildDerivedReports();
renderAll();
