import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const ALLOWED_ORIGINS = [
  "https://wired-tcg.lovable.app",
  "https://id-preview--01a84b36-38b5-44f5-84e8-d310aea37c80.lovable.app",
  "http://localhost:8080",
  "http://localhost:5173",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  };
}

// Simple in-memory rate limiter
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const MAX_FAILED_ATTEMPTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = failedAttempts.get(ip);
  if (!record) return false;
  if (now - record.lastAttempt > RATE_LIMIT_WINDOW) {
    failedAttempts.delete(ip);
    return false;
  }
  return record.count >= MAX_FAILED_ATTEMPTS;
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const record = failedAttempts.get(ip);
  if (!record || now - record.lastAttempt > RATE_LIMIT_WINDOW) {
    failedAttempts.set(ip, { count: 1, lastAttempt: now });
  } else {
    record.count++;
    record.lastAttempt = now;
  }
}

function clearFailedAttempts(ip: string) {
  failedAttempts.delete(ip);
}

const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Name too long"),
  description: z.string().max(1000, "Description too long").nullable().optional(),
  price: z.number().min(0, "Price cannot be negative").max(999999.99, "Price too high"),
  image_url: z.string().url("Invalid image URL").nullable().optional(),
  card_color: z.string().min(1).max(50).default("primary"),
  active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

const productUpdateSchema = productSchema.partial().extend({
  id: z.string().uuid("Invalid product ID"),
});

function sanitizeError(error: any): string {
  console.error("Admin operation failed:", error);
  return "Operation failed. Please try again.";
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (isRateLimited(clientIp)) {
    console.warn(`Rate limited: ${clientIp}`);
    return new Response(JSON.stringify({ error: "Too many failed attempts. Please wait and try again." }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const adminPassword = Deno.env.get("ADMIN_PASSWORD");
  const providedPassword = req.headers.get("x-admin-password");

  if (!providedPassword || providedPassword !== adminPassword) {
    recordFailedAttempt(clientIp);
    console.warn(`Failed auth attempt from: ${clientIp}`);
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  clearFailedAttempts(clientIp);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST" && action === "upload-image") {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      if (!file) throw new Error("No file provided");

      const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        return new Response(JSON.stringify({ error: "Invalid file type. Allowed: PNG, JPEG, WebP, GIF" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (file.size > 5 * 1024 * 1024) {
        return new Response(JSON.stringify({ error: "File too large. Max 5MB." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const ext = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;

      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, { contentType: file.type });
      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      return new Response(JSON.stringify({ url: urlData.publicUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const validated = productSchema.parse(body);
      const { data, error } = await supabase
        .from("products")
        .insert(validated)
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "PUT") {
      const body = await req.json();
      const validated = productUpdateSchema.parse(body);
      const { id, ...updates } = validated;
      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE") {
      const body = await req.json();
      const { id } = z.object({ id: z.string().uuid() }).parse(body);
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const status = error instanceof z.ZodError ? 400 : 500;
    return new Response(JSON.stringify({ error: sanitizeError(error) }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
