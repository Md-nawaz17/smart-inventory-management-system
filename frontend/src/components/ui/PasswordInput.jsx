import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function PasswordInput({
  value,
  onChange,
  placeholder = "Enter your password",
  name = "password",
  autoComplete = "current-password",
  required = true,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
      <input
        type={visible ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="input-field pl-10 pr-11"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600
                   dark:hover:text-slate-300 transition-colors rounded-md p-1"
      >
        {visible ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
      </button>
    </div>
  );
}
