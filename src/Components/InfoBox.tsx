import React from "react";
import {ItemDetails} from "@/pages/item-check/item-check";
import ItemDetailsLink from "@/components/ItemDetailsLink";

const InfoBox = ({children}: { children: React.ReactNode | React.ReactNode[] }) => {
  return <div className="bg-white rounded-lg shadow-sm mb-4 p-4 md:p-6">
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
      {children}
    </div>
  </div>
}
export const FullInfoBox = ({children}: { children: React.ReactNode | React.ReactNode[] }) => {
  return <div className="bg-white rounded-lg shadow-sm mb-4 p-4 md:p-6">
    <div className="space-y-4">
      {children}
    </div>
  </div>
}
export const SecondaryInfoBox = ({children}: { children: React.ReactNode | React.ReactNode[] }) => {
  return <div className="bg-white rounded-lg shadow-sm mb-4 p-4 md:p-6">
    <div className="grid grid-cols-2 gap-4 text-sm">
      {children}
    </div>
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
    <div>
      <span className="text-gray-500">{label}:</span>
      <span className="ml-2 font-medium nowra">{!onClick && !itemDetailsLink ?
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