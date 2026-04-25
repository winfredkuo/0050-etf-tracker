import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { KeyRound, Users } from 'lucide-react';

interface LoginProps {
  onLogin: (roomId: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = roomId.trim();
    if (input === '0050-WPPE') {
      setError('');
      onLogin(input);
    } else if (input) {
      setError('專屬密碼錯誤，請重新輸入');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Users className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">家庭專屬空間</CardTitle>
          <CardDescription className="text-slate-500 mt-2">
            請輸入你們的專屬密碼以進行跨裝置同步
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <label htmlFor="roomId" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <KeyRound className="w-4 h-4" /> 專屬密碼
              </label>
              <Input
                id="roomId"
                type="password"
                placeholder="請輸入專屬密碼"
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value);
                  setError('');
                }}
                className={`w-full h-11 ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                autoFocus
              />
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-base"
              disabled={!roomId.trim()}
            >
              進入家庭空間
            </Button>
            <p className="text-xs text-center text-slate-400 mt-4">
              只要在不同裝置輸入相同的密碼，就能看到並同步同一份投資紀錄。
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
