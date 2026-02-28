// ---------------- MOCK ENGINE ----------------
import { db } from "./universal.js";
import {
  collection,
  getDocs,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

let currentUserId = null;
let questions = [];
let userAnswers = {};
let timerInterval = null;
let timeLeft = 0;

// ---------- INIT USER ----------
export function setMockUser(uid){
  currentUserId = uid;
}

// ---------- FETCH QUESTIONS ----------
async function fetchQuestions(subject, chapter, count){

  const snap = await getDocs(
    collection(db, "questionBank", subject, chapter)
  );

  let all = [];
  snap.forEach(doc => all.push(doc.data()));

  // shuffle
  all.sort(() => Math.random() - 0.5);

  return all.slice(0, count);
}

// ---------- START MOCK ----------
export async function startMock(subject, chapter, count, minutes){
    

  questions = await fetchQuestions(subject, chapter, count);
  userAnswers = {};

  renderTest();

  startTimer(minutes);
}

// ---------- RENDER ----------
function renderTest(){

  const container = document.getElementById("testContainer");
  if(!container) return;

  container.innerHTML = "";

  questions.forEach((q,index)=>{

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>Q${index+1}. ${q.question}</h3>
      ${q.options.map((opt,i)=>`
        <label>
          <input type="radio"
                 name="q${index}"
                 value="${i}"
                 onchange="window.__mockAnswer(${index},${i})">
          ${opt}
        </label><br>
      `).join("")}
    `;

    container.appendChild(div);
  });

  const submitBtn = document.createElement("button");
  submitBtn.className = "submit-btn";
  submitBtn.innerText = "Submit Test";
  submitBtn.onclick = submitMock;

  container.appendChild(submitBtn);
}

// expose answer setter safely
window.__mockAnswer = function(qIndex, value){
  userAnswers[qIndex] = value;
};

// ---------- TIMER ----------
function startTimer(minutes){

  const timerBox = document.getElementById("timerBox");
  timeLeft = minutes * 60;

  timerInterval = setInterval(()=>{

    timeLeft--;

    if(timerBox){
      const m = Math.floor(timeLeft/60);
      const s = timeLeft%60;
      timerBox.innerText = `${m}:${s.toString().padStart(2,'0')}`;
    }

    if(timeLeft <= 0){
      clearInterval(timerInterval);
      submitMock();
    }

  },1000);
}

// ---------- SUBMIT ----------
async function submitMock(){

  clearInterval(timerInterval);

  let score = 0;
  let weakTopics = {};

  questions.forEach((q,i)=>{

    if(userAnswers[i] == q.answer){
      score++;
    }else{
      weakTopics[q.topic] = (weakTopics[q.topic] || 0) + 1;
    }

  });

  const percent = Math.round((score/questions.length)*100);

  showResult(score, percent, weakTopics);

  await saveResult(score, percent, weakTopics);
}

// ---------- SHOW RESULT ----------
function showResult(score, percent, weakTopics){

  const container = document.getElementById("testContainer");

  container.innerHTML = `
    <div class="card">
      <h2>Test Completed</h2>
      <h3>Score: ${score}/${questions.length}</h3>
      <h3>Percentage: ${percent}%</h3>
      <h4>Weak Topics:</h4>
      <ul>
        ${Object.keys(weakTopics).length === 0
          ? "<li>None 🎉</li>"
          : Object.keys(weakTopics).map(t=>`<li>${t}</li>`).join("")}
      </ul>
    </div>
  `;
}

// ---------- SAVE RESULT ----------
async function saveResult(score, percent, weakTopics){

  if(!currentUserId) return;

  await setDoc(
    doc(db,"users",currentUserId,"mockResults",Date.now().toString()),
    {
      score,
      total: questions.length,
      percentage: percent,
      weakTopics,
      timestamp: new Date()
    }
  );
}