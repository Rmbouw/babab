// ================================================================
// CLOUDFLARE WORKER - ZYX DATA COLLECTOR
// ================================================================

// GANTI INI DENGAN KV NAMESPACE YANG KAMU BUAT
// Buka Cloudflare Dashboard → Workers & Pages → KV → Buat namespace
// Nama: ZYX_DATA

const KV_NAMESPACE = 'ZYX_DATA';
const STORAGE_KEY = 'zyx_data_list';

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const method = request.method;

        // CORS
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        if (method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // ========== GET: Ambil semua data ==========
        if (method === 'GET') {
            try {
                const data = await env[KV_NAMESPACE].get(STORAGE_KEY);
                const parsed = data ? JSON.parse(data) : [];
                return new Response(JSON.stringify({ success: true, data: parsed }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            } catch (err) {
                return new Response(JSON.stringify({ success: false, error: err.message }), {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
        }

        // ========== POST: Simpan data ==========
        if (method === 'POST') {
            try {
                const body = await request.json();
                // Ambil data existing
                const existing = await env[KV_NAMESPACE].get(STORAGE_KEY);
                let list = existing ? JSON.parse(existing) : [];

                // Cek duplikat berdasarkan ID
                const exists = list.some(item => item.id === body.id);
                if (!exists) {
                    list.push(body);
                    await env[KV_NAMESPACE].put(STORAGE_KEY, JSON.stringify(list));
                }

                return new Response(JSON.stringify({ success: true, message: 'Data saved', total: list.length }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            } catch (err) {
                return new Response(JSON.stringify({ success: false, error: err.message }), {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
        }

        // ========== DELETE: Hapus semua data ==========
        if (method === 'DELETE') {
            try {
                await env[KV_NAMESPACE].delete(STORAGE_KEY);
                return new Response(JSON.stringify({ success: true, message: 'All data deleted' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            } catch (err) {
                return new Response(JSON.stringify({ success: false, error: err.message }), {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
        }

        return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }
};