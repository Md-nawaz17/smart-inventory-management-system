import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import PasswordInput from "../../components/ui/PasswordInput";
import AuthLayout from "./AuthLayout";

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(true);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password, { remember });
    if (result.success) navigate("/dashboard");
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your inventory dashboard."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50
                          dark:border-rose-500/30 dark:bg-rose-500/10 px-3.5 py-3 text-sm
                          text-rose-700 dark:text-rose-400 animate-fade-in">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            <input
              id="email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
          </div>
          <PasswordInput
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
        </div>

        <label className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400 select-none pt-1">
          <input
            type="checkbox"
            checked={remember}
            onChange={() => setRemember((v) => !v)}
            className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-brand-600 focus:ring-brand-500"
          />
          Keep me signed in
        </label>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500 dark:text-slate-400">
        Don't have an account?{" "}
        <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
