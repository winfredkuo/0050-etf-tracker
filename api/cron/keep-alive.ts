import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // 檢查是否為 Vercel Cron 發出的請求 (可選，增加安全性)
  // const authHeader = req.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new Response('Missing Supabase environment variables', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 執行一個極小的查詢來保持活躍
    const { data, error } = await supabase
      .from('family_data')
      .select('room_id')
      .limit(1);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, message: 'Supabase is awake!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
