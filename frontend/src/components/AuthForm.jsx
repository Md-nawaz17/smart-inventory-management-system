import { useState } from "react";

function AuthForm({ onSubmit, loading }) {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const isRegister = mode === "register";

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(mode, formData);
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div>
          <p className="eyebrow">Smart Inventory</p>
          <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
          <p className="muted">
            Sign in to manage private inventory, stock logs, analytics, and
            alerts.
          </p>
        </div>

        <div className="segmented">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <label>
              Name
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <span className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                minLength="6"
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </span>
          </label>

          <button type="submit" className="primary-action" disabled={loading}>
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create Account"
                : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AuthForm;
