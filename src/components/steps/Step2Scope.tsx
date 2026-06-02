import React from "react";
import { IntakeFormPayload } from "@/lib/schema";
import { Check, Mail, CreditCard, Calendar, Users, BarChart, MapPin, Lock, Code2, LayoutTemplate, ShoppingCart, AppWindow, Smartphone, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextAreaField } from "../TextAreaField";

interface Step2ScopeProps {
  data: IntakeFormPayload;
  updateData: (updates: Partial<IntakeFormPayload>) => void;
  errors?: Record<string, string>;
  clearError?: (field: string) => void;
}

const projectTypeOptions = [
  { id: "landing", label: "Landing Page", icon: LayoutTemplate },
  { id: "ecommerce", label: "E-commerce", icon: ShoppingCart },
  { id: "webapp", label: "Web App", icon: AppWindow },
  { id: "mobile", label: "Mobile App", icon: Smartphone },
];

const integrationOptions = [
  { id: "email", label: "Email", icon: Mail },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "scheduling", label: "Scheduling", icon: Calendar },
  { id: "crm", label: "CRM", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart },
  { id: "maps", label: "Maps", icon: MapPin },
  { id: "auth", label: "Auth", icon: Lock },
  { id: "custom", label: "Custom", icon: Code2 },
];

const integrationHelp: Record<string, string> = {
  payments: "Stripe, PayPal, Square, etc.",
  auth: "Social / SSO options: Apple Sign‑In, Google, Microsoft, GitHub, etc.",
  email: "Resend, SendGrid, Mailgun, AWS SES, etc.",
  scheduling: "Calendly, Google Calendar, Microsoft Bookings, etc.",
  crm: "HubSpot, Salesforce, Pipedrive, Zoho CRM, etc.",
  analytics: "Google Analytics, Mixpanel, Amplitude, Plausible, etc.",
  maps: "Google Maps, Mapbox, OpenStreetMap, etc.",
  custom: "Any custom third‑party API you need to connect."
};


