"use client";

import React from "react";
import { Info, Target, BarChart2, Palette, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationBarProps {
  currentStep: number;
  setStep: (step: number) => void;
  maxStepReachable: number;
}

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  currentStep,
  setStep,
  maxStepReachable,
}) => {
  const steps = [
    { id: 1, label: "About", icon: Info },
    { id: 2, label: "Scope", icon: Target },
    { id: 3, label: "Market", icon: BarChart2 },
    { id: 4, label: "Style", icon: Palette },
    { id: 5, label: "Launch", icon: Rocket },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#121c33]/90 backdrop-blur-xl border-t border-white/10 z-50 py-3 px-4">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isReachable = step.id <= maxStepReachable;

          return (
            <button
              key={step.id}
              onClick={() => {
                if (isReachable) setStep(step.id);
              }}
              disabled={!isReachable}
              className={cn(
                "flex flex-col items-center gap-1 min-w-[64px] transition-all",
                isActive
                  ? "text-[#ADC8FF]"
                  : isReachable
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-600 cursor-not-allowed opacity-50"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-full",
                  isActive ? "bg-[#ADC8FF]/10" : ""
                )}
              >
                <step.icon className="w-5 h-5" />
              </div>
              <span
                className={cn(
                  "text-[10px] uppercase tracking-wider font-semibold",
                  isActive ? "border-b border-[#ADC8FF] pb-0.5" : ""
                )}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
