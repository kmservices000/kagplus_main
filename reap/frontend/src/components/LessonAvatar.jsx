import { useEffect, useRef, useState } from 'react';

const LessonAvatar = ({ audioSrc, playSignal = 0, onStart, onEnded }) => {
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const rafRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const cleanupAudio = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
    }
    audioCtxRef.current = null;
    analyserRef.current = null;
    dataArrayRef.current = null;
    setMouthOpen(0);
  };

  useEffect(
    () => () => {
      cleanupAudio();
    },
    [],
  );

  const ensureAnalyser = () => {
    if (!audioRef.current) return;
    if (audioCtxRef.current) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const source = ctx.createMediaElementSource(audioRef.current);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);
    analyser.connect(ctx.destination);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;
  };

  const tickMouth = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i += 1) {
      const deviation = dataArrayRef.current[i] - 128;
      sum += deviation * deviation;
    }
    const rms = Math.sqrt(sum / dataArrayRef.current.length);
    const normalized = Math.min(1, rms / 24); // tweak sensitivity
    setMouthOpen(normalized);
    rafRef.current = requestAnimationFrame(tickMouth);
  };

  const startPlayback = async (reset = false) => {
    if (!audioRef.current) return;
    try {
      ensureAnalyser();
      if (audioCtxRef.current?.state === 'suspended') {
        await audioCtxRef.current.resume();
      }
      if (reset) {
        audioRef.current.currentTime = 0;
      }
      await audioRef.current.play();
      setIsPlaying(true);
      setHasStarted(true);
      if (onStart) onStart();
      rafRef.current = requestAnimationFrame(tickMouth);
    } catch (error) {
      setIsPlaying(false);
    }
  };

  const handlePause = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setMouthOpen(0);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  useEffect(() => {
    if (!isReady) return undefined;
    if (!playSignal) return undefined;
    startPlayback(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playSignal, isReady]);

  return (
    <div className="lesson-avatar lesson-avatar--large">
      <div className="lesson-avatar__visual">
        <div className="lesson-avatar__overlay">
          <span className="lesson-avatar__eye lesson-avatar__eye--left" />
          <span className="lesson-avatar__eye lesson-avatar__eye--right" />
          <span className="lesson-avatar__cheek lesson-avatar__cheek--left" />
          <span className="lesson-avatar__cheek lesson-avatar__cheek--right" />
          <span
            className="lesson-avatar__mouth"
            style={{ transform: `translateX(-50%) scaleY(${0.5 + mouthOpen * 1.5})` }}
          />
        </div>
      </div>
      <div className="lesson-avatar__body">
        <p className="lesson-avatar__title">Lesson voice</p>
        <div className="lesson-avatar__controls">
          <button
            type="button"
            className="primary-btn"
            onClick={() => startPlayback(!hasStarted)}
            disabled={!isReady || isPlaying}
          >
            {isPlaying ? 'Playing…' : hasStarted ? 'Resume audio' : 'Start audio'}
          </button>
          <button
            type="button"
            className="primary-btn ghost"
            onClick={() => startPlayback(true)}
            disabled={!isReady}
          >
            Restart
          </button>
          <button
            type="button"
            className="circle-btn"
            onClick={handlePause}
            disabled={!isPlaying}
            aria-label="Pause audio"
          >
            ❚❚
          </button>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="auto"
        onCanPlay={() => setIsReady(true)}
        onPlay={() => setIsPlaying(true)}
        onPause={handlePause}
        onEnded={() => {
          handlePause();
          if (onEnded) onEnded();
        }}
      />
    </div>
  );
};

export default LessonAvatar;
