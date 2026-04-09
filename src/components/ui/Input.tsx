import React, { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, required, id, ...props }, ref) => {
    const inputId = id || Math.random().toString(36).substring(7);
    
    return (
      <div className={cn("dhu-input-wrapper", className)}>
        {label && (
          <label htmlFor={inputId} className="dhu-input-label">
            {label}
            {required && <span className="dhu-input-required">*</span>}
          </label>
        )}
        <div className="dhu-input-container">
          {icon && <div className="dhu-input-icon">{icon}</div>}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "dhu-input",
              icon && "dhu-input-with-icon",
              error && "dhu-input-error"
            )}
            {...props}
          />
        </div>
        {error && <span className="dhu-input-error-message">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
