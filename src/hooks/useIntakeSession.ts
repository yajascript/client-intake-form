"use client";

import { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { IntakeFormPayload, defaultIntakeFormPayload } from "@/lib/schema";

export const useIntakeSession = (sessionId: string) => {
  const [data, setData] = useState<IntakeFormPayload>(defaultIntakeFormPayload);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Initial load
  useEffect(() => {
    if (!sessionId) return;
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/session/sync?session=${sessionId}`);
        if (response.ok) {
          const sessionData = await response.json();
          if (sessionData && Object.keys(sessionData).length > 0) {
            setData((prev) => ({ ...prev, ...sessionData }));
          }
        }
      } catch (error) {
        console.error("Failed to load session", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  // Debounced save
  const debouncedSave = useDebouncedCallback(async (newData: IntakeFormPayload) => {
    if (!sessionId) return;
    try {
      await fetch(`/api/session/sync?session=${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });
    } catch (error) {
      console.error("Failed to sync session", error);
    } finally {
      setIsSaving(false);
      setIsDirty(false);
    }
  }, 1000);

  const updateData = (newData: Partial<IntakeFormPayload>) => {
    setData((prev) => {
      const updated = { ...prev, ...newData };
      setIsDirty(true);
      setIsSaving(true);
      debouncedSave(updated);
      return updated;
    });
  };

  return { data, updateData, isLoading, isSaving, isDirty };
};
