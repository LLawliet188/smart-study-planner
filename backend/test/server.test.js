const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { once } = require("node:events");
const test = require("node:test");

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "study-planner-"));
const testDataFile = path.join(tempDir, "tasks.json");
process.env.TASKS_FILE = testDataFile;

const { app } = require("../server");

let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0);
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => {
  server.close();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

test.beforeEach(() => {
  fs.writeFileSync(testDataFile, "[]");
});

async function request(route, options = {}) {
  const response = await fetch(`${baseUrl}${route}`, options);
  const rawBody = await response.text();
  const body = rawBody ? JSON.parse(rawBody) : null;
  return { response, body };
}

test("GET /api/tasks returns an empty task list", async () => {
  const { response, body } = await request("/api/tasks");

  assert.equal(response.status, 200);
  assert.deepEqual(body, []);
});

test("POST /api/tasks rejects blank task text", async () => {
  const { response, body } = await request("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "   " }),
  });

  assert.equal(response.status, 400);
  assert.equal(body.message, "Task text is required");
});

test("task workflow creates, toggles, and deletes a task", async () => {
  const createResult = await request("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "Read Java chapter", dueDate: "2026-06-10" }),
  });

  assert.equal(createResult.response.status, 201);
  assert.equal(createResult.body.text, "Read Java chapter");
  assert.equal(createResult.body.dueDate, "2026-06-10");
  assert.equal(createResult.body.done, false);
  assert.ok(createResult.body.id);

  const toggleResult = await request(`/api/tasks/${createResult.body.id}`, {
    method: "PATCH",
  });

  assert.equal(toggleResult.response.status, 200);
  assert.equal(toggleResult.body.done, true);

  const deleteResult = await request(`/api/tasks/${createResult.body.id}`, {
    method: "DELETE",
  });

  assert.equal(deleteResult.response.status, 200);
  assert.equal(deleteResult.body.message, "Deleted");

  const listResult = await request("/api/tasks");
  assert.deepEqual(listResult.body, []);
});
