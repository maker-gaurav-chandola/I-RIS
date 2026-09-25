import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...rest }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <label className="field" htmlFor={inputId}>
        <span className="field-label">{label}</span>
        <input ref={ref} id={inputId} className={`field-input ${className}`} {...rest} />
        {error && <span className="field-error">{error}</span>}
      </label>
    );
  }
);
Input.displayName = "Input";
