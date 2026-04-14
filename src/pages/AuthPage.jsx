import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginUser, registerUser, isAuthenticated } from "../api/api";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [flipping, setFlipping] = useState(false);
  const [loginData, setLoginData] = useState({ email: "test@example.com", password: "" });
  const [regData, setRegData] = useState({ name: "", email: "", password: "" });
  const [loginErrors, setLoginErrors] = useState({});
  const [regErrors, setRegErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated()) navigate("/dashboard", { replace: true });
  }, [navigate]);

  const from = location.state?.from?.pathname || "/dashboard";

  const switchSide = () => {
    if (flipping) return;
    setFlipping(true);
    setTimeout(() => {
      setIsLogin((v) => !v);
      setFlipping(false);
    }, 350); // halfway through the 700ms flip
  };

  // ── Login handlers ──
  const validateLogin = () => {
    const e = {};
    if (!loginData.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(loginData.email)) e.email = "Invalid email";
    if (!loginData.password) e.password = "Password is required";
    return e;
  };

  const handleLogin = async (evt) => {
    evt.preventDefault();
    const ve = validateLogin();
    if (Object.keys(ve).length) { setLoginErrors(ve); return; }
    setLoginErrors({});
    setLoading(true);
    try {
      await loginUser(loginData);
      navigate(from, { replace: true });
    } catch (err) {
      setLoginErrors({ general: err.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginChange = (field) => (e) => {
    setLoginData({ ...loginData, [field]: e.target.value });
    if (loginErrors[field]) setLoginErrors({ ...loginErrors, [field]: "" });
  };

  // ── Register handlers ──
  const validateReg = () => {
    const e = {};
    if (!regData.name.trim()) e.name = "Name is required";
    if (!regData.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(regData.email)) e.email = "Invalid email";
    if (!regData.password) e.password = "Password is required";
    else if (regData.password.length < 6) e.password = "Minimum 6 characters";
    return e;
  };

  const handleRegister = async (evt) => {
    evt.preventDefault();
    const ve = validateReg();
    if (Object.keys(ve).length) { setRegErrors(ve); return; }
    setRegErrors({});
    setLoading(true);
    try {
      await registerUser(regData);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setRegErrors({ general: err.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  const handleRegChange = (field) => (e) => {
    setRegData({ ...regData, [field]: e.target.value });
    if (regErrors[field]) setRegErrors({ ...regErrors, [field]: "" });
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={s.wrap}>
        <div className={`auth-card ${flipping ? "flipping" : ""}`}>

          {isLogin ? (
            <>
              {/* LOGIN: Hero left, Form right */}
              <div style={{ ...s.hero, borderRadius: "12px 0 0 12px" }}>
                <div>
                  <h1 style={s.heroTitle}>Welcome back</h1>
                  <p style={s.heroSub}>
                    Manage projects, track tasks, and collaborate — all in one place.
                  </p>
                  <button style={s.heroBtn} onClick={switchSide}>
                    Create an account →
                  </button>
                </div>
              </div>

              <div style={s.formSide}>
                <div style={s.logo}><span style={s.logoDot} />TaskFlow</div>
                <h2 style={s.heading}>Sign in</h2>
                <p style={s.sub}>Continue to your workspace</p>

                <div style={s.seed} onClick={() => setLoginData({ email: "test@example.com", password: "password123" })}>
                  <span style={{ fontSize: 14 }}>🔑</span>
                  <span style={{ fontSize: 11 }}>Test credentials: <strong>test@example.com</strong></span>
                </div>

                {loginErrors.general && <div style={s.errorBanner}>{loginErrors.general}</div>}

                <form onSubmit={handleLogin} noValidate>
                  <div style={s.field}>
                    <input style={{ ...s.input, ...(loginErrors.email ? s.inputError : {}) }}
                      type="email" placeholder="Email address"
                      value={loginData.email} onChange={handleLoginChange("email")} disabled={loading} />
                    {loginErrors.email && <span style={s.fieldError}>{loginErrors.email}</span>}
                  </div>
                  <div style={s.field}>
                    <input style={{ ...s.input, ...(loginErrors.password ? s.inputError : {}) }}
                      type="password" placeholder="Password"
                      value={loginData.password} onChange={handleLoginChange("password")} disabled={loading} />
                    {loginErrors.password && <span style={s.fieldError}>{loginErrors.password}</span>}
                  </div>
                  <a style={s.forgot} href="#">Forgot your password?</a>
                  <button style={s.btn} type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </form>

                <p style={s.switchText}>
                  Don't have an account?{" "}
                  <span style={s.link} onClick={switchSide}>Sign up</span>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* REGISTER: Hero left, Form right */}
              <div style={{ ...s.hero, borderRadius: "12px 0 0 12px" }}>
                <div>
                  <h1 style={s.heroTitle}>Hello,{"\n"}friend!</h1>
                  <p style={s.heroSub}>
                    Enter your details and start your journey with TaskFlow today.
                  </p>
                  <button style={s.heroBtn} onClick={switchSide}>
                    Already have an account →
                  </button>
                </div>
              </div>

              <div style={s.formSide}>
                <div style={s.logo}><span style={s.logoDot} />TaskFlow</div>
                <h2 style={s.heading}>Create account</h2>
                <p style={s.sub}>Join TaskFlow and start managing your projects</p>

                {regErrors.general && <div style={s.errorBanner}>{regErrors.general}</div>}

                <form onSubmit={handleRegister} noValidate>
                  <div style={s.field}>
                    <input style={{ ...s.input, ...(regErrors.name ? s.inputError : {}) }}
                      type="text" placeholder="Full name"
                      value={regData.name} onChange={handleRegChange("name")} disabled={loading} />
                    {regErrors.name && <span style={s.fieldError}>{regErrors.name}</span>}
                  </div>
                  <div style={s.field}>
                    <input style={{ ...s.input, ...(regErrors.email ? s.inputError : {}) }}
                      type="email" placeholder="Email address"
                      value={regData.email} onChange={handleRegChange("email")} disabled={loading} />
                    {regErrors.email && <span style={s.fieldError}>{regErrors.email}</span>}
                  </div>
                  <div style={s.field}>
                    <input style={{ ...s.input, ...(regErrors.password ? s.inputError : {}) }}
                      type="password" placeholder="Password (min 6 characters)"
                      value={regData.password} onChange={handleRegChange("password")} disabled={loading} />
                    {regErrors.password && <span style={s.fieldError}>{regErrors.password}</span>}
                  </div>
                  <button style={s.btn} type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Create account"}
                  </button>
                </form>

                <p style={s.switchText}>
                  Already have an account?{" "}
                  <span style={s.link} onClick={switchSide}>Sign in</span>
                </p>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}

const INDIGO = "#4f46e5";

const CSS = `
  .auth-card {
    display: flex;
    width: 100%;
    max-width: 640px;
    border-radius: 12px;
    border: 0.5px solid #e0e0e0;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 2px 16px rgba(0,0,0,0.07);
    transform-style: preserve-3d;
    transition: transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1);
  }
  .auth-card.flipping {
    transform: rotateY(90deg) scale(0.95);
  }
`;

const s = {
  wrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#f5f5f5",
    padding: "2rem 1rem",
    perspective: "1200px",
  },
  hero: {
    flex: "0 0 200px",
    background: INDIGO,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 500,
    color: "#fff",
    lineHeight: 1.3,
    marginBottom: 8,
    whiteSpace: "pre-line",
  },
  heroSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 1.5,
    marginBottom: 14,
  },
  heroBtn: {
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    border: "0.5px solid rgba(255,255,255,0.4)",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 12,
    cursor: "pointer",
  },
  formSide: {
    flex: 1,
    padding: "1.5rem",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    marginBottom: "1rem",
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: INDIGO,
    flexShrink: 0,
    display: "inline-block",
  },
  heading: { fontSize: 18, fontWeight: 500, marginBottom: 4 },
  sub: { fontSize: 12, color: "#888", marginBottom: 12 },
  seed: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#f9f9f9",
    border: "0.5px solid #e0e0e0",
    borderRadius: 8,
    padding: "7px 10px",
    marginBottom: 12,
    cursor: "pointer",
  },
  errorBanner: {
    background: "#fef2f2",
    border: "0.5px solid #fca5a5",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 12,
    color: "#b91c1c",
    marginBottom: 10,
  },
  field: { marginBottom: 10 },
  input: {
    width: "100%",
    height: 34,
    padding: "0 10px",
    fontSize: 13,
    border: "0.5px solid #e0e0e0",
    borderRadius: 8,
    outline: "none",
    boxSizing: "border-box",
  },
  inputError: { borderColor: "#f87171" },
  fieldError: { fontSize: 11, color: "#b91c1c", marginTop: 3, display: "block" },
  forgot: {
    fontSize: 11,
    color: INDIGO,
    textDecoration: "none",
    display: "block",
    textAlign: "right",
    marginBottom: 12,
  },
  btn: {
    width: "100%",
    height: 34,
    background: INDIGO,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    marginBottom: 12,
  },
  switchText: { fontSize: 12, color: "#888", textAlign: "center" },
  link: { color: INDIGO, cursor: "pointer", textDecoration: "underline" },
};