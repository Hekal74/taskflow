import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser, isAuthenticated } from "../api/api";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "test@example.com",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sliding, setSliding] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated()) navigate("/dashboard", { replace: true });
  }, [navigate]);

  const from = location.state?.from?.pathname || "/dashboard";

  const slide = () => {
    if (sliding) return;
    setSliding(true);
    setTimeout(() => navigate("/register"), 500);
  };

  const validate = () => {
    const e = {};
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      e.email = "Invalid email";
    if (!formData.password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length) {
      setErrors(ve);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await loginUser(formData);
      navigate(from, { replace: true });
    } catch (err) {
      console.log(err);
      setErrors({ general: err.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  return (
    <>
      <style>{CSS}</style>

      <div style={s.wrap}>
        <div style={s.card}>

          {/* LEFT FORM */}
          <div style={s.formSide}>
            <div style={s.logo}>
              <span style={s.logoDot} /> TaskFlow
            </div>

            <h2 style={s.heading}>Sign in</h2>
            <p style={s.sub}>Continue to your workspace</p>

            <div
              style={s.seed}
              onClick={() =>
                setFormData({
                  email: "test@example.com",
                  password: "password123",
                })
              }
            >
              🔑 Test credentials
            </div>

            {errors.general && (
              <div style={s.errorBanner}>{errors.general}</div>
            )}

            <form onSubmit={handleSubmit} noValidate style={s.form}>
              <div style={s.field}>
                <input
                  style={{
                    ...s.input,
                    ...(errors.email ? s.inputError : {}),
                  }}
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange("email")}
                  disabled={loading}
                />
                {errors.email && (
                  <span style={s.fieldError}>{errors.email}</span>
                )}
              </div>

              <div style={s.field}>
                <input
                  style={{
                    ...s.input,
                    ...(errors.password ? s.inputError : {}),
                  }}
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange("password")}
                  disabled={loading}
                />
                {errors.password && (
                  <span style={s.fieldError}>{errors.password}</span>
                )}
              </div>

              <a style={s.forgot} href="#">
                Forgot your password?
              </a>

              <button style={s.btn} type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p style={s.switchText}>
              Don't have an account?{" "}
              <span style={s.link} onClick={slide}>
                Sign up
              </span>
            </p>
          </div>

          {/* RIGHT HERO */}
          <div className={`hero-panel${sliding ? " slide-left" : ""}`}>
            <div className="hero-circles" />
            <div className="hero-circle-sm" />

            <div style={s.heroInner}>
              <h1 style={s.heroTitle}>
                Hey,{"\n"}Welcome{"\n"}Back.
              </h1>

              <p style={s.heroSub}>
                Manage projects, track tasks, and collaborate — all in one place.
              </p>

              <button style={s.heroBtn} onClick={slide}>
                Create an account →
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

/* FIXED CSS */
const CSS = `
.hero-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 45%;
  height: 100%;
  background: linear-gradient(135deg, #a855f7, #6d28d9);
  border-radius: 0 12px 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  transition: transform 0.5s ease;
  z-index: 2;
}
.hero-panel.slide-left {
  transform: translateX(-125%);
}
.hero-circles {
  position: absolute;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: #c084fc;
  top: -40px;
  right: -40px;
  opacity: 0.7;
}
.hero-circle-sm {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #a855f7;
  bottom: 20px;
  right: 20px;
  opacity: 0.5;
}
`;

/* FIXED STYLES */
const s = {
  wrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#f3f0ff",
    padding: "2rem 1rem",
  },

  card: {
    position: "relative",
    display: "flex",
    width: "100%",
    maxWidth: 700,
    height: 420,
    borderRadius: 12,
    overflow: "hidden",
    background: "#fff",
    boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
  },

  formSide: {
    flex: "0 0 55%",   // ✅ FIXED WIDTH
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "2rem",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  logo: {
    fontSize: 13,
    marginBottom: 10,
  },

  logoDot: {
    width: 8,
    height: 8,
    background: "#7c3aed",
    borderRadius: "50%",
    display: "inline-block",
    marginRight: 5,
  },

  heading: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 5,
  },

  sub: {
    textAlign: "center",
    fontSize: 12,
    color: "#777",
    marginBottom: 15,
  },

  seed: {
    background: "#faf5ff",
    padding: 8,
    borderRadius: 8,
    textAlign: "center",
    marginBottom: 10,
    cursor: "pointer",
    fontSize: 12,
  },

  field: {
    marginBottom: 10,
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },

  input: {
    width: "100%",
    maxWidth: 260,   // ✅ FIXED WIDTH
    height: 34,
    padding: "0 10px",
    borderRadius: 8,
    border: "1px solid #ddd",
  },

  inputError: {
    borderColor: "red",
  },

  fieldError: {
    fontSize: 10,
    color: "red",
  },

  forgot: {
    fontSize: 11,
    color: "#7c3aed",
    textDecoration: "none",
    display: "block",
    textAlign: "right",
    marginBottom: 12,
  },

  btn: {
    width: "100%",
    maxWidth: 260,   // ✅ FIXED WIDTH
    height: 34,
    background: "linear-gradient(135deg,#a855f7,#7c3aed)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },

  switchText: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 10,
  },

  link: {
    color: "#7c3aed",
    cursor: "pointer",
  },

  errorBanner: {
    color: "red",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 10,
  },

  heroInner: {
    textAlign: "center",
    color: "#fff",
  },

  heroTitle: {
    fontSize: 22,
    whiteSpace: "pre-line",
  },

  heroSub: {
    fontSize: 12,
    marginTop: 10,
  },

  heroBtn: {
    marginTop: 10,
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid #fff",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
  },
};