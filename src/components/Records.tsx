import React, { useState } from 'react';
import { InvestmentRecord, Profile } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { format } from 'date-fns';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';

interface RecordsProps {
  investments: InvestmentRecord[];
  profiles: Profile[];
  onAdd: (record: Omit<InvestmentRecord, 'id'>) => void;
  onEdit: (id: string, record: Omit<InvestmentRecord, 'id'>) => void;
  onDelete: (id: string) => void;
}

export function Records({ investments, profiles, onAdd, onEdit, onDelete }: RecordsProps) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [profileId, setProfileId] = useState(profiles[0]?.id || '');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    date: '',
    amount: '',
    price: '',
    profileId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !price || !profileId) return;

    const numAmount = parseFloat(amount);
    const numPrice = parseFloat(price);
    const shares = numAmount / numPrice;

    onAdd({
      date,
      amount: numAmount,
      price: numPrice,
      shares,
      profileId
    });

    setAmount('');
    setPrice('');
  };

  const startEdit = (inv: InvestmentRecord) => {
    setEditingId(inv.id);
    setEditForm({
      date: inv.date,
      amount: inv.amount.toString(),
      price: inv.price.toString(),
      profileId: inv.profileId
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    if (!editForm.amount || !editForm.price || !editForm.profileId) return;

    const numAmount = parseFloat(editForm.amount);
    const numPrice = parseFloat(editForm.price);
    const shares = numAmount / numPrice;

    onEdit(id, {
      date: editForm.date,
      amount: numAmount,
      price: numPrice,
      shares,
      profileId: editForm.profileId
    });

    setEditingId(null);
  };

  const sortedInvestments = [...investments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>新增定期定額紀錄</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-5 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">成員</label>
              <select 
                className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
                required
              >
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">日期</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">投入金額 (NT$)</label>
              <Input type="number" min="0" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="例如: 5000" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">買入價格 (NT$)</label>
              <Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="例如: 150.5" required />
            </div>
            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4 mr-2" /> 新增紀錄
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>歷史紀錄</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedInvestments.length === 0 ? (
            <p className="text-center text-slate-500 py-8">目前還沒有任何投資紀錄</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3">日期</th>
                    <th className="px-4 py-3">帳戶</th>
                    <th className="px-4 py-3 text-right">投入金額</th>
                    <th className="px-4 py-3 text-right">買入價格</th>
                    <th className="px-4 py-3 text-right">獲得股數</th>
                    <th className="px-4 py-3 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedInvestments.map((inv) => {
                    const profile = profiles.find(p => p.id === inv.profileId);
                    const isEditing = editingId === inv.id;

                    if (isEditing) {
                      return (
                        <tr key={inv.id} className="border-b bg-indigo-50/50">
                          <td className="px-4 py-3">
                            <Input 
                              type="date" 
                              value={editForm.date} 
                              onChange={(e) => setEditForm({...editForm, date: e.target.value})} 
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select 
                              className="flex h-8 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                              value={editForm.profileId}
                              onChange={(e) => setEditForm({...editForm, profileId: e.target.value})}
                            >
                              {profiles.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <Input 
                              type="number" 
                              min="0" 
                              step="1" 
                              value={editForm.amount} 
                              onChange={(e) => setEditForm({...editForm, amount: e.target.value})} 
                              className="h-8 text-xs text-right"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.01" 
                              value={editForm.price} 
                              onChange={(e) => setEditForm({...editForm, price: e.target.value})} 
                              className="h-8 text-xs text-right"
                            />
                          </td>
                          <td className="px-4 py-3 text-right text-slate-400">
                            {/* Auto-calculated, no input */}
                            {editForm.amount && editForm.price 
                              ? (parseFloat(editForm.amount) / parseFloat(editForm.price)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
                              : '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => saveEdit(inv.id)} className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={cancelEdit} className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={inv.id} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-3">{inv.date}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${profile?.color}20`, color: profile?.color }}>
                            {profile?.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">NT$ {inv.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">NT$ {inv.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-right">{inv.shares.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => startEdit(inv)} className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onDelete(inv.id)} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
