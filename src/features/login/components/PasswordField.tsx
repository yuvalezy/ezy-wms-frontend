import React from 'react';

interface PasswordFieldProps {
  label: string;
  disabled?: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({ label, disabled }) => {
  return (
    <div>
      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="password"
        name="password"
        id="password"
        required
        disabled={disabled}
        className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
      />
    </div>
  );
};