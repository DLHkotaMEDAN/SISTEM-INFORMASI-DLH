"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Report } from '@/types/report';
import { getUnitByCategory } from '@/utils/report-helpers';
import { cn } from "@/lib/utils";

interface ReportCardProps {
  report: Report;
  isLoggedIn: boolean;
  isPimpinan: boolean;
  onDelete: (e: React.MouseEvent, report: Report) => void;
}

const ReportCard = ({ report, isLoggedIn, isPimpinan, onDelete }: ReportCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-none bg-white ring-1 ring-slate-200 relative"
      onClick={() => navigate(`/report/${report.id}`)}
    >
      <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 group-hover:w-2 transition-all" />
      
      <CardHeader className="p-5 pb-2">
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Calendar className="h-3 w-3 mr-1.5 text-blue-500" />
              {new Date(report.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <Badge variant="secondary" className="w-fit text-[10px] font-bold bg-blue-50 text-blue-700 border-blue-100 px-2 py-0.5">
              {report.category}
            </Badge>
          </div>
          
          {isLoggedIn && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full" 
                onClick={(e) => { e.stopPropagation(); navigate(`/edit/${report.id}`); }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full", isPimpinan && "hidden")} 
                disabled={isPimpinan} 
                onClick={(e) => onDelete(e, report)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <CardTitle className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors mt-3">
          {report.description}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-5 pt-0 space-y-4">
        <div className="flex items-start gap-2 text-xs text-slate-500 leading-relaxed">
          <MapPin className="h-3.5 w-3.5 mt-0.5 text-red-500 shrink-0" />
          <span className="line-clamp-2">
            {report.location.street}, {Array.isArray(report.location.village) ? report.location.village.join(", ") : report.location.village}
          </span>
        </div>
        
        <div className="pt-4 flex justify-between items-center border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Volume Pekerjaan</span>
            <span className="text-xs font-black text-slate-700">{report.volume} {getUnitByCategory(report.category)}</span>
          </div>
          <div className="flex items-center text-blue-600 font-bold text-[11px] bg-blue-50 px-3 py-1.5 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all">
            Detail <Eye className="ml-1.5 h-3.5 w-3.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportCard;