import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { normalizedConstituents } from '../data/constituents';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ConstituentsProps {
  stockData: Record<string, { price: string; change: string; percentChange?: number }>;
}

export function Constituents({ stockData }: ConstituentsProps) {
  // Group top 10 and others for the pie chart
  const top10 = normalizedConstituents.slice(0, 10);
  const othersWeight = normalizedConstituents.slice(10).reduce((sum, item) => sum + item.weight, 0);
  
  const chartData = [
    ...top10,
    { symbol: 'others', name: '其他成分股', weight: Number(othersWeight.toFixed(2)) }
  ];

  const COLORS = [
    '#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', 
    '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#cbd5e1'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>0050 成分股權重分佈 (前10大)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={130}
                  fill="#8884d8"
                  dataKey="weight"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}%`, '權重']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>0050 完整成分股清單與即時報價</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 w-16 text-center">排名</th>
                  <th className="px-4 py-3">代號</th>
                  <th className="px-4 py-3">名稱</th>
                  <th className="px-4 py-3 text-right">最新股價</th>
                  <th className="px-4 py-3 text-right">漲跌</th>
                  <th className="px-4 py-3 text-right">權重 (%)</th>
                  <th className="px-4 py-3">比例視覺化</th>
                </tr>
              </thead>
              <tbody>
                {normalizedConstituents.map((stock, index) => {
                  const stockInfo = stockData[stock.symbol];
                  const price = stockInfo?.price || '-';
                  const percentChange = stockInfo?.percentChange;
                  
                  const isUp = percentChange !== undefined && percentChange > 0;
                  const isDown = percentChange !== undefined && percentChange < 0;
                  const changeColor = isUp ? 'text-red-500' : isDown ? 'text-green-500' : 'text-slate-500';
                  
                  let displayChange = '-';
                  if (percentChange !== undefined) {
                    const sign = isUp ? '+' : '';
                    displayChange = `${sign}${percentChange.toFixed(2)}%`;
                  }

                  return (
                    <tr key={stock.symbol} className="border-b hover:bg-slate-50">
                      <td className="px-4 py-3 text-center text-slate-500">{index + 1}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: index < 10 ? COLORS[index] : '#cbd5e1' }}
                          />
                          {stock.symbol}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{stock.name}</td>
                      <td className="px-4 py-3 text-right font-mono">{price}</td>
                      <td className={`px-4 py-3 text-right font-mono ${changeColor}`}>{displayChange}</td>
                      <td className="px-4 py-3 text-right">{stock.weight.toFixed(2)}%</td>
                      <td className="px-4 py-3 w-1/3">
                        <div className="w-full bg-slate-100 rounded-full h-2.5">
                          <div 
                            className="h-2.5 rounded-full" 
                            style={{ 
                              width: `${Math.max(stock.weight, 0.5)}%`,
                              backgroundColor: index < 10 ? COLORS[index] : '#94a3b8'
                            }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
