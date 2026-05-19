"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ClipboardList, CheckCircle2, Calendar, TrendingUp } from 'lucide-react';
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
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-200/50",
      trend: "+2 dari kemarin"
    },
    {
      label: "Rencana Hari Ini",
      value: plansToday,
      icon: ClipboardList,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-200/50",
      trend: "Sesuai jadwal"
    },
    {
      label: "Total Laporan",
      value: totalReports,
      icon: CheckCircle2,
      color: "text-indigo-600",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-200/50",
      trend: "Data tersinkron"
    },
    {
      label: "Total Rencana",
      value: totalWorkPlans,
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-200/50",
      trend: "Arsip lengkap"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <Card key={i} className={cn(
          "glass-card border-none transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg group",
          "relative overflow-hidden"
        )}>
          <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-110", stat.bgColor)} />
          <CardContent className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className={cn("p-2.5 rounded-xl shrink-0", stat.bgColor)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                <TrendingUp size={12} className={stat.color} />
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;