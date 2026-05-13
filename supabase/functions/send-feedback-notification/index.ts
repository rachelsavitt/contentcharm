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

function createFeedbackNotificationEmail(
  freelancerName: string,
  clientName: string,
  month: string,
  approvedCount: number,
  editsCount: number,
  declinedCount: number,
  editsRequested: Array<{ title: string; comment: string }>,
  dashboardUrl: string
) {
  const content = `
    <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">
      Hi ${freelancerName},
    </h1>

    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #333333;">
      ${clientName} just finished reviewing their ${month} content calendar.
    </p>

    <div style="margin: 24px 0; padding: 24px; background-color: #f8f8f8; border-radius: 8px;">
      <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">
        Here's the summary:
      </p>
      <p style="margin: 8px 0; font-size: 16px; line-height: 1.8; color: #333333;">
        ✓ Approved: ${approvedCount} posts
      </p>
      <p style="margin: 8px 0; font-size: 16px; line-height: 1.8; color: #333333;">
        ✏ Edits requested: ${editsCount} posts
      </p>
      <p style="margin: 8px 0; font-size: 16px; line-height: 1.8; color: #333333;">
        ✕ Declined: ${declinedCount} posts
      </p>
    </div>

    ${editsRequested.length > 0 ? `
      <div style="margin: 24px 0;">
        <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">
          Posts needing edits:
        </p>
        ${editsRequested.map(edit => `
          <div style="margin: 12px 0; padding: 12px; background-color: #fff8f0; border-left: 3px solid ${BRAND_COLOR}; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #1a1a1a;">
              ${edit.title}
            </p>
            <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #555555;">
              "${edit.comment}"
            </p>
          </div>
        `).join('')}
      </div>
    ` : ''}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td align="center">
          <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND_COLOR}; color: #1a1a1a; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            View Calendar →
          </a>
        </td>
      </tr>
    </table>
  `;

  return {
    subject: `${clientName} has reviewed their content`,
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
    const {
      freelancerEmail,
      freelancerName,
      clientName,
      month,
      approvedCount,
      editsCount,
      declinedCount,
      editsRequested,
      dashboardUrl,
      calendarId,
    } = await req.json();

    if (!freelancerEmail || !freelancerName || !clientName || !month || !dashboardUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (!resendApiKey || resendApiKey === "re_123456789") {
      console.log("Development mode: Email would be sent to:", freelancerEmail);
      console.log("Subject:", `${clientName} has reviewed their content`);
      console.log("Dashboard URL:", dashboardUrl);
      console.log("Summary:", { approvedCount, editsCount, declinedCount });

      await serviceClient.from("email_logs").insert({
        recipient: freelancerEmail,
        email_type: "feedback_notification",
        subject: `${clientName} has reviewed their content`,
        status: "success",
        metadata: {
          calendar_id: calendarId,
          approved_count: approvedCount,
          edits_count: editsCount,
          declined_count: declinedCount,
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

    const emailTemplate = createFeedbackNotificationEmail(
      freelancerName,
      clientName,
      month,
      approvedCount,
      editsCount,
      declinedCount,
      editsRequested || [],
      dashboardUrl
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: freelancerEmail,
      reply_to: REPLY_TO_EMAIL,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    await serviceClient.from("email_logs").insert({
      recipient: freelancerEmail,
      email_type: "feedback_notification",
      subject: emailTemplate.subject,
      status: error ? "failed" : "success",
      error_message: error?.message || null,
      metadata: {
        calendar_id: calendarId,
        approved_count: approvedCount,
        edits_count: editsCount,
        declined_count: declinedCount,
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
    console.error("Error sending feedback notification:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
