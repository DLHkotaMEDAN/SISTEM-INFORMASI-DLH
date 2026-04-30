"use client";

import React from 'react';
import { Announcement } from '@/services/announcementService';
import { Megaphone, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnnouncementBannerProps {
  announcement: Announcement | null;
}

const AnnouncementBanner = ({ announcement }: AnnouncementBannerProps) => {
  if (!announcement || !announcement.is_active) return null;

  return (
    <div className="mb-6 animate-in fade-in slide-in-from-top duration-500">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 md:p-5 shadow-lg shadow-blue-200 relative overflow-hidden group">
        {/* Decorative background icon */}
        <Megaphone className="absolute -right-4 -bottom-4 h-24 w-24 text-white/10 -rotate-12 group-hover:scale-110 transition-transform duration-700" />
        
        <div className="flex items-start gap-4 relative z-10">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm shrink-0">
            <Megaphone className="h-5 w-5 text-white" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-white font-black text-xs md:text-sm uppercase tracking-wider">Catatan Pimpinan</h4>
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            </div>
            <p className="text-blue-50 text-sm md:text-base leading-relaxed font-medium whitespace-pre-wrap">
              {announcement.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;