import React from 'react';

interface LoginButtonProps {
  text: string;
  disabled?: boolean;
}

export const LoginButton: React.FC<LoginButtonProps> = ({ text, disabled }) => {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`w-full font-semibold py-2 rounded-lg transition ${
        disabled 
          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {text}
    </button>
  );
};