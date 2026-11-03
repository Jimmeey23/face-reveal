import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Eye, Maximize, Minimize, Pause, Play, RotateCcw, Settings as SettingsIcon, Shuffle, SlidersHorizontal, Square, Users, Volume2, VolumeX, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Background } from "./components/Background";
import { Controls } from "./components/Controls";
import { Header } from "./components/Header";
import { PeopleManager } from "./components/PeopleManager";
import { PhotoCard } from "./components/PhotoCard";
import { ProgressStrip } from "./components/ProgressStrip";
import { QuizOptions } from "./components/QuizOptions";
import { ResultsModal } from "./components/ResultsModal";
import { SettingsPanel } from "./components/SettingsPanel";
import { StartScreen } from "./components/StartScreen";
import { Toast } from "./components/Toast";
import { SAMPLE_PEOPLE } from "./data/people";
import { useFullscreen } from "./hooks/useFullscreen";
import { useIdle } from "./hooks/useIdle";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { celebrate, sadRain, sprinkle } from "./lib/confetti";
import { shuffleArray } from "./lib/image";
import { sound } from "./lib/sound";
import { deleteCustomPerson, isSupabaseConfigured, loadCustomPeople, saveCustomPerson } from "./lib/supabase";
import {
  ANIMATIONS,
  DEFAULT_SETTINGS,
  EMPTY_STATS,
  type AnswerResult,
  type Person,
  type Phase,
  type QuizStats,
  type RevealAnimation,
  type Settings,
} from "./types";
import { cn } from "./utils/cn";

const cardVariants = {
  enter: (d: number) => ({ x: d * 90, opacity: 0, rotate: d * 6, scale: 0.94 }),
  center: { x: 0, opacity: 1, rotate: 0, scale: 1 },
  exit: (d: number) => ({ x: -d * 90, opacity: 0, rotate: -d * 6, scale: 0.94 }),
};

