import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { InvestmentRecord, Profile } from './types';
import { Dashboard } from './components/Dashboard';
import { Records } from './components/Records';
import { Constituents } from './components/Constituents';
import { Login } from './components/Login';
import { LayoutDashboard, ListPlus, PieChart, Settings, RefreshCw, LogOut } from 'lucide-react';
import { Input } from './components/ui/Input';
import { supabase } from './lib/supabase';

const DEFAULT_PROFILES: Profile[] = [
  { id: 'daughter1', name: '郭昀樂', color: '#3b82f6' }, // blue
  { id: 'daughter2', name: '郭欣睿', color: '#ec4899' }, // pink
  { id: 'mother', name: '許珮珍', color: '#10b981' }, // green
];

export default function App() {
  const [roomId, setRoomId] = useLocalStorage<string>('0050-room-id', '');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'records' | 'constituents'>('dashboard');
  const [investments, setInvestments] = useLocalStorage<InvestmentRecord[]>('0050-investments', []);
  const [profiles, setProfiles] = useLocalStorage<Profile[]>('0050-profiles', DEFAULT_PROFILES);
  const [currentPriceStr, setCurrentPriceStr] = useLocalStorage<string>('0050-current-price', '150.00');
  const [stockData, setStockData] = useState<Record<string, any>>({});
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Use a ref to prevent syncing back to Supabase immediately after fetching from it
  const isInitialLoad = useRef(true);

  const currentPrice = parseFloat(currentPriceStr) || 0;

  // Fetch initial data from Supabase when roomId is set
  useEffect(() => {
    if (!roomId || !supabase) return;

    const fetchSupabaseData = async () => {
      setIsSyncing(true);
      try {
        const { data, error } = await supabase
          .from('family_data')
          .select('investments, profiles')
          .eq('room_id', roomId)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error fetching from Supabase:', error);
          return;
        }

        if (data) {
          // Data exists in Supabase, update local state
          if (data.investments) setInvestments(data.investments);
          if (data.profiles) {
            // Renaming logic for existing profiles
            let cloudProfiles = data.profiles.map((p: any) => {
              if (p.id === 'mother' && p.name.includes('媽媽')) {
                return { ...p, name: '許珮珍' };
              }
              return p;
            });
            
            // Merge mother profile if missing in cloud data
            if (!cloudProfiles.find((p: any) => p.id === 'mother')) {
               cloudProfiles.push({ id: 'mother', name: '許珮珍', color: '#10b981' });
            }
            setProfiles(cloudProfiles);
          }
        } else {
          // No data in Supabase yet, push current local data
          await supabase.from('family_data').insert({
            room_id: roomId,
            investments,
            profiles,
            updated_at: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('Supabase sync error:', err);
      } finally {
        setIsSyncing(false);
        // Allow subsequent changes to be synced to Supabase
        setTimeout(() => { isInitialLoad.current = false; }, 500);
      }
    };

    fetchSupabaseData();
  }, [roomId]);

  // Sync to Supabase when local data changes
  useEffect(() => {
    if (!roomId || !supabase || isInitialLoad.current || isSyncing) return;

    const syncData = async () => {
      try {
        await supabase
          .from('family_data')
          .upsert({
            room_id: roomId,
            investments,
            profiles,
            updated_at: new Date().toISOString()
          });
      } catch (err) {
        console.error('Error syncing to Supabase:', err);
      }
    };

    const timeoutId = setTimeout(syncData, 1000); // Debounce sync
    return () => clearTimeout(timeoutId);
  }, [investments, profiles, roomId]);

  useEffect(() => {
    // Migrate old names to new names if they haven't been changed manually
    setProfiles(prev => {
      let changed = false;
      const newProfiles = prev.map(p => {
        if (p.id === 'daughter1' && p.name === '大女兒') { changed = true; return { ...p, name: '郭昀樂' }; }
        if (p.id === 'daughter2' && p.name === '小女兒') { changed = true; return { ...p, name: '郭欣睿' }; }
        if (p.id === 'mother' && p.name.includes('媽媽')) { changed = true; return { ...p, name: '許珮珍' }; }
        return p;
      });
      
      // Add mother profile if it doesn't exist
      if (!newProfiles.find(p => p.id === 'mother')) {
        newProfiles.push({ id: 'mother', name: '許珮珍', color: '#10b981' });
        changed = true;
      }
      
      return changed ? newProfiles : prev;
    });

    fetchStockPrices();
  }, []);

  const fetchStockPrices = async () => {
    setIsFetching(true);
    setFetchError(null);
    try {
      const priceMap: Record<string, { price: string; change: string; percentChange?: number }> = {};
      
      // 取得 TWSE (上市) 資料 - 透過我們自己的後端 API 避免 CORS 問題
      const twseRes = await fetch('/api/twse');
      if (!twseRes.ok) {
        throw new Error(`伺服器錯誤: ${twseRes.status}`);
      }
      
      const twseData = await twseRes.json();
      twseData.forEach((item: any) => {
        const price = parseFloat(item.ClosingPrice);
        const change = parseFloat(item.Change);
        let percentChange = 0;
        
        if (!isNaN(price) && !isNaN(change)) {
          // 昨收價 = 今收價 - 漲跌價
          const prevPrice = price - change;
          if (prevPrice !== 0) {
            percentChange = (change / prevPrice) * 100;
          }
        }

        priceMap[item.Code] = {
          price: item.ClosingPrice,
          change: item.Change,
          percentChange: percentChange
        };
      });

      if (Object.keys(priceMap).length === 0) {
        throw new Error("無法取得上市股價資料，請稍後再試");
      }

      setStockData(priceMap);

      if (priceMap['0050'] && priceMap['0050'].price) {
        setCurrentPriceStr(priceMap['0050'].price.replace(/,/g, ''));
      }
    } catch (error: any) {
      console.error("Failed to fetch stock prices", error);
      setFetchError(error.message || "Failed to fetch");
    } finally {
      setIsFetching(false);
    }
  };

  const handleAddRecord = (record: Omit<InvestmentRecord, 'id'>) => {
    const newRecord: InvestmentRecord = {
      ...record,
      id: crypto.randomUUID()
    };
    setInvestments([...investments, newRecord]);
  };

  const handleEditRecord = (id: string, updatedRecord: Omit<InvestmentRecord, 'id'>) => {
    setInvestments(investments.map(inv => 
      inv.id === id ? { ...updatedRecord, id } : inv
    ));
  };

  const handleDeleteRecord = (id: string) => {
    setInvestments(investments.filter(inv => inv.id !== id));
  };

  const handleLogout = () => {
    setRoomId('');
    isInitialLoad.current = true;
  };

  if (!roomId) {
    return <Login onLogin={setRoomId} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-50 flex-shrink-0 shadow-xl z-10 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <PieChart className="h-6 w-6 text-indigo-400" />
              0050 存股計畫
            </h1>
            <p className="text-sm text-slate-400 mt-1">為家人的未來深耕投資</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-slate-400 hover:text-white transition-colors"
            title="登出家庭空間"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" /> 總覽面板
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'records' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ListPlus className="h-5 w-5" /> 投資紀錄
          </button>
          <button
            onClick={() => setActiveTab('constituents')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'constituents' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <PieChart className="h-5 w-5" /> 0050 成分股
          </button>
        </nav>
        
        <div className="p-6 mt-auto border-t border-slate-800 bg-slate-800/50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Settings className="h-4 w-4" /> 0050 目前股價
              </label>
              <button 
                onClick={fetchStockPrices}
                disabled={isFetching}
                className="text-slate-400 hover:text-white transition-colors"
                title="重新整理股價"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400">NT$</span>
              <Input 
                type="number" 
                min="0" 
                step="0.01" 
                className="pl-10 bg-slate-900 border-slate-700 text-white focus-visible:ring-indigo-500 h-9"
                value={currentPriceStr}
                onChange={(e) => setCurrentPriceStr(e.target.value)}
              />
            </div>
            {fetchError ? (
              <p className="text-xs text-red-400 leading-relaxed">
                擷取股價失敗：{fetchError}。您可以手動輸入股價。
              </p>
            ) : (
              <p className="text-xs text-slate-400 leading-relaxed">
                開啟程式時已自動擷取最新報價，用於計算目前市值與未實現損益。
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-50/50">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard investments={investments} profiles={profiles} currentPrice={currentPrice} />
          )}
          {activeTab === 'records' && (
            <Records 
              investments={investments} 
              profiles={profiles} 
              onAdd={handleAddRecord} 
              onEdit={handleEditRecord}
              onDelete={handleDeleteRecord} 
            />
          )}
          {activeTab === 'constituents' && (
            <Constituents stockData={stockData} />
          )}
        </div>
      </main>
    </div>
  );
}
