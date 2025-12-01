import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { getModuleById, getStageDecks } from '../data/modules';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { getRandomQuestionsFromBank } from '../data/testBanks';

const colorTagMap = {
  RED: 'color-red',
  BLUE: 'color-blue',
  PURPLE: 'color-purple',
  GREEN: 'color-green',
  ORANGE: 'color-orange',
  UNDERLINE: 'underline',
};

const applyColorTags = (value = '') => {
  if (typeof value !== 'string') return value;
  let output = value;
  Object.entries(colorTagMap).forEach(([token, cls]) => {
    const bracketPattern = new RegExp(`\\[${token}\\]([\\s\\S]*?)\\[/${token}\\]`, 'gi');
    output = output.replace(bracketPattern, (_, inner) => `<span class="${cls}">${inner}</span>`);
    const legacyPattern = new RegExp(`${token}([\\s\\S]*?)/${token}`, 'gi');
    output = output.replace(legacyPattern, (_, inner) => `<span class="${cls}">${inner}</span>`);
    output = output.replace(new RegExp(`\\[/?${token}\\]|${token}|/${token}`, 'g'), '');
  });
  return output;
};

const stripLeadingDashes = (value = '') =>
  value.replace(/^[\s\u00a0\u200b\uFEFF]*[—–-]\s*/, '');

const boldParentheticals = (value = '') =>
  value.replace(/\(([^()]+)\)/g, (match, inner) => `<strong>(${inner})</strong>`);

const decorateSpecialMarkers = (text = '') =>
  boldParentheticals(
    applyColorTags(stripLeadingDashes(text).replace(/\bBREAK\b/gi, '<span class="break-spacer">   </span>')),
  );

const gatherReviewIds = (lessonCode, queue) => {
  if (!lessonCode || !Array.isArray(queue)) return [];
  const relevant = queue.filter((item) => item.topicCode === lessonCode);
  return [...new Set(relevant.map((item) => String(item.questionId)))];
};

