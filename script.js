let currentDate = new Date();
let selectedDate = null;

let calendarData = JSON.parse(localStorage.getItem("calendarData")) || {};
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

/* ================= TASKS ================= */

function addTask() {
  const input = document.getElementById("taskInput");
  if (!input.value.trim()) return;

  const newTask = {
    id: Date.now(),
    text: input.value.trim(),
    completed: false
  };

  tasks.push(newTask);
  saveTasks();
  renderTaskList();

  input.value = "";
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

  const check = li.querySelector(".check");

  if (task.completed) li.classList.add("completed");

  check.onclick = () => {
    task.completed = !task.completed;
    saveTasks();
    renderTaskList();
  };

  li.querySelector(".delete-btn").onclick = () => {
    tasks = tasks.filter(t => t.id !== task.id);
    saveTasks();
    renderTaskList();
  };

  return li;
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTaskList() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach(task => {
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
    const dayTasks = calendarData[key] || [];

    calendar.innerHTML += `
      <div class="day ${extraClass}"
        onclick="selectDay(${d})"
        ondragover="allowDrop(event)"
        ondrop="dropTask(event, ${d})">

        <div class="day-number">${d}</div>

        <div class="calendar-tasks">
          ${dayTasks
            .map(
              (t, i) => `
              <div class="mini-task ${t.completed ? "completed-mini" : ""}">
                <span onclick="toggleCalendarTask('${key}', ${i})">
                  ${t.completed ? "☑" : "☐"} ${t.text}
                </span>

                <button onclick="deleteCalendarTask('${key}', ${i})">
                  ✖
                </button>
              </div>
            `
            )
            .join("")}
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
  if (!selectedDate || !input.value.trim()) return;

  if (!calendarData[selectedDate]) {
    calendarData[selectedDate] = [];
  }

  calendarData[selectedDate].push({
    text: input.value.trim(),
    completed: false
  });

  saveCalendar();
  renderCalendar();

  input.value = "";
}

function deleteCalendarTask(key, index) {
  calendarData[key].splice(index, 1);
  saveCalendar();
  renderCalendar();
}

function toggleCalendarTask(key, index) {
  calendarData[key][index].completed =
    !calendarData[key][index].completed;

  saveCalendar();
  renderCalendar();
}

function saveCalendar() {
  localStorage.setItem("calendarData", JSON.stringify(calendarData));
}

/* ================= DRAG & DROP ================= */

function allowDrop(e) {
  e.preventDefault();
}

function dropTask(e, day) {
  e.preventDefault();

  const taskId = Number(e.dataTransfer.getData("taskId"));
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const key = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;

  if (!calendarData[key]) calendarData[key] = [];

  calendarData[key].push(task);

  tasks = tasks.filter(t => t.id !== taskId);

  saveTasks();
  saveCalendar();

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