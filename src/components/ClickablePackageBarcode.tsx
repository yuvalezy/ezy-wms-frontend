import React from "react";
import {Link} from "react-router";

interface ClickablePackageBarcodeProps {
  packageId: string | number;
  barcode: string;
  className?: string;
  children?: React.ReactNode;
}

const ClickablePackageBarcode: React.FC<ClickablePackageBarcodeProps> = ({ 
  packageId, 
  barcode, 
  className = "",
  children 
}) => {
  return (
    <Link
      to={`/packageCheck/${packageId}/${barcode}`}
      className={`text-blue-600 hover:underline hover:text-blue-800 transition-colors ${className}`}
    >
      {children || barcode}
    </Link>
  );
};

export default ClickablePackageBarcode;