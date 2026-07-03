import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, User, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import PasswordInput from "../../components/ui/PasswordInput";
import AuthLayout from "./AuthLayout";

export default function Register() {
  const { register, loading, error, setError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const passwordsMatch =
    form.confirmPassword.length === 0 || form.password === form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError?.("Passwords do not match.");
      return;
    }
    const result = await register(form.name, form.email, form.password);
    if (result.success) navigate("/dashboard");
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start managing your inventory in minutes."
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
          <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Full name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            <input
              id="name"
              type="text"
              name="name"
              required
              autoComplete="name"
              placeholder="Jane Cooper"
              value={form.name}
              onChange={handleChange}
              className="input-field pl-10"
            />
          </div>
        </div>

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
          <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Password
          </label>
          <PasswordInput
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            placeholder="At least 6 characters"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Confirm password
          </label>
          <PasswordInput
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            placeholder="Re-enter your password"
          />
          {form.confirmPassword.length > 0 && (
            <p className={`flex items-center gap-1.5 text-xs mt-1 ${
              passwordsMatch ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}>
              {passwordsMatch ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
              {passwordsMatch ? "Passwords match" : "Passwords do not match"}
            </p>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating account...
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
