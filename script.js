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

  setTimeout(initSortable, 0);

  input.value = "";
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.completed = !task.completed;

  save();
  renderTaskList();
  renderCalendar();

  setTimeout(initSortable, 0);
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);

  save();
  renderTaskList();
  renderCalendar();

  setTimeout(initSortable, 0);
}

function createTaskElement(task) {
  const li = document.createElement("li");

  li.dataset.id = task.id;
  li.draggable = true;

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
    .filter(t => !t.date)
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
        ondragenter="this.classList.add('drag-over')"
        ondragleave="this.classList.remove('drag-over')"
        ondrop="dropTask(event, '${key}')">

        <div class="day-number">${d}</div>

        <div class="calendar-tasks"></div>
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

  setTimeout(initSortable, 0);

  input.value = "";
}

/* ================= DRAG & DROP ================= */

function allowDrop(e) {
  e.preventDefault();
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

  document.querySelectorAll(".day").forEach(d => {
    d.classList.remove("drag-over");
  });

  setTimeout(initSortable, 0);
}

/* ================= SORTABLE ================= */

function initSortable() {
  const taskList = document.getElementById("taskList");

  new Sortable(taskList, {
    animation: 150,
    group: "tasks"
  });

  document.querySelectorAll(".calendar-tasks").forEach(el => {
    new Sortable(el, {
      animation: 150,
      group: "tasks",

      onAdd: function (evt) {
        const taskId = Number(evt.item.dataset.id);
        const task = tasks.find(t => t.id === taskId);

        if (!task) return;

        const day = evt.to.closest(".day");
        const dayNumber = Array.from(document.querySelectorAll(".day")).indexOf(day);

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        task.date = `${year}-${month}-${dayNumber + 1}`;

        save();
        renderTaskList();
        renderCalendar();
      }
    });
  });
}

/* ================= NAV ================= */

function prevMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
  setTimeout(initSortable, 0);
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
  setTimeout(initSortable, 0);
}

/* ================= INIT ================= */

window.addEventListener("load", () => {
  renderTaskList();
  renderCalendar();

  setTimeout(initSortable, 0);

  document.getElementById("taskInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
  });

  document.getElementById("dayTaskInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTaskToDay();
  });
});