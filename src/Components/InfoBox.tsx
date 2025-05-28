import React from "react";

const InfoBox = ({children}: { children: React.ReactNode | React.ReactNode[] }) => {
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {children}
  </div>
}
export const SecondaryInfoBox = ({children}: { children: React.ReactNode | React.ReactNode[] }) => {
  return <div className="grid grid-cols-2 gap-2">
    {children}
  </div>
}

export const InfoBoxValue = ({label, value, onClick}: { label: string, value: any, onClick?: () => void }) => {
  const handleOnClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    onClick?.();
  };
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-sm font-medium text-muted-foreground">{label}:</span>
      <span className="text-base truncate">{!onClick ?
        value :
        <a href="#" onClick={handleOnClick} className="text-blue-600 hover:underline">
          {value}
        </a>
      }</span>
    </div>
  );
}

export default InfoBox;