import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KpiBoxProps {
  title: string;
  value: number;
  icon: React.ComponentType<any>;
  className?: string;
  backgroundColor?: string;
  iconColor?: string;
  route?: string;
  borderColor?: string;
}

export function KpiBox({ title, value, icon: Icon, className, backgroundColor, iconColor, route, borderColor }: KpiBoxProps) {
  const cardContent = (
    <Card className={`${className || ''} bg-white hover:shadow-md transition-all duration-200 cursor-pointer h-[160px] border-l-8 ${borderColor || 'border-l-blue-500'} hover:bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 flex flex-col`}>
      <CardHeader className="flex flex-row items-start justify-between py-2 px-6 flex-shrink-0">
        <CardTitle className="text-sm font-semibold text-gray-900 leading-tight pr-3">{title}</CardTitle>
        <div className="flex-shrink-0 ml-auto">
          <Icon 
            className={`h-6 w-6 ${iconColor || 'text-blue-600'}`}
            aria-hidden="true"
          />
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-4 flex-1 flex items-center">
        <div className="text-4xl font-bold text-gray-900">{value}</div>
      </CardContent>
    </Card>
  );

  return route ? (
    <Link 
      to={route} 
      className="block min-h-[48px] focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-lg"
      aria-label={`View ${title}: ${value} items`}
    >
      {cardContent}
    </Link>
  ) : cardContent;
}