export const Step2Scope: React.FC<Step2ScopeProps> = ({ data, updateData, errors = {}, clearError }) => {
  const toggleProjectType = (typeId: string) => {
    const current = data.projectType || [];
    if (current.includes(typeId)) {
      updateData({ projectType: current.filter((t) => t !== typeId) });
    } else {
      updateData({ projectType: [...current, typeId] });
      if (clearError) clearError('projectType');
    }
  };

  const toggleLanguage = (lang: string) => {
    const current = data.languages || [];
    if (current.includes(lang)) {
      updateData({ languages: current.filter((l) => l !== lang) });
    } else {
      updateData({ languages: [...current, lang] });
      if (clearError) clearError('languages');
    }
  };

  const toggleIntegration = (integrationId: string) => {
    const current = data.integrations || [];
    if (current.includes(integrationId)) {
      updateData({ integrations: current.filter((i) => i !== integrationId) });
    } else {
      updateData({ integrations: [...current, integrationId] });
      if (clearError) clearError('integrations');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="glass p-8 flex flex-col gap-6">
        <h2 className="text-xl font-semibold mb-2">What Are We Building?</h2>

        <div className="flex flex-col gap-3">
          <label className={cn("text-sm font-medium ml-1", errors.projectType ? "text-rose-400" : "text-white/80")}>
            Project Type <span className="text-yellow-400">*</span>
          </label>
          <div className={cn("grid grid-cols-2 gap-3 p-1 rounded-xl", errors.projectType ? "ring-1 ring-rose-400/50" : "")}>
            {projectTypeOptions.map((opt) => {
              const isSelected = (data.projectType || []).includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleProjectType(opt.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-all",
                    isSelected
                      ? "bg-[#ADC8FF]/10 border-[#ADC8FF]"
                      : "bg-[#121c33]/50 border-white/10 hover:border-white/30"
                  )}
                >
                  <opt.icon className={cn("w-5 h-5", isSelected ? "text-[#ADC8FF]" : "text-white/60")} />
                  <span className={cn("text-xs font-medium tracking-wider uppercase", isSelected ? "text-[#ADC8FF]" : "text-white/60")}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.projectType && <span className="text-xs text-rose-400 ml-1">{errors.projectType}</span>}
        </div>

        <TextAreaField
          label="Current Workflow"
          placeholder="What tools or manual processes are you currently using that we are replacing?"
          value={data.currentWorkflow || ""}
          onChange={(e) => updateData({ currentWorkflow: e.target.value })}
          maxLength={500}
        />

        <TextAreaField
          label="Main Pain Points"
          placeholder="What are the biggest challenges you're trying to solve?"
          value={data.painPoints || ""}
          onChange={(e) => updateData({ painPoints: e.target.value })}
          maxLength={500}
        />

        <div className="flex flex-col gap-3 mt-4">
          <label className={cn("text-sm font-medium ml-1", errors.languages ? "text-rose-400" : "text-white/80")}>
            Supported Languages <span className="text-yellow-400">*</span>
          </label>
          <div className={cn("flex gap-6 items-center ml-1 flex-wrap", errors.languages ? "ring-1 ring-rose-400/50 p-2 rounded-xl" : "")}>
            {["English", "French", "Other"].map((lang) => (
              <label key={lang} className="flex items-center gap-2 cursor-pointer">
                <div
                  className={cn(
                    "w-5 h-5 rounded flex items-center justify-center border transition-colors",
                    (data.languages || []).includes(lang)
                      ? "bg-[#ADC8FF] border-[#ADC8FF] text-[#0B1326]"
                      : "bg-white/5 border-white/20 text-transparent"
                  )}
                >
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-sm text-white/80">{lang}</span>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={(data.languages || []).includes(lang)}
                  onChange={() => toggleLanguage(lang)}
                />
              </label>
            ))}
          </div>
          {errors.languages && <span className="text-xs text-rose-400 ml-1">{errors.languages}</span>}
          {(data.languages || []).includes("Other") && (
            <div className="animate-in fade-in slide-in-from-top-2 mt-2 flex flex-col gap-2">
              <label className={cn("text-sm font-medium ml-1", errors.otherLanguage ? "text-rose-400" : "text-white/80")}>
                Specify Other Language <span className="text-yellow-400">*</span>
              </label>
              <input
                className={cn("glass-input text-sm w-full", errors.otherLanguage && "border-rose-400 focus:ring-rose-400 focus:border-rose-400")}
                placeholder="e.g. Italian, Japanese..."
                value={data.otherLanguage || ""}
                onChange={(e) => {
                  updateData({ otherLanguage: e.target.value });
                  if (clearError) clearError('otherLanguage');
                }}
              />
              {errors.otherLanguage && <span className="text-xs text-rose-400 ml-1">{errors.otherLanguage}</span>}
            </div>
          )}
        </div>
      </div>

      <div className="glass p-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Key Integrations <span className="text-yellow-400">*</span></h2>
          <span className="text-xs text-white/50">{(data.integrations || []).length} Selected</span>
        </div>

        <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", errors.integrations ? "ring-1 ring-rose-400/50 p-2 rounded-xl" : "")}>
          {integrationOptions.map((opt) => {
            const isSelected = (data.integrations || []).includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => toggleIntegration(opt.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-3 p-6 rounded-lg border transition-all relative group",
                  isSelected
                    ? "bg-[#ADC8FF]/10 border-[#ADC8FF]"
                    : "bg-[#121c33]/50 border-white/10 hover:border-white/30"
                )}
              >
                <opt.icon className={cn("w-6 h-6", isSelected ? "text-[#ADC8FF]" : "text-white/60")} />
                <span className={cn("text-xs font-medium tracking-wider uppercase", isSelected ? "text-[#ADC8FF]" : "text-white/60")}>
                  {opt.label}
                </span>
                {/* Desktop Hover Tooltip */}
                <div className="absolute bottom-full mb-2 hidden md:group-hover:block w-48 left-1/2 -translate-x-1/2 bg-[#121c33] text-white text-center text-xs p-2 rounded-md shadow-xl border border-white/20 backdrop-filter backdrop-blur-md animate-in fade-in slide-in-from-bottom-1 duration-150 z-50 pointer-events-none">
                  {integrationHelp[opt.id]}
                </div>
                {/* Mobile Inline Help */}
                {/* <span className="text-[10px] text-white/40 mt-1 md:hidden leading-tight text-center px-1">
                  {integrationHelp[opt.id]}
                </span> */}
              </button>
            );
          })}
        </div>
        {errors.integrations && <span className="text-xs text-rose-400 ml-1">{errors.integrations}</span>}

        {(data.integrations || []).includes("custom") && (
          <div className="flex flex-col gap-2 mt-4 animate-in fade-in slide-in-from-top-2">
            <label className={cn("text-sm font-medium ml-1", errors.customIntegrationDetails ? "text-rose-400" : "text-white/80")}>
              Custom Integration Details <span className="text-yellow-400">*</span>
            </label>
            <textarea
              className={cn("glass-input min-h-[100px] resize-y", errors.customIntegrationDetails && "border-rose-400 focus:ring-rose-400 focus:border-rose-400")}
              placeholder="Please describe the custom integration..."
              value={data.customIntegrationDetails || ""}
              onChange={(e) => {
                updateData({ customIntegrationDetails: e.target.value });
                if (clearError) clearError('customIntegrationDetails');
              }}
              maxLength={300}
            />
            {errors.customIntegrationDetails && <span className="text-xs text-rose-400 ml-1">{errors.customIntegrationDetails}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
