import React from "react";

const InfoBox = ({children}: {children: React.ReactNode | React.ReactNode[]}) => {
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {children}
  </div>
}

export const InfoBoxValue = ({label, value}: {label: string, value: any}) => {
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-sm font-medium text-muted-foreground">{label}:</span>
      <span className="text-base">{value}</span>
    </div>
  );
}

export default InfoBox;