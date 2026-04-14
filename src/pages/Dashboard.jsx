import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, logout, fetchProjects, createProject, deleteProject } from "../api/api";
import { useTheme } from "../context/ThemeContext";
import ThemePicker from "../components/ThemePicker";

const COLORS = ["#e02455", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

// Returns '#fff' for dark primaries, '#1a1a2e' for light ones
function getSidebarFg(hex) {
  if (!hex || hex.length < 7) return "#fff";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#1a1a2e" : "#ffffff";
}

function alphaOf(fg, lightAlpha, darkAlpha) {
  return fg === "#ffffff"
    ? `rgba(255,255,255,${lightAlpha})`
    : `rgba(0,0,0,${darkAlpha})`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getMe();
  const { theme, darkMode, toggleDark } = useTheme();

  const [projects, setProjects]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView]   = useState("dashboard");
  const [settingsTab, setSettingsTab] = useState("general");
  const [newProject, setNewProject]   = useState({ name: "", description: "", color: "#e02455" });

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch {
      console.log("Error loading projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newProject.name.trim()) return;
    try {
      const project = await createProject(newProject);
      setProjects([...projects, { ...project, task_count: 0, done_count: 0 }]);
      setShowModal(false);
      setNewProject({ name: "", description: "", color: "#e02455" });
    } catch {
      alert("Failed to create project");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete project?")) return;
    setProjects(projects.filter(p => p.id !== id));
    try { await deleteProject(id); }
    catch { alert("Delete failed"); }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const getProgress = (p) =>
    p.task_count ? Math.round((p.done_count / p.task_count) * 100) : 0;

  const totalTasks = projects.reduce((a, p) => a + (p.task_count || 0), 0);
  const totalDone  = projects.reduce((a, p) => a + (p.done_count || 0), 0);
  const overallPct = totalTasks ? Math.round((totalDone / totalTasks) * 100) : 0;

  const d = darkMode;

  // ── Sidebar contrast tokens derived from active theme primary ──
  const primaryHex    = theme?.primary || "#7c3aed";
  const sidebarFg     = getSidebarFg(primaryHex);
  const sidebarMuted  = alphaOf(sidebarFg, 0.55, 0.45);
  const sidebarSection= alphaOf(sidebarFg, 0.40, 0.35);
  const sidebarHoverBg= alphaOf(sidebarFg, 0.12, 0.07);
  const sidebarActiveBg = alphaOf(sidebarFg, 0.22, 0.12);
  const sidebarDivider  = alphaOf(sidebarFg, 0.15, 0.10);
  const sidebarDotColor = alphaOf(sidebarFg, 0.75, 0.55);

  const topbarBg     = d ? "var(--primary-dim)" : "#fff";
  const topbarBorder = d ? "var(--primary-border)" : "#e5e7eb";

  const navItem = (icon, label, view) => {
    const isActive = view === activeView;
    return (
      <div
        key={label}
        onClick={() => setActiveView(view)}
        style={{
          display: "flex", alignItems: "center", gap: 9,
          padding: "8px 10px", borderRadius: 8, marginBottom: 2,
          cursor: "pointer", fontSize: 13, whiteSpace: "nowrap",
          background: isActive ? sidebarActiveBg : "transparent",
          borderLeft: isActive ? `3px solid ${sidebarFg}` : "3px solid transparent",
          color: isActive ? sidebarFg : sidebarMuted,
          fontWeight: isActive ? 600 : 400,
          transition: "all 0.18s",
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = sidebarHoverBg; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
      >
        <span style={{ fontSize: 14, width: 18, textAlign: "center", flexShrink: 0, color: isActive ? sidebarFg : sidebarMuted }}>{icon}</span>
        {label}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: d ? "#0d0d1a" : "#f0f2ff", fontFamily: "'DM Sans', sans-serif", transition: "background 0.3s" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? 220 : 0,
        minWidth: sidebarOpen ? 220 : 0,
        padding: sidebarOpen ? "1.4rem 1rem" : 0,
        background: "var(--primary)",
        color: sidebarFg,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        flexShrink: 0,
        boxShadow: "4px 0 24px rgba(0,0,0,0.18)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 17, fontWeight: 700, marginBottom: "1.6rem", whiteSpace: "nowrap", color: sidebarFg }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: alphaOf(sidebarFg, 0.9, 0.7), display: "inline-block", flexShrink: 0 }} />
          TaskFlow
        </div>

        {/* Main nav */}
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "1.5px", color: sidebarSection, margin: "0 0 5px 3px", whiteSpace: "nowrap" }}>MAIN</div>
        {navItem("⬛", "Dashboard", "dashboard")}
        {navItem("⚙", "Settings", "settings")}

        {/* Projects */}
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "1.5px", color: sidebarSection, margin: "1.1rem 0 5px 3px", whiteSpace: "nowrap" }}>PROJECTS</div>
        {projects.slice(0, 5).map((p) => (
          <div key={p.id}
            onClick={() => navigate(`/project/${p.id}`)}
            style={{ fontSize: 12, padding: "5px 10px", color: sidebarMuted, cursor: "pointer", whiteSpace: "nowrap", borderRadius: 6, transition: "background 0.15s", display: "flex", alignItems: "center", gap: 7 }}
            onMouseEnter={e => e.currentTarget.style.background = sidebarHoverBg}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: sidebarDotColor, flexShrink: 0 }} />
            {p.name}
          </div>
        ))}
        <div
          style={{ fontSize: 12, padding: "5px 10px", color: sidebarMuted, cursor: "pointer", whiteSpace: "nowrap", transition: "color 0.15s" }}
          onClick={() => setShowModal(true)}
          onMouseEnter={e => e.currentTarget.style.color = sidebarFg}
          onMouseLeave={e => e.currentTarget.style.color = sidebarMuted}
        >
          + New project
        </div>

        <div style={{ height: 1, background: sidebarDivider, margin: "0.9rem 0" }} />

        {/* Bottom */}
        <div style={{ marginTop: "auto", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: 7 }}>
          {/* Progress card */}
          <div style={{ background: alphaOf(sidebarFg, 0.15, 0.08), border: `1px solid ${alphaOf(sidebarFg, 0.2, 0.1)}`, borderRadius: 10, padding: "10px 12px", whiteSpace: "nowrap" }}>
            <div style={{ fontSize: 11, color: alphaOf(sidebarFg, 0.7, 0.55), marginBottom: 3 }}>Monthly progress</div>
            <div style={{ fontSize: 10, color: alphaOf(sidebarFg, 0.5, 0.35), marginBottom: 8 }}>Based on completed tasks</div>
            <div style={{ height: 4, background: alphaOf(sidebarFg, 0.2, 0.12), borderRadius: 10, marginBottom: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${overallPct}%`, background: sidebarFg, borderRadius: 10, transition: "width 0.5s" }} />
            </div>
            <div style={{ fontSize: 10, color: alphaOf(sidebarFg, 0.6, 0.45) }}>{overallPct}% complete</div>
          </div>

          <ThemePicker />

          <button onClick={handleLogout} style={{
            background: alphaOf(sidebarFg, 0.0, 0.0),
            border: `1px solid ${alphaOf(sidebarFg, 0.22, 0.15)}`,
            padding: "8px", borderRadius: 7, color: sidebarFg, cursor: "pointer",
            fontSize: 12.5, fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap",
            transition: "background 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = alphaOf(sidebarFg, 0.12, 0.07)}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            ↩ Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Topbar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0.8rem 1.4rem",
          background: topbarBg,
          borderBottom: `1px solid ${topbarBorder}`,
          transition: "background 0.3s, border-color 0.3s",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setSidebarOpen(v => !v)}
              style={{
                background: d ? "rgba(255,255,255,0.12)" : "var(--primary-dim)",
                border: `1px solid ${d ? "rgba(255,255,255,0.2)" : "var(--primary-border)"}`,
                borderRadius: 8, width: 33, height: 33, cursor: "pointer",
                color: d ? "#fff" : "var(--primary)", fontSize: 12,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
            >
              {sidebarOpen ? "◀" : "▶"}
            </button>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: d ? "#fff" : "#111", margin: 0, whiteSpace: "nowrap" }}>
              {activeView === "settings" ? "Settings" : `Welcome back, ${user?.name || "User"} 👋`}
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={toggleDark} style={{
              background: d ? "rgba(255,255,255,0.12)" : "#f3f4f6",
              border: `1px solid ${d ? "rgba(255,255,255,0.2)" : "#e5e7eb"}`,
              borderRadius: 20, padding: "5px 12px", cursor: "pointer",
              fontSize: 12, color: d ? "#fff" : "#333",
              display: "flex", alignItems: "center", gap: 6,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {d ? "☀ Light" : "🌙 Dark"}
            </button>
            {activeView === "dashboard" && (
              <button onClick={() => setShowModal(true)} style={{
                background: "var(--primary)",
                border: "none", borderRadius: 8, padding: "7px 14px",
                color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 3px 10px var(--primary-glow)",
              }}>
                + New Project
              </button>
            )}
            <div style={{
              width: 31, height: 31, borderRadius: "50%", background: "var(--primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: sidebarFg, fontSize: 13, fontWeight: 700, flexShrink: 0,
              boxShadow: "0 2px 8px var(--primary-glow)",
            }}>
              {(user?.name || "U")[0].toUpperCase()}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.4rem" }}>

          {/* ── Dashboard ── */}
          {activeView === "dashboard" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.9rem", marginBottom: "1.5rem" }}>
                {[
                  { label: "Projects",    value: projects.length, gradient: "linear-gradient(135deg, var(--primary), #8b5cf6)" },
                  { label: "Total Tasks", value: totalTasks,       gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)" },
                  { label: "Completed",   value: totalDone,        gradient: "linear-gradient(135deg, #10b981, #06b6d4)" },
                  { label: "Progress",    value: `${overallPct}%`, gradient: "linear-gradient(135deg, #f59e0b, #ef4444)" },
                ].map(({ label, value, gradient }) => (
                  <div key={label} style={{ background: gradient, borderRadius: 13, padding: "1rem 1.2rem", color: "#fff", boxShadow: "0 4px 18px rgba(0,0,0,0.18)" }}>
                    <div style={{ fontSize: 9.5, opacity: 0.75, letterSpacing: "1.2px", marginBottom: 5 }}>{label.toUpperCase()}</div>
                    <div style={{ fontSize: 26, fontWeight: 700 }}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 10, letterSpacing: "1.4px", fontWeight: 700, marginBottom: 10, color: d ? "rgba(255,255,255,0.35)" : "#999" }}>
                PROJECTS
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "0.9rem" }}>
                {projects.map((p, i) => {
                  const progress = getProgress(p);
                  const color = COLORS[i % COLORS.length];
                  return (
                    <div key={p.id}
                      onClick={() => navigate(`/project/${p.id}`)}
                      style={{
                        background: d ? "#1a1a2e" : "#fff",
                        borderRadius: 13, overflow: "hidden", cursor: "pointer",
                        border: `1px solid ${d ? "rgba(255,255,255,0.06)" : "#e5e7eb"}`,
                        boxShadow: d ? "0 4px 18px rgba(0,0,0,0.25)" : "0 3px 14px rgba(0,0,0,0.05)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 26px ${color}44`; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = d ? "0 4px 18px rgba(0,0,0,0.25)" : "0 3px 14px rgba(0,0,0,0.05)"; }}
                    >
                      <div style={{ height: 74, background: `linear-gradient(135deg, ${color}, ${color}99)`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 12px" }}>
                        <div style={{ width: 35, height: 35, borderRadius: 9, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", fontWeight: 700 }}>
                          {p.name[0].toUpperCase()}
                        </div>
                        <button onClick={(e) => handleDelete(p.id, e)} style={{ background: "rgba(0,0,0,0.22)", border: "none", color: "#fff", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                      </div>
                      <div style={{ padding: "11px 13px" }}>
                        <div style={{ fontWeight: 600, fontSize: 13.5, color: d ? "#fff" : "#111", marginBottom: 3 }}>{p.name}</div>
                        <div style={{ fontSize: 11.5, color: d ? "rgba(255,255,255,0.38)" : "#888", marginBottom: 9, lineHeight: 1.4 }}>{p.description || "No description"}</div>
                        <div style={{ height: 4, background: d ? "rgba(255,255,255,0.12)" : "#eee", borderRadius: 10, marginBottom: 5, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${progress}%`, background: color, borderRadius: 10, transition: "width 0.5s" }} />
                        </div>
                        <div style={{ fontSize: 10.5, color: d ? "rgba(255,255,255,0.35)" : "#999" }}>
                          {progress}% completed · {p.task_count || 0} tasks
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Settings ── */}
          {activeView === "settings" && (
            <Settings d={d} theme={theme} toggleDark={toggleDark} settingsTab={settingsTab} setSettingsTab={setSettingsTab} />
          )}
        </div>
      </main>

      {/* ── Modal ── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" }}>
          <div style={{ background: d ? "#1a1a2e" : "#fff", borderRadius: 16, padding: "1.7rem", width: 330, border: "1px solid var(--primary-border)", boxShadow: "0 20px 55px rgba(0,0,0,0.4)" }}>
            <h3 style={{ marginBottom: "1rem", color: d ? "#fff" : "#111", fontSize: 17 }}>New Project</h3>

            {["name", "description"].map(field => (
              <input key={field}
                placeholder={field === "name" ? "Project Name" : "Description (optional)"}
                value={newProject[field]}
                onChange={e => setNewProject({ ...newProject, [field]: e.target.value })}
                style={{
                  width: "100%", padding: "8px 11px", marginBottom: 9,
                  borderRadius: 8, border: `1px solid ${d ? "rgba(255,255,255,0.15)" : "#e5e7eb"}`,
                  background: d ? "#0d0d1a" : "#f9f9f9",
                  color: d ? "#fff" : "#111", fontSize: 13,
                  boxSizing: "border-box", outline: "none", fontFamily: "'DM Sans', sans-serif",
                }}
              />
            ))}

            <div style={{ display: "flex", gap: 7, marginBottom: "1.2rem" }}>
              {COLORS.map(c => (
                <div key={c} onClick={() => setNewProject({ ...newProject, color: c })}
                  style={{
                    width: 22, height: 22, borderRadius: "50%", background: c, cursor: "pointer",
                    border: newProject.color === c ? `2px solid ${d ? "#fff" : "#111"}` : "2px solid transparent",
                    transition: "transform 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                />
              ))}
            </div>

            <div style={{ display: "flex", gap: 7 }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: "8px", borderRadius: 8,
                background: d ? "rgba(255,255,255,0.08)" : "#f3f4f6",
                border: `1px solid ${d ? "rgba(255,255,255,0.12)" : "#e5e7eb"}`,
                color: d ? "#fff" : "#333", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
              }}>Cancel</button>
              <button onClick={handleCreate} style={{
                flex: 1, padding: "8px", borderRadius: 8,
                background: "var(--primary)",
                border: "none", color: sidebarFg, cursor: "pointer", fontSize: 13, fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
              }}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Settings ── */
function Settings({ d, theme, toggleDark, settingsTab, setSettingsTab }) {
  const { themeKey, setThemeKey, THEMES } = useTheme();

  const cardBg     = d ? "#1a1a2e" : "#fff";
  const cardBorder = d ? "rgba(255,255,255,0.06)" : "#e5e7eb";
  const rowBorder  = d ? "rgba(255,255,255,0.04)" : "#f3f4f6";
  const textColor  = d ? "#fff" : "#111";
  const mutedColor = d ? "rgba(255,255,255,0.38)" : "#6b7280";
  const labelColor = d ? "rgba(255,255,255,0.35)" : "#9ca3af";
  const inputBg    = d ? "#0d0d1a" : "#f9fafb";
  const inputBorder= d ? "rgba(255,255,255,0.15)" : "#e5e7eb";

  const sectionLabel = (text) => (
    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "1.4px", color: labelColor, marginBottom: 10 }}>{text}</div>
  );

  const card = (children) => (
    <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 13, overflow: "hidden", marginBottom: "1.75rem" }}>
      {children}
    </div>
  );

  const row = (label, sub, control, last = false) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 17px", borderBottom: last ? "none" : `1px solid ${rowBorder}` }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: textColor, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12, color: mutedColor }}>{sub}</div>
      </div>
      {control}
    </div>
  );

  const Toggle = ({ defaultChecked = false, onChange }) => {
    const [on, setOn] = useState(defaultChecked);
    return (
      <div onClick={() => { setOn(v => !v); onChange && onChange(!on); }} style={{
        width: 40, height: 22, borderRadius: 22,
        background: on ? "var(--primary)" : (d ? "rgba(255,255,255,0.2)" : "#d1d5db"),
        position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
      }}>
        <div style={{
          position: "absolute", top: 3, left: on ? 21 : 3,
          width: 16, height: 16, borderRadius: "50%", background: "#fff",
          transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }} />
      </div>
    );
  };

  const sel = { fontSize: 13, padding: "5px 8px", borderRadius: 7, border: `1px solid ${inputBorder}`, background: inputBg, color: textColor, cursor: "pointer", outline: "none", fontFamily: "'DM Sans', sans-serif" };
  const inp = { fontSize: 13, padding: "6px 10px", borderRadius: 7, border: `1px solid ${inputBorder}`, background: inputBg, color: textColor, outline: "none", fontFamily: "'DM Sans', sans-serif" };

  const TABS = ["General", "Notifications", "Account"];

  return (
    <>
      <div style={{ display: "flex", gap: 4, padding: 4, background: d ? "rgba(255,255,255,0.06)" : "#f3f4f6", borderRadius: 10, marginBottom: "1.75rem", width: "fit-content" }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setSettingsTab(tab.toLowerCase())}
            style={{
              padding: "6px 18px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 13, fontFamily: "'DM Sans', sans-serif",
              background: settingsTab === tab.toLowerCase() ? (d ? "#1a1a2e" : "#fff") : "transparent",
              color: settingsTab === tab.toLowerCase() ? textColor : mutedColor,
              boxShadow: settingsTab === tab.toLowerCase() ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              fontWeight: settingsTab === tab.toLowerCase() ? 600 : 400,
              transition: "all 0.2s",
            }}>
            {tab}
          </button>
        ))}
      </div>

      {settingsTab === "general" && (
        <>
          {sectionLabel("APPEARANCE")}
          {card(<>
            {row("Dark mode", "Use dark theme across the app", <Toggle defaultChecked={d} onChange={toggleDark} />)}
            {row("Accent color", "Pick your primary theme color",
              <div style={{ display: "flex", gap: 7 }}>
                {Object.entries(THEMES).map(([key, t]) => (
                  <div key={key} onClick={() => setThemeKey(key)}
                    style={{
                      width: 21, height: 21, borderRadius: "50%", background: t.primary, cursor: "pointer", flexShrink: 0,
                      border: themeKey === key ? `2px solid ${d ? "#fff" : "#111"}` : "2px solid transparent",
                      transition: "transform 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                  />
                ))}
              </div>
            )}
            {row("Language", "Interface display language",
              <select style={sel}><option>English</option><option>Tamil</option><option>Hindi</option><option>French</option></select>
            )}
            {row("Default project view", "How projects are displayed",
              <select style={sel}><option>Grid</option><option>List</option><option>Kanban</option></select>,
              true
            )}
          </>)}
        </>
      )}

      {settingsTab === "notifications" && (
        <>
          {sectionLabel("ALERTS")}
          {card(<>
            {[
              ["Email notifications", "Get updates via email"],
              ["Task reminders", "Reminders before due dates"],
              ["Project updates", "When teammates make changes"],
              ["Weekly digest", "Summary of activity each week"],
            ].map(([label, sub], i, arr) =>
              row(label, sub, <Toggle defaultChecked={true} />, i === arr.length - 1)
            )}
          </>)}
        </>
      )}

      {settingsTab === "account" && (
        <>
          {sectionLabel("PROFILE")}
          {card(<>
            {row("Display name", "How your name appears to others", <input style={{ ...inp, width: 140 }} defaultValue="User" />)}
            {row("Email address", "Used for login and notifications", <input type="email" style={{ ...inp, width: 190 }} defaultValue="user@example.com" />, true)}
          </>)}

          {sectionLabel("SECURITY")}
          {card(<>
            {row("Change password", "Update your login password",
              <button style={{ padding: "7px 14px", borderRadius: 7, fontSize: 13, background: "var(--primary-dim)", border: "1px solid var(--primary-border)", color: "var(--primary)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Update</button>
            )}
            {row("Two-factor auth", "Extra security for your account", <Toggle />, true)}
          </>)}

          {sectionLabel("DANGER ZONE")}
          {card(
            row("Delete account", "Permanently remove your account and all data",
              <button style={{ padding: "7px 14px", borderRadius: 7, fontSize: 13, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Delete</button>,
              true
            )
          )}
        </>
      )}
    </>
  );
}