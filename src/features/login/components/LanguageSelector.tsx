import React from 'react';

interface LanguageSelectorProps {
  label: string;
  currentLanguage: string;
  onLanguageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  label,
  currentLanguage,
  onLanguageChange,
  disabled
}) => {
  return (
    <div>
      <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        name="language"
        id="language"
        value={currentLanguage}
        onChange={onLanguageChange}
        className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
      >
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </div>
  );
};