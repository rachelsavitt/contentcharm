import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@4.0.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const BRAND_COLOR = '#C9A96E';
const FROM_EMAIL = 'noreply@contentcharmai.com';
const REPLY_TO_EMAIL = 'support@contentcharmai.com';

function createEmailLayout(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Content Charm</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9f9f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
        </table>
        <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
          <tr>
            <td align="center" style="padding: 0 20px;">
              <p style="margin: 0; font-size: 12px; color: #666666;">
                Content Charm - Content calendar management for freelancers
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function createCalendarShareEmail(
  clientName: string,
  freelancerName: string,
  month: string,
  shareUrl: string,
  personalMessage?: string,
  logoUrl?: string
) {
  const content = `
    ${logoUrl ? `
      <div style="text-align: center; margin-bottom: 32px;">
        <img src="${logoUrl}" alt="Logo" style="max-width: 200px; height: auto;">
      </div>
    ` : ''}

    <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">
      Hi ${clientName},
    </h1>

    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #333333;">
      Your ${month} content calendar is ready for your review.
    </p>

    ${personalMessage ? `
      <div style="margin: 24px 0; padding: 16px; background-color: #f8f8f8; border-left: 4px solid ${BRAND_COLOR}; border-radius: 4px;">
        <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #333333; font-style: italic;">
          "${personalMessage}"
        </p>
      </div>
    ` : ''}

    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #333333;">
      Please review each post and let us know what you think — you can approve, request edits, or decline each one directly on the page.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td align="center">
          <a href="${shareUrl}" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND_COLOR}; color: #1a1a1a; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Review My Content →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
      This link is unique to you and doesn't require a login or account.
    </p>

    <p style="margin: 16px 0 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
      Questions? Just reply to this email.
    </p>

    <p style="margin: 24px 0 0 0; font-size: 16px; color: #333333;">
      ${freelancerName}
    </p>
  `;

  return {
    subject: `${clientName}'s content is ready to review`,
    html: createEmailLayout(content),
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      clientEmail,
      clientName,
      freelancerName,
      month,
      shareUrl,
      personalMessage,
      logoUrl,
      calendarId,
    } = await req.json();

    if (!clientEmail || !clientName || !freelancerName || !month || !shareUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey || resendApiKey === "re_123456789") {
      console.log("Development mode: Email would be sent to:", clientEmail);
      console.log("Subject:", `${clientName}'s content is ready to review`);
      console.log("Share URL:", shareUrl);
      console.log("Personal message:", personalMessage || "None");

      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      await serviceClient.from("email_logs").insert({
        recipient: clientEmail,
        email_type: "calendar_share",
        subject: `${clientName}'s content is ready to review`,
        status: "success",
        metadata: {
          calendar_id: calendarId,
          user_id: user.id,
          mode: "development",
        },
      });

      return new Response(
        JSON.stringify({ success: true, mode: "development" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const resend = new Resend(resendApiKey);

    const emailTemplate = createCalendarShareEmail(
      clientName,
      freelancerName,
      month,
      shareUrl,
      personalMessage,
      logoUrl
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: clientEmail,
      reply_to: REPLY_TO_EMAIL,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await serviceClient.from("email_logs").insert({
      recipient: clientEmail,
      email_type: "calendar_share",
      subject: emailTemplate.subject,
      status: error ? "failed" : "success",
      error_message: error?.message || null,
      metadata: {
        calendar_id: calendarId,
        user_id: user.id,
        resend_id: data?.id,
      },
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, emailId: data.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending calendar email:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
