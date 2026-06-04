"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, FileText, ClipboardList, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  isPimpinan: boolean;
  isLoggedIn: boolean;
  activeTab: string;
}

const QuickActions = ({ isPimpinan, isLoggedIn, activeTab }: QuickActionsProps) => {
  const navigate = useNavigate();

  if (!isLoggedIn || isPimpinan) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      <Button 
        onClick={() => navigate('/create')}
        className={cn(
          "flex-1 h-14 md:h-16 text-base font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]",
          "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        )}
      >
        <div className="bg-white/20 p-2 rounded-lg mr-3">
          <Plus className="h-5 w-5" />
        </div>
        Buat Laporan Harian
      </Button>
      
      <Button 
        onClick={() => navigate('/work-plans/create')}
        variant="outline"
        className={cn(
          "flex-1 h-14 md:h-16 text-base font-bold border-2 transition-all hover:scale-[1.02] active:scale-[0.98]",
          "border-green-600 text-green-700 hover:bg-green-50"
        )}
      >
        <div className="bg-green-100 p-2 rounded-lg mr-3">
          <ClipboardList className="h-5 w-5" />
        </div>
        Buat Rencana Kerja
      </Button>
    </div>
  );
};

export default QuickActions;