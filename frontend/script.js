const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskCounter = document.getElementById("taskCounter");
const taskProgress = document.getElementById("taskProgress");

const API_URL = "http://localhost:3000/api/tasks";

function createTaskElement(task) {
  const li = document.createElement("li");

  const textSpan = document.createElement("span");
  textSpan.textContent = task.text;

  if (task.done) {
    textSpan.style.textDecoration = "line-through";
    textSpan.style.opacity = "0.7";
  }

  const btnBox = document.createElement("div");
  btnBox.style.display = "flex";
  btnBox.style.gap = "8px";

  const doneBtn = document.createElement("button");
  doneBtn.textContent = task.done ? "Undo" : "Done";
  doneBtn.style.background = task.done ? "#e6f4ea" : "#fff";
doneBtn.style.borderColor = task.done ? "#b7e1c1" : "#ddd";
  doneBtn.addEventListener("click", async () => {
    await fetch(`${API_URL}/${task.id}`, { method: "PATCH" });
    loadTasks();
  });

  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.style.background = "#ffecec";
delBtn.style.borderColor = "#ffbdbd";
  delBtn.addEventListener("click", async () => {
    await fetch(`${API_URL}/${task.id}`, { method: "DELETE" });
    loadTasks();
  });

  btnBox.appendChild(doneBtn);
  btnBox.appendChild(delBtn);

  li.appendChild(textSpan);
  li.appendChild(btnBox);

  return li;
}

async function loadTasks() {
  taskList.innerHTML = "";
  const res = await fetch(API_URL);
  const tasks = await res.json();
  
  const remaining = tasks.filter(t => !t.done).length;
  taskCounter.textContent = `${remaining} task(s) remaining`;

  const completed = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  taskProgress.textContent = `${completed} / ${total} tasks completed (${percent}%)`;

  tasks.forEach((task) => {
    taskList.appendChild(createTaskElement(task));
  });
}

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = taskInput.value.trim();
  if (!text) return;

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  taskInput.value = "";
  loadTasks();
});

// Load tasks on page open
loadTasks();