const StagePage = () => {
  const { moduleId, stageId } = useParams();
  const moduleData = useMemo(() => getModuleById(moduleId), [moduleId]);
  const navigate = useNavigate();
  const stageDecks = useMemo(() => getStageDecks(moduleData), [moduleData]);
  const { language } = useLanguage();
  const {
    markTopicComplete,
    isTopicComplete,
    logMistake,
    reviewQueue,
    scheduleReviewQuestion,
    clearReviewQuestion,
  } = useProgress();
  const currentDeck =
    stageDecks.find((deck) => deck.slug === stageId) || stageDecks[0];
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [quizResponses, setQuizResponses] = useState({});
  const [quizRefreshKey, setQuizRefreshKey] = useState(0);
  const [activeReviewIds, setActiveReviewIds] = useState([]);

  useEffect(() => {
    setActiveLessonIndex(0); // eslint-disable-line react-hooks/set-state-in-effect
  }, [currentDeck?.slug]);

  const stageCode = currentDeck?.code || 'Stage';
  const stageTitle = currentDeck?.title || 'Lesson';
  const lessonsInDeck = currentDeck?.lessons || [];
  const safeIndex =
    lessonsInDeck.length > 0
      ? Math.min(activeLessonIndex, lessonsInDeck.length - 1)
      : 0;
  const lesson = lessonsInDeck[safeIndex];
  const isPracticeLesson = Boolean(lesson?.isPractice || lesson?.optional);
  const isTrackableLesson = Boolean(lesson && !lesson?.optional);
  const englishContent = lesson?.content?.english;
  const localizedContent =
    lesson?.content && language ? lesson.content[language.id] : null;

  useEffect(() => {
    setIsStarted(false); // eslint-disable-line react-hooks/set-state-in-effect
    setActiveStepIndex(0);
    setQuizResponses({});
    setQuizRefreshKey(0);
  }, [lesson?.code]);

  useEffect(() => {
    if (isPracticeLesson) {
      setActiveReviewIds([]);
      return;
    }
    setActiveReviewIds(gatherReviewIds(lesson?.code, reviewQueue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.code, quizRefreshKey, isPracticeLesson]);

  const renderContentBlock = (label, content) => (
    <div className="lesson-content-block" key={label}>
      <p className="content-language">{label}</p>
      {content.introHtml || content.intro ? (
        <p
          className="content-intro"
          dangerouslySetInnerHTML={{
            __html: content.introHtml || decorateSpecialMarkers(content.intro || ''),
          }}
        />
      ) : null}
      {content.definitions?.length ? (
        <ul className="content-definitions">
          {content.definitions.map((item, index) => {
            if (item.isBreak) {
              return (
                <li key={`${label}-break-${index}`} className="definition-break" aria-hidden="true">
                  <span className="break-spacer">   </span>
                </li>
              );
            }
            const isExample = /^example\b/i.test(item.term || '');
            const definitionHtml =
              item.descriptionHtml || decorateSpecialMarkers(item.description || '');
            const termHtml = decorateSpecialMarkers(item.term || '');
            const prefix = termHtml ? ` — ${definitionHtml}` : definitionHtml;
            return (
              <li key={`${label}-${item.term}`} className={isExample ? 'definition-example' : ''}>
                <strong dangerouslySetInnerHTML={{ __html: termHtml }} />
                <span
                  className="definition-text"
                  dangerouslySetInnerHTML={{ __html: prefix }}
                />
              </li>
            );
          })}
        </ul>
      ) : null}
      {content.closingHtml ? (
        <p
          className="content-closing"
          dangerouslySetInnerHTML={{ __html: decorateSpecialMarkers(content.closingHtml) }}
        />
      ) : content.closing ? (
        <p className="content-closing">{decorateSpecialMarkers(content.closing)}</p>
      ) : null}
    </div>
  );

  const steps = useMemo(() => {
    if (!lesson) return [];
    const baseSteps = [];
    if (englishContent || localizedContent) {
      baseSteps.push({ type: 'definition', title: 'Step 1 — Basic Card (Definition)' });
    }
    lesson.flow?.forEach((step) => {
      if (step.type === 'quiz' && step.questionBank) {
        const quizQuestions =
          getRandomQuestionsFromBank(
            step.questionBank.moduleId || lesson.code,
            step.questionBank.count,
            {
              prioritizeIds: isPracticeLesson ? [] : activeReviewIds,
            },
          ) ||
          [];
        baseSteps.push({
          ...step,
          questions: quizQuestions.length ? quizQuestions : step.questions || [],
        });
      } else {
        baseSteps.push(step);
      }
    });
    return baseSteps;
  }, [lesson, englishContent, localizedContent, activeReviewIds, quizRefreshKey]);

  const finalStep = steps[steps.length - 1];
  const currentStep = isStarted ? steps[activeStepIndex] : null;
  const isQuizStep = currentStep?.type === 'quiz';
  const finalQuizQuestions =
    finalStep?.type === 'quiz' && Array.isArray(finalStep.questions) ? finalStep.questions : [];
  const isFinalQuizStep = isQuizStep && currentStep === finalStep && finalQuizQuestions.length > 0;
  const showLessonOverview = !(isStarted && isQuizStep);
  const topicCompleted = lesson && isTrackableLesson ? isTopicComplete(lesson.code) : false;
  const onFinalStep = isStarted && steps.length && activeStepIndex === steps.length - 1;
  const totalQuizQuestions = finalQuizQuestions.length;
  const answeredCount = finalQuizQuestions.filter((question) => Boolean(quizResponses[question.id])).length;
  const correctCount = finalQuizQuestions.reduce(
    (count, question) => (quizResponses[question.id] === question.answer ? count + 1 : count),
    0,
  );
  const passingScore = totalQuizQuestions ? Math.max(Math.ceil(totalQuizQuestions * 0.8), 4) : 0;
  const quizCompleted = totalQuizQuestions > 0 && answeredCount === totalQuizQuestions;
  const quizPassed = quizCompleted && correctCount >= passingScore;
  const readyToComplete = onFinalStep && (finalStep?.type === 'quiz' ? quizPassed : true);
  const completionHintText = isPracticeLesson
    ? 'Optional practice — repeat as often as you want.'
    : finalStep?.type === 'quiz' && totalQuizQuestions
        ? `Score at least ${passingScore}/${totalQuizQuestions} correct to master this topic.`
        : 'Finish this step to master the topic.';

  useEffect(() => {
    if (!lesson?.code || topicCompleted || isPracticeLesson) return;
    if (finalStep?.type === 'quiz') return;
    if (readyToComplete) {
      markTopicComplete(lesson.code);
    }
  }, [lesson?.code, readyToComplete, topicCompleted, markTopicComplete, finalStep?.type, isPracticeLesson]);

  if (!moduleData) {
    return (
      <div className="page lesson-page">
        <TopNav />
        <div className="lesson-not-found">
          <p>Module not found.</p>
          <Link to="/english" className="primary-btn">
            Back to Academic English Writing class
          </Link>
        </div>
      </div>
    );
  }

  if (!currentDeck) {
    return (
      <div className="page lesson-page">
        <TopNav />
        <div className="lesson-not-found">
          <p>Stage not found for this module.</p>
          <Link to={`/english/modules/${moduleId}`} className="primary-btn">
            Back to lessons
          </Link>
        </div>
      </div>
    );
  }

  const handleStart = () => {
    setIsStarted(true);
    setActiveStepIndex(0);
    setQuizResponses({});
  };

  const goToStep = (direction) => {
    setActiveStepIndex((prev) => {
      const next = prev + direction;
      if (next < 0) return 0;
      if (next >= steps.length) return steps.length - 1;
      return next;
    });
    setQuizResponses({});
  };

  const handleQuizSelect = (questionId, option, question) => {
    const payload = {
      moduleId,
      moduleLabel: moduleData.label,
      topicCode: lesson.code,
      topicTitle: lesson.title,
      questionId,
      questionText: question.prompt,
    };
    if (!isPracticeLesson) {
      if (option !== question.answer) {
        logMistake({
          ...payload,
          chosen: option,
          correct: question.answer,
        });
        scheduleReviewQuestion(payload);
      } else {
        clearReviewQuestion(payload);
      }
    }
    setQuizResponses((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleRetakeQuiz = () => {
    setQuizRefreshKey((prev) => prev + 1);
    setQuizResponses({});
  };

  const handleMarkComplete = () => {
    if (isPracticeLesson) return;
    if (lesson?.code && !topicCompleted) {
      markTopicComplete(lesson.code);
    }
  };

  const renderStep = (step) => {
    if (!step) return null;
    if (step.type === 'definition') {
      return (
        <div className="lesson-content-grid">
          {englishContent && renderContentBlock('English', englishContent)}
          {localizedContent && renderContentBlock(language.label, localizedContent)}
        </div>
      );
    }
    if (step.type === 'examples') {
      return step.examples.map((example) => {
        const translations = example.translationsHtml || example.translations || {};
        const translationEntries = Object.entries(translations);
        return (
          <div className="example-card" key={example.id}>
            <h4>{example.label}</h4>
            <p className="example-sentence">
              <strong>Sentence (EN):</strong>
              <br />
              {example.sentenceHtml ? (
                <span dangerouslySetInnerHTML={{ __html: example.sentenceHtml }} />
              ) : (
                example.sentence
              )}
            </p>
            {example.tagging ? (
              <ul className="tagging-list">
                {Object.entries(example.tagging).map(([part, value]) => (
                  <li key={`${example.id}-${part}`}>
                    <strong>{part}:</strong> {value}
                  </li>
                ))}
              </ul>
            ) : null}
            {translationEntries.length ? (
              <div className="example-translations">
                {translationEntries.map(([lang, text]) => (
                  <p key={`${example.id}-${lang}`} className="example-translation">
                    <strong className="example-translation-label">{lang.toUpperCase()}:</strong>{' '}
                    {text?.includes('<') ? (
                      <span dangerouslySetInnerHTML={{ __html: text }} />
                    ) : (
                      text
                    )}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        );
      });
    }
    if (step.type === 'ready') {
      const readyMessageHtml = step.messageHtml || (step.message ? decorateSpecialMarkers(step.message) : null);
      return readyMessageHtml ? (
        <p className="ready-message" dangerouslySetInnerHTML={{ __html: readyMessageHtml }} />
      ) : (
        <p className="ready-message">{step.message}</p>
      );
    }
    if (step.type === 'quiz') {
      return (
        <div className="quiz-list">
          {step.questions.map((question) => {
            const selected = quizResponses[question.id];
            const isAnswerRevealed = Boolean(selected);
            return (
              <div key={question.id} className="quiz-card">
                <p className="quiz-question">
                  <strong>{question.title}</strong>
                </p>
                <p>{question.prompt}</p>
                <div className="quiz-options">
                  {question.options.map((option) => {
                    const isSelected = selected === option;
                    const isCorrect = option === question.answer;
                    return (
                      <button
                        key={`${question.id}-${option}`}
                        type="button"
                        className={`quiz-option ${isSelected ? 'selected' : ''} ${
                          isAnswerRevealed && isCorrect ? 'correct' : ''
                        } ${isAnswerRevealed && isSelected && !isCorrect ? 'incorrect' : ''}`}
                        onClick={() => handleQuizSelect(question.id, option, question)}
                        disabled={isAnswerRevealed}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                {isAnswerRevealed ? (
                  <p className="quiz-answer">Correct answer: {question.answer}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page lesson-page">
      <TopNav />
      <section className="lesson-header">
        <div>
          <p className="lesson-breadcrumb">
            ACADEMIC ENGLISH WRITING CLASS / {moduleData.label.replace('MODULE', 'Module')} / LESSON {stageCode} / TOPICS
          </p>
          <h2>
            <span className="stage-code">{stageCode}</span> {stageTitle}
          </h2>
          <p>
            {moduleData.title} &mdash; {moduleData.description}
          </p>
        </div>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => navigate(`/english/modules/${moduleId}`)}
        >
          Back to lessons
        </button>
      </section>
      <section className="lesson-board">
        <aside className="lesson-menu">
          {lessonsInDeck.map((item, index) => {
            const pillClasses = [
              'lesson-pill',
              index === safeIndex ? 'active' : '',
              item.optional ? 'practice' : '',
              item.optional ? '' : isTopicComplete(item.code) ? 'completed' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <button type="button" key={item.code} className={pillClasses} onClick={() => setActiveLessonIndex(index)}>
                <span className="lesson-pill-code">{item.code}</span>
                <span>{item.title}</span>
                {!item.optional && isTopicComplete(item.code) ? (
                  <span className="lesson-pill-status">Mastered ✓</span>
                ) : null}
                {item.optional ? <span className="lesson-pill-status practice-label">Practice</span> : null}
              </button>
            );
          })}
        </aside>
        <div className="lesson-panel">
          <p className="lesson-stage">
            {stageCode} — {stageTitle}
          </p>
          {lesson ? (
            <>
              <h3>{lesson.title}</h3>
              {showLessonOverview ? <p className="lesson-summary">{lesson.summary}</p> : null}
              {showLessonOverview && lesson.highlights?.length ? (
                <ul className="lesson-highlights">
                  {lesson.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {showLessonOverview && lesson.why ? <p className="lesson-why">{lesson.why}</p> : null}
              {isStarted && currentStep ? (
                <>
                  <p className="step-indicator">
                    Step {activeStepIndex + 1} of {steps.length}
                  </p>
                  <div className="lesson-step">{renderStep(currentStep)}</div>
                  {isFinalQuizStep ? (
                    <div className="quiz-status">
                      <p className="quiz-score">
                        Score: {correctCount}/{totalQuizQuestions || 5}
                      </p>
                      {isPracticeLesson ? (
                        quizCompleted ? (
                          <button type="button" className="primary-btn" onClick={handleRetakeQuiz}>
                            Start another practice set
                          </button>
                        ) : (
                          <span className="completion-hint">
                            Answer all {totalQuizQuestions || 5} items to finish this practice set.
                          </span>
                        )
                      ) : quizCompleted ? (
                        quizPassed ? (
                          topicCompleted ? (
                            <span className="completion-hint">Topic mastered ✓</span>
                          ) : (
                            <button type="button" className="primary-btn" onClick={handleMarkComplete}>
                              Mark complete
                            </button>
                          )
                        ) : (
                          <button type="button" className="primary-btn" onClick={handleRetakeQuiz}>
                            Retake with new set
                          </button>
                        )
                      ) : (
                        <span className="completion-hint">
                          Answer all {totalQuizQuestions || 5} items. Need {Math.max(passingScore, 1)} correct to pass.
                        </span>
                      )}
                    </div>
                  ) : null}
                </>
              ) : null}
              <div className="lesson-panel-actions">
                {!isStarted ? (
                  <button type="button" className="primary-btn" onClick={handleStart}>
                    Start
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="circle-btn"
                      onClick={() => goToStep(-1)}
                      disabled={activeStepIndex === 0}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className="circle-btn filled"
                      onClick={() => goToStep(1)}
                      disabled={activeStepIndex === steps.length - 1}
                    >
                      →
                    </button>
                    {topicCompleted && !isPracticeLesson ? (
                      <span className="completion-pill">Topic mastered ✓</span>
                    ) : (
                      <span className="completion-hint">{completionHintText}</span>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <p className="lesson-summary">Lessons for this stage will be available soon.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default StagePage;
