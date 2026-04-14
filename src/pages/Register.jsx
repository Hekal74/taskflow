import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, isAuthenticated } from "../api/api";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sliding, setSliding] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) navigate("/dashboard", { replace: true });
  }, [navigate]);

  const slide = () => {
    if (sliding) return;
    setSliding(true);
    setTimeout(() => navigate("/"), 500);
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Invalid email";
    if (!formData.password) e.password = "Password is required";
    else if (formData.password.length < 6) e.password = "Min 6 characters";
    if (!formData.confirm) e.confirm = "Please confirm your password";
    else if (formData.confirm !== formData.password) e.confirm = "Passwords don't match";
    return e;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length) { setErrors(ve); return; }
    setErrors({});
    setLoading(true);
    try {
      await registerUser({ name: formData.name, email: formData.email, password: formData.password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
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

          {/* LEFT HERO */}
          <div className={`hero-panel-reg${sliding ? " slide-right" : ""}`}>
            <div className="hero-circles-reg" />
            <div className="hero-circle-sm-reg" />

            <div style={s.heroInner}>
              <h1 style={s.heroTitle}>
                Hello,{"\n"}Welcome{"\n"}Aboard.
              </h1>
              <p style={s.heroSub}>
                Plan smarter, ship faster, and stay in sync with your team.
              </p>
              <button style={s.heroBtn} onClick={slide}>
                ← Sign in instead
              </button>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div style={s.formSide}>
            <div style={s.logo}>
              <span style={s.logoDot} /> TaskFlow
            </div>

            <h2 style={s.heading}>Create account</h2>
            <p style={s.sub}>Start managing your projects today</p>

            {errors.general && (
              <div style={s.errorBanner}>{errors.general}</div>
            )}

            <form onSubmit={handleSubmit} noValidate style={s.form}>
              {[
                { field: "name",     type: "text",     placeholder: "Full name" },
                { field: "email",    type: "email",    placeholder: "Email address" },
                { field: "password", type: "password", placeholder: "Password" },
                { field: "confirm",  type: "password", placeholder: "Confirm password" },
              ].map(({ field, type, placeholder }) => (
                <div key={field} style={s.field}>
                  <input
                    style={{ ...s.input, ...(errors[field] ? s.inputError : {}) }}
                    type={type}
                    placeholder={placeholder}
                    value={formData[field]}
                    onChange={handleChange(field)}
                    disabled={loading}
                  />
                  {errors[field] && <span style={s.fieldError}>{errors[field]}</span>}
                </div>
              ))}

              <button style={s.btn} type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p style={s.switchText}>
              Already have an account?{" "}
              <span style={s.link} onClick={slide}>Sign in</span>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}

const CSS = `
.hero-panel-reg {
  position: absolute;
  top: 0;
  left: 0;
  width: 45%;
  height: 100%;
  background: linear-gradient(135deg, #a855f7, #6d28d9);
  border-radius: 12px 0 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  transition: transform 0.5s ease;
  z-index: 2;
}
.hero-panel-reg.slide-right {
  transform: translateX(125%);
}
.hero-circles-reg {
  position: absolute;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: #c084fc;
  top: -40px;
  left: -40px;
  opacity: 0.7;
}
.hero-circle-sm-reg {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #a855f7;
  bottom: 20px;
  left: 20px;
  opacity: 0.5;
}
`;

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
    height: 460,
    borderRadius: 12,
    overflow: "hidden",
    background: "#fff",
    boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
  },

  formSide: {
    flex: "0 0 55%",
    marginLeft: "45%",
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
    marginBottom: 8,
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
    marginBottom: 4,
  },

  sub: {
    textAlign: "center",
    fontSize: 12,
    color: "#777",
    marginBottom: 12,
  },

  field: {
    marginBottom: 8,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  input: {
    width: "100%",
    maxWidth: 260,
    height: 34,
    padding: "0 10px",
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
  },

  inputError: {
    borderColor: "red",
  },

  fieldError: {
    fontSize: 10,
    color: "red",
    alignSelf: "flex-start",
    marginLeft: "calc(50% - 130px)",
    marginTop: 2,
  },

  btn: {
    width: "100%",
    maxWidth: 260,
    height: 34,
    background: "linear-gradient(135deg, #a855f7, #7c3aed)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    marginTop: 4,
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
    marginBottom: 8,
  },

  heroInner: {
    textAlign: "center",
    color: "#fff",
  },

  heroTitle: {
    fontSize: 22,
    whiteSpace: "pre-line",
    fontWeight: 700,
  },

  heroSub: {
    fontSize: 12,
    marginTop: 10,
    opacity: 0.85,
  },

  heroBtn: {
    marginTop: 12,
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid #fff",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
  },
};