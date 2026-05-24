function addTask() {
  const input = document.getElementById("taskInput");
  const taskText = input.value;

  if (taskText === "") return;

  const li = document.createElement("li");

  li.innerHTML = `
    ${taskText}
    <button class="delete-btn">❌</button>
  `;

  li.addEventListener("click", function() {
    li.classList.toggle("completed");
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
      text: li.childNodes[0].textContent.trim(),
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
      ${task.text}
      <button class="delete-btn">❌</button>
    `;

    if (task.completed) {
      li.classList.add("completed");
    }

    li.addEventListener("click", function() {
      li.classList.toggle("completed");
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