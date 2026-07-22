const weeks = [
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

function q(text, options, answer){ return {text,options,answer}; }
function lesson(day,title,goal,videoId,structure,...qs){ return {day,title,goal,videoId,structure,qs}; }
function simple(day,title,videoId,structure){
  return lesson(day,title,`Compreender ${title.toLowerCase()} em uma conversa curta.`,videoId,structure,
    q("Qual é a melhor estratégia na primeira escuta?",["Traduzir cada palavra","Entender a situação geral","Ativar legenda em português"],1),
    q("Na segunda escuta, qual apoio usar?",["Legenda em inglês","Tradução automática","Nenhum áudio"],0),
    q("O que deve ser repetido em voz alta?",["Uma frase útil","Todo o vídeo de memória","Somente palavras em português"],0));
}

const blank = {week:1,day:1,completed:[],answers:{},scores:{},minutes:0,evaluations:{},confidence:{}};
let stored = JSON.parse(localStorage.getItem("inglesNoRitmo")||"{}");
let state = {...blank,...stored};
if(!state.week) state.week=1;
const key=(w,d)=>`${w}-${d}`;
const save=()=>localStorage.setItem("inglesNoRitmo",JSON.stringify(state));
const currentWeek=()=>weeks[Math.min(state.week,weeks.length)-1];
const currentLesson=()=>currentWeek().lessons[state.day-1];
function toast(text){const el=document.querySelector("#toast");el.textContent=text;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2400)}

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
      <div class="feedback ${done?"show":""}">${done?`Aula concluída · ${state.scores[id]}/${l.qs.length} respostas corretas.`:""}</div>
      <div class="actions"><button type="submit" class="primary">${done?"Atualizar respostas":"Concluir aula"}</button><button type="button" class="primary whatsapp" id="whatsapp">Enviar pelo WhatsApp</button></div>
    </form></div>`;
  document.querySelector("#quizForm").onsubmit=e=>finishLesson(e,l,id);
  document.querySelector("#whatsapp").onclick=()=>shareLesson(l);
}

function finishLesson(e,l,id){
  e.preventDefault();const data=new FormData(e.target),ans=l.qs.map((_,i)=>Number(data.get(`q${i}`))),confidence=Number(document.querySelector("#confidence").value);
  if(ans.some(Number.isNaN)||!confidence){toast("Responda às questões e avalie a audição.");return}
  state.answers[id]=ans;state.scores[id]=ans.filter((a,i)=>a===l.qs[i].answer).length;state.confidence[id]=confidence;
  if(!state.completed.includes(id)){state.completed.push(id);state.minutes+=30}
  if(l.day<7) state.day=l.day+1;save();renderAll();toast("Aula concluída. Progresso salvo!");
}

function shareLesson(l){
  const msg=`Inglês — Semana ${state.week}, Dia ${l.day}\n${l.title}\nObjetivo: ${l.goal}\nDuração: 30 minutos.\nAbrir portal: ${location.href.split("#")[0]}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank","noopener");
}

function weekCompleted(w){return weeks[w-1].lessons.every(l=>state.completed.includes(key(w,l.day)))}
function renderWeek(){
  const w=currentWeek();document.querySelector("#weekTitle").textContent=`Semana ${state.week}`;document.querySelector("#weekGrid").innerHTML=w.lessons.map(l=>{const done=state.completed.includes(key(state.week,l.day));return `<article class="day-card ${done?"done":""}" data-day="${l.day}"><strong>${done?"✓ ":""}Dia ${l.day}</strong><span>${l.title}</span></article>`}).join("");
  document.querySelectorAll(".day-card").forEach(c=>c.onclick=()=>{state.day=Number(c.dataset.day);save();switchView("hoje")});
  const unlocked=weekCompleted(state.week), evaluated=Boolean(state.evaluations[state.week]);
  document.querySelector("#assessmentCard").className=`assessment-card ${unlocked?"":"locked"}`;
  document.querySelector("#assessmentCard").innerHTML=`<p class="eyebrow">AVALIAÇÃO SEMANAL</p><h2>${evaluated?"Semana avaliada":unlocked?"Pronto para avaliar":"Conclua as sete aulas"}</h2><p>${evaluated?state.evaluations[state.week].message:unlocked?"O sistema analisará acertos e confiança auditiva para montar a próxima semana.":`${7-w.lessons.filter(l=>state.completed.includes(key(state.week,l.day))).length} aula(s) restante(s).`}</p>${unlocked&&!evaluated?`<div class="actions"><button class="primary" id="evaluate">Gerar próxima semana</button></div>`:""}`;
  if(unlocked&&!evaluated) document.querySelector("#evaluate").onclick=evaluateWeek;
}

