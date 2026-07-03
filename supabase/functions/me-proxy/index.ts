// Magic Eden Solana proxy — lets the browser tracker read Magic Eden data.
// Magic Eden's API sends no CORS header and is DataDome-protected, so it can't be
// called directly from the GitHub Pages app. This function calls it server-side and
// returns the JSON with proper CORS headers. Read-only: only collection stats + token
// metadata are allowed, so it can't be abused as an open proxy.
//
// Optional secret MAGICEDEN_KEY (set via `supabase secrets set`) raises the rate limit
// and helps get past DataDome. Works keyless on the public tier (~120 req/min) too.

const ME_BASE = "https://api-mainnet.magiceden.dev/v2";

// Only these path prefixes are forwarded (read-only NFT data).
const ALLOWED = [/^collections\/[^/]+\/stats$/, /^tokens\/[^/?]+$/];

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const path = new URL(req.url).searchParams.get("path") || "";
  if (!ALLOWED.some((re) => re.test(path))) {
    return new Response(JSON.stringify({ error: "path not allowed", path }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const key = Deno.env.get("MAGICEDEN_KEY");
  const headers: Record<string, string> = { Accept: "application/json" };
  if (key) headers["Authorization"] = `Bearer ${key}`;

  try {
    const r = await fetch(`${ME_BASE}/${path}`, { headers });
    const body = await r.text();
    return new Response(body, {
      status: r.status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 502,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
