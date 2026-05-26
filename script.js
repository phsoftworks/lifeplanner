let currentDate = new Date();
let selectedDate = null;

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

/* ================= SAVE ================= */

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* ================= TASKS ================= */

function addTask() {
  const input = document.getElementById("taskInput");
  if (!input.value.trim()) return;

  tasks.push({
    id: Date.now(),
    text: input.value.trim(),
    completed: false,
    date: null
  });

  save();
  renderTaskList();
  renderCalendar();
  input.value = "";
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.completed = !task.completed;

  save();
  renderTaskList();
  renderCalendar();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);

  save();
  renderTaskList();
  renderCalendar();
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.draggable = true;

  li.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("taskId", task.id);
  });

  li.innerHTML = `
    <span class="check">${task.completed ? "☑" : "☐"}</span>
    <span class="task-text">${task.text}</span>
    <button class="delete-btn">✖</button>
  `;

  li.querySelector(".check").onclick = () => toggleTask(task.id);
  li.querySelector(".delete-btn").onclick = () => deleteTask(task.id);

  if (task.completed) li.classList.add("completed");

  return li;
}

function renderTaskList() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks
    .filter(t => !t.date) // SOLO tareas sin fecha
    .forEach(task => {
      list.appendChild(createTaskElement(task));
    });
}

/* ================= CALENDAR ================= */

function renderCalendar() {
  const calendar = document.getElementById("calendar");
  const title = document.getElementById("monthTitle");

  calendar.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();

  title.textContent = currentDate.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric"
  });

  for (let i = 0; i < firstDay; i++) {
    calendar.innerHTML += `<div></div>`;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let d = 1; d <= days; d++) {
    const cellDate = new Date(year, month, d);

    let extraClass = "";
    if (cellDate.getTime() === today.getTime()) extraClass = "today";
    else if (cellDate < today) extraClass = "past-day";

    const key = `${year}-${month + 1}-${d}`;

    const dayTasks = tasks.filter(t => t.date === key);

    calendar.innerHTML += `
      <div class="day ${extraClass}"
        onclick="selectDay(${d})"
        ondragover="allowDrop(event)"
        ondrop="dropTask(event, '${key}')">

        <div class="day-number">${d}</div>

        <div class="calendar-tasks">
          ${dayTasks.map(t => `
  <div 
    class="mini-task ${t.completed ? "completed-mini" : ""}"
    draggable="true"
    ondragstart="startCalendarDrag(event, ${t.id})"
  >

    <span onclick="toggleTask(${t.id})">
      ${t.completed ? "☑" : "☐"} ${t.text}
    </span>

    <button 
      class="mini-delete"
      onclick="deleteTask(${t.id})"
    >
      ✖
    </button>

  </div>
`).join("")}
        </div>

      </div>
    `;
  }
}

/* ================= CALENDAR ACTIONS ================= */

function selectDay(day) {
  const key = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;
  selectedDate = key;

  document.getElementById("selectedDayTitle").textContent =
    `Tareas del día ${day}`;
}

function addTaskToDay() {
  const input = document.getElementById("dayTaskInput");
  if (!input.value.trim() || !selectedDate) return;

  tasks.push({
    id: Date.now(),
    text: input.value.trim(),
    completed: false,
    date: selectedDate
  });

  save();
  renderTaskList();
  renderCalendar();

  input.value = "";
}

/* ================= DRAG & DROP ================= */

function allowDrop(e) {
  e.preventDefault();
}
function startCalendarDrag(e, taskId) {
  e.dataTransfer.setData("taskId", taskId);
}
function dropTask(e, dateKey) {
  e.preventDefault();

  const taskId = Number(e.dataTransfer.getData("taskId"));
  const task = tasks.find(t => t.id === taskId);

  if (!task) return;

  task.date = dateKey;

  save();
  renderTaskList();
  renderCalendar();
}

/* ================= NAV ================= */

function prevMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
}

/* ================= INIT ================= */

window.addEventListener("load", () => {
  renderTaskList();
  renderCalendar();

  document.getElementById("taskInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
  });

  document.getElementById("dayTaskInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTaskToDay();
  });
});
new Sortable(taskList, {
  animation: 150
});