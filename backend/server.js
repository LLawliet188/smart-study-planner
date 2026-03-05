const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "tasks.json");

function readTasks() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function saveTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// Test route
app.get("/", (req, res) => {
  res.send("Study Planner Backend Running");
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

  if (!text) {
    return res.status(400).json({ message: "Task text is required" });
  }

  const newTask = {
    id: Date.now().toString(),
    text,
    done: false,
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

app.listen(3000, () => {
  console.log("Server running on port 3000");
});