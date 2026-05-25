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
    <span class="task-text">${text}</span>
    <button class="delete-btn">❌</button>
  `;

  if (completed) li.classList.add("completed");

  li.querySelector(".task-text").onclick = () => {
    li.classList.toggle("completed");
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
    calendar.innerHTML += `
      <div class="day" onclick="selectDay(${d})">
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

  input.value = "";
}