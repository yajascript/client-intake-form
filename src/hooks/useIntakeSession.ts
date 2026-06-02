"use client";

import { useState, useEffect, useRef } from "react";
import { IntakeFormPayload, defaultIntakeFormPayload } from "@/lib/schema";

export const useIntakeSession = (sessionId: string) => {
  const [data, setData] = useState<IntakeFormPayload>(defaultIntakeFormPayload);
  const [isLoading, setIsLoading] = useState(!!sessionId);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const dataRef = useRef<IntakeFormPayload>(defaultIntakeFormPayload);
  const isInitialMount = useRef(true);

  // Keep ref in sync with state
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Initial load
  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    let isMounted = true;
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/session/sync?session=${sessionId}`);
        if (response.ok) {
          const sessionData = await response.json();
          if (sessionData && Object.keys(sessionData).length > 0 && isMounted) {
            setData((prev) => ({ ...prev, ...sessionData }));
            // Don't mark as dirty on initial load
          }
        }
      } catch (error) {
        console.error("Failed to load session", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchSession();
    return () => { isMounted = false; };
  }, [sessionId]);

  // Auto-save debounce effect
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!sessionId || !isDirty) return;

    const handler = setTimeout(async () => {
      setIsSaving(true);
      try {
        await fetch(`/api/session/sync?session=${sessionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataRef.current),
        });
        setIsDirty(false);
      } catch (error) {
        console.error("Failed to sync session", error);
      } finally {
        setIsSaving(false);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(handler);
  }, [data, sessionId, isDirty]);

  const saveData = async () => {
    if (!sessionId) return;
    setIsSaving(true);
    try {
      await fetch(`/api/session/sync?session=${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataRef.current),
      });
      setIsDirty(false);
    } catch (error) {
      console.error("Failed to sync session", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateData = (newData: Partial<IntakeFormPayload>) => {
    setData((prev) => {
      const updated = { ...prev, ...newData };
      dataRef.current = updated; // Update ref immediately for synchronous access
      setIsDirty(true);
      return updated;
    });
  };

  return { data, updateData, saveData, isLoading, isSaving, isDirty };
};
