import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { InvestmentRecord, Profile } from '../types';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';

interface DashboardProps {
  investments: InvestmentRecord[];
  profiles: Profile[];
  currentPrice: number;
}

export function Dashboard({ investments, profiles, currentPrice }: DashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {profiles.map(profile => {
          const profileInvestments = investments.filter(inv => inv.profileId === profile.id);
          const totalInvested = profileInvestments.reduce((sum, inv) => sum + inv.amount, 0);
          const totalShares = profileInvestments.reduce((sum, inv) => sum + inv.shares, 0);
          const averageCost = totalShares > 0 ? totalInvested / totalShares : 0;
          const currentValue = totalShares * currentPrice;
          const profitLoss = currentValue - totalInvested;
          const roi = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
          const isPositive = profitLoss >= 0;

          return (
            <Card key={profile.id} className="overflow-hidden border-t-4" style={{ borderTopColor: profile.color }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center justify-between">
                  <span>{profile.name} 的 0050 投資組合</span>
                  <PieChart className="h-5 w-5 text-slate-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">總投入金額</p>
                    <p className="text-2xl font-bold">NT$ {totalInvested.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">目前市值</p>
                    <p className="text-2xl font-bold">NT$ {currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">累積股數</p>
                    <p className="text-xl font-semibold">{totalShares.toLocaleString(undefined, { maximumFractionDigits: 2 })} 股</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">平均成本</p>
                    <p className="text-xl font-semibold">NT$ {averageCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
                
                <div className={`mt-6 p-4 rounded-lg flex items-center justify-between ${isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  <div>
                    <p className="text-sm font-medium mb-1">未實現損益</p>
                    <p className="text-2xl font-bold flex items-center gap-2">
                      {isPositive ? '+' : ''}{profitLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium mb-1">報酬率</p>
                    <p className="text-2xl font-bold flex items-center gap-1 justify-end">
                      {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                      {isPositive ? '+' : ''}{roi.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
