
// =========================
// 🧠 VARIABLES
// =========================
let currentDate = new Date();
let selectedDate = null;

let calendarData = JSON.parse(localStorage.getItem("calendarData")) || {};

// =========================
// 🧠 ADD TASK (LISTA PRINCIPAL)
// =========================
function addTask() {
  const input = document.getElementById("taskInput");
  const taskText = input.value;

  if (taskText === "") return;

  const li = document.createElement("li");

  li.innerHTML = `
    <span class="check">☐</span>
    <span class="task-text">${taskText}</span>
    <span class="status"></span>
    <button class="delete-btn">❌</button>
  `;

  li.setAttribute("draggable", "true");
  li.id = "task-" + Date.now();

  const check = li.querySelector(".check");
  const status = li.querySelector(".status");
  const deleteBtn = li.querySelector(".delete-btn");

  check.addEventListener("click", () => {
    li.classList.toggle("completed");

    if (li.classList.contains("completed")) {
      check.textContent = "☑";
      status.textContent = "Completado";
    } else {
      check.textContent = "☐";
      status.textContent = "";
    }

    saveTasks();
    reorderTasks();
  });

  deleteBtn.addEventListener("click", () => {
    li.remove();
    saveTasks();
  });

  li.addEventListener("dragstart", drag);

  document.getElementById("taskList").appendChild(li);

  saveTasks();
  input.value = "";
}

// =========================
// 📦 GUARDAR TASKS
// =========================
function saveTasks() {
  const tasks = [];

  document.querySelectorAll("#taskList li").forEach(li => {
    const text = li.querySelector(".task-text").textContent;

    tasks.push({
      text,
      completed: li.classList.contains("completed")
    });
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// =========================
// 🔄 REORDENAR
// =========================
function reorderTasks() {
  const list = document.getElementById("taskList");
  const items = Array.from(list.children);

  items.sort((a, b) => {
    return a.classList.contains("completed") - b.classList.contains("completed");
  });

  items.forEach(i => list.appendChild(i));
}

// =========================
// 💾 CARGAR TASKS
// =========================
  const saved = JSON.parse(localStorage.getItem("tasks")) || [];

  saved.forEach(task => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span class="check">☐</span>
      <span class="task-text">${task.text}</span>
      <span class="status"></span>
      <button class="delete-btn">❌</button>
    `;

    li.setAttribute("draggable", "true");
    li.id = "task-" + Date.now();

    const check = li.querySelector(".check");
    const status = li.querySelector(".status");
    const deleteBtn = li.querySelector(".delete-btn");

    if (task.completed) {
      li.classList.add("completed");
      check.textContent = "☑";
      status.textContent = "Completado";
    }

    check.addEventListener("click", () => {
      li.classList.toggle("completed");

      if (li.classList.contains("completed")) {
        check.textContent = "☑";
        status.textContent = "Completado";
      } else {
        check.textContent = "☐";
        status.textContent = "";
      }

      saveTasks();
      reorderTasks();
    });

    deleteBtn.addEventListener("click", () => {
      li.remove();
      saveTasks();
    });

    li.addEventListener("dragstart", drag);

    document.getElementById("taskList").appendChild(li);
  });

  reorderTasks();

  renderCalendar(); // 🔥 IMPORTANTE
};

// =========================
// ⌨️ ENTER
// =========================
document.getElementById("taskInput").addEventListener("keydown", e => {
  if (e.key === "Enter") addTask();
});

// =========================
// 🌐 SW
// =========================
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

// =========================
// 🧲 DRAG & DROP BASE
// =========================
function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drop(ev) {
  ev.preventDefault();
  const id = ev.dataTransfer.getData("text");
  const el = document.getElementById(id);

  ev.target.closest(".day")?.querySelector(".dropzone")?.appendChild(el);
}

// =========================
// 📅 CALENDARIO REAL
// =========================
function renderCalendar() {
  const calendar = document.getElementById("calendar");
  const title = document.getElementById("monthTitle");

  calendar.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();

  title.innerText = currentDate.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric"
  });

  for (let i = 0; i < firstDay; i++) {
    calendar.innerHTML += `<div></div>`;
  }

  for (let d = 1; d <= days; d++) {
    calendar.innerHTML += `
      <div class="day" onclick="selectDay(${d}, this)">
        ${d}
      </div>
    `;
  }
}

function prevMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
}

// =========================
// 📌 SELECCIONAR DÍA
// =========================
function selectDay(day, el) {
  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();

  selectedDate = `${y}-${m + 1}-${day}`;

  document.getElementById("selectedDayTitle").innerText =
    `Tareas del ${day}`;

  document.querySelectorAll(".day").forEach(d => d.classList.remove("selected"));
  el.classList.add("selected");

  renderDayTasks();
}

// =========================
// 📝 TAREAS POR DÍA
// =========================
function addTaskToDay() {
  const input = document.getElementById("dayTaskInput");

  if (!selectedDate || input.value === "") return;

  if (!calendarData[selectedDate]) {
    calendarData[selectedDate] = [];
  }

  calendarData[selectedDate].push({
    text: input.value,
    completed: false
  });

  input.value = "";

  saveCalendar();
  renderDayTasks();
}

function renderDayTasks() {
  const list = document.getElementById("dayTaskList");
  list.innerHTML = "";

  if (!calendarData[selectedDate]) return;

  calendarData[selectedDate].forEach((t, i) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>${t.text}</span>
      <button onclick="deleteDayTask(${i})">❌</button>
    `;

    list.appendChild(li);
  });
}

function deleteDayTask(i) {
  calendarData[selectedDate].splice(i, 1);
  saveCalendar();
  renderDayTasks();
}

function saveCalendar() {
  localStorage.setItem("calendarData", JSON.stringify(calendarData));
}

// =========================
// 🧠 SPLASH
// =========================
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  if (splash) splash.style.display = "none";
});
document.addEventListener("DOMContentLoaded", () => {
  renderCalendar();
});