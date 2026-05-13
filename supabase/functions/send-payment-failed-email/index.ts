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

function createPaymentFailedEmail(userName: string, billingPortalUrl: string) {
  const content = `
    <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">
      Hi ${userName},
    </h1>

    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #333333;">
      We weren't able to process your payment for Content Charm.
    </p>

    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #333333;">
      This sometimes happens when a card expires or has insufficient funds. Your account is still active for the next 7 days while you sort it out.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td align="center">
          <a href="${billingPortalUrl}" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND_COLOR}; color: #1a1a1a; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Update payment method →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
      If you need help, just reply to this email.
    </p>

    <p style="margin: 24px 0 0 0; font-size: 16px; color: #333333;">
      The Content Charm Team
    </p>
  `;

  return {
    subject: "Action needed — your Content Charm payment didn't go through",
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
      userEmail,
      userName,
      billingPortalUrl,
      userId,
    } = await req.json();

    if (!userEmail || !userName || !billingPortalUrl) {
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
      console.log("Development mode: Payment failed email would be sent to:", userEmail);
      console.log("Subject: Action needed — your Content Charm payment didn't go through");
      console.log("Billing portal URL:", billingPortalUrl);

      await serviceClient.from("email_logs").insert({
        recipient: userEmail,
        email_type: "payment_failed",
        subject: "Action needed — your Content Charm payment didn't go through",
        status: "success",
        metadata: {
          user_id: userId,
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

    const emailTemplate = createPaymentFailedEmail(userName, billingPortalUrl);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      reply_to: REPLY_TO_EMAIL,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    await serviceClient.from("email_logs").insert({
      recipient: userEmail,
      email_type: "payment_failed",
      subject: emailTemplate.subject,
      status: error ? "failed" : "success",
      error_message: error?.message || null,
      metadata: {
        user_id: userId,
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
    console.error("Error sending payment failed email:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
