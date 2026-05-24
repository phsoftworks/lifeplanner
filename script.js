
let currentDate = new Date();

/* =========================
   🧠 ADD TASK
========================= */
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

  // draggable (para calendario futuro)
  li.setAttribute("draggable", "true");
  li.id = "task-" + Date.now();

  const check = li.querySelector(".check");
  const status = li.querySelector(".status");
  const deleteBtn = li.querySelector(".delete-btn");

  /* ===== COMPLETAR ===== */
  check.addEventListener("click", (event) => {
    event.stopPropagation();

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

  /* ===== BORRAR ===== */
  deleteBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    li.remove();
    saveTasks();
  });

  /* ===== DRAG START ===== */
  li.addEventListener("dragstart", drag);

  document.getElementById("taskList").appendChild(li);

  saveTasks();
  input.value = "";
}

/* =========================
   📦 GUARDAR
========================= */
function saveTasks() {
  const tasks = [];

  document.querySelectorAll("#taskList li").forEach(li => {
    const textElement = li.querySelector(".task-text");

    tasks.push({
      text: textElement.textContent,
      completed: li.classList.contains("completed")
    });
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* =========================
   🔄 REORDENAR
   (completadas abajo)
========================= */
function reorderTasks() {
  const taskList = document.getElementById("taskList");
  const tasks = Array.from(taskList.children);

  tasks.sort((a, b) => {
    const aDone = a.classList.contains("completed");
    const bDone = b.classList.contains("completed");
    return aDone - bDone;
  });

  tasks.forEach(t => taskList.appendChild(t));
}

/* =========================
   💾 CARGAR
========================= */
window.onload = function () {
  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

  savedTasks.forEach(task => {
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

    check.addEventListener("click", (event) => {
      event.stopPropagation();

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

    deleteBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      li.remove();
      saveTasks();
    });

    li.addEventListener("dragstart", drag);

    document.getElementById("taskList").appendChild(li);
  });

  reorderTasks();
};

/* =========================
   ⌨️ ENTER
========================= */
document.getElementById("taskInput").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

/* =========================
   🌐 SERVICE WORKER
========================= */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

/* =========================
   🧲 DRAG & DROP (CALENDARIO)
========================= */
function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();

  const taskId = ev.dataTransfer.getData("text");
  const task = document.getElementById(taskId);

  ev.target.closest(".day")?.querySelector(".dropzone")?.appendChild(task);
}

/* =========================
   🧠 SPLASH
========================= */
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  if (splash) splash.style.display = "none";
});