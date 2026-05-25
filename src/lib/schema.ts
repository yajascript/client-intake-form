import { z } from "zod";

export const intakeSchema = z.object({
  // Identity
  businessName: z.string().min(2, "Business name is required").max(40),
  clientName: z.string().min(2, "Client name is required").max(40),
  tagline: z.string().max(60).optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().or(z.literal("")),
  whatDoYouDo: z.string().optional().or(z.literal("")),
  
  socialLinks: z.array(z.object({
    platform: z.string(),
    url: z.string() // keeping it simple, allow handle/URL
  })).optional(),

  // Scope
  projectType: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  otherLanguage: z.string().optional(),
  integrations: z.array(z.string()).optional(),
  customIntegrationDetails: z.string().optional(),
  currentWorkflow: z.string().optional(),
  painPoints: z.string().optional(),

  // Market
  targetAudience: z.string().optional(),
  projectGoal: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  competitors: z.array(z.object({
    name: z.string(),
    doingWell: z.string(),
    differentiate: z.string()
  })).optional(),
  hasCompetitors: z.boolean().optional(),

  // Style
  brandVoice: z.array(z.string()).optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  tertiaryColor: z.string().optional(),
  neutralColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  headlineFont: z.string().optional(),
  bodyFont: z.string().optional(),
  labelFont: z.string().optional(),

  // Launch
  timelineExpectations: z.string().optional(),
  milestones: z.array(z.object({
    date: z.string(),
    name: z.string()
  })).optional(),
  budgetTier: z.string().optional(),
  referralSource: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export type IntakeFormPayload = z.infer<typeof intakeSchema>;

export const defaultIntakeFormPayload: IntakeFormPayload = {
  businessName: "",
  clientName: "",
  tagline: "",
  email: "",
  phone: "",
  whatDoYouDo: "",
  socialLinks: [
    { platform: "Website", url: "" },
    { platform: "Instagram", url: "" }
  ],
  projectType: [],
  languages: [],
  otherLanguage: "",
  integrations: [],
  customIntegrationDetails: "",
  currentWorkflow: "",
  painPoints: "",
  targetAudience: "",
  projectGoal: "",
  keywords: [],
  competitors: [
    { name: "", doingWell: "", doingPoorly: "", differentiate: "" }
  ],
  brandVoice: [],
  primaryColor: "#3B82F6", // from screenshot
  secondaryColor: "#1E293B",
  tertiaryColor: "#D16900",
  neutralColor: "#0F172A",
  backgroundColor: "#0B1326",
  headlineFont: "Geist",
  bodyFont: "Geist",
  labelFont: "Geist",
  timelineExpectations: "",
  milestones: [{ date: "", name: "" }],
  budgetTier: "",
  additionalNotes: "",
};
