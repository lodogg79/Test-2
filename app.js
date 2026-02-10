/* 🔑 VUL HIER JE OPENAI API KEY IN */
const OPENAI_API_KEY = "PLAK_HIER_JE_API_KEY";

/* BEGIN VARIABLES */
let mood="", theme="rust", lastReply="";

/* DAGELIJKSE CHECK */
const today = new Date().toDateString();
const lastDay = localStorage.getItem("lastCheck");
const welcome = document.getElementById("welcome");
if(today===lastDay){
  welcome.innerText="Welkom terug 🌱 Tijd voor je flow.";
}else{
  welcome.innerText="Nieuwe dag ✨ Tijd voor je check-in!";
  localStorage.setItem("lastCheck", today);
}

/* THEMA */
function setTheme(t){
  theme=t;
  if(t==="rust") bg("#a8edea","#fed6e3");
  if(t==="creatief") bg("#fbc2eb","#a6c1ee");
  if(t==="focus") bg("#d4fc79","#96e6a1");
}
function bg(a,b){
  document.documentElement.style.setProperty('--bg1',a);
  document.documentElement.style.setProperty('--bg2',b);
}

/* MOOD */
function setMood(m){ mood=m; }

/* FLOW */
async function startFlow(){
  const input=document.getElementById("input").value.trim();
  const out=document.getElementById("output");
  const persona=document.getElementById("persona").value;
  if(!input){ out.innerHTML="📝 Schrijf eerst iets."; return; }

  out.innerHTML="🌱 AI stemt af en denkt mee...";

  const prompt = `
Je bent een AI-personage: ${persona}.
Thema: ${theme}
Stemming: ${mood}

Geef:
1. Inzicht (emotioneel)
2. Innerlijke actie
3. Concrete praktische actie

Kort en menselijk.

Gebruiker zegt:
"${input}"
`;

  try{
    const res = await fetch("https://api.openai.com/v1/chat/completions",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization":"Bearer "+OPENAI_API_KEY
      },
      body:JSON.stringify({
        model:"gpt-4o-mini",
        messages:[{role:"user",content:prompt}],
        temperature:0.85
      })
    });
    const data = await res.json();
    lastReply=data.choices[0].message.content;
    out.innerHTML="💬 "+lastReply;
    saveHistory(lastReply);
  }catch(e){
    out.innerHTML="⚠️ AI kon even niet verbinden.";
  }
}

/* STEM */
function spreek(){
  if(!lastReply) return;
  const u=new SpeechSynthesisUtterance(lastReply);
  u.lang="nl-NL";
  u.rate=0.9;
  speechSynthesis.speak(u);
}

/* GESCHIEDENIS */
function saveHistory(text){
  let h=JSON.parse(localStorage.getItem("flowHistory")||"[]");
  h.unshift(text);
  h=h.slice(0,10);
  localStorage.setItem("flowHistory",JSON.stringify(h));
  showHistory();
}
function showHistory(){
  const h=JSON.parse(localStorage.getItem("flowHistory")||"[]");
  document.getElementById("history").innerHTML = 
    h.length ? "<b>📓 Recente inzichten:</b><br>"+h.map(x=>"• "+x).join("<br>") : "";
}
showHistory();

/* EXPORT */
function exportHistory(){
  const h=JSON.parse(localStorage.getItem("flowHistory")||"[]");
  if(!h.length){ alert("Geen inzichten om te exporteren"); return; }
  const blob=new Blob([h.join("\n\n")], {type:"text/plain"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download="FlowAI_Inzichten.txt";
  a.click();
  URL.revokeObjectURL(url);
}