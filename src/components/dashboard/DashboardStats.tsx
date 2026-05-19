"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ClipboardList, CheckCircle2, Calendar } from 'lucide-react';
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  totalReports: number;
  totalWorkPlans: number;
  reportsToday: number;
  plansToday: number;
}

const DashboardStats = ({ totalReports, totalWorkPlans, reportsToday, plansToday }: DashboardStatsProps) => {
  const stats = [
    {
      label: "Laporan Hari Ini",
      value: reportsToday,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100"
    },
    {
      label: "Rencana Hari Ini",
      value: plansToday,
      icon: ClipboardList,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-100"
    },
    {
      label: "Total Laporan",
      value: totalReports,
      icon: CheckCircle2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100"
    },
    {
      label: "Total Rencana",
      value: totalWorkPlans,
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
      {stats.map((stat, i) => (
        <Card key={i} className={cn("border shadow-sm overflow-hidden", stat.borderColor)}>
          <CardContent className="p-4 flex items-center gap-3 md:gap-4">
            <div className={cn("p-2 md:p-3 rounded-xl shrink-0", stat.bgColor)}>
              <stat.icon className={cn("h-5 w-5 md:h-6 md:w-6", stat.color)} />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-lg md:text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;