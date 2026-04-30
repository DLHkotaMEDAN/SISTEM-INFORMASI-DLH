"use client";

import React from 'react';
import { Megaphone, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from "@/lib/utils";

interface AnnouncementBannerProps {
  content: string;
  author: string;
  date: string;
}

const AnnouncementBanner = ({ content, author, date }: AnnouncementBannerProps) => {
  if (!content) return null;

  return (
    <div className="bg-blue-600 text-white p-4 rounded-xl shadow-md mb-6 relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
        <Megaphone size={120} />
      </div>
      
      <div className="relative z-10 flex items-start gap-4">
        <div className="bg-white/20 p-2 rounded-lg shrink-0">
          <Megaphone className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 flex items-center gap-2">
            Catatan Pimpinan
          </p>
          <p className="text-sm md:text-base font-medium leading-relaxed">
            "{content}"
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-[10px] font-bold opacity-70">
            <span className="flex items-center gap-1">
              <User size={12} /> {author}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> {format(new Date(date), 'dd MMMM yyyy, HH:mm', { locale: localeId })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;