let currentDate = new Date();
let selectedDate = null;
let calendarData = JSON.parse(localStorage.getItem("calendarData")) || {};
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

/* ================= TASKS ================= */

function addTask() {
  const input = document.getElementById("taskInput");
  if (!input.value) return;

  const li = createTaskElement(input.value);
  document.getElementById("taskList").appendChild(li);

  tasks.push({ text: input.value, completed: false });
  saveTasks();

  input.value = "";
}

function createTaskElement(text, completed = false) {
  const li = document.createElement("li");
li.draggable = true;
li.addEventListener("dragstart", (e) => {
  e.dataTransfer.setData("text", text);
});
  li.innerHTML = `
  <span class="check">☐</span>

  <span class="task-text">${text}</span>

  <span class="status"></span>

  <button class="delete-btn">✖</button>
`;
const check = li.querySelector(".check");
const status = li.querySelector(".status");

 if (completed) {
  li.classList.add("completed");
  check.textContent = "☑";
  status.textContent = "Completado";
}
  check.onclick = () => {

  li.classList.toggle("completed");

  if (li.classList.contains("completed")) {
    check.textContent = "☑";
    status.textContent = "Completado";
  } else {
    check.textContent = "☐";
    status.textContent = "";
  }

  saveTasks();
};

  li.querySelector(".delete-btn").onclick = () => {
    li.remove();
    saveTasks();
  };

  return li;
}

function saveTasks() {
  const list = document.querySelectorAll("#taskList li");
  tasks = [];

  list.forEach(li => {
    tasks.push({
      text: li.querySelector(".task-text").textContent,
      completed: li.classList.contains("completed")
    });
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* LOAD TASKS */
window.addEventListener("load", () => {
  tasks.forEach(t => {
    document.getElementById("taskList").appendChild(
      createTaskElement(t.text, t.completed)
    );
  });

  renderCalendar();
});

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

  for (let d = 1; d <= days; d++) {

  const key = `${year}-${month + 1}-${d}`;
  const dayTasks = calendarData[key] || [];

  calendar.innerHTML += `
    <div 
      class="day"
      onclick="selectDay(${d})"
      ondragover="allowDrop(event)"
      ondrop="dropTask(event, ${d})"
    >
      <div class="day-number">${d}</div>

      <div class="calendar-tasks">
        ${dayTasks.map((task, index) => `
  <div class="mini-task">

    <span>${task}</span>

    <button 
      class="mini-delete"
      onclick="deleteCalendarTask('${key}', ${index})"
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

function prevMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
}

function selectDay(day) {
  const key = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;
  selectedDate = key;

  document.getElementById("selectedDayTitle").textContent =
    `Tareas del día ${day}`;
}

/* ================= CALENDAR TASKS ================= */

function addTaskToDay() {
  const input = document.getElementById("dayTaskInput");
  if (!selectedDate || !input.value) return;

  if (!calendarData[selectedDate]) {
    calendarData[selectedDate] = [];
  }

  calendarData[selectedDate].push(input.value);
  localStorage.setItem("calendarData", JSON.stringify(calendarData));

renderCalendar();

input.value = "";
}

function allowDrop(e) {
  e.preventDefault();
}

function dropTask(e, day) {
  e.preventDefault();

  const taskText = e.dataTransfer.getData("text");

  const key = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;

  if (!calendarData[key]) {
    calendarData[key] = [];
  }

  calendarData[key].push(taskText);

  localStorage.setItem("calendarData", JSON.stringify(calendarData));

  renderCalendar();
}
document.getElementById("taskInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTask();
  }
});

document.getElementById("dayTaskInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTaskToDay();
  }
});
function deleteCalendarTask(key, index) {

  calendarData[key].splice(index, 1);

  localStorage.setItem(
    "calendarData",
    JSON.stringify(calendarData)
  );

  renderCalendar();
}