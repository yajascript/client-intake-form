"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Loader2, AlertCircle,
  ChevronRight, ChevronLeft, ArrowRight, Upload, X, Search, FileText, Code2, Copy
} from "lucide-react";
import { useIntakeSession } from "@/hooks/useIntakeSession";
import { processIntakeSubmission } from "@/lib/actions";
import { generatePRD } from "@/lib/prdGenerator";
import ReactMarkdown from "react-markdown";
import { WizardStepContainer } from "./WizardStepContainer";
import { BottomNavigationBar } from "./BottomNavigationBar";
import { cn } from "@/lib/utils";

import { Step1Identity } from "./steps/Step1Identity";
import { Step2Scope } from "./steps/Step2Scope";
import { Step3Market } from "./steps/Step3Market";
import { Step4Style } from "./steps/Step4Style";
import { Step5Launch } from "./steps/Step5Launch";

interface IntakeWizardProps {
  dictionary: any;
  locale: string;
  sessionParam?: string;
}

export default function IntakeWizard({ dictionary, locale, sessionParam }: IntakeWizardProps) {
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    if (sessionParam) {
      setSessionId(sessionParam);
    }
  }, [sessionParam]);

  const { data, updateData, saveData, isLoading, isSaving, isDirty } = useIntakeSession(sessionId);

  // Auto-rename logic moved to handleNext
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [mdMode, setMdMode] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const [maxStepReachable, setMaxStepReachable] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 5;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateForm = (upToStep: number): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (upToStep >= 1) {
      if (!data.clientName?.trim()) errs.clientName = "Client Name cannot be empty";
      if (!data.businessName?.trim()) errs.businessName = "Business Name cannot be empty";
      if (!data.tagline?.trim()) errs.tagline = "Tagline cannot be empty";
      if (!data.email?.trim()) {
        errs.email = "Email cannot be empty";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errs.email = "Please enter a valid email address";
      }
      if (!data.whatDoYouDo?.trim()) errs.whatDoYouDo = "Please describe what you do";
    }
    if (upToStep >= 2) {
      if ((data.projectType || []).length === 0) errs.projectType = "Please select at least one project type";
      if ((data.languages || []).length === 0) errs.languages = "Please select at least one supported language";
      if ((data.languages || []).includes("Other") && !data.otherLanguage?.trim()) {
        errs.otherLanguage = "Please specify the other language";
      }
      if ((data.integrations || []).length === 0) errs.integrations = "Please select at least one integration";
      if ((data.integrations || []).includes("custom") && !data.customIntegrationDetails?.trim()) {
        errs.customIntegrationDetails = "Please specify your custom integration details";
      }
    }
    if (upToStep >= 4) {
      if (!logoFile && !data.logoUrl) {
        errs.logo = "Brand logo is required";
      }
    }
    if (upToStep >= 5) {
      const firstMilestone = data.milestones?.[0];
      if (!firstMilestone?.name?.trim()) errs.milestoneName = "Milestone name is required";
      if (!firstMilestone?.date?.trim()) errs.milestoneDate = "Milestone date is required";
    }
    return errs;
  };

  const canProceedToNextStep = (targetStep: number) => {
    // Only validate if trying to move FORWARD
    if (targetStep <= currentStep) {
      setErrors({});
      return true;
    }

    const newErrors = validateForm(currentStep);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTimeout(() => {
        const errorElement = document.querySelector('.text-rose-400');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return false;
    }

    setErrors({});
    return true;
  };

  const clearError = (field: string) => {
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const autoRenameSession = () => {
    if (!data.clientName && !data.businessName) return;
    
    const parts = [data.clientName, data.businessName].filter(Boolean);
    const slug = parts.join("-").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    if (slug && slug !== sessionId) {
      const oldSessionId = sessionId;
      const newFriendlySession = slug;
      
      setSessionId(newFriendlySession);
      window.history.replaceState(null, "", `/${locale}/intake?session=${newFriendlySession}`);
      
      if (!oldSessionId) {
        // First time creating the session
        fetch(`/api/session/sync?session=${newFriendlySession}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        // Fire off rename request to move all blobs and clean up the old ones
        fetch("/api/session/rename", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oldSessionId, newSessionId: newFriendlySession }),
        }).then(() => {
          // After rename is complete, sync the latest data into the new json
          fetch(`/api/session/sync?session=${newFriendlySession}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
        });
      }
    }
  };

  const handleNext = () => {
    if (!canProceedToNextStep(currentStep + 1)) return;

    if (currentStep === 1) {
      autoRenameSession();
    }

    if (currentStep < totalSteps) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
      if (currentStep + 1 > maxStepReachable) {
        setMaxStepReachable(currentStep + 1);
      }
      scrollToTop();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
      scrollToTop();
    }
  };

  const setStep = (step: number) => {
    // If they are trying to jump ahead, validate their current step first
    if (step > currentStep && !canProceedToNextStep(step)) return;

    if (currentStep === 1 && step > 1) {
      autoRenameSession();
    }

    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
    scrollToTop();
  };

  const handleSubmit = async () => {
    const errs = validateForm(5);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      let stepWithError = currentStep;
      if (errs.clientName || errs.businessName || errs.tagline || errs.email || errs.whatDoYouDo) stepWithError = 1;
      else if (errs.projectType || errs.languages || errs.otherLanguage || errs.integrations || errs.customIntegrationDetails) stepWithError = 2;
      else if (errs.logo) stepWithError = 4;
      else if (errs.milestoneName || errs.milestoneDate) stepWithError = 5;

      if (stepWithError !== currentStep) {
        setDirection(stepWithError > currentStep ? 1 : -1);
        setCurrentStep(stepWithError);
        scrollToTop();
      }

      setTimeout(() => {
        const errorElement = document.querySelector('.text-rose-400');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    if (logoFile) {
      formData.append("logo", logoFile);
    }

    const result = await processIntakeSubmission(sessionId, data, formData);
    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
      scrollToTop();
    } else {
      alert("Failed to submit form.");
    }
  };

  if (isLoading) {
    return <div className="text-white/60 text-center py-20">Loading session...</div>;
  }

  if (isSuccess) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center py-20 gap-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
          <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-12 h-12 animate-in zoom-in duration-500 delay-150" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 text-center max-w-lg px-6">
          <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70">
            Thank You!
          </h2>
          <p className="text-white/60 text-lg leading-relaxed">
            We've received your project details. Our team will review the information and get back to you shortly with the next steps.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          <div className="glass p-6 flex items-center gap-4 border border-[#ADC8FF]/20 bg-[#ADC8FF]/5 rounded-2xl animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300 max-w-sm">
            <RocketIcon className="w-8 h-8 text-[#ADC8FF]" />
            <div className="flex flex-col text-left">
              <span className="font-semibold text-white">What's Next?</span>
              <span className="text-sm text-white/50">We'll be in touch within 24-48 hours.</span>
            </div>
          </div>
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="px-6 py-4 rounded-2xl border border-white/10 hover:bg-white/5 text-sm font-medium transition-colors animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300"
          >
            {showAnswers ? "Hide Answers" : "View Submitted Answers"}
          </button>
        </div>

        {showAnswers && (
          <div className="w-full max-w-3xl mt-8 glass rounded-2xl text-left overflow-hidden animate-in slide-in-from-top-4 fade-in duration-500 flex flex-col">
            <div className="bg-white/5 border-b border-white/10 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#ADC8FF]" />
                Generated PRD
              </h3>
              <div className="flex items-center gap-2">
                <div className="bg-[#0B1326]/50 rounded-lg p-1 border border-white/10 flex items-center">
                  <button
                    onClick={() => setMdMode('preview')}
                    className={cn("px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2", mdMode === 'preview' ? "bg-white/10 text-white" : "text-white/50 hover:text-white")}
                  >
                    <FileText className="w-4 h-4" /> Preview
                  </button>
                  <button
                    onClick={() => setMdMode('code')}
                    className={cn("px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2", mdMode === 'code' ? "bg-white/10 text-white" : "text-white/50 hover:text-white")}
                  >
                    <Code2 className="w-4 h-4" /> Markdown
                  </button>
                </div>
                {mdMode === 'code' && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatePRD(data));
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="px-3 py-2 rounded-lg bg-[#ADC8FF]/10 text-[#ADC8FF] border border-[#ADC8FF]/20 hover:bg-[#ADC8FF]/20 transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Copy className="w-4 h-4" /> {copied ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[600px] custom-scrollbar">
              {mdMode === 'preview' ? (
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-white" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-8 mb-4 border-b border-white/10 pb-2 text-white" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-6 mb-2 text-[#ADC8FF]" {...props} />,
                      p: ({ node, ...props }) => <p className="mb-4 text-white/80 leading-relaxed" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 text-white/80 space-y-1" {...props} />,
                      li: ({ node, ...props }) => <li className="" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                      hr: ({ node, ...props }) => <hr className="border-white/10 my-8" {...props} />,
                      blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-[#ADC8FF] pl-4 italic text-white/60 mb-4 py-1" {...props} />,
                      code: ({ node, inline, ...props }: any) => inline ? <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm text-[#ADC8FF] font-mono" {...props} /> : <code className="block bg-white/5 p-4 rounded-xl text-sm font-mono overflow-x-auto border border-white/10 mb-4" {...props} />,
                    }}
                  >
                    {generatePRD(data)}
                  </ReactMarkdown>
                </div>
              ) : (
                <pre className="text-sm font-mono text-white/70 whitespace-pre-wrap selection:bg-[#ADC8FF]/30">
                  {generatePRD(data)}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 pb-12" onBlur={(e) => {
      // Avoid saving if focus moves within the same container,
      // but to be safe we can just save anytime focus leaves any field.
      saveData();

      // Auto-rename the session ID if they just finished typing the client/business name
      autoRenameSession();
    }}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#040B18]/90 backdrop-blur-md pt-4 pb-4 border-b border-white/5 flex items-center justify-between -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          {dictionary['intake.title']}
        </h1>
        <div className="flex items-center gap-2">
          {isSaving ? (
            <Loader2 className="w-4 h-4 text-[#ADC8FF] animate-spin" />
          ) : isDirty ? (
            <AlertCircle className="w-4 h-4 text-yellow-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span className="text-sm text-white/80 font-medium">
            {isSaving ? "Saving..." : isDirty ? "Unsaved Changes" : "Saved"}
          </span>
        </div>
      </div>



      {/* Main Wizard Form Container */}
      <div className="relative min-h-[400px] w-full overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {currentStep === 1 && (
            <WizardStepContainer key="step1" direction={direction}>
              <Step1Identity data={data} updateData={updateData} errors={errors} clearError={clearError} />
            </WizardStepContainer>
          )}

          {currentStep === 2 && (
            <WizardStepContainer key="step2" direction={direction}>
              <Step2Scope data={data} updateData={updateData} errors={errors} clearError={clearError} />
            </WizardStepContainer>
          )}

          {currentStep === 3 && (
            <WizardStepContainer key="step3" direction={direction}>
              <Step3Market data={data} updateData={updateData} />
            </WizardStepContainer>
          )}

          {currentStep === 4 && (
            <WizardStepContainer isActive={currentStep === 4} direction={direction}>
            <Step4Style data={data} updateData={updateData} logoFile={logoFile} setLogoFile={setLogoFile} errors={errors} clearError={clearError} sessionId={sessionId} />
          </WizardStepContainer>
          )}

          {currentStep === 5 && (
            <WizardStepContainer key="step5" direction={direction}>
              <Step5Launch data={data} updateData={updateData} errors={errors} clearError={clearError} />
            </WizardStepContainer>
          )}
        </AnimatePresence>
      </div>

      {/* Inline Navigation (Back / Continue) */}
      <div className="flex items-center justify-between mt-2 mb-6">
        <button
          onClick={handleBack}
          disabled={currentStep === 1 || isSubmitting}
          className="bg-white/10 text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-colors opacity-0 pointer-events-none"
          style={{ opacity: currentStep > 1 ? 1 : 0, pointerEvents: currentStep > 1 ? 'auto' : 'none' }}
        >
          {dictionary['intake.back']}
        </button>
        {currentStep < totalSteps ? (
          <button
            onClick={handleNext}
            className="group bg-[#ADC8FF] text-[#0B1326] px-8 py-3 rounded-full font-bold hover:bg-white hover:shadow-[0_0_20px_rgba(173,200,255,0.4)] transition-all flex items-center gap-2"
          >
            {dictionary['intake.continue']}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#ADC8FF] text-[#0B1326] px-8 py-3 rounded-full font-bold hover:bg-white transition-colors"
          >
            {isSubmitting ? "Submitting..." : (
              <span className="flex items-center gap-2">
                <RocketIcon className="w-4 h-4" /> Submit Form
              </span>
            )}
          </button>
        )}
      </div>

      {/* Fixed Bottom Navigation */}
      <BottomNavigationBar
        currentStep={currentStep}
        setStep={setStep}
        maxStepReachable={maxStepReachable}
      />
    </div>
  );
}

// Minimal inline rocket icon for submit button
function RocketIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  )
}
