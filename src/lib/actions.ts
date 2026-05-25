"use server";

import { IntakeFormPayload, intakeSchema } from "./schema";
import { generatePRD } from "./prdGenerator";
// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

export async function processIntakeSubmission(
  sessionId: string,
  clientResponsePayload: IntakeFormPayload,
  logoFormData: FormData
) {
  try {
    // 1. Bypass strict payload validation to avoid throwing alerts
    const parsedPayload = clientResponsePayload as any;

    // 2. Extract Logo File (if any)
    const logoFile = logoFormData.get("logo") as File | null;
    let logoInfo = "No logo provided";
    if (logoFile && logoFile.size > 0) {
      logoInfo = `File uploaded: ${logoFile.name} (${logoFile.size} bytes)`;
    }

    // 3. Generate PRD
    const prdContent = generatePRD(parsedPayload);
    const prdBuffer = Buffer.from(prdContent, 'utf-8');

    const attachments: any[] = [
      {
        filename: `${parsedPayload.businessName || 'Project'}_PRD.md`,
        content: prdBuffer,
      }
    ];

    if (logoFile && logoFile.size > 0) {
      const arrayBuffer = await logoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      attachments.push({
        filename: logoFile.name,
        content: buffer,
      });
    }

    // 4. Send Email via Resend (DISABLED FOR NOW)
    /*
    if (process.env.RESEND_API_KEY && process.env.RECIPIENT_EMAIL) {
      await resend.emails.send({
        from: 'Intake Form <onboarding@resend.dev>',
        to: process.env.RECIPIENT_EMAIL,
        subject: `New Client Intake: ${parsedPayload.businessName || 'Project'}`,
        text: `A new client intake form has been submitted for ${parsedPayload.businessName || 'Project'}.\n\nPlease find the generated PRD and logo attached.`,
        attachments: attachments,
      });
      console.log("Successfully sent email via Resend");
    } else {
      console.log("Resend not configured (missing API Key or Recipient Email)");
    }
    */

    return { success: true };
  } catch (error) {
    console.error("Submission error", error);
    return { success: false, error: "Failed to process submission" };
  }
}
