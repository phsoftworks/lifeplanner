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
  });

  const deleteBtn = li.querySelector(".delete-btn");

  deleteBtn.addEventListener("click", function(event) {
    event.stopPropagation();
    li.remove();
  });

  document.getElementById("taskList").appendChild(li);

  input.value = "";
}
