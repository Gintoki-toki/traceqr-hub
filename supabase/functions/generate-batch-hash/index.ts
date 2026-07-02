/*import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256(secret: string, message: string) {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message)
  );

  return toHex(signature);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Método no permitido" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "No autorizado" }, 401);
    }

    const accessToken = authHeader.replace("Bearer ", "").trim();

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const qrSigningSecret = Deno.env.get("QR_SIGNING_SECRET");

    if (!supabaseUrl || !serviceRoleKey || !qrSigningSecret) {
      return jsonResponse(
        { error: "Faltan variables de entorno del servidor" },
        500
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      data: { user },
      error: userError,
    } = await adminClient.auth.getUser(accessToken);

    if (userError || !user) {
      return jsonResponse({ error: "Sesión inválida" }, 401);
    }

    const { batchId } = await req.json();

    if (!batchId) {
      return jsonResponse({ error: "Falta batchId" }, 400);
    }

    const { data: batch, error: batchError } = await adminClient
      .from("qr_batches")
      .select(
        `
        id,
        company_id,
        product_id,
        batch_code,
        name,
        quantity,
        generated_count,
        batch_hash,
        status,
        pdf_ready
      `
      )
      .eq("id", batchId)
      .single();

    if (batchError || !batch) {
      return jsonResponse({ error: "No se encontró el lote" }, 404);
    }

    if (batch.status !== "draft") {
      return jsonResponse(
        { error: "Solo se pueden generar lotes en estado borrador" },
        400
      );
    }

    if (batch.quantity <= 0) {
      return jsonResponse({ error: "La cantidad del lote no es válida" }, 400);
    }

    const { data: member, error: memberError } = await adminClient
      .from("company_members")
      .select("id, role, status")
      .eq("company_id", batch.company_id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (memberError || !member) {
      return jsonResponse(
        { error: "No tienes permisos para generar este lote" },
        403
      );
    }

    const generatedAt = new Date().toISOString();

    const batchHashPayload = JSON.stringify({
      app: "TraceQrHub",
      version: "1",
      companyId: batch.company_id,
      productId: batch.product_id,
      batchId: batch.id,
      batchCode: batch.batch_code,
      quantity: batch.quantity,
      generatedAt,
    });

    const batchHash = await hmacSha256(qrSigningSecret, batchHashPayload);

    const { error: updateError } = await adminClient
      .from("qr_batches")
      .update({
        batch_hash: batchHash,
        generated_count: batch.quantity,
        status: "generated",
        pdf_ready: false,
      })
      .eq("id", batch.id);

    if (updateError) {
      return jsonResponse(
        { error: `Error al actualizar lote: ${updateError.message}` },
        500
      );
    }

    await adminClient.from("qr_events").insert({
      company_id: batch.company_id,
      batch_id: batch.id,
      event_type: "qr_generated",
      created_by: user.id,
      metadata: {
        strategy: "batch_hash_only",
        algorithm: "HMAC-SHA256",
        qrDerivation: "SHA-512 later from batch_hash + short_code",
        quantity: batch.quantity,
        batchCode: batch.batch_code,
      },
    });

    return jsonResponse({
      success: true,
      message: "Lote generado correctamente",
      batch: {
        id: batch.id,
        batchCode: batch.batch_code,
        quantity: batch.quantity,
        generatedCount: batch.quantity,
        status: "generated",
        pdfReady: false,
      },
    });
  } catch (error) {
    console.error("[generate-batch-hash] Unexpected error:", error);

    return jsonResponse(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      500
    );
  }
});*/