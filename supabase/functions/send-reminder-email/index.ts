import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@4.0.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const FROM_EMAIL = "noreply@contentcharmai.com";
const REPLY_TO_EMAIL = "support@contentcharmai.com";

function createEmailLayout(content) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background-color: #f9f9f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr><td style="padding: 40px;">${content}</td></tr>
        </table>
        <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
          <tr><td align="center"><p style="margin: 0; font-size: 12px; color: #666666;">Content Charm - Content calendar management for freelancers</p></td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function createReminderEmail(clientName, freelancerName, calendarTitle, shareUrl, pendingPosts, primaryColor, logoUrl) {
  const pendingPostsHtml = pendingPosts.map(post => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
        <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">${post.title}</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #888888;">${post.platform}${post.scheduled_date ? " · " + new Date(post.scheduled_date).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : ""}</p>
      </td>
    </tr>
  `).join("");

  const logoHtml = logoUrl ? `<div style="text-align: center; margin-bottom: 32px;"><img src="${logoUrl}" alt="Logo" style="max-width: 200px; height: auto;"></div>` : "";

  const content = `
    ${logoHtml}
    <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">Hi ${clientName} 👋</h1>
    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #333333;">
      Just a friendly reminder — your <strong>${calendarTitle}</strong> has ${pendingPosts.length} ${pendingPosts.length === 1 ? "post" : "posts"} still waiting for your approval.
    </p>
    <div style="background-color: #fafafa; border-radius: 8px; padding: 20px; margin: 0 0 24px 0; border: 1px solid #eeeeee;">
      <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 600; color: #888888; text-transform: uppercase; letter-spacing: 0.5px;">Still needs your approval:</p>
      <table width="100%" cellpadding="0" cellspacing="0">${pendingPostsHtml}</table>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td align="center">
          <a href="${shareUrl}" style="display: inline-block; padding: 14px 32px; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Review my content →
          </a>
        </td>
      </tr>
    </table>
    <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #666666;">No login needed — just click the button above.</p>
    <p style="margin: 16px 0 0 0; font-size: 16px; color: #333333;">${freelancerName}</p>
  `;

  return {
    subject: `Reminder: ${pendingPosts.length} post${pendingPosts.length === 1 ? "" : "s"} still need your approval`,
    html: createEmailLayout(content),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization") } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { clientEmail, clientName, freelancerName, calendarTitle, shareUrl, pendingPosts, primaryColor, logoUrl, calendarId } = await req.json();

    if (!clientEmail || !clientName || !freelancerName || !calendarTitle || !shareUrl || !pendingPosts) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const emailTemplate = createReminderEmail(clientName, freelancerName, calendarTitle, shareUrl, pendingPosts, primaryColor || "#C9A96E", logoUrl);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: clientEmail,
      reply_to: REPLY_TO_EMAIL,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    const serviceClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    await serviceClient.from("email_logs").insert({
      recipient: clientEmail,
      email_type: "approval_reminder",
      subject: emailTemplate.subject,
      status: error ? "failed" : "success",
      error_message: error?.message || null,
      metadata: { calendar_id: calendarId, user_id: user.id, resend_id: data?.id },
    });

    if (error) {
      return new Response(JSON.stringify({ error: "Failed to send email" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true, emailId: data.id }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
