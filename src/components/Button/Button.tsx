import type { ButtonHTMLAttributes } from "react";

type Variant = "record" | "pause" | "resume" | "stop" | "primary" | "danger" | "transcribe";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  record: "bg-rose-400 hover:bg-rose-500",
  pause: "bg-amber-300 hover:bg-amber-400 text-slate-800",
  resume: "bg-teal-400 hover:bg-teal-500",
  stop: "bg-slate-400 hover:bg-slate-500",
  primary: "bg-blue-400 hover:bg-blue-500",
  danger: "bg-rose-400 hover:bg-rose-500",
  transcribe: "bg-indigo-400 hover:bg-indigo-500",
};

function Button({ variant = "primary", className = "", ...rest }: ButtonProps) {
  const classes = [
    variantClasses[variant],
    "inline-flex items-center gap-1.5 text-white font-medium transition-colors disabled:opacity-50 rounded-full px-4 py-2",
    className,
    "hover: cursor-pointer",
  ]
    .filter(Boolean)
    .join(" ");

  return <button className={classes} {...rest} />;
}

export default Button;
