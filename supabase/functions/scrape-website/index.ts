import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function pick(re: RegExp, html: string): string {
  const m = html.match(re);
  return m ? m[1].trim() : "";
}

function stripText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 6000);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  try {
    let { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "No URL provided" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!url.startsWith("http")) url = "https://" + url;
    const origin = new URL(url).origin;

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ContentCharmBot/1.0)" },
    });
    const html = await res.text();

    // --- raw signals ---
    const ogSite = pick(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i, html);
    const ogTitle = pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i, html);
    const title = pick(/<title[^>]*>([^<]+)<\/title>/i, html);
    const rawName = ogSite || ogTitle || title.split(/[|\-\u2013\u2014]/)[0].trim();

    let logo = pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i, html);
    if (!logo) {
      const icon = pick(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/i, html);
      if (icon) logo = icon;
    }
    if (logo && logo.startsWith("/")) logo = origin + logo;

    const hexMatches = html.match(/#[0-9a-fA-F]{6}/g) || [];
    const freq: Record<string, number> = {};
    for (const h of hexMatches) {
      const hex = h.toLowerCase();
      if (hex === "#ffffff" || hex === "#000000") continue;
      freq[hex] = (freq[hex] || 0) + 1;
    }
    const scrapedColors = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([hex]) => hex);

    const pageText = stripText(html);

    // --- GPT-4o brand DNA extraction ---
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    let dna: any = {};
    if (openaiApiKey && pageText.length > 50) {
      const sys = "You are a brand strategist. Read the website text and return ONLY valid JSON (no markdown, no backticks) describing the brand. Use this exact shape: {\"industry\":\"\",\"targetAudience\":\"\",\"toneOfVoice\":\"\",\"keyServices\":[],\"messagingThemes\":[],\"vocabularyToUse\":[],\"vocabularyToAvoid\":[],\"brandSummary\":\"\"}. Keep arrays to 3-6 short items. brandSummary is one sentence.";
      const userMsg = "Brand name: " + rawName + "\n\nWebsite text:\n" + pageText;
      try {
        const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + openaiApiKey },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [{ role: "system", content: sys }, { role: "user", content: userMsg }],
            temperature: 0.4,
          }),
        });
        const aiData = await aiRes.json();
        const raw = aiData.choices?.[0]?.message?.content || "{}";
        const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
        dna = JSON.parse(cleaned);
      } catch (_e) {
        dna = {};
      }
    }

    return new Response(JSON.stringify({
      businessName: rawName,
      logo,
      colors: scrapedColors,
      industry: dna.industry || "",
      targetAudience: dna.targetAudience || "",
      toneOfVoice: dna.toneOfVoice || "",
      keyServices: dna.keyServices || [],
      messagingThemes: dna.messagingThemes || [],
      vocabularyToUse: dna.vocabularyToUse || [],
      vocabularyToAvoid: dna.vocabularyToAvoid || [],
      brandSummary: dna.brandSummary || "",
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Scrape failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
