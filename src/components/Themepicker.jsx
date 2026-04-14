import { useTheme } from "../context/ThemeContext";

// Returns '#fff' for dark primaries, '#1a1a2e' for light ones
function getSidebarFg(hex) {
  if (!hex || hex.length < 7) return "#fff";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#1a1a2e" : "#ffffff";
}

export default function ThemePicker() {
  const { themeKey, setThemeKey, THEMES, theme } = useTheme();

  const fg = getSidebarFg(theme?.primary || "#7c3aed");

  return (
    <div style={{
      display: "flex",
      gap: 6,
      padding: "7px 10px",
      background: fg === "#ffffff" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
      borderRadius: 8,
      border: `1px solid ${fg === "#ffffff" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}`,
      alignItems: "center",
    }}>
      <span style={{ fontSize: 10, color: fg === "#ffffff" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)", marginRight: 2, whiteSpace: "nowrap", letterSpacing: "0.5px" }}>
        Theme
      </span>
      {Object.entries(THEMES).map(([key, t]) => (
        <div
          key={key}
          onClick={() => setThemeKey(key)}
          title={key.charAt(0).toUpperCase() + key.slice(1)}
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: t.primary,
            cursor: "pointer",
            flexShrink: 0,
            border: themeKey === key
              ? `2px solid ${fg}`
              : "2px solid transparent",
            boxShadow: themeKey === key ? `0 0 0 1px ${t.primary}` : "none",
            transition: "transform 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.25)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        />
      ))}
    </div>
  );
}