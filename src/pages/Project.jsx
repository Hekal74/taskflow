import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import ThemePicker from "../components/ThemePicker";
import { fetchProject, fetchTasks, createTask, updateTask, deleteTask } from "../api/api";
import { getMe } from "../api/api";
import "./Project.css";

const STATUS_COLS = ["todo", "in_progress", "done"];
const STATUS_LABEL = { todo: "To Do", in_progress: "In Progress", done: "Done" };
const PRIORITY_COLOR = { high: "#e02455", medium: "#f59e0b", low: "#10b981" };
const MEMBERS = ["Itachi", "Naruto", "Sakura", "Kakashi", "Sasuke"];

const EMPTY_TASK = { title: "", description: "", status: "todo", priority: "medium", assignee_id: "", due_date: "" };

function getSidebarFg(hex) {
  if (!hex || hex.length < 7) return "#fff";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#1a1a2e" : "#ffffff";
}

export default function Project() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id: projectId } = useParams();
  const { theme, darkMode, toggleDark } = useTheme();

  const [project, setProject] = useState(state?.project || null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState(EMPTY_TASK);
  const [taskError, setTaskError] = useState("");
  const [adding, setAdding] = useState(false);

  const [editTask, setEditTask] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const [dragTask, setDragTask] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [completingId, setCompletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");

  const d = darkMode;

  useEffect(() => { loadData(); }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchProject(projectId);
      setProject(data);
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message || "Failed to load project.");
    } finally {
      setLoading(false);
    }
  };

  const projectColor = project?.color || theme.primary;
  const primaryFg = getSidebarFg(projectColor);

  // Derive theme-aware tint colors inline
  const primaryLight = `${projectColor}18`;
  const primaryMid   = `${projectColor}30`;

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const progress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  const filtered = useMemo(() => tasks.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.title.toLowerCase().includes(q) ||
      t.assignee_id?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q);
    const matchPriority = filterPriority === "all" || t.priority === filterPriority;
    const matchAssignee = filterAssignee === "all" || t.assignee_id === filterAssignee;
    return matchSearch && matchPriority && matchAssignee;
  }), [tasks, search, filterPriority, filterAssignee]);

  const tasksByStatus = (status) => filtered.filter((t) => t.status === status);
  const hasFilters = search || filterPriority !== "all" || filterAssignee !== "all";

  const handleAddTask = async () => {
    if (!newTask.title.trim()) { setTaskError("Task title is required"); return; }
    setAdding(true);
    setTaskError("");
    const tempId = `temp-${Date.now()}`;
    const optimistic = { id: tempId, project_id: projectId, ...newTask, title: newTask.title.trim(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    setTasks((ts) => [...ts, optimistic]);
    setNewTask(EMPTY_TASK);
    setShowForm(false);
    try {
      const created = await createTask(projectId, {
        title: newTask.title.trim(), description: newTask.description,
        status: newTask.status, priority: newTask.priority,
        assignee_id: newTask.assignee_id || null, due_date: newTask.due_date || null,
      });
      setTasks((ts) => ts.map((t) => t.id === tempId ? created : t));
    } catch (err) {
      setTasks((ts) => ts.filter((t) => t.id !== tempId));
      setTaskError(err.message || "Failed to add task.");
      setShowForm(true);
    } finally {
      setAdding(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const prev = tasks.find((t) => t.id === taskId);
    setTasks((ts) => ts.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
    if (newStatus === "done") { setCompletingId(taskId); setTimeout(() => setCompletingId(null), 700); }
    try { await updateTask(taskId, { status: newStatus }); }
    catch { setTasks((ts) => ts.map((t) => t.id === taskId ? prev : t)); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    const prev = [...tasks];
    setTasks((ts) => ts.filter((t) => t.id !== taskId));
    try { await deleteTask(taskId); }
    catch { setTasks(prev); }
  };

  const handleSaveEdit = async () => {
    if (!editTask.title.trim()) { setEditError("Title is required"); return; }
    setSavingEdit(true); setEditError("");
    try {
      const updated = await updateTask(editTask.id, {
        title: editTask.title.trim(), description: editTask.description,
        status: editTask.status, priority: editTask.priority,
        assignee_id: editTask.assignee_id || null, due_date: editTask.due_date || null,
      });
      setTasks((ts) => ts.map((t) => t.id === editTask.id ? updated : t));
      setEditTask(null);
    } catch (err) {
      setEditError(err.message || "Failed to save.");
    } finally { setSavingEdit(false); }
  };

  const handleDrop = (status) => {
    if (dragTask) { handleStatusChange(dragTask.id, status); setDragTask(null); setDragOver(null); }
  };

  const isOverdue = (due) => due && new Date(due) < new Date();

  // ── Dynamic style tokens ──────────────────────────────────────────────
  const page        = d ? "#0d0d1a" : "#f0f2ff";
  const navBg       = d ? "#13132a" : "#fff";
  const navBorder   = d ? "rgba(255,255,255,0.07)" : "#e5e7eb";
  const cardBg      = d ? "#1a1a2e" : "#fff";
  const cardBorder  = d ? "rgba(255,255,255,0.07)" : "#e5e7eb";
  const colBg       = d ? "#13132a" : "#f5f5fa";
  const colBorder   = d ? "rgba(255,255,255,0.06)" : "#e5e7eb";
  const textPrimary = d ? "#f0f0ff" : "#111";
  const textMuted   = d ? "rgba(255,255,255,0.45)" : "#888";
  const inputBg     = d ? "#0d0d1a" : "#f9fafb";
  const inputBorder = d ? "rgba(255,255,255,0.12)" : "#e5e7eb";
  const inputColor  = d ? "#f0f0ff" : "#111";

  if (loading) return (
    <div className="proj-page" style={{ background: page, color: textPrimary }}>
      <nav className="proj-nav" style={{ background: navBg, borderBottomColor: navBorder }}>
        <button className="back-btn" style={{ color: projectColor, borderColor: `${projectColor}40`, background: primaryLight }} onClick={() => navigate("/Dashboard")}>← Back</button>
        <div className="proj-nav-title" style={{ color: textPrimary }}>Loading...</div>
        <div />
      </nav>
      <div className="proj-loading">
        <div className="spinner" style={{ borderTopColor: projectColor }} />
        <p style={{ color: textMuted }}>Loading project...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="proj-page" style={{ background: page, color: textPrimary }}>
      <nav className="proj-nav" style={{ background: navBg, borderBottomColor: navBorder }}>
        <button className="back-btn" style={{ color: projectColor, borderColor: `${projectColor}40`, background: primaryLight }} onClick={() => navigate("/Dashboard")}>← Back</button>
        <div className="proj-nav-title" style={{ color: textPrimary }}>Error</div>
        <div />
      </nav>
      <div className="proj-error">
        <p style={{ color: textMuted }}>⚠️ {error}</p>
        <button className="btn-retry" style={{ color: projectColor }} onClick={loadData}>Try again</button>
      </div>
    </div>
  );

  return (
    <div className="proj-page" style={{ background: page, fontFamily: "'DM Sans', sans-serif" }}>

      {/* Navbar */}
      <nav className="proj-nav" style={{ background: navBg, borderBottomColor: navBorder }}>
        <button className="back-btn"
          style={{ color: projectColor, borderColor: `${projectColor}40`, background: primaryLight }}
          onClick={() => navigate("/Dashboard")}>← Back</button>
        <div className="proj-nav-title" style={{ color: textPrimary }}>
          <span className="proj-nav-dot" style={{ background: projectColor }} />
          {project?.name}
        </div>
        <div className="proj-nav-right" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ThemePicker />
          <button onClick={toggleDark} style={{
            background: d ? "rgba(255,255,255,0.08)" : "#f3f4f6",
            border: `1px solid ${d ? "rgba(255,255,255,0.14)" : "#e5e7eb"}`,
            borderRadius: 20, padding: "4px 11px", cursor: "pointer",
            fontSize: 12, color: d ? "#fff" : "#333",
            display: "flex", alignItems: "center", gap: 5,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {d ? "☀ Light" : "🌙 Dark"}
          </button>
          <span className="proj-task-count" style={{ background: primaryLight, color: projectColor, border: `1px solid ${primaryMid}` }}>
            {tasks.length} tasks
          </span>
        </div>
      </nav>

      {/* Project Header */}
      <div className="proj-header" style={{
        background: cardBg,
        borderColor: `${projectColor}55`,
        boxShadow: d ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
        borderLeftWidth: 4,
        borderLeftStyle: "solid",
      }}>
        <div className="proj-header-left">
          <h1 style={{ color: projectColor }}>{project?.name}</h1>
          <p className="proj-desc" style={{ color: textMuted }}>{project?.description || "No description"}</p>
          <div className="progress-wrap">
            <div className="progress-bar-bg" style={{ background: d ? "rgba(255,255,255,0.1)" : "#e5e7eb" }}>
              <div className="progress-bar-fill" style={{ width: `${progress}%`, background: projectColor }} />
            </div>
            <span className="progress-label" style={{ color: projectColor }}>
              {progress}% complete — {doneCount}/{tasks.length} tasks done
            </span>
          </div>
        </div>
        <button className="btn-add-task" style={{ background: projectColor, color: primaryFg, boxShadow: `0 3px 12px ${projectColor}55` }}
          onClick={() => { setShowForm(!showForm); setTaskError(""); }}>
          {showForm ? "× Cancel" : "+ Add Task"}
        </button>
      </div>

      {/* Toolbar */}
      <div className="proj-toolbar" style={{ background: cardBg, borderColor: colBorder }}>
        <div className="search-wrap" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
          <span className="search-icon" style={{ color: textMuted }}>🔍</span>
          <input className="search-input" placeholder="Search tasks..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ background: "transparent", color: inputColor }} />
          {search && <button className="search-clear" style={{ color: textMuted }} onClick={() => setSearch("")}>×</button>}
        </div>
        <div className="filter-row">
          {[
            { val: filterPriority, setter: setFilterPriority, opts: [["all","All Priorities"],["high","🔴 High"],["medium","🟡 Medium"],["low","🟢 Low"]] },
            { val: filterAssignee, setter: setFilterAssignee, opts: [["all","All Members"], ...MEMBERS.map(m => [m, m])] },
          ].map((f, i) => (
            <select key={i} className="filter-select" value={f.val} onChange={(e) => f.setter(e.target.value)}
              style={{ background: inputBg, color: inputColor, border: `1px solid ${inputBorder}` }}>
              {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
          {hasFilters && (
            <button className="filter-clear" style={{ color: projectColor, background: primaryLight, border: `1px solid ${primaryMid}` }}
              onClick={() => { setFilterPriority("all"); setFilterAssignee("all"); setSearch(""); }}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <div className="task-form-card" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: d ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.08)" }}>
          <h3 style={{ color: textPrimary }}>New Task</h3>
          {taskError && <div className="task-error" style={{ color: projectColor, borderColor: `${projectColor}40`, background: primaryLight }}>{taskError}</div>}
          <div className="task-form-grid">
            {[
              { field: "title", label: "Title *", type: "input", full: true, placeholder: "What needs to be done?" },
            ].map(({ field, label, full, placeholder }) => (
              <div key={field} className={`form-field ${full ? "full" : ""}`}>
                <label style={{ color: textMuted }}>{label}</label>
                <input className="task-input" placeholder={placeholder}
                  value={newTask[field]}
                  onChange={(e) => { setNewTask({ ...newTask, [field]: e.target.value }); setTaskError(""); }}
                  autoFocus onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                  style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: inputColor }} />
              </div>
            ))}
            <div className="form-field">
              <label style={{ color: textMuted }}>Status</label>
              <select className="task-select" value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: inputColor }}>
                {STATUS_COLS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label style={{ color: textMuted }}>Priority</label>
              <select className="task-select" value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: inputColor }}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
            <div className="form-field">
              <label style={{ color: textMuted }}>Due Date</label>
              <input className="task-input" type="date" value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: inputColor }} />
            </div>
            <div className="form-field">
              <label style={{ color: textMuted }}>Assign To</label>
              <select className="task-select" value={newTask.assignee_id}
                onChange={(e) => setNewTask({ ...newTask, assignee_id: e.target.value })}
                style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: inputColor }}>
                <option value="">Unassigned</option>
                {MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-field full">
              <label style={{ color: textMuted }}>Description / Note</label>
              <textarea className="task-input task-textarea" placeholder="Add context for the assignee..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} rows={2}
                style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: inputColor }} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-cancel-task"
              style={{ background: d ? "rgba(255,255,255,0.06)" : "#f3f4f6", border: `1px solid ${inputBorder}`, color: textMuted }}
              onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn-confirm-task"
              style={{ background: projectColor, color: primaryFg, boxShadow: `0 2px 10px ${projectColor}44` }}
              onClick={handleAddTask} disabled={adding}>
              {adding ? "Adding..." : "Add Task"}
            </button>
          </div>
        </div>
      )}

      {/* Empty board state */}
      {tasks.length === 0 && (
        <div className="board-empty" style={{ color: textMuted }}>
          <div className="board-empty-icon">📋</div>
          <h3 style={{ color: textPrimary }}>No tasks yet</h3>
          <p>Add your first task to get started.</p>
          <button className="btn-add-task" style={{ background: projectColor, color: primaryFg, marginTop: "1rem" }}
            onClick={() => setShowForm(true)}>+ Add Task</button>
        </div>
      )}

      {/* Kanban Board */}
      {tasks.length > 0 && (
        <div className="kanban-board">
          {STATUS_COLS.map((col) => (
            <div key={col}
              className={`kanban-col ${dragOver === col ? "drag-over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(col)}
              style={{
                background: colBg,
                border: `1px solid ${dragOver === col ? projectColor : colBorder}`,
                boxShadow: dragOver === col ? `0 0 0 2px ${projectColor}40` : "none",
              }}
            >
              <div className="kanban-col-header">
                <span className="col-title" style={{ color: textPrimary }}>{STATUS_LABEL[col]}</span>
                <span className="col-count"
                  style={tasksByStatus(col).length > 0
                    ? { background: primaryLight, color: projectColor, border: `1px solid ${primaryMid}` }
                    : { background: d ? "rgba(255,255,255,0.08)" : "#eee", color: textMuted }}>
                  {tasksByStatus(col).length}
                </span>
              </div>
              <div className="kanban-tasks">
                {tasksByStatus(col).length === 0 ? (
                  <div className="col-empty"
                    style={{ borderColor: dragOver === col ? projectColor : (d ? "rgba(255,255,255,0.1)" : "#ddd"), color: textMuted }}>
                    {hasFilters ? "No matching tasks" : "Drop tasks here"}
                  </div>
                ) : (
                  tasksByStatus(col).map((task) => (
                    <div key={task.id}
                      className={`task-card ${completingId === task.id ? "completing" : ""} ${task.status === "done" ? "task-done" : ""}`}
                      draggable onDragStart={() => setDragTask(task)}
                      style={{
                        background: cardBg,
                        border: `1px solid ${cardBorder}`,
                        boxShadow: d ? "none" : "0 2px 8px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div className="task-card-top">
                        <span className="priority-dot" style={{ background: PRIORITY_COLOR[task.priority] }} title={task.priority} />
                        <div className="task-actions">
                          <button className="task-edit"
                            style={{ color: textMuted, background: d ? "rgba(255,255,255,0.06)" : "#f5f5f5" }}
                            onClick={() => { setEditTask({ ...task }); setEditError(""); }} title="Edit">✏️</button>
                          <button className="task-delete"
                            style={{ color: "#ef4444", background: d ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.08)" }}
                            onClick={() => handleDeleteTask(task.id)} title="Delete">×</button>
                        </div>
                      </div>
                      <p className={`task-title ${task.status === "done" ? "strikethrough" : ""}`}
                        style={{ color: task.status === "done" ? textMuted : textPrimary }}>{task.title}</p>
                      {task.description && <p className="task-note" style={{ color: textMuted }}>📝 {task.description}</p>}
                      <div className="task-meta-row">
                        {task.assignee_id && (
                          <span className="task-assignee" style={{ background: primaryLight, color: projectColor, border: `1px solid ${primaryMid}` }}>
                            👤 {task.assignee_id}
                          </span>
                        )}
                        {task.due_date && (
                          <span className={`task-due ${isOverdue(task.due_date) && task.status !== "done" ? "overdue" : ""}`}
                            style={!(isOverdue(task.due_date) && task.status !== "done") ? { color: textMuted, background: d ? "rgba(255,255,255,0.06)" : "#f3f4f6" } : {}}>
                            📅 {new Date(task.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </span>
                        )}
                      </div>
                      <div className="task-card-bottom">
                        <select className="task-status-select" value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            borderColor: task.status === "done" ? "#10b981" : inputBorder,
                            background: inputBg, color: inputColor,
                          }}>
                          {STATUS_COLS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editTask && (
        <div className="modal-backdrop" onClick={() => setEditTask(null)}>
          <div className="modal edit-modal" onClick={(e) => e.stopPropagation()}
            style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: d ? "0 20px 60px rgba(0,0,0,0.5)" : "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div className="modal-header" style={{ borderBottomColor: colBorder }}>
              <h2 style={{ color: textPrimary }}>Edit Task</h2>
              <button className="modal-close" style={{ color: textMuted, background: d ? "rgba(255,255,255,0.08)" : "#f3f4f6" }} onClick={() => setEditTask(null)}>×</button>
            </div>
            <div className="modal-body">
              {editError && <div className="task-error" style={{ color: projectColor, borderColor: `${projectColor}40`, background: primaryLight }}>{editError}</div>}
              <div className="task-form-grid">
                <div className="form-field full">
                  <label style={{ color: textMuted }}>Title *</label>
                  <input className="task-input" value={editTask.title}
                    onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                    autoFocus style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: inputColor }} />
                </div>
                <div className="form-field">
                  <label style={{ color: textMuted }}>Status</label>
                  <select className="task-select" value={editTask.status}
                    onChange={(e) => setEditTask({ ...editTask, status: e.target.value })}
                    style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: inputColor }}>
                    {STATUS_COLS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label style={{ color: textMuted }}>Priority</label>
                  <select className="task-select" value={editTask.priority}
                    onChange={(e) => setEditTask({ ...editTask, priority: e.target.value })}
                    style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: inputColor }}>
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
                <div className="form-field">
                  <label style={{ color: textMuted }}>Due Date</label>
                  <input className="task-input" type="date" value={editTask.due_date || ""}
                    onChange={(e) => setEditTask({ ...editTask, due_date: e.target.value })}
                    style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: inputColor }} />
                </div>
                <div className="form-field">
                  <label style={{ color: textMuted }}>Assign To</label>
                  <select className="task-select" value={editTask.assignee_id || ""}
                    onChange={(e) => setEditTask({ ...editTask, assignee_id: e.target.value })}
                    style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: inputColor }}>
                    <option value="">Unassigned</option>
                    {MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-field full">
                  <label style={{ color: textMuted }}>Description / Note</label>
                  <textarea className="task-input task-textarea" value={editTask.description || ""}
                    onChange={(e) => setEditTask({ ...editTask, description: e.target.value })} rows={3}
                    style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: inputColor }} />
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ borderTopColor: colBorder }}>
              <button className="btn-cancel"
                style={{ background: d ? "rgba(255,255,255,0.06)" : "#f3f4f6", border: `1px solid ${inputBorder}`, color: textMuted }}
                onClick={() => setEditTask(null)}>Cancel</button>
              <button className="btn-submit"
                style={{ background: projectColor, color: primaryFg, boxShadow: `0 2px 10px ${projectColor}44` }}
                onClick={handleSaveEdit} disabled={savingEdit}>
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}