import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '../theme/tokens';

const STORAGE_KEY = '@kodex_state_v1';

export interface UserProgressState {
  themeMode: ThemeMode;
  xp: number;
  dailyXp: number;
  dailyGoal: number;
  streak: number;
  lastActiveDate: string | null;
  completedStepIds: string[];
  completedModuleIds: string[];
  completedSandboxIds: string[];
  masteredInterviewIds: string[];
  mistakeStepIds: string[];
}

const DEFAULT_STATE: UserProgressState = {
  themeMode: 'light',
  xp: 0,
  dailyXp: 0,
  dailyGoal: 120,
  streak: 1,
  lastActiveDate: null,
  completedStepIds: [],
  completedModuleIds: [],
  completedSandboxIds: [],
  masteredInterviewIds: [],
  mistakeStepIds: [],
};

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface ProgressContextValue {
  state: UserProgressState;
  hydrated: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  recordStepCompleted: (stepId: string, xpEarned: number) => void;
  recordModuleCompleted: (moduleId: string) => void;
  recordMistake: (stepId: string) => void;
  clearMistake: (stepId: string) => void;
  recordSandboxSolved: (challengeId: string, xpEarned: number) => void;
  toggleInterviewMastered: (questionId: string) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UserProgressState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active) return;
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as Partial<UserProgressState>;
            const today = getTodayKey();
            const isSameDay = parsed.lastActiveDate === today;
            setState({
              ...DEFAULT_STATE,
              ...parsed,
              dailyXp: isSameDay ? parsed.dailyXp ?? 0 : 0,
            });
          } catch {
            setState(DEFAULT_STATE);
          }
        }
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback((next: UserProgressState) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
      // Non-fatal persistence error
    });
  }, []);

  const updateState = useCallback(
    (updater: (prev: UserProgressState) => UserProgressState) => {
      setState((prev) => {
        const next = updater(prev);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const applyActivityAndXp = (prev: UserProgressState, xpDelta: number): Partial<UserProgressState> => {
    const today = getTodayKey();
    const yesterday = getYesterdayKey();
    let nextStreak = prev.streak;
    if (prev.lastActiveDate !== today) {
      nextStreak = prev.lastActiveDate === yesterday ? prev.streak + 1 : 1;
    }
    const nextDailyXp = prev.lastActiveDate === today ? prev.dailyXp + xpDelta : xpDelta;
    return {
      xp: prev.xp + xpDelta,
      dailyXp: nextDailyXp,
      streak: nextStreak,
      lastActiveDate: today,
    };
  };

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      updateState((prev) => ({ ...prev, themeMode: mode }));
    },
    [updateState]
  );

  const recordStepCompleted = useCallback(
    (stepId: string, xpEarned: number) => {
      updateState((prev) => {
        const alreadyDone = prev.completedStepIds.includes(stepId);
        const xpDelta = alreadyDone ? 0 : xpEarned;
        return {
          ...prev,
          ...applyActivityAndXp(prev, xpDelta),
          completedStepIds: alreadyDone ? prev.completedStepIds : [...prev.completedStepIds, stepId],
          mistakeStepIds: prev.mistakeStepIds.filter((id) => id !== stepId),
        };
      });
    },
    [updateState]
  );

  const recordModuleCompleted = useCallback(
    (moduleId: string) => {
      updateState((prev) => {
        if (prev.completedModuleIds.includes(moduleId)) return prev;
        return {
          ...prev,
          ...applyActivityAndXp(prev, 25),
          completedModuleIds: [...prev.completedModuleIds, moduleId],
        };
      });
    },
    [updateState]
  );

  const recordMistake = useCallback(
    (stepId: string) => {
      updateState((prev) => {
        if (prev.mistakeStepIds.includes(stepId)) return prev;
        return { ...prev, mistakeStepIds: [...prev.mistakeStepIds, stepId] };
      });
    },
    [updateState]
  );

  const clearMistake = useCallback(
    (stepId: string) => {
      updateState((prev) => ({
        ...prev,
        mistakeStepIds: prev.mistakeStepIds.filter((id) => id !== stepId),
      }));
    },
    [updateState]
  );

  const recordSandboxSolved = useCallback(
    (challengeId: string, xpEarned: number) => {
      updateState((prev) => {
        const alreadyDone = prev.completedSandboxIds.includes(challengeId);
        const xpDelta = alreadyDone ? 0 : xpEarned;
        return {
          ...prev,
          ...applyActivityAndXp(prev, xpDelta),
          completedSandboxIds: alreadyDone
            ? prev.completedSandboxIds
            : [...prev.completedSandboxIds, challengeId],
        };
      });
    },
    [updateState]
  );

  const toggleInterviewMastered = useCallback(
    (questionId: string) => {
      updateState((prev) => {
        const exists = prev.masteredInterviewIds.includes(questionId);
        const masteredInterviewIds = exists
          ? prev.masteredInterviewIds.filter((id) => id !== questionId)
          : [...prev.masteredInterviewIds, questionId];
        return {
          ...prev,
          ...applyActivityAndXp(prev, exists ? 0 : 15),
          masteredInterviewIds,
        };
      });
    },
    [updateState]
  );

  const resetProgress = useCallback(() => {
    updateState((prev) => ({
      ...DEFAULT_STATE,
      themeMode: prev.themeMode,
    }));
  }, [updateState]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      hydrated,
      setThemeMode,
      recordStepCompleted,
      recordModuleCompleted,
      recordMistake,
      clearMistake,
      recordSandboxSolved,
      toggleInterviewMastered,
      resetProgress,
    }),
    [
      state,
      hydrated,
      setThemeMode,
      recordStepCompleted,
      recordModuleCompleted,
      recordMistake,
      clearMistake,
      recordSandboxSolved,
      toggleInterviewMastered,
      resetProgress,
    ]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return ctx;
}
