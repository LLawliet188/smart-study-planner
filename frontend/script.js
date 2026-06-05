const themeToggle = document.getElementById("themeToggle");
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskCounter = document.getElementById("taskCounter");
const taskProgress = document.getElementById("taskProgress");
const dueDateInput = document.getElementById("dueDateInput");
const progressFill = document.getElementById("progressFill");
const emptyState = document.getElementById("emptyState");

const API_URL = "/api/tasks";

function createTaskElement(task) {
  const li = document.createElement("li");

  const textSpan = document.createElement("span");
  textSpan.textContent = task.text;

  if (task.dueDate) {
    const due = document.createElement("small");
    due.textContent = `Due: ${task.dueDate}`;
    due.style.display = "block";
    due.style.color = "#666";

    textSpan.appendChild(document.createElement("br"));
    textSpan.appendChild(due);
  }

  if (task.dueDate && !task.done) {
    const today = new Date();
    const due = new Date(task.dueDate + "T00:00:00");

    const todayDate = new Date(today.toDateString());

    if (due < todayDate) {
      li.style.background = "#fff5f5";
      li.style.borderColor = "#ffbdbd";
    } else if (due.getTime() === todayDate.getTime()) {
      li.style.background = "#fff9e6";
      li.style.borderColor = "#ffe08a";
    }
  }

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
  
  // Show message if there are no tasks
  if (tasks.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }
  
  const remaining = tasks.filter((task) => !task.done).length;
  taskCounter.textContent = `${remaining} task(s) remaining`;

  const completed = tasks.filter((task) => task.done).length;
  const total = tasks.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  taskProgress.textContent = `${completed} / ${total} tasks completed (${percent}%)`;
  progressFill.style.width = `${percent}%`;

  tasks.sort((a, b) => {
    // Unfinished tasks should stay above completed tasks.
    if (a.done !== b.done) {
      return a.done - b.done;
    }

    // Tasks without due dates appear after dated tasks.
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;

    return new Date(a.dueDate) - new Date(b.dueDate);
  });

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
    body: JSON.stringify({
      text,
      dueDate: dueDateInput.value || null,
    }),
  });

  taskInput.value = "";
  dueDateInput.value = "";
  loadTasks();
});

// Load tasks on page open
loadTasks();

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    themeToggle.textContent = "☀ Light Mode";
  } else {
    themeToggle.textContent = "🌙 Dark Mode";
  }
});
