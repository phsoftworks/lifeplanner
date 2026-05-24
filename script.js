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

  const check = li.querySelector(".check");
  const status = li.querySelector(".status");

  check.addEventListener("click", function(event) {
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
  });

  const deleteBtn = li.querySelector(".delete-btn");

  deleteBtn.addEventListener("click", function(event) {
    event.stopPropagation();
    li.remove();
    saveTasks();
  });

  document.getElementById("taskList").appendChild(li);

  saveTasks();
  input.value = "";
}

function saveTasks() {
  const tasks = [];

  document.querySelectorAll("#taskList li").forEach(li => {
    tasks.push({
      text: li.querySelector(".task-text").textContent,
      completed: li.classList.contains("completed")
    });
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

window.onload = function() {
  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

  savedTasks.forEach(task => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span class="check">☐</span>
      <span class="task-text">${task.text}</span>
      <span class="status"></span>
      <button class="delete-btn">❌</button>
    `;

    const check = li.querySelector(".check");
    const status = li.querySelector(".status");

    if (task.completed) {
      li.classList.add("completed");
      check.textContent = "☑";
      status.textContent = "Completado";
    }

    check.addEventListener("click", function(event) {
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
    });

    const deleteBtn = li.querySelector(".delete-btn");

    deleteBtn.addEventListener("click", function(event) {
      event.stopPropagation();
      li.remove();
      saveTasks();
    });

    document.getElementById("taskList").appendChild(li);
  });
};

document.getElementById("taskInput").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    addTask();
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}