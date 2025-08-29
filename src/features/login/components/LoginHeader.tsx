import React from 'react';

interface LoginHeaderProps {
  companyName?: string;
  loginText: string;
}

export const LoginHeader: React.FC<LoginHeaderProps> = ({ companyName, loginText }) => {
  return (
    <div className="flex flex-col items-center mb-6">
      <img
        src="/images/ezy_wms.png"
        alt="Company Logo"
        className="w-auto h-20 mb-4 object-contain"
      />
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">
        {companyName || 'COMPANY NAME'}
      </h2>
      <p className="text-center text-gray-500">{loginText}</p>
    </div>
  );
};