import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface KpiBoxProps {
  title: string;
  value: number;
  icon: IconDefinition;
  className?: string;
  backgroundColor?: string;
  iconColor?: string;
}

export function KpiBox({ title, value, icon, className, backgroundColor, iconColor }: KpiBoxProps) {
  return (
    <Card className={`${className || ''} ${backgroundColor || ''} hover:shadow-lg transition-shadow duration-300`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <FontAwesomeIcon icon={icon} className={`h-4 w-4 ${iconColor || 'text-blue-500'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
