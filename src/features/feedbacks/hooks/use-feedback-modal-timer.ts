"use client";

import { useEffect, useState, useCallback } from "react";
import { useUserInfo } from "@/helpers/use-user";

const INITIAL_DELAY = 60 * 1000; // 1 minute after the signed-in user is loaded
const STORAGE_KEY_PREFIX = "feedback_modal_shown";
const COMPLETED_STORAGE_KEY_PREFIX = "feedback_completed";

interface UseFeedbackModalTimerReturn {
  shouldShowModal: boolean;
  snoozeModal: () => void;
  clearSnooze: () => void;
  resetTimer: () => void;
}

/**
 * Custom hook that manages automatic feedback modal timing
 *
 * Features:
 * - Opens once per browser sign-in session if user.is_feedback_completed is false
 * - Waits 1 minute so the dashboard and page components can finish rendering
 *
 * @returns {UseFeedbackModalTimerReturn} Modal control functions and state
 */
export const useFeedbackModalTimer = (): UseFeedbackModalTimerReturn => {
  const { id: user_id, is_feedback_completed } = useUserInfo();
  const [shouldShowModal, setShouldShowModal] = useState(false);

  useEffect(() => {
    // Don't show if feedback is already completed or user not loaded
    if (!user_id || is_feedback_completed) {
      return;
    }

    const storageKey = `${STORAGE_KEY_PREFIX}_${user_id}`;
    const completedKey = `${COMPLETED_STORAGE_KEY_PREFIX}_${user_id}`;
    if (localStorage.getItem(completedKey) === "true") {
      return;
    }

    if (sessionStorage.getItem(storageKey) === "true") {
      return;
    }

    const timer = setTimeout(() => {
      sessionStorage.setItem(storageKey, "true");
      setShouldShowModal(true);
    }, INITIAL_DELAY);

    return () => clearTimeout(timer);
  }, [user_id, is_feedback_completed]);

  /**
   * Close the modal for this sign-in session.
   */
  const snoozeModal = useCallback(() => {
    if (user_id) {
      sessionStorage.setItem(`${STORAGE_KEY_PREFIX}_${user_id}`, "true");
    }
    setShouldShowModal(false);
  }, [user_id]);

  /**
   * Close the modal after successful feedback submission.
   */
  const clearSnooze = useCallback(() => {
    if (user_id) {
      sessionStorage.setItem(`${STORAGE_KEY_PREFIX}_${user_id}`, "true");
      localStorage.setItem(`${COMPLETED_STORAGE_KEY_PREFIX}_${user_id}`, "true");
    }
    setShouldShowModal(false);
  }, [user_id]);

  /**
   * Reset the timer to initial state
   */
  const resetTimer = useCallback(() => {
    if (user_id) {
      sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}_${user_id}`);
    }
    setShouldShowModal(false);
  }, [user_id]);

  return {
    shouldShowModal,
    snoozeModal,
    clearSnooze,
    resetTimer,
  };
};
