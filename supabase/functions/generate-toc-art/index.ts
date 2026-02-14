const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TOC_PROMPT = `Create a tall vertical cyberpunk-themed table of contents image for a Kickstarter campaign for a card game called "WIRED" — a cybersecurity-themed trading card game.

The image should be a dark, moody cyberpunk poster with the following TABLE OF CONTENTS items listed vertically with decorative cyberpunk elements between them:

1. WELCOME TO WIRED
2. HOW TO PLAY
3. WHAT'S IN THE BOX
4. GAME MODES
5. REWARD TIERS
6. ADD-ONS
7. STRETCH GOALS

Art direction:
- Deep dark background (near black with dark blue/purple tones)
- Neon green, electric blue, and purple glow effects throughout
- Circuit board traces and network cable lines weaving between the text entries
- Each TOC entry should have a small thematic icon or illustration next to it:
  - "WELCOME TO WIRED" — a glowing neon "WIRED" logo with circuit traces
  - "HOW TO PLAY" — a hand holding glowing playing cards
  - "WHAT'S IN THE BOX" — an open box with neon light spilling out and cables emerging
  - "GAME MODES" — three glowing monitors showing different game screens
  - "REWARD TIERS" — stacked treasure/reward boxes with neon outlines
  - "ADD-ONS" — gear/upgrade icons with circuit connections
  - "STRETCH GOALS" — a progress bar with electric sparks at the endpoint

- Include 2-3 cyberpunk character silhouettes integrated into the design:
  - A hooded hacker figure with glowing green visor (representing the Security Specialist)
  - A sleek corporate figure in a suit with digital glasses (representing the Headhunter)
  - A tech worker with tool belt and glowing cables (representing the Field Tech)

- Playing cards should be scattered/floating throughout the composition, some showing cyberpunk artwork, some face-down with circuit board patterns on the back

- The overall composition should flow like a vertical infographic with energy lines connecting each section
- Text should be in a futuristic/tech font style, glowing with neon green primary color
- Add subtle scan lines and digital noise texture for authenticity
- The aspect ratio should be roughly 2:3 (tall vertical format, like a Kickstarter page section)

Make the text VERY CLEAR and READABLE. The section titles must be the dominant text elements.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const adminPassword = Deno.env.get("ADMIN_PASSWORD");
  const providedPassword = req.headers.get("x-admin-password");

  if (!providedPassword || providedPassword !== adminPassword) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Allow custom prompt override from request body
    let prompt = TOC_PROMPT;
    try {
      const body = await req.json();
      if (body.prompt) prompt = body.prompt;
    } catch {
      // No body or invalid JSON, use default prompt
    }

    console.log("Calling Lovable AI gateway for image generation...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          { role: "user", content: prompt },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds to your Lovable workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Image generation failed. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textContent = data.choices?.[0]?.message?.content || "";

    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data).slice(0, 500));
      return new Response(JSON.stringify({ error: "No image was generated. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Image generated successfully");

    return new Response(JSON.stringify({ image: imageUrl, description: textContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-toc-art error:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
