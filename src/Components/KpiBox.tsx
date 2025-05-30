import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface KpiBoxProps {
  title: string;
  value: number;
  icon: IconDefinition;
  className?: string;
}

export function KpiBox({ title, value, icon, className }: KpiBoxProps) {
  return (
    <Card className={`${className || ''} hover:shadow-lg transition-shadow duration-300`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <FontAwesomeIcon icon={icon} className="h-4 w-4 text-blue-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}