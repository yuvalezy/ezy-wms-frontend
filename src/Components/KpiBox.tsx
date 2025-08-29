import React from "react";
import { Link } from "react-router";
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
    <Card className={`${className || ''} group relative overflow-hidden bg-white hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 cursor-pointer min-h-[140px] md:min-h-[160px] border border-gray-200 hover:border-gray-300 rounded-xl ${borderColor || 'border-l-blue-500'} border-l-4 hover:border-l-8 hover:-translate-y-1 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 flex flex-col`}>
      <CardHeader className="flex flex-row items-start justify-between py-3 px-4 md:px-6 flex-shrink-0">
        <CardTitle className="text-sm md:text-base font-semibold text-gray-900 leading-tight pr-3 group-hover:text-gray-700 transition-colors">{title}</CardTitle>
        <div className="flex-shrink-0 ml-auto p-1 rounded-lg bg-gray-50 group-hover:bg-opacity-80 transition-colors">
          <Icon 
            className={`h-5 w-5 md:h-6 md:w-6 ${iconColor || 'text-blue-600'} group-hover:scale-110 transition-transform`}
            aria-hidden="true"
          />
        </div>
      </CardHeader>
      <CardContent className="px-4 md:px-6 pb-4 flex-1 flex items-center">
        <div className="text-3xl md:text-4xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">{value.toLocaleString()}</div>
      </CardContent>
      
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-gray-50/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </Card>
  );

  return route ? (
    <Link 
      to={route} 
      className="block focus:outline-none rounded-xl"
      aria-label={`View ${title}: ${value.toLocaleString()} items`}
    >
      {cardContent}
    </Link>
  ) : cardContent;
}
