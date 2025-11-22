import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { modules } from '../data/modules';

const ProgressContext = createContext({
  completedTopics: new Set(),
  markTopicComplete: () => {},
  isTopicComplete: () => false,
  moduleProgress: [],
  mistakes: [],
  deadlines: {},
  reviewQueue: [],
  logMistake: () => {},
  setModuleDeadline: () => {},
  scheduleReviewQuestion: () => {},
  clearReviewQuestion: () => {},
});

const STORAGE_KEY = 'reap-progress';

const loadInitialProgress = () => {
  if (typeof window === 'undefined') {
    return { completed: [], mistakes: [], deadlines: {}, reviewQueue: [] };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: [], mistakes: [], deadlines: {}, reviewQueue: [] };
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      Array.isArray(parsed.completed) &&
      Array.isArray(parsed.mistakes) &&
      typeof parsed.deadlines === 'object' &&
      Array.isArray(parsed.reviewQueue)
    ) {
      return parsed;
    }
    return { completed: [], mistakes: [], deadlines: {}, reviewQueue: [] };
  } catch {
    return { completed: [], mistakes: [], deadlines: {}, reviewQueue: [] };
  }
};

export const ProgressProvider = ({ children }) => {
  const initial = loadInitialProgress();
  const [completedTopics, setCompletedTopics] = useState(initial.completed);
  const [mistakes, setMistakes] = useState(initial.mistakes);
  const [deadlines, setDeadlines] = useState(initial.deadlines || {});
  const [reviewQueue, setReviewQueue] = useState(initial.reviewQueue || []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ completed: completedTopics, mistakes, deadlines, reviewQueue }),
      );
    }
  }, [completedTopics, mistakes, deadlines, reviewQueue]);

  const markTopicComplete = (code) => {
    setCompletedTopics((prev) => {
      if (prev.includes(code)) return prev;
      return [...prev, code];
    });
  };

  const isTopicComplete = (code) => completedTopics.includes(code);

  const moduleProgress = useMemo(() => {
    return modules.map((module) => {
      const total = module.lessons.length || 1;
      const completed = module.lessons.filter((lesson) =>
        completedTopics.includes(lesson.code),
      ).length;
      return {
        id: module.id,
        label: module.label,
        percent: Math.round((completed / total) * 100),
        completed,
        total,
        deadline: deadlines[module.id] || '',
      };
    });
  }, [completedTopics, deadlines]);

  const logMistake = (payload) => {
    setMistakes((prev) => [
      {
        id: `${payload.topicCode}-${payload.questionId}-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...payload,
      },
      ...prev,
    ]);
  };

  const scheduleReviewQuestion = ({ moduleId, moduleLabel, topicCode, questionId, questionText }) => {
    if (!moduleId || !topicCode || typeof questionId === 'undefined') return;
    setReviewQueue((prev) => {
      const hasEntry = prev.some(
        (item) =>
          item.moduleId === moduleId &&
          item.topicCode === topicCode &&
          String(item.questionId) === String(questionId),
      );
      if (hasEntry) return prev;
      return [
        ...prev,
        {
          moduleId,
          moduleLabel,
          topicCode,
          questionId: String(questionId),
          questionText,
        },
      ];
    });
  };

  const clearReviewQuestion = ({ moduleId, topicCode, questionId }) => {
    if (!moduleId || !topicCode || typeof questionId === 'undefined') return;
    setReviewQueue((prev) =>
      prev.filter(
        (item) =>
          !(
            item.moduleId === moduleId &&
            item.topicCode === topicCode &&
            String(item.questionId) === String(questionId)
          ),
      ),
    );
  };

  const setModuleDeadline = (moduleId, dateString) => {
    setDeadlines((prev) => ({
      ...prev,
      [moduleId]: dateString,
    }));
  };

  const value = {
    completedTopics: new Set(completedTopics),
    markTopicComplete,
    isTopicComplete,
    moduleProgress,
    mistakes,
    deadlines,
    reviewQueue,
    logMistake,
    setModuleDeadline,
    scheduleReviewQuestion,
    clearReviewQuestion,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useProgress = () => useContext(ProgressContext);
