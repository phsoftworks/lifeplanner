let currentDate = new Date();
let selectedDate = null;

let tasks =
  JSON.parse(localStorage.getItem("tasks")) || [];

/* ================= SAVE ================= */

function save() {
  localStorage.setItem(
    "tasks",
    JSON.stringify(tasks)
  );
}

/* ================= STATS ================= */

function updateStats() {

  const total = tasks.length;

  const completed =
    tasks.filter(t => t.completed).length;

  const pending = total - completed;

  document.getElementById("totalTasks").textContent =
    total;

  document.getElementById("completedTasks").textContent =
    completed;

  document.getElementById("pendingTasks").textContent =
    pending;
}

/* ================= TASKS ================= */

function addTask() {

  const input =
    document.getElementById("taskInput");

  const text = input.value.trim();

  if (!text) return;

  tasks.push({
    id: Date.now(),
    text,
    completed: false,
    date: null
  });

  input.value = "";

  save();

  renderAll();
}

function toggleTask(id) {

  const task =
    tasks.find(t => t.id === id);

  if (!task) return;

  task.completed = !task.completed;

  save();

  renderAll();
}

function deleteTask(id) {

  tasks =
    tasks.filter(t => t.id !== id);

  save();

  renderAll();
}

/* ================= TASK ELEMENT ================= */

function createTaskElement(task) {

  const li =
    document.createElement("li");

  li.dataset.id = task.id;

  li.innerHTML = `
    <span class="check">
      ${task.completed ? "☑" : "☐"}
    </span>

    <span class="task-text">
      ${task.text}
    </span>

    <button class="delete-btn">
      ✖
    </button>
  `;

  li.querySelector(".check").onclick =
    () => toggleTask(task.id);

  li.querySelector(".delete-btn").onclick =
    () => deleteTask(task.id);

  if (task.completed) {
    li.classList.add("completed");
  }

  return li;
}

/* ================= TASK LIST ================= */

function renderTaskList() {

  const list =
    document.getElementById("taskList");

  list.innerHTML = "";

  tasks
    .filter(t => !t.date)
    .forEach(task => {

      list.appendChild(
        createTaskElement(task)
      );

    });

}

/* ================= CALENDAR ================= */

function renderCalendar() {

  const calendar =
    document.getElementById("calendar");

  const title =
    document.getElementById("monthTitle");

  calendar.innerHTML = "";

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth();

  const firstDay =
    new Date(year, month, 1).getDay();

  const days =
    new Date(year, month + 1, 0).getDate();

  title.textContent =
    currentDate.toLocaleDateString(
      "es-ES",
      {
        month: "long",
        year: "numeric"
      }
    );

  for (let i = 0; i < firstDay; i++) {
    calendar.innerHTML += `<div></div>`;
  }

  const today = new Date();

  today.setHours(0,0,0,0);

  for (let d = 1; d <= days; d++) {

    const cellDate =
      new Date(year, month, d);

    let extraClass = "";

    if (
      cellDate.getTime() === today.getTime()
    ) {
      extraClass = "today";
    }

    else if (cellDate < today) {
      extraClass = "past-day";
    }

    const key =
      `${year}-${month + 1}-${d}`;

    const dayTasks =
      tasks.filter(t => t.date === key);

    calendar.innerHTML += `

      <div
        class="day ${extraClass}"
        onclick="selectDay('${key}')"
      >

        <div class="day-number">
          ${d}
        </div>

        <div
          class="calendar-tasks"
          data-date="${key}"
        >

          ${dayTasks.map(t => `

            <div
              class="mini-task
              ${t.completed ? "completed-mini" : ""}"
              data-id="${t.id}"
            >

              <span onclick="toggleTask(${t.id})">

                ${t.completed ? "☑" : "☐"}

                ${t.text}

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

  initSortable();
}

/* ================= SORTABLE ================= */

function initSortable() {

  const taskList =
    document.getElementById("taskList");

  new Sortable(taskList, {

    group: "tasks",

    animation: 150,

    delay: 120,

    delayOnTouchOnly: true,

    ghostClass: "dragging"
  });

  document
    .querySelectorAll(".calendar-tasks")
    .forEach(el => {

      new Sortable(el, {

        group: "tasks",

        animation: 150,

        delay: 120,

        delayOnTouchOnly: true,

        ghostClass: "dragging",

        onAdd: function(evt) {

          const taskId =
            Number(evt.item.dataset.id);

          const task =
            tasks.find(
              t => t.id === taskId
            );

          if (!task) return;

          task.date =
            evt.to.dataset.date;

          save();

          renderAll();
        }
      });

    });

}

/* ================= DAY ACTIONS ================= */

function selectDay(key) {

  selectedDate = key;

  const day =
    key.split("-")[2];

  document.getElementById(
    "selectedDayTitle"
  ).textContent =
    `Tareas del día ${day}`;
}

function addTaskToDay() {

  const input =
    document.getElementById(
      "dayTaskInput"
    );

  const text =
    input.value.trim();

  if (!text || !selectedDate) return;

  tasks.push({

    id: Date.now(),

    text,

    completed: false,

    date: selectedDate
  });

  input.value = "";

  save();

  renderAll();
}

/* ================= MONTH NAV ================= */

function prevMonth() {

  currentDate.setMonth(
    currentDate.getMonth() - 1
  );

  renderCalendar();
}

function nextMonth() {

  currentDate.setMonth(
    currentDate.getMonth() + 1
  );

  renderCalendar();
}

/* ================= RENDER ALL ================= */

function renderAll() {

  renderTaskList();

  renderCalendar();

  updateStats();
}

/* ================= INIT ================= */

window.addEventListener("load", () => {

  renderAll();

  document
    .getElementById("taskInput")
    .addEventListener("keydown", e => {

      if (e.key === "Enter") {
        addTask();
      }

    });

  document
    .getElementById("dayTaskInput")
    .addEventListener("keydown", e => {

      if (e.key === "Enter") {
        addTaskToDay();
      }

    });

});