import React from "react";
import { Link } from "react-router-dom";

interface ClickableItemCodeProps {
  itemCode: string;
  className?: string;
}

const ClickableItemCode: React.FC<ClickableItemCodeProps> = ({ itemCode, className = "" }) => {
  return (
    <Link
      to={`/itemCheck/${itemCode}`}
      className={`text-blue-600 hover:underline hover:text-blue-800 transition-colors ${className}`}
    >
      {itemCode}
    </Link>
  );
};

export default ClickableItemCode;