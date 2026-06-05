const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Tests can point the API at a temporary file without changing real user data.
const DATA_FILE = process.env.TASKS_FILE
  ? path.resolve(process.env.TASKS_FILE)
  : path.join(__dirname, "tasks.json");
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");

function readTasks() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    // First run or missing data file: start with an empty planner.
    return [];
  }
}

function saveTasks(tasks) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// Serve the frontend from the same server, so http://localhost:3000 opens the app.
app.use(express.static(FRONTEND_DIR));

// Frontend page
app.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

// Get all tasks
app.get("/api/tasks", (req, res) => {
  const tasks = readTasks();
  res.json(tasks);
});

// Add a task
app.post("/api/tasks", (req, res) => {
  const tasks = readTasks();
  const text = (req.body.text || "").trim();
  const dueDate = req.body.dueDate || null;

  if (!text) {
    return res.status(400).json({ message: "Task text is required" });
  }

  const newTask = {
    id: Date.now().toString(),
    text,
    done: false,
    dueDate,
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  saveTasks(tasks);

  res.status(201).json(newTask);
});

// Toggle done
app.patch("/api/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const { id } = req.params;

  const task = tasks.find((t) => t.id === id);
  if (!task) return res.status(404).json({ message: "Task not found" });

  task.done = !task.done;
  saveTasks(tasks);

  res.json(task);
});

// Delete a task
app.delete("/api/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const { id } = req.params;

  const updated = tasks.filter((t) => t.id !== id);
  saveTasks(updated);

  res.json({ message: "Deleted" });
});

if (require.main === module) {
  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
}

// Export the app so tests can start it on a temporary port.
module.exports = { app, readTasks, saveTasks };
