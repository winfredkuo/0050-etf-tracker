import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { normalizedConstituents } from '../data/constituents';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ConstituentsProps {
  // stockData no longer needed per user request to remove individual prices/changes
}

export function Constituents({ }: ConstituentsProps) {
  // Group constituents by category
  const categoryGroups = normalizedConstituents.reduce((acc, stock) => {
    const category = stock.category || "未分類";
    if (!acc[category]) {
      acc[category] = { name: category, weight: 0, stocks: [] };
    }
    acc[category].weight += stock.weight;
    acc[category].stocks.push(stock);
    return acc;
  }, {} as Record<string, { name: string; weight: number; stocks: any[] }>);

  const categories = Object.values(categoryGroups).sort((a, b) => b.weight - a.weight);

  const COLORS = [
    '#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', 
    '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#cbd5e1',
    '#94a3b8', '#1e293b', '#475569'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>0050 產業類別權重分佈</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={130}
                  fill="#8884d8"
                  dataKey="weight"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toFixed(2)}%`, '權重']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>0050 成分股產業分類清單</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {categories.map((cat, catIndex) => (
              <div key={cat.name} className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[catIndex % COLORS.length] }}
                    />
                    {cat.name}
                  </h3>
                  <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    總權重: {cat.weight.toFixed(2)}%
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                      <tr>
                        <th className="px-4 py-2">代號</th>
                        <th className="px-4 py-2">名稱</th>
                        <th className="px-4 py-2 text-right">單一權重 (%)</th>
                        <th className="px-4 py-2">佔產業比例</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.stocks.map((stock) => (
                        <tr key={stock.symbol} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="px-4 py-2 font-mono text-slate-600">{stock.symbol}</td>
                          <td className="px-4 py-2 font-medium">{stock.name}</td>
                          <td className="px-4 py-2 text-right">{stock.weight.toFixed(2)}%</td>
                          <td className="px-4 py-2 w-1/3">
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                              <div 
                                className="h-1.5 rounded-full" 
                                style={{ 
                                  width: `${(stock.weight / cat.weight) * 100}%`,
                                  backgroundColor: COLORS[catIndex % COLORS.length]
                                }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
