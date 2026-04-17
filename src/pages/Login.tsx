"use client";

import React, { useEffect, useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { FileText, User } from 'lucide-react';

const Login = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in');

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-blue-600 p-3 rounded-2xl w-fit">
            <FileText className="text-white h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Sistem Laporan DLH</CardTitle>
          <p className="text-slate-500 text-sm">
            {view === 'sign_in' ? 'Silakan masuk ke akun Anda' : 'Buat akun baru untuk melapor'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Toggle View Kustom */}
          <div className="flex bg-slate-100 p-1 rounded-lg mb-2">
            <Button 
              variant="ghost" 
              className={`flex-1 text-xs h-8 transition-all ${view === 'sign_in' ? 'shadow-sm bg-white text-blue-600' : 'text-slate-500'}`}
              onClick={() => setView('sign_in')}
            >
              Masuk
            </Button>
            <Button 
              variant="ghost" 
              className={`flex-1 text-xs h-8 transition-all ${view === 'sign_up' ? 'shadow-sm bg-white text-blue-600' : 'text-slate-500'}`}
              onClick={() => setView('sign_up')}
            >
              Daftar
            </Button>
          </div>

          {/* Tampilkan input Username HANYA saat tampilan Daftar (Sign Up) */}
          {view === 'sign_up' && (
            <div className="space-y-2 mb-4 animate-in fade-in slide-in-from-top-2">
              <Label htmlFor="username" className="text-xs font-bold text-slate-700 uppercase">Nama Pengguna (Username)</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  id="username"
                  placeholder="Contoh: budi_taman" 
                  className="pl-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-slate-500 italic">*Nama ini akan muncul di laporan Anda</p>
            </div>
          )}

          <Auth
            supabaseClient={supabase}
            view={view}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                  }
                }
              }
            }}
            providers={[]}
            theme="light"
            additionalData={{
              username: username,
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Kata Sandi',
                  button_label: 'Masuk Sekarang',
                  loading_button_label: 'Memproses Masuk...',
                },
                sign_up: {
                  email_label: 'Alamat Email',
                  password_label: 'Kata Sandi Baru',
                  button_label: 'Daftar Akun',
                  loading_button_label: 'Mendaftarkan...',
                }
              }
            }}
          />

          <div className="mt-6 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-[10px] text-amber-800 leading-relaxed">
              <strong>Catatan:</strong> Gunakan <strong>Email</strong> untuk login di masa mendatang. Username hanya digunakan sebagai identitas nama Anda di sistem.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;