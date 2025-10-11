// supabase/functions/start-shipping-simulation/index.ts

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?dts";

// Headers để xử lý lỗi CORS khi gọi từ app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const getEnv = (key: string): string | undefined => {
  if (typeof (globalThis as any).Deno !== "undefined" && (globalThis as any).Deno.env) {
    return (globalThis as any).Deno.env.get(key);
  }
  return (globalThis as Record<string, unknown>)[key] as string | undefined;
};

interface ShippingHistoryEntry {
  status: string;
  updated_at: string;
  location: string;
}

interface RequestBody {
  order_id?: number;
}

interface SupabaseUpdatePayload {
  tracking_code: string;
  shipping_status: string;
  tracking_history: ShippingHistoryEntry[];
}

serve(async (req: Request): Promise<Response> => {
  // Bắt buộc phải có để trình duyệt không chặn request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl: string | undefined = getEnv("SUPABASE_URL") ?? getEnv("EXPO_PUBLIC_SUPABASE_URL");
    const supabaseAnonKey: string | undefined = getEnv("SUPABASE_ANON_KEY") ?? getEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase credentials" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    );

    let body: RequestBody;
    try {
      body = await req.json() as RequestBody;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { order_id } = body;
    if (!order_id) {
      throw new Error("Vui lòng cung cấp 'order_id'.");
    }

    const trackingCode: string = `EXPRESS-SHIP-${Math.floor(100000 + Math.random() * 900000)}`;
    const initialStatus: string = 'Đang chuẩn bị hàng';
    
    const initialHistory: ShippingHistoryEntry[] = [{
      status: initialStatus,
      updated_at: new Date().toISOString(),
      location: "Kho Express, America" // Địa điểm giả
    }];

    const updatePayload: SupabaseUpdatePayload = {
      tracking_code: trackingCode,
      shipping_status: initialStatus,
      tracking_history: initialHistory,
    };

    const { error }: { error: Error | null } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', order_id);

    if (error) throw error;

    return new Response(JSON.stringify({ message: 'Bắt đầu giao hàng thành công!', tracking_code: trackingCode }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});