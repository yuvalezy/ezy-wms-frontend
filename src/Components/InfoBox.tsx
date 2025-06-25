import React from "react";
import {CountingSummaryReportLine} from "@/pages/Counting/data/Report";
import {ItemDetails} from "@/pages/item-check/item-check";
import ItemDetailsLink from "@/components/ItemDetailsLink";

const InfoBox = ({children}: { children: React.ReactNode | React.ReactNode[] }) => {
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {children}
  </div>
}
export const FullInfoBox = ({children}: { children: React.ReactNode | React.ReactNode[] }) => {
  return <div className="gap-4 space-y-1 mb-4">
    {children}
  </div>
}
export const SecondaryInfoBox = ({children}: { children: React.ReactNode | React.ReactNode[] }) => {
  return <div className="grid grid-cols-2 gap-2">
    {children}
  </div>
}

export const InfoBoxValue = ({label, value, onClick, itemDetailsLink}: {
  label: string,
  value: any,
  onClick?: () => void,
  itemDetailsLink?: ItemDetails
}) => {
  const handleOnClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    onClick?.();
  };
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-sm font-medium text-muted-foreground">{label}:</span>
      <span className="text-base truncate">{!onClick && !itemDetailsLink ?
        value :
        !itemDetailsLink ?
          <a href="#" onClick={handleOnClick} className="text-blue-600 hover:underline">
            {value}
          </a> :
          <ItemDetailsLink data={itemDetailsLink}/>
      }</span>
    </div>
  );
}

export default InfoBox;