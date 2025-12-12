import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, leftIcon, rightIcon, className = '', ...props }, ref) => {
        const inputClasses = [
            'input-field',
            leftIcon ? 'input-field-with-icon-left' : '',
            rightIcon ? 'input-field-with-icon-right' : '',
            error ? 'input-field-error' : '',
            className
        ].filter(Boolean).join(' ');

        return (
            <div className="input-container">
                {label && (
                    <label className="input-label">
                        {label}
                    </label>
                )}
                <div className="input-with-icon">
                    {leftIcon && (
                        <div className="input-icon-left">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={inputClasses}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="input-icon-right">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="input-error-message">{error}</p>
                )}
                {helperText && !error && (
                    <p className="input-helper-text">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
