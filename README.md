# Smart Study Planner

Smart Study Planner is a small full-stack web application for organizing study tasks. Users can add tasks, set optional due dates, mark tasks as completed, delete tasks, switch between light and dark mode, and view their completion progress.

## Features

- Add study tasks.
- Add optional due dates.
- Mark tasks as completed or undo completion.
- Delete tasks.
- Track remaining tasks and completion percentage.
- Sort unfinished tasks and earlier due dates first.
- Use a responsive browser interface.

## Technology Choices

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express, CORS
- Persistence: JSON file storage in `backend/tasks.json`
- Tools: npm, Git, GitHub, browser testing

## Run The Project

Install backend dependencies:

```bash
cd backend
npm install
```

Start the backend and frontend server:

```bash
npm start
```

Open the app in a browser:

```text
http://localhost:3000
```

## Run Tests

From the `backend` folder:

```bash
npm test
```
