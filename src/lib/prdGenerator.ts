import { IntakeFormPayload } from "./schema";

export function generatePRD(data: IntakeFormPayload): string {
  const projectTitle = data.businessName || data.clientName || "Project";
  
  return `# prd.md - ${projectTitle}

> **Note:** For business context, contact information, target audience, and raw branding assets, please refer to the Client Intake Form.

### Product Vision & Tech Stack

- **Goal:** ${data.projectGoal || "Establish brand presence and enable lead capture."}
- **Tech Stack:** **Next.js 16+** (App Router, Server Components by default), **Tailwind v4**, \`proxy.ts\` (instead of \`middleware.ts\`).
- **Performance Target:** **Lighthouse 90+** across all categories. Initial JS bundle < 150kb.
- **Aesthetic (Luxury Design Tokens):**
    - **Primary Color:** \`${data.primaryColor || "#3B82F6"}\`
    - **Secondary Color:** \`${data.secondaryColor || "#1E293B"}\`
    - **Background Color:** \`${data.backgroundColor || "#0B1326"}\`
    - **Typography:** ${data.headlineFont || "Geist"}
    - **Vibe:** Luxury, minimal, airy, premium.
    - **Radii:** \`rounded-[2.5rem]\` for cards, \`rounded-[4rem]\` for sections.
    - **Glassmorphism:** \`bg-white/60\` + \`backdrop-blur-md\` on non-solid backgrounds.

---

## Detailed Information Architecture

### Target Market
- **Target Audience:** ${data.targetAudience || "N/A"}
- **Keywords:** ${(data.keywords || []).join(", ") || "None provided"}

### Scope & Integrations
- **Project Type:** ${(data.projectType || []).join(", ") || "N/A"}
- **Languages:** ${(data.languages || []).concat(data.otherLanguage ? [data.otherLanguage] : []).join(", ") || "English"}
- **Integrations:** ${(data.integrations || []).concat(data.customIntegrationDetails ? [data.customIntegrationDetails] : []).join(", ") || "None"}
- **Current Workflow:** ${data.currentWorkflow || "N/A"}
- **Pain Points:** ${data.painPoints || "N/A"}

${data.hasCompetitors && data.competitors && data.competitors.length > 0 ? `### Competitor Analysis\n${data.competitors.map(c => `- **${c.name}**\n  - Doing Well: ${c.doingWell}\n  - Differentiator: ${c.differentiate}`).join("\n")}` : ""}

---

## Execution & Milestones

- **Timeline Expectations:** ${data.timelineExpectations || "Standard"}
- **Budget Tier:** ${data.budgetTier || "Unknown"}
- **Referral Source:** ${data.referralSource || "Unknown"}

### Key Milestones
${(data.milestones || []).map(m => `- **${m.date}**: ${m.name}`).join("\n") || "- No milestones defined"}

### Additional Notes
> ${data.additionalNotes || "No additional notes provided."}

---

## Technical Defaults
- **Edge Defense:** Mandatory **Cloudflare WAF** for DDoS and bot protection.
- **App Defense:** Mandatory **Firebase App Check (reCAPTCHA Enterprise)** for all client-to-server requests.
- **Form Defense:** Implement **Honeypot fields** on all public forms.
`;
}
