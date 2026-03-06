import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";

/**
 * Shared hook for "Get started" CTA behavior on marketing pages.
 * - Not authenticated → navigate to signup with new_program intent
 * - Authenticated with plan → show confirmation modal, on confirm go to onboarding
 * - Authenticated without plan → go straight to onboarding
 */
export function useGetStarted() {
  const navigate = useNavigate();
  const { user, isGuest } = useAuthContext();
  const { state, resetAll } = useApp();
  const isAuthenticated = !!user || isGuest;
  const [showModal, setShowModal] = useState(false);

  const handleGetStarted = useCallback(() => {
    if (!isAuthenticated) {
      navigate("/auth?intent=new_program");
      return;
    }
    if (state.currentPlan) {
      setShowModal(true);
    } else {
      navigate("/onboarding");
    }
  }, [isAuthenticated, state.currentPlan, navigate]);

  const handleConfirmRestart = useCallback(() => {
    // Full reset and go to onboarding for a fresh setup
    resetAll();
    setShowModal(false);
    navigate("/onboarding");
  }, [resetAll, navigate]);

  return {
    showModal,
    setShowModal,
    handleGetStarted,
    handleConfirmRestart,
  };
}
