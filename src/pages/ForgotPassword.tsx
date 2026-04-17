"use client";

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { KeyRound, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { showError, showSuccess } from '../utils/toast';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showError("Masukkan email Anda");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      showSuccess("Instruksi pemulihan telah dikirim ke email Anda");
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-orange-500">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-orange-500 p-3 rounded-2xl w-fit">
            <KeyRound className="text-white h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Lupa Kata Sandi?</CardTitle>
          <p className="text-slate-500 text-sm">Masukkan email Anda untuk memulihkan akses</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Email Terdaftar</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  type="email"
                  placeholder="nama@gmail.com" 
                  className="pl-10 h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 h-11 text-base font-bold"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Kirim Instruksi"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-slate-500 hover:text-blue-600 flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Kembali ke Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;