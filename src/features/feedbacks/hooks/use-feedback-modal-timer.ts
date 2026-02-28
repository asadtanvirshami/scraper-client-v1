"use client";

import { useEffect, useState, useCallback } from "react";
import { useUserInfo } from "@/helpers/use-user";

const INITIAL_DELAY = 2 * 60 * 1000; // 2 minutes
const SNOOZE_DELAY = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = "feedback_modal_snoozed";

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
 * - Opens after 2 minutes if user.is_feedback_completed is false
 * - If canceled, reopens after 5 minutes
 * - Persists snooze state across page refreshes
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

    // Check if modal was previously snoozed
    const snoozedUntil = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    let delay = INITIAL_DELAY;

    if (snoozedUntil) {
      const snoozedTime = parseInt(snoozedUntil, 10);
      if (now < snoozedTime) {
        // Still in snooze period, wait for remaining time
        delay = snoozedTime - now;
      } else {
        // Snooze period expired, clear it
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    const timer = setTimeout(() => {
      setShouldShowModal(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [user_id, is_feedback_completed]);

  /**
   * Snooze the modal for 5 minutes
   */
  const snoozeModal = useCallback(() => {
    const snoozeUntil = Date.now() + SNOOZE_DELAY;
    localStorage.setItem(STORAGE_KEY, snoozeUntil.toString());
    setShouldShowModal(false);
  }, []);

  /**
   * Clear snooze state (e.g., after successful feedback submission)
   */
  const clearSnooze = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setShouldShowModal(false);
  }, []);

  /**
   * Reset the timer to initial state
   */
  const resetTimer = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setShouldShowModal(false);
  }, []);

  return {
    shouldShowModal,
    snoozeModal,
    clearSnooze,
    resetTimer,
  };
};