function evaluateWeek(){
  const w=state.week, ids=weeks[w-1].lessons.map(l=>key(w,l.day)),correct=ids.reduce((n,id)=>n+(state.scores[id]||0),0),total=ids.length*3,pct=Math.round(correct/total*100),avg=ids.reduce((n,id)=>n+(state.confidence[id]||0),0)/ids.length;
  const support=pct<80||avg<2;const message=`Resultado: ${pct}% · Audição: ${avg.toFixed(1)}/3. ${support?"A próxima semana terá revisão reforçada.":"Você pode avançar com mais desafio auditivo."}`;
  state.evaluations[w]={pct,avg,support,message};
  if(w<weeks.length){state.week=w+1;state.day=1;toast(`Semana ${state.week} liberada!`)}else{toast("Ciclo de três semanas concluído. Hora de reavaliar o ritmo.")}
  save();renderAll();
}

function renderStats(){
  const answered=Object.values(state.answers).reduce((n,a)=>n+a.length,0),correct=Object.values(state.scores).reduce((a,b)=>a+b,0);
  document.querySelector("#completedStat").textContent=state.completed.length;document.querySelector("#minutesStat").textContent=`${state.minutes} min`;document.querySelector("#accuracyStat").textContent=answered?`${Math.round(correct/answered*100)}%`:"—";
  const last=state.evaluations[Math.max(1,state.week-1)];document.querySelector("#adaptiveMessage").textContent=last?.message||"Conclua a primeira semana para receber uma recomendação adaptativa.";
}
function renderAll(){const done=currentWeek().lessons.filter(l=>state.completed.includes(key(state.week,l.day))).length;document.querySelector("#streakValue").textContent=state.completed.length;document.querySelector("#progressFill").style.width=`${done/7*100}%`;document.querySelector("#progressText").textContent=`${done} de 7 aulas concluídas`;document.querySelector(".eyebrow").textContent=`SEMANA ${state.week} · A1 ACELERADO`;renderLesson();renderWeek();renderStats()}
function switchView(id){document.querySelectorAll(".view,.nav-link").forEach(x=>x.classList.remove("active"));document.querySelector(`#${id}`).classList.add("active");document.querySelector(`[data-view="${id}"]`).classList.add("active");scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll(".nav-link").forEach(b=>b.onclick=()=>switchView(b.dataset.view));
function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="progresso-ingles-marcelo.json";a.click();URL.revokeObjectURL(a.href);toast("Backup exportado.")}
document.querySelector("#exportButton").onclick=exportData;document.querySelector("#backupButton").onclick=exportData;
document.querySelector("#importInput").onchange=async e=>{try{state={...blank,...JSON.parse(await e.target.files[0].text())};save();renderAll();toast("Progresso restaurado.")}catch{toast("Não foi possível ler esse backup.")}};
document.querySelector("#resetButton").onclick=()=>{if(confirm("Apagar todo o progresso salvo neste navegador?")){state={...blank,completed:[],answers:{},scores:{},evaluations:{},confidence:{}};save();renderAll();toast("Progresso reiniciado.")}};

window.addEventListener("online",()=>{document.body.classList.remove("offline");toast("Conexão restabelecida.")});
window.addEventListener("offline",()=>{document.body.classList.add("offline");toast("Modo offline: exercícios continuam disponíveis.")});
if(!navigator.onLine) document.body.classList.add("offline");
if("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");
let installPrompt;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;document.querySelector("#installButton").hidden=false});
document.querySelector("#installButton").onclick=async()=>{if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;document.querySelector("#installButton").hidden=true}else toast("Use o menu do navegador e escolha ‘Adicionar à tela inicial’. ")};
renderAll();
