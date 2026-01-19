import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = ({
  label,
  error,
  id,
  className = '',
  ...props
}: InputProps) => {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-muted mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-4 py-2.5 rounded-lg
          bg-surface border border-border
          text-text placeholder:text-text-muted/50
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-error focus:ring-error/50 focus:border-error' : ''}
          ${className}
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 text-sm text-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};
