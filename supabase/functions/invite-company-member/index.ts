/*import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type InviteRole = "admin" | "operator";

interface InviteCompanyMemberPayload {
  companyId: string;
  email: string;
  displayName: string;
  role: InviteRole;
  password: string;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function isValidRole(role: string): role is InviteRole {
  return role === "admin" || role === "operator";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return jsonResponse(
      {
        success: false,
        error: "Método no permitido.",
      },
      405
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse(
        {
          success: false,
          error: "Faltan variables de entorno de Supabase.",
        },
        500
      );
    }

    const authorizationHeader = req.headers.get("Authorization");

    if (!authorizationHeader) {
      return jsonResponse(
        {
          success: false,
          error: "No se recibió token de autorización.",
        },
        401
      );
    }

    const accessToken = authorizationHeader.replace("Bearer ", "").trim();

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      data: { user: currentUser },
      error: userError,
    } = await adminClient.auth.getUser(accessToken);

    if (userError || !currentUser) {
      return jsonResponse(
        {
          success: false,
          error: "Sesión inválida o expirada.",
        },
        401
      );
    }

    const payload = (await req.json()) as Partial<InviteCompanyMemberPayload>;

    const companyId = String(payload.companyId ?? "").trim();
    const email = String(payload.email ?? "").trim().toLowerCase();
    const displayName = String(payload.displayName ?? "").trim();
    const role = String(payload.role ?? "").trim();
    const password = String(payload.password ?? "");

    if (!companyId || !email || !displayName || !role || !password) {
      return jsonResponse(
        {
          success: false,
          error: "Todos los campos son obligatorios.",
        },
        400
      );
    }

    if (!isValidRole(role)) {
      return jsonResponse(
        {
          success: false,
          error: "Rol inválido. Solo se permite admin u operator.",
        },
        400
      );
    }

    if (password.length < 8) {
      return jsonResponse(
        {
          success: false,
          error: "La contraseña debe tener mínimo 8 caracteres.",
        },
        400
      );
    }

    const { data: inviterMember, error: inviterError } = await adminClient
      .from("company_members")
      .select("id, company_id, user_id, role, status")
      .eq("company_id", companyId)
      .eq("user_id", currentUser.id)
      .eq("status", "active")
      .maybeSingle();

    if (inviterError) {
      return jsonResponse(
        {
          success: false,
          error: inviterError.message,
        },
        500
      );
    }

    if (!inviterMember) {
      return jsonResponse(
        {
          success: false,
          error: "No perteneces a esta empresa o tu usuario está inactivo.",
        },
        403
      );
    }

    if (inviterMember.role !== "owner" && inviterMember.role !== "admin") {
      return jsonResponse(
        {
          success: false,
          error: "No tienes permisos para invitar usuarios.",
        },
        403
      );
    }

    const { data: existingMember, error: existingMemberError } =
      await adminClient
        .from("company_members")
        .select("id, email, status")
        .eq("company_id", companyId)
        .eq("email", email)
        .maybeSingle();

    if (existingMemberError) {
      return jsonResponse(
        {
          success: false,
          error: existingMemberError.message,
        },
        500
      );
    }

    if (existingMember) {
      return jsonResponse(
        {
          success: false,
          error: "Este correo ya pertenece a la empresa.",
        },
        409
      );
    }

    const { data: createdUserData, error: createUserError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          display_name: displayName,
          company_id: companyId,
          role,
          invited_by: currentUser.id,
          app: "TraceQrHub",
        },
      });

    if (createUserError || !createdUserData.user) {
      return jsonResponse(
        {
          success: false,
          error: createUserError?.message ?? "No se pudo crear el usuario.",
        },
        400
      );
    }

    const createdUser = createdUserData.user;

    const { data: memberData, error: memberInsertError } = await adminClient
      .from("company_members")
      .insert({
        company_id: companyId,
        user_id: createdUser.id,
        email,
        display_name: displayName,
        role,
        status: "active",
      })
      .select(
        `
        id,
        company_id,
        user_id,
        email,
        display_name,
        role,
        status,
        created_at,
        updated_at
      `
      )
      .single();

    if (memberInsertError) {
      await adminClient.auth.admin.deleteUser(createdUser.id);

      return jsonResponse(
        {
          success: false,
          error: memberInsertError.message,
        },
        500
      );
    }

    return jsonResponse({
      success: true,
      message: "Usuario invitado correctamente.",
      user: {
        id: createdUser.id,
        email: createdUser.email,
      },
      member: memberData,
    });
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error inesperado al invitar usuario.",
      },
      500
    );
  }
});*/