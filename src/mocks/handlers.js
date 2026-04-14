import { http, HttpResponse } from "msw";

const BASE = "http://localhost:4000";

// ── In-memory database ───────────────────────────────────────────────────────
const db = {
  users: [
    { id: "seed-001", name: "Test User", email: "test@example.com", password: "password123" },
  ],
  projects: [
    { id: "proj-001", name: "TaskFlow App", description: "Main product dashboard and task system", owner_id: "seed-001", created_at: "2026-04-01T10:00:00Z" },
    { id: "proj-002", name: "Marketing Site", description: "Landing page redesign and SEO updates", owner_id: "seed-001", created_at: "2026-04-02T10:00:00Z" },
  ],
  tasks: [
    { id: "task-001", project_id: "proj-001", title: "Set up project structure", description: "Follow Vite + React template", status: "done", priority: "high", assignee_id: "seed-001", due_date: "2026-04-10", created_at: "2026-04-01T10:00:00Z", updated_at: "2026-04-10T10:00:00Z" },
    { id: "task-002", project_id: "proj-001", title: "Design auth pages", description: "Use AuthPage.css for styling", status: "done", priority: "high", assignee_id: "seed-001", due_date: "2026-04-11", created_at: "2026-04-01T11:00:00Z", updated_at: "2026-04-11T10:00:00Z" },
    { id: "task-003", project_id: "proj-001", title: "Build dashboard UI", description: "Cards with color tops and progress bars", status: "in_progress", priority: "medium", assignee_id: "seed-001", due_date: "2026-04-14", created_at: "2026-04-02T10:00:00Z", updated_at: "2026-04-02T10:00:00Z" },
    { id: "task-004", project_id: "proj-001", title: "Connect mock API", description: "Wire up MSW handlers", status: "in_progress", priority: "low", assignee_id: null, due_date: "2026-04-15", created_at: "2026-04-02T11:00:00Z", updated_at: "2026-04-02T11:00:00Z" },
    { id: "task-005", project_id: "proj-001", title: "Write unit tests", description: "", status: "todo", priority: "low", assignee_id: null, due_date: "2026-04-20", created_at: "2026-04-03T10:00:00Z", updated_at: "2026-04-03T10:00:00Z" },
    { id: "task-006", project_id: "proj-002", title: "Redesign landing page", description: "New hero section", status: "in_progress", priority: "high", assignee_id: "seed-001", due_date: "2026-04-18", created_at: "2026-04-02T10:00:00Z", updated_at: "2026-04-02T10:00:00Z" },
  ],
};

const uid  = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const now  = () => new Date().toISOString();

const makeToken = (userId) => btoa(JSON.stringify({ userId, exp: Date.now() + 86400000 }));

const getUser = (request) => {
  try {
    const auth  = request.headers.get("Authorization") || "";
    const token = auth.replace("Bearer ", "").trim();
    if (!token) return null;
    const { userId } = JSON.parse(atob(token));
    return db.users.find((u) => u.id === userId) || null;
  } catch {
    return null;
  }
};

const unauth  = () => HttpResponse.json({ error: "unauthorized" }, { status: 401 });
const notFound = () => HttpResponse.json({ error: "not found" },  { status: 404 });
const forbidden = () => HttpResponse.json({ error: "forbidden" }, { status: 403 });

