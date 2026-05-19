"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowRight, Edit, Trash2, Eye, EyeOff, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WorkPlan } from '@/types/workPlan';
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WorkPlanCardProps {
  plan: WorkPlan;
  isLoggedIn: boolean;
  isPimpinan: boolean;
  onDelete: (e: React.MouseEvent, plan: WorkPlan) => void;
  onToggleVisibility: (e: React.MouseEvent, plan: WorkPlan) => void;
}

const WorkPlanCard = ({ plan, isLoggedIn, isPimpinan, onDelete, onToggleVisibility }: WorkPlanCardProps) => {
  const navigate = useNavigate();
  const isHidden = plan.is_visible === false;

  return (
    <Card 
      className={cn(
        "group hover:shadow-xl transition-all duration-300 cursor-pointer border-none bg-white ring-1 ring-slate-200 relative overflow-hidden",
        isHidden ? "opacity-75 grayscale-[0.5]" : ""
      )} 
      onClick={() => navigate(`/work-plans/print/${plan.id}`)}
    >
      <div className={cn(
        "absolute top-0 left-0 w-1.5 h-full transition-all group-hover:w-2",
        isHidden ? "bg-slate-400" : "bg-green-600"
      )} />
      
      <CardHeader className="p-5 pb-2">
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Calendar className="h-3 w-3 mr-1.5 text-green-600" />
              {new Date(plan.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn(
                "w-fit text-[10px] font-bold px-2 py-0.5",
                isHidden ? "bg-slate-100 text-slate-500 border-slate-200" : "bg-green-50 text-green-700 border-green-100"
              )}>
                {plan.category}
              </Badge>
              {isHidden && (
                <Badge variant="outline" className="text-[9px] bg-red-50 text-red-600 border-red-100 font-bold">
                  <EyeOff size={10} className="mr-1" /> Tersembunyi
                </Badge>
              )}
            </div>
          </div>
          
          {isLoggedIn && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn("h-8 w-8 rounded-full", isHidden ? "text-slate-400 hover:text-blue-600" : "text-blue-600 hover:bg-blue-50")} 
                      onClick={(e) => onToggleVisibility(e, plan)} 
                      disabled={isPimpinan}
                    >
                      {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>{isHidden ? "Tampilkan di Rekap" : "Sembunyikan dari Rekap"}</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full" 
                disabled={isPimpinan}
                onClick={(e) => { e.stopPropagation(); if(!isPimpinan) navigate(`/work-plans/edit/${plan.id}`); }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full" 
                disabled={isPimpinan} 
                onClick={(e) => onDelete(e, plan)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <CardTitle className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-green-600 transition-colors mt-3">
          {plan.items?.[0]?.description || "Rencana Kerja"}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-5 pt-0 space-y-4">
        <div className="flex items-start gap-2 text-xs text-slate-500 leading-relaxed">
          <MapPin className="h-3.5 w-3.5 mt-0.5 text-red-500 shrink-0" />
          <span className="line-clamp-1">
            {plan.items?.[0]?.location?.street || "Lokasi Kerja"}
          </span>
        </div>
        
        <div className="pt-4 flex justify-between items-center border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Cakupan Lokasi</span>
            <span className="text-xs font-black text-slate-700">{plan.items?.length || 0} Titik Kerja</span>
          </div>
          <div className="flex items-center text-green-600 font-bold text-[11px] bg-green-50 px-3 py-1.5 rounded-full group-hover:bg-green-600 group-hover:text-white transition-all">
            Lihat Rencana <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkPlanCard;