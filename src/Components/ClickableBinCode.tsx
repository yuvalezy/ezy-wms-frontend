import React from "react";
import {Link} from "react-router";

interface ClickableBinCodeProps {
  binEntry: number;
  binCode: string;
  className?: string;
  children?: React.ReactNode;
}

const ClickableBinCode: React.FC<ClickableBinCodeProps> = ({ 
  binEntry, 
  binCode, 
  className = "",
  children 
}) => {
  return (
    <Link
      to={`/binCheck/${binEntry}/${binCode}`}
      className={`text-blue-600 hover:underline hover:text-blue-800 transition-colors ${className}`}
    >
      {children || binCode}
    </Link>
  );
};

export default ClickableBinCode;