export const handlers = [

  // ── POST /auth/register ──────────────────────────────────────────────────
  http.post(`${BASE}/auth/register`, async ({ request }) => {
    const { name, email, password } = await request.json();
    const fields = {};
    if (!name)     fields.name     = "is required";
    if (!email)    fields.email    = "is required";
    if (!password) fields.password = "is required";
    if (Object.keys(fields).length)
      return HttpResponse.json({ error: "validation failed", fields }, { status: 400 });

    if (db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()))
      return HttpResponse.json({ error: "validation failed", fields: { email: "already taken" } }, { status: 400 });

    const user  = { id: uid(), name, email, password };
    db.users.push(user);
    const token = makeToken(user.id);
    return HttpResponse.json({ token, user: { id: user.id, name, email } }, { status: 201 });
  }),

  // ── POST /auth/login ─────────────────────────────────────────────────────
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const { email, password } = await request.json();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email?.toLowerCase() && u.password === password
    );
    if (!user) return HttpResponse.json({ error: "unauthorized" }, { status: 401 });
    const token = makeToken(user.id);
    return HttpResponse.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  }),

  // ── GET /auth/me ─────────────────────────────────────────────────────────
  http.get(`${BASE}/auth/me`, ({ request }) => {
    const user = getUser(request);
    if (!user) return unauth();
    return HttpResponse.json({ id: user.id, name: user.name, email: user.email });
  }),

  // ── GET /projects ─────────────────────────────────────────────────────────
  http.get(`${BASE}/projects`, ({ request }) => {
    const user = getUser(request);
    if (!user) return unauth();
    const projects = db.projects
      .filter((p) => p.owner_id === user.id)
      .map((p) => ({
        ...p,
        task_count: db.tasks.filter((t) => t.project_id === p.id).length,
        done_count: db.tasks.filter((t) => t.project_id === p.id && t.status === "done").length,
      }));
    return HttpResponse.json({ projects });
  }),

  // ── POST /projects ────────────────────────────────────────────────────────
  http.post(`${BASE}/projects`, async ({ request }) => {
    const user = getUser(request);
    if (!user) return unauth();
    const body = await request.json();
    if (!body.name?.trim())
      return HttpResponse.json({ error: "validation failed", fields: { name: "is required" } }, { status: 400 });
    const project = { id: uid(), name: body.name.trim(), description: body.description?.trim() || "", owner_id: user.id, created_at: now() };
    db.projects.push(project);
    return HttpResponse.json(project, { status: 201 });
  }),

  // ── GET /projects/:id ─────────────────────────────────────────────────────
  http.get(`${BASE}/projects/:id`, ({ request, params }) => {
    const user = getUser(request);
    if (!user) return unauth();
    const project = db.projects.find((p) => p.id === params.id);
    if (!project) return notFound();
    if (project.owner_id !== user.id) return forbidden();
    const tasks = db.tasks.filter((t) => t.project_id === params.id);
    return HttpResponse.json({ ...project, tasks });
  }),

  // ── PATCH /projects/:id ───────────────────────────────────────────────────
  http.patch(`${BASE}/projects/:id`, async ({ request, params }) => {
    const user = getUser(request);
    if (!user) return unauth();
    const project = db.projects.find((p) => p.id === params.id);
    if (!project) return notFound();
    if (project.owner_id !== user.id) return forbidden();
    const body = await request.json();
    if (body.name !== undefined)        project.name        = body.name;
    if (body.description !== undefined) project.description = body.description;
    return HttpResponse.json(project);
  }),

  // ── DELETE /projects/:id ──────────────────────────────────────────────────
  http.delete(`${BASE}/projects/:id`, ({ request, params }) => {
    const user = getUser(request);
    if (!user) return unauth();
    const idx = db.projects.findIndex((p) => p.id === params.id);
    if (idx === -1) return notFound();
    if (db.projects[idx].owner_id !== user.id) return forbidden();
    db.projects.splice(idx, 1);
    db.tasks = db.tasks.filter((t) => t.project_id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),

  // ── GET /projects/:id/tasks ───────────────────────────────────────────────
  http.get(`${BASE}/projects/:id/tasks`, ({ request, params }) => {
    const user = getUser(request);
    if (!user) return unauth();
    const project = db.projects.find((p) => p.id === params.id);
    if (!project) return notFound();
    const url    = new URL(request.url);
    const status = url.searchParams.get("status");
    const assignee = url.searchParams.get("assignee");
    let tasks = db.tasks.filter((t) => t.project_id === params.id);
    if (status)   tasks = tasks.filter((t) => t.status === status);
    if (assignee) tasks = tasks.filter((t) => t.assignee_id === assignee);
    return HttpResponse.json({ tasks });
  }),

  // ── POST /projects/:id/tasks ──────────────────────────────────────────────
  http.post(`${BASE}/projects/:id/tasks`, async ({ request, params }) => {
    const user = getUser(request);
    if (!user) return unauth();
    const project = db.projects.find((p) => p.id === params.id);
    if (!project) return notFound();
    const body = await request.json();
    if (!body.title?.trim())
      return HttpResponse.json({ error: "validation failed", fields: { title: "is required" } }, { status: 400 });
    const task = {
      id: uid(),
      project_id:  params.id,
      title:       body.title.trim(),
      description: body.description?.trim() || "",
      status:      body.status      || "todo",
      priority:    body.priority    || "medium",
      assignee_id: body.assignee_id || null,
      due_date:    body.due_date    || null,
      created_at:  now(),
      updated_at:  now(),
    };
    db.tasks.push(task);
    return HttpResponse.json(task, { status: 201 });
  }),

  // ── PATCH /tasks/:id ──────────────────────────────────────────────────────
  http.patch(`${BASE}/tasks/:id`, async ({ request, params }) => {
    const user = getUser(request);
    if (!user) return unauth();
    const task = db.tasks.find((t) => t.id === params.id);
    if (!task) return notFound();
    const body = await request.json();
    const fields = ["title", "status", "priority", "assignee_id", "due_date", "description"];
    fields.forEach((f) => { if (body[f] !== undefined) task[f] = body[f]; });
    task.updated_at = now();
    return HttpResponse.json(task);
  }),

  // ── DELETE /tasks/:id ─────────────────────────────────────────────────────
  http.delete(`${BASE}/tasks/:id`, ({ request, params }) => {
    const user = getUser(request);
    if (!user) return unauth();
    const idx = db.tasks.findIndex((t) => t.id === params.id);
    if (idx === -1) return notFound();
    db.tasks.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];