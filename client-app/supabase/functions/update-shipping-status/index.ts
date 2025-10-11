// supabase/functions/update-shipping-status/index.ts
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?dts";

// Danh sách các địa điểm giả để làm cho timeline thú vị hơn
const locations = [
  "Departed from sorting hub",
  "In transit ",
  "Arrived at local delivery station",
  "Out for delivery to your address"
];

interface TrackingHistoryEntry {
  status: string;
  updated_at: string;
  location: string;
}

interface Order {
  tracking_history: TrackingHistoryEntry[];
}

interface UpdateShippingStatusRequest {
  order_id: number;
  new_status: string;
}

const getEnv = (key: string): string | undefined => {
  if (typeof (globalThis as any).Deno !== "undefined" && ((globalThis as any).Deno as { env?: { get: (k: string) => string | undefined } }).env) {
    return ((globalThis as any).Deno as { env: { get: (k: string) => string | undefined } }).env.get(key);
  }
  return ((globalThis as any)[key]);
};

serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const SUPABASE_URL = getEnv("SUPABASE_URL") ?? getEnv("EXPO_PUBLIC_SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY =
    getEnv("SUPABASE_SERVICE_ROLE_KEY") ?? getEnv("EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Missing Supabase credentials" }), { status: 500 });
  }

  let payload: UpdateShippingStatusRequest;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), { status: 400 });
  }

  const { order_id, new_status } = payload;

  const supabaseAdmin = createClient(
    SUPABASE_URL!,
    SUPABASE_SERVICE_ROLE_KEY!,
    {
      // Important on server: do not persist sessions or attempt token auto-refresh
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  try {
    // 1. Lấy lịch sử tracking hiện tại
    const { data: currentOrder, error: fetchError }: { data: Order | null; error: any } = await supabaseAdmin
      .from('orders')
      .select('tracking_history')
      .eq('id', order_id)
      .single();

    if (fetchError || !currentOrder) {
      return new Response(JSON.stringify({ error: "Không tìm thấy đơn hàng" }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // 2. Tạo bản ghi lịch sử mới
    const newHistoryEntry: TrackingHistoryEntry = {
      status: new_status,
      updated_at: new Date().toISOString(),
      location: locations[Math.floor(Math.random() * locations.length)] // Lấy ngẫu nhiên một địa điểm
    };
    
    const updatedHistory: TrackingHistoryEntry[] = [...(currentOrder.tracking_history || []), newHistoryEntry];

    // 3. Cập nhật trạng thái và lịch sử mới
    const { error: updateError }: { error: any } = await supabaseAdmin
      .from('orders')
      .update({
        shipping_status: new_status,
        tracking_history: updatedHistory,
      })
      .eq('id', order_id);

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ message: `Cập nhật trạng thái thành công cho đơn ${order_id}` }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    // If Supabase client attempted a refresh and failed, surface a clear response
    if (err?.message?.includes?.('Refresh Token')) {
      return new Response(JSON.stringify({ error: 'Auth refresh error in function (invalid/expired refresh token).' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: err?.message ?? 'Internal error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});