export default function App() {
  /* ------------------------------------------------------------ */
  /* Persistent data                                               */
  /* ------------------------------------------------------------ */
  const [settings, setSettings] = useLocalStorage<Settings>("gtb:settings:v1", DEFAULT_SETTINGS);
  const [legacyPeople, setLegacyPeople, legacyStorageError] = useLocalStorage<Person[]>("gtb:people:v1", []);
  const [customPeople, setCustomPeople] = useState<Person[]>([]);
  const [peopleError, setPeopleError] = useState<string | null>(null);
  const [peopleLoading, setPeopleLoading] = useState(true);
  const [disabledIds, setDisabledIds] = useLocalStorage<string[]>("gtb:disabled:v1", []);

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => setSettings((prev) => ({ ...prev, ...patch })),
    [setSettings],
  );

  const allPeople = useMemo(() => [...SAMPLE_PEOPLE, ...legacyPeople, ...customPeople], [legacyPeople, customPeople]);
  const activePeople = useMemo(() => allPeople.filter((p) => !disabledIds.includes(p.id)), [allPeople, disabledIds]);
  const activeKey = activePeople.map((p) => p.id).join("|");
  const activeRef = useRef(activePeople);
  activeRef.current = activePeople;

  /* ------------------------------------------------------------ */
  /* Game state                                                    */
  /* ------------------------------------------------------------ */
  const [started, setStarted] = useState(false);
  const [order, setOrder] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerResult>>({});
  const [stats, setStats] = useState<QuizStats>(EMPTY_STATS);
  const [currentAnimation, setCurrentAnimation] = useState<RevealAnimation>("morph");
  const [animateReveal, setAnimateReveal] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [peeking, setPeeking] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showPeople, setShowPeople] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const revealTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const panelsOpen = showSettings || showPeople || showResults || !started;
  const idle = useIdle(3500, isFullscreen && started && !panelsOpen);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!isSupabaseConfigured) {
        setPeopleError("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to persist uploaded photos.");
        setPeopleLoading(false);
        return;
      }
      try {
        const savedPeople = await loadCustomPeople();
        if (cancelled) return;
        if (savedPeople.length === 0 && legacyPeople.length > 0) {
          const migrated = [];
          for (const person of legacyPeople) migrated.push(await saveCustomPerson(person));
          if (cancelled) return;
          setCustomPeople(migrated);
          setLegacyPeople([]);
        } else {
          setCustomPeople(savedPeople);
        }
        setPeopleError(null);
      } catch (error) {
        if (cancelled) return;
        setPeopleError(error instanceof Error ? error.message : "Couldn't load saved people from Supabase.");
      } finally {
        if (!cancelled) setPeopleLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
    // Load and migrate once for this app session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deck = useMemo(() => {
    const byId = new Map(activePeople.map((p) => [p.id, p]));
    return order.map((id) => byId.get(id)).filter((p): p is Person => !!p);
  }, [order, activePeople]);

  const person = deck[index];
  const isLast = index >= deck.length - 1;
  const isFirst = index <= 0;
  const revealed = useMemo(() => new Set(revealedIds), [revealedIds]);
  const guessing = phase === "idle" || phase === "counting";

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const clearRevealTimer = () => {
    if (revealTimer.current) {
      window.clearTimeout(revealTimer.current);
      revealTimer.current = null;
    }
  };

  /* ------------------------------------------------------------ */
  /* Deck building                                                  */
  /* ------------------------------------------------------------ */
  const buildDeck = useCallback((shuffle: boolean) => {
    clearRevealTimer();
    const ids = activeRef.current.map((p) => p.id);
    setOrder(shuffle ? shuffleArray(ids) : ids);
    setIndex(0);
    setDirection(1);
    setPhase("idle");
    setRevealedIds([]);
    setAnswers({});
    answersRef.current = {};
    setStats(EMPTY_STATS);
    setShowResults(false);
    setAnimateReveal(false);
    setSelectedAnswer(null);
    setHintLevel(0);
    setPeeking(false);
    setTimerPaused(false);
  }, []);

  useEffect(() => {
    buildDeck(settings.shuffle);
  }, [activeKey, settings.shuffle, buildDeck]);

  /* ------------------------------------------------------------ */
  /* Side effects: palette, sound, mode switch                      */
  /* ------------------------------------------------------------ */
  useEffect(() => {
    document.documentElement.dataset.palette = settings.palette;
  }, [settings.palette]);

  useEffect(() => {
    sound.enabled = settings.sound;
  }, [settings.sound]);

  useEffect(() => {
    if (settings.mode === "manual" && phaseRef.current === "counting") {
      setPhase("idle");
      setTimerPaused(false);
    }
  }, [settings.mode]);

  useEffect(() => () => clearRevealTimer(), []);

  /* ------------------------------------------------------------ */
  /* Quiz options                                                   */
  /* ------------------------------------------------------------ */
  const quizOptions = useMemo(() => {
    if (!person?.name) return [];
    const seen = new Set<string>([person.name.toLowerCase()]);
    const others: string[] = [];
    for (const p of shuffleArray(activeRef.current)) {
      const k = p.name.toLowerCase();
      if (k && !seen.has(k)) {
        seen.add(k);
        others.push(p.name);
      }
    }
    return shuffleArray([person.name, ...others.slice(0, 3)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person?.id, activeKey]);
  const quizAvailable = settings.quizMode && quizOptions.length >= 2;
  const maxHint = person ? (person.funFact ? 2 : 1) : 0;

  // Choose the reveal effect for the current baby *before* the reveal starts so the
  // matching stage component is already mounted and can transition smoothly.
  const personId = person?.id;
  useEffect(() => {
    if (!guessing) return;
    setCurrentAnimation(
      settings.animation === "random" ? ANIMATIONS[Math.floor(Math.random() * ANIMATIONS.length)].id : settings.animation,
    );
  }, [personId, settings.animation, guessing]);

  /* ------------------------------------------------------------ */
  /* Actions                                                        */
  /* ------------------------------------------------------------ */
  const recordAnswer = (id: string, result: AnswerResult) => {
    answersRef.current = { ...answersRef.current, [id]: result };
    setAnswers(answersRef.current);
    setStats((prev) => {
      const streak = result === "correct" ? prev.streak + 1 : 0;
      return {
        correct: prev.correct + (result === "correct" ? 1 : 0),
        wrong: prev.wrong + (result === "wrong" ? 1 : 0),
        missed: prev.missed + (result === "missed" ? 1 : 0),
        streak,
        bestStreak: Math.max(prev.bestStreak, streak),
      };
    });
  };

  const reveal = () => {
    const p = person;
    if (!p) return;
    if (phaseRef.current === "revealing" || phaseRef.current === "revealed") return;
    const anim: RevealAnimation = currentAnimation;
    setAnimateReveal(true);
    setPhase("revealing");
    phaseRef.current = "revealing";
    setPeeking(false);
    sound.whoosh();

    let result = answersRef.current[p.id];
    if (quizAvailable && !result) {
      result = "missed";
      recordAnswer(p.id, "missed");
    }
    const duration = ANIMATIONS.find((a) => a.id === anim)?.duration ?? 1500;
    const { confetti } = settings;
    clearRevealTimer();
    revealTimer.current = window.setTimeout(() => {
      setPhase("revealed");
      setRevealedIds((prev) => (prev.includes(p.id) ? prev : [...prev, p.id]));
      if (result === "wrong" || result === "missed") {
        sound.pop();
        if (confetti) sadRain();
      } else {
        sound.tada();
        if (confetti) celebrate();
      }
    }, duration);
  };

  const goTo = (i: number, dir?: number) => {
    if (i < 0 || i >= deck.length || i === index) return;
    clearRevealTimer();
    setDirection(dir ?? (i > index ? 1 : -1));
    setIndex(i);
    const p = deck[i];
    const wasRevealed = revealedIds.includes(p.id);
    setPhase(wasRevealed ? "revealed" : "idle");
    phaseRef.current = wasRevealed ? "revealed" : "idle";
    setAnimateReveal(false);
    setSelectedAnswer(null);
    setHintLevel(0);
    setPeeking(false);
    setTimerPaused(false);
    sound.swoosh();
  };

  const next = () => {
    if (!deck.length) return;
    if (isLast) {
      setShowResults(true);
      return;
    }
    goTo(index + 1, 1);
  };
  const prev = () => goTo(index - 1, -1);

  const startTimer = () => {
    if (phaseRef.current !== "idle") return;
    setTimerPaused(false);
    setPhase("counting");
    phaseRef.current = "counting";
    sound.start();
  };

  const primary = () => {
    switch (phaseRef.current) {
      case "idle":
        if (settings.mode === "timer") startTimer();
        else reveal();
        break;
      case "counting":
        reveal();
        break;
      case "revealed":
        next();
        break;
      default:
        break;
    }
  };

  const answer = (name: string) => {
    const p = person;
    if (!p || selectedAnswer !== null || !guessing) return;
    setSelectedAnswer(name);
    setTimerPaused(true);
    const res: AnswerResult = name === p.name ? "correct" : "wrong";
    recordAnswer(p.id, res);
    if (res === "correct") {
      sound.correct();
      if (settings.confetti) sprinkle(0.5, 0.55);
    } else {
      sound.wrong();
    }
    window.setTimeout(() => actionsRef.current.reveal(), 900);
  };

  const hint = () => {
    if (!guessing || hintLevel >= maxHint) return;
    setHintLevel((l) => l + 1);
    sound.click();
  };

  const timerClick = () => {
    if (phaseRef.current === "idle") startTimer();
    else if (phaseRef.current === "counting") {
      setTimerPaused((p) => !p);
      sound.click();
    }
  };

  const toggleMode = () => updateSettings({ mode: settings.mode === "timer" ? "manual" : "timer" });
  const toggleQuiz = () => {
    updateSettings({ quizMode: !settings.quizMode });
    showToast(!settings.quizMode ? "🧠 Quiz mode on" : "Quiz mode off");
  };
  const toggleSound = () => {
    const nextVal = !settings.sound;
    updateSettings({ sound: nextVal });
    if (nextVal) {
      sound.enabled = true;
      sound.unlock();
      sound.click();
    }
    showToast(nextVal ? "🔊 Sound on" : "🔇 Sound off");
  };

  const start = () => {
    sound.unlock();
    setStarted(true);
    sound.start();
  };

  const stopShow = () => {
    setShowControls(false);
    setTimerPaused(false);
    buildDeck(settings.shuffle);
    setStarted(false);
    if (isFullscreen) void toggleFullscreen();
    sound.swoosh();
  };

  const restart = (shuffle = settings.shuffle) => {
    buildDeck(shuffle);
    sound.swoosh();
    showToast(shuffle ? "🔀 Deck shuffled" : "↺ Deck restarted");
  };

  // Keep a ref of the latest actions so timers/keyboard never see stale closures.
  const actionsRef = useRef({ reveal, next, prev, primary, hint, toggleMode, toggleQuiz, toggleSound, start, answer });
  actionsRef.current = { reveal, next, prev, primary, hint, toggleMode, toggleQuiz, toggleSound, start, answer };
  const quizRef = useRef({ options: quizOptions, available: quizAvailable });
  quizRef.current = { options: quizOptions, available: quizAvailable };
  const stateRef = useRef({ started, panelsOpen });
  stateRef.current = { started, panelsOpen };

  /* ------------------------------------------------------------ */
  /* Auto-start timer & auto-advance                                */
  /* ------------------------------------------------------------ */
  useEffect(() => {
    if (!started || !person || panelsOpen) return;
    if (phase !== "idle" || settings.mode !== "timer" || !settings.autoStartTimer) return;
    const t = window.setTimeout(() => {
      if (phaseRef.current === "idle") {
        setPhase("counting");
        phaseRef.current = "counting";
        sound.start();
      }
    }, 900);
    return () => window.clearTimeout(t);
  }, [started, person, phase, settings.mode, settings.autoStartTimer, panelsOpen]);

  const autoAdvanceKey = `${person?.id ?? ""}-${phase}`;
  useEffect(() => {
    if (!started || panelsOpen || phase !== "revealed" || !settings.autoAdvance) return;
    const t = window.setTimeout(() => actionsRef.current.next(), settings.autoAdvanceDelay * 1000);
    return () => window.clearTimeout(t);
  }, [started, panelsOpen, phase, settings.autoAdvance, settings.autoAdvanceDelay, index]);

  /* ------------------------------------------------------------ */
  /* Keyboard shortcuts                                             */
  /* ------------------------------------------------------------ */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      const a = actionsRef.current;

      if (k === "Escape") {
        setShowSettings(false);
        setShowPeople(false);
        return;
      }
      if (!stateRef.current.started) {
        if (k === " " || k === "Enter") {
          e.preventDefault();
          a.start();
        }
        return;
      }
      if (stateRef.current.panelsOpen) return;

      const blur = () => (document.activeElement as HTMLElement | null)?.blur?.();
      switch (k) {
        case " ":
        case "Enter":
          e.preventDefault();
          blur();
          a.primary();
          break;
        case "ArrowRight":
        case "n":
        case "N":
          a.next();
          break;
        case "ArrowLeft":
        case "p":
        case "P":
          a.prev();
          break;
        case "r":
        case "R":
          a.reveal();
          break;
        case "h":
        case "H":
          a.hint();
          break;
        case "t":
        case "T":
          a.toggleMode();
          break;
        case "q":
        case "Q":
          a.toggleQuiz();
          break;
        case "f":
        case "F":
          void toggleFullscreen();
          break;
        case "m":
        case "M":
          a.toggleSound();
          break;
        case "s":
        case "S":
          setShowSettings(true);
          break;
        case "u":
        case "U":
          setShowPeople(true);
          break;
        case "1":
        case "2":
        case "3":
        case "4": {
          const q = quizRef.current;
          const name = q.options[parseInt(k, 10) - 1];
          if (q.available && name) a.answer(name);
          break;
        }
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleFullscreen]);

  /* ------------------------------------------------------------ */
  /* People management                                              */
  /* ------------------------------------------------------------ */
  const addPerson = async (p: Person) => {
    try {
      const saved = await saveCustomPerson(p);
      setCustomPeople((prev) => [...prev, saved]);
      setPeopleError(null);
      showToast(`✨ Added ${saved.name || "a new baby"} to the deck`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Couldn't save this person to Supabase.";
      setPeopleError(message);
      throw error;
    }
  };
  const deletePerson = async (id: string) => {
    if (legacyPeople.some((person) => person.id === id)) {
      setLegacyPeople((prev) => prev.filter((person) => person.id !== id));
    } else {
      try {
        const cleanupWarning = await deleteCustomPerson(id);
        setCustomPeople((prev) => prev.filter((p) => p.id !== id));
        setPeopleError(cleanupWarning ? `Person deleted, but Supabase couldn't remove its photo files: ${cleanupWarning}` : null);
      } catch (error) {
        setPeopleError(error instanceof Error ? error.message : "Couldn't delete this person from Supabase.");
        return;
      }
    }
    setDisabledIds((prev) => prev.filter((d) => d !== id));
  };
  const toggleDisabled = (id: string) =>
    setDisabledIds((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));

  /* ------------------------------------------------------------ */
  /* Helper text (non-quiz)                                         */
  /* ------------------------------------------------------------ */
  const helper = (() => {
    if (!person) return "";
    if (phase === "revealing") return "Drumroll, please… 🥁";
    if (phase === "revealed") return isLast ? "That was the last one — check out the results! 🏁" : "Did you get it? Hit Next for another cutie →";
    if (phase === "counting") return "Shout your guess before the timer runs out! ⏰";
    if (settings.mode === "timer") return settings.autoStartTimer ? "Get ready… the countdown is about to begin!" : "Start the timer when everyone's ready.";
    return "Take your guesses, then hit Reveal when everyone's ready.";
  })();

  /* ------------------------------------------------------------ */
  /* Render                                                         */
  /* ------------------------------------------------------------ */
  return (
    <div className="relative flex min-h-dvh flex-col">
      <Background particles={settings.showParticles} clip={started ? person?.animation : undefined} />

      <Header
        quizMode={quizAvailable}
        stats={stats}
        sound={settings.sound}
        onToggleSound={toggleSound}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => void toggleFullscreen()}
        onOpenSettings={() => setShowSettings(true)}
        onOpenPeople={() => setShowPeople(true)}
        hidden={idle}
      />

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pt-6 pb-24 sm:px-6">
        {person ? (
          <div className="flex w-full justify-center">
            {/* ---- Photo: as large as the viewport allows ---- */}
            <div className="flex w-full justify-center">
              <div className="w-[min(100%,calc((100dvh-19rem)*0.75))] min-w-[15rem] lg:w-[min(100%,calc((100dvh-15rem)*0.75))]">
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                  <motion.div
                    key={person.id}
                    custom={direction}
                    variants={cardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  >
                    <PhotoCard
                      person={person}
                      phase={phase}
                      animation={currentAnimation}
                      revealStyle={settings.revealStyle}
                      animateReveal={animateReveal}
                      peeking={peeking}
                      hintLevel={hintLevel}
                      showFunFact={settings.showFunFacts}
                      result={answers[person.id]}
                      quizMode={quizAvailable}
                      showTimer={settings.mode === "timer"}
                      timerSeconds={settings.timerSeconds}
                      timerPaused={timerPaused || panelsOpen}
                      onTimerComplete={() => actionsRef.current.reveal()}
                      onTimerTick={(s) => (s <= 3 ? sound.urgentTick() : sound.tick())}
                      onTimerClick={timerClick}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* ---- Controls: collapsed into a floating button, opens as a drawer ---- */}
            <div
              className={cn(
                "glass-strong fixed bottom-4 left-1/2 z-40 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full p-1.5 shadow-2xl transition-opacity duration-500",
                idle && !showControls && "pointer-events-none opacity-0",
              )}
            >
              <ToolButton label="Stop show" onClick={stopShow} className="text-rose-300">
                <Square size={18} fill="currentColor" />
              </ToolButton>
              <ToolButton label="Restart" onClick={() => restart(false)}>
                <RotateCcw size={18} />
              </ToolButton>
              <ToolButton label="Shuffle & restart" onClick={() => restart(true)}>
                <Shuffle size={18} />
              </ToolButton>
              <span className="mx-1 h-6 w-px bg-white/15" />
              <ToolButton label="Previous" onClick={prev} disabled={isFirst}>
                <ChevronLeft size={20} />
              </ToolButton>
              <button
                type="button"
                onClick={primary}
                className="brand-gradient flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 font-display text-sm font-bold shadow-lg transition active:scale-95"
              >
                {phase === "revealed" ? (
                  <>{isLast ? "Results" : "Next"} <ChevronRight size={16} /></>
                ) : phase === "idle" && settings.mode === "timer" ? (
                  <><Play size={16} fill="currentColor" /> Start</>
                ) : (
                  <><Eye size={16} /> Reveal</>
                )}
              </button>
              <ToolButton label="Next" onClick={next}>
                <ChevronRight size={20} />
              </ToolButton>
              {phase === "counting" && (
                <ToolButton label={timerPaused ? "Resume timer" : "Pause timer"} onClick={timerClick}>
                  {timerPaused ? <Play size={18} /> : <Pause size={18} />}
                </ToolButton>
              )}
              <span className="mx-1 h-6 w-px bg-white/15" />
              <ToolButton label={settings.sound ? "Mute" : "Unmute"} onClick={toggleSound}>
                {settings.sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </ToolButton>
              <ToolButton label={isFullscreen ? "Exit fullscreen" : "Fullscreen"} onClick={() => void toggleFullscreen()}>
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </ToolButton>
              <ToolButton label="Settings" onClick={() => setShowSettings(true)}>
                <SettingsIcon size={18} />
              </ToolButton>
              <ToolButton label={showControls ? "Hide advanced controls" : "Advanced controls"} onClick={() => setShowControls((v) => !v)} active={showControls}>
                {showControls ? <X size={18} /> : <SlidersHorizontal size={18} />}
              </ToolButton>
            </div>
            <div
              className={cn(
                "glass-strong fixed right-4 bottom-20 z-40 flex max-h-[calc(100dvh-7rem)] w-[min(calc(100vw-2rem),26rem)] flex-col gap-5 overflow-y-auto rounded-3xl p-4 shadow-2xl transition-all duration-300",
                !showControls && "pointer-events-none translate-y-3 opacity-0",
              )}
            >
              <ProgressStrip deck={deck} index={index} revealed={revealed} answers={answers} onJump={(i) => goTo(i)} />

              {quizAvailable ? (
                <div className="glass rounded-3xl p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-display text-lg font-semibold">Who is it? 🤔</span>
                    <span className="text-[11px] font-black tracking-[0.18em] text-white/40 uppercase">press 1–4</span>
                  </div>
                  <QuizOptions
                    options={quizOptions}
                    correct={person.name}
                    selected={selectedAnswer ?? (answers[person.id] ? "" : null)}
                    disabled={!guessing}
                    onSelect={answer}
                  />
                </div>
              ) : (
                <div className="glass flex items-center gap-3 rounded-3xl px-5 py-4">
                  <span className="text-2xl">{phase === "revealed" ? "🎉" : phase === "counting" ? "⏱️" : "💬"}</span>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={helper}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-semibold text-white/80"
                    >
                      {helper}
                    </motion.p>
                  </AnimatePresence>
                </div>
              )}

              <Controls
                phase={phase}
                mode={settings.mode}
                onModeChange={(mode) => updateSettings({ mode })}
                isFirst={isFirst}
                isLast={isLast}
                onPrev={prev}
                onNext={next}
                onPrimary={primary}
                hintLevel={hintLevel}
                maxHint={maxHint}
                onHint={hint}
                onPeekStart={() => {
                  if (guessing) {
                    setPeeking(true);
                    sound.swoosh();
                  }
                }}
                onPeekEnd={() => setPeeking(false)}
                onRestart={() => restart()}
                animation={settings.animation}
                onAnimationChange={(animation) => updateSettings({ animation })}
                autoAdvance={settings.autoAdvance}
                autoAdvanceDelay={settings.autoAdvanceDelay}
                autoAdvancePaused={panelsOpen}
                autoAdvanceKey={autoAdvanceKey}
              />
            </div>
          </div>
        ) : (
          started && (
            <div className="glass-strong max-w-md rounded-3xl p-8 text-center">
              <div className="text-5xl">🍼</div>
              <h2 className="mt-3 font-display text-2xl font-semibold">No babies in the deck</h2>
              <p className="mt-1 text-sm text-white/60">Add some photos or re-enable the sample people to start playing.</p>
              <button
                type="button"
                onClick={() => setShowPeople(true)}
                className="brand-gradient mt-5 inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-display font-bold shadow-lg"
              >
                <Users size={18} /> Manage people
              </button>
            </div>
          )
        )}
      </main>

      <SettingsPanel open={showSettings} onClose={() => setShowSettings(false)} settings={settings} onChange={updateSettings} />

      <PeopleManager
        open={showPeople}
        onClose={() => setShowPeople(false)}
        people={allPeople}
        disabledIds={disabledIds}
        onToggleDisabled={toggleDisabled}
        onAdd={addPerson}
        onDelete={deletePerson}
        storageError={peopleError ?? legacyStorageError ?? (peopleLoading ? "Connecting to Supabase…" : null)}
      />

      <ResultsModal
        open={showResults}
        onClose={() => setShowResults(false)}
        deck={deck}
        answers={answers}
        stats={stats}
        quizMode={quizAvailable}
        revealStyle={settings.revealStyle}
        onReplay={() => restart(false)}
        onShuffleReplay={() => restart(true)}
        onManagePeople={() => {
          setShowResults(false);
          setShowPeople(true);
        }}
      />

      <StartScreen
        open={!started}
        peopleCount={activePeople.length}
        settings={settings}
        onChange={updateSettings}
        onStart={start}
        onManagePeople={() => setShowPeople(true)}
        previewImages={activePeople.slice(0, 5).map((p) => p.babyImage)}
      />

      <Toast message={toast} />
    </div>
  );
}

function ToolButton({
  label,
  onClick,
  disabled,
  active,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid h-10 w-10 shrink-0 place-items-center rounded-full transition hover:bg-white/15 active:scale-95 disabled:pointer-events-none disabled:opacity-30",
        active && "bg-white/20",
        className,
      )}
    >
      {children}
    </button>
  );
}
