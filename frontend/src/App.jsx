import { useState, useRef, useEffect } from 'react';

function App() {
  const gentleGongRef = useRef(null);

  const backgrounds = [
    { name: 'Am Forest', url: 'https://res.cloudinary.com/dk25jqckw/image/upload/v1770702401/brianna-parks-9GxWfpg8FbA-unsplash_jwckna.jpg' },
    { name: 'Beautiful Lake', url: 'https://res.cloudinary.com/dk25jqckw/image/upload/v1770755057/IMG_4981_of6atq.jpg' },
    { name: 'Double Rainbow', url: 'https://res.cloudinary.com/dk25jqckw/image/upload/v1770754604/babe-took-this_3_ytwlig.jpg' },
    { name: 'Peaceful Zen Garden', url: 'https://res.cloudinary.com/ninjagrvl/image/upload/v1771394783/ec9wd50vlrvcaeocf90y.png' },
    { name: 'Rainforest', url: 'https://res.cloudinary.com/ninjagrvl/image/upload/v1771398228/njxhneme7ifznyt7zk6f.png' },
  ];

  const [bgIndex, setBgIndex] = useState(0);
  const [darkMode, setDarkMode] = useState(true); // Default dark for new theme
  const [bgEnabled, setBgEnabled] = useState(true);

  const sounds = {
    sound1: '/audio/2.mp3',                        // Tibetan Bowls
    sound2: '/audio/3.mp3',                        // Nature Woods
    sound3: '/audio/4.mp3',                        // Lake & Stars
    sound4: '/audio/native-flute.mp3',             // Native Flute — place this file in /public/audio/
    freq528: '/audio/frequencies/528hz.mp3',
    freq432: '/audio/frequencies/432hz.mp3',
    freq396: '/audio/frequencies/396hz.mp3',
    freq40:  '/audio/frequencies/40hz.mp3',
    gong:   '/audio/1.mp3',                        // Gong (timer)
  };

  // Separate audio refs for sounds vs frequencies — no more key collisions
  const soundRefs = {
    sound1: useRef(null),
    sound2: useRef(null),
    sound3: useRef(null),
    sound4: useRef(null),
  };

  const freqRefs = {
    freq528: useRef(null),
    freq432: useRef(null),
    freq396: useRef(null),
    freq40:  useRef(null),
  };

  const audioRefs = { ...soundRefs, ...freqRefs };

  const [freqStates, setFreqStates] = useState({ freq528: false, freq432: false, freq396: false, freq40: false });
  const [soundStates, setSoundStates] = useState({ sound1: false, sound2: false, sound3: false, sound4: false });
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [timerSeconds, setTimerSeconds] = useState(10 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [breathActive, setBreathActive] = useState(false);
  const breathRef = useRef(null);

  // Light mode background picker panel
  const [showLightPanel, setShowLightPanel] = useState(false);
  // 'none' means plain gradient, 0-4 means backgrounds[idx]
  const [lightBgChoice, setLightBgChoice] = useState('none');
  const lightPanelRef = useRef(null);

  // Close panel on outside click
  useEffect(() => {
    if (!showLightPanel) return;
    const handleClick = (e) => {
      if (lightPanelRef.current && !lightPanelRef.current.contains(e.target)) {
        setShowLightPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showLightPanel]);

  const toggleFrequency = (freqKey) => {
    setFreqStates(prev => {
      const isOn = !prev[freqKey];
      const audio = freqRefs[freqKey].current;
      if (audio) {
        if (isOn) { audio.volume = 1; audio.currentTime = 0; audio.play(); }
        else { audio.pause(); audio.currentTime = 0; }
      }
      return { ...prev, [freqKey]: isOn };
    });
  };

  const toggleSound = (type) => {
    setSoundStates(prev => {
      const isOn = !prev[type];
      // Stop all sounds first
      Object.values(soundRefs).forEach(ref => {
        if (ref.current) { ref.current.pause(); ref.current.currentTime = 0; }
      });
      // Play the selected one
      if (isOn) {
        const audio = soundRefs[type].current;
        if (audio) { audio.volume = 1; audio.currentTime = 0; audio.play(); }
      }
      return { sound1: false, sound2: false, sound3: false, sound4: false, [type]: isOn };
    });
  };

  useEffect(() => { setTimerSeconds(timerMinutes * 60); }, [timerMinutes]);

  useEffect(() => {
    if (!timerRunning) return;
    if (timerSeconds <= 0) {
      setTimerRunning(false);
      if (gentleGongRef.current) { gentleGongRef.current.currentTime = 0; gentleGongRef.current.play(); }
      return;
    }
    timerRef.current = setTimeout(() => setTimerSeconds(s => s - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timerRunning, timerSeconds]);

  // Breathing cycle: 4s inhale, 4s hold, 4s exhale
  useEffect(() => {
    if (!breathActive) return;
    const cycle = ['inhale', 'hold', 'exhale'];
    let idx = 0;
    setBreathPhase(cycle[0]);
    breathRef.current = setInterval(() => {
      idx = (idx + 1) % cycle.length;
      setBreathPhase(cycle[idx]);
    }, 4000);
    return () => clearInterval(breathRef.current);
  }, [breathActive]);

  const startTimer = () => {
    if (gentleGongRef.current) {
      gentleGongRef.current.currentTime = 0;
      gentleGongRef.current.play()
        .then(() => { setTimerSeconds(timerMinutes * 60); setTimerRunning(true); })
        .catch(() => { setTimerSeconds(timerMinutes * 60); setTimerRunning(true); });
    } else {
      setTimerSeconds(timerMinutes * 60); setTimerRunning(true);
    }
  };
  const stopTimer = () => { setTimerRunning(false); clearTimeout(timerRef.current); };

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  const timerProgress = timerRunning ? 1 - (timerSeconds / (timerMinutes * 60)) : 0;
  const circumference = 2 * Math.PI * 54;

  // Sound card configs — all 4 sounds matched to actual files
  const soundCards = [
    { key: 'sound1', label: 'Tibetan Bowls', color: 'from-amber-400 to-yellow-600',  glow: 'shadow-amber-400/40',   icon: '🔔', activeRing: 'ring-amber-400'   },
    { key: 'sound2', label: 'Nature Woods',  color: 'from-emerald-400 to-teal-600',  glow: 'shadow-emerald-400/40', icon: '🌿', activeRing: 'ring-emerald-400' },
    { key: 'sound3', label: 'Lake & Stars',  color: 'from-violet-400 to-indigo-700', glow: 'shadow-violet-400/40',  icon: '🌌', activeRing: 'ring-violet-400'  },
    { key: 'sound4', label: 'Native Flute',  color: 'from-rose-500 to-pink-700',     glow: 'shadow-rose-500/40',    icon: '🪈', activeRing: 'ring-rose-400'    },
  ];

  const freqCards = [
    { key: 'freq528', hz: '528', label: 'Love & DNA Repair',    color: 'from-emerald-400 to-cyan-500',   border: 'border-emerald-400/40', glow: 'shadow-emerald-400/20' },
    { key: 'freq432', hz: '432', label: 'Harmony & Nature',     color: 'from-sky-400 to-blue-600',       border: 'border-sky-400/40',     glow: 'shadow-sky-400/20'     },
    { key: 'freq396', hz: '396', label: 'Liberation & Fear',    color: 'from-rose-400 to-pink-600',      border: 'border-rose-400/40',    glow: 'shadow-rose-400/20'    },
    { key: 'freq40',  hz: '40',  label: 'Focus & Concentration', color: 'from-amber-400 to-orange-500',  border: 'border-amber-400/40',   glow: 'shadow-amber-400/20', badge: 'GAMMA' },
  ];

  return (
    <div className={`min-h-screen w-full relative overflow-x-hidden font-sans transition-all duration-700 ${
      darkMode
        ? 'bg-[#060a0f] text-slate-100'
        : 'bg-gradient-to-br from-emerald-50 via-white to-sky-100 text-slate-900'
    }`}>

      {/* ── GOOGLE FONTS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Raleway:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; }

        body { font-family: 'Raleway', sans-serif; }

        .font-display { font-family: 'Cinzel', serif; }

        /* ─── COSMIC BACKGROUND ─── */
        .stars-bg {
          background:
            radial-gradient(ellipse at 20% 50%, rgba(14,165,233,0.07) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.09) 0%, transparent 40%),
            radial-gradient(ellipse at 60% 80%, rgba(16,185,129,0.06) 0%, transparent 40%),
            #060a0f;
        }

        /* ─── GLASSMORPHISM CARD ─── */
        .glass-dark {
          background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        .glass-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        /* ─── NEON GLOW EFFECTS ─── */
        .glow-cyan { box-shadow: 0 0 30px rgba(34,211,238,0.3), 0 0 60px rgba(34,211,238,0.1); }
        .glow-violet { box-shadow: 0 0 30px rgba(167,139,250,0.3), 0 0 60px rgba(167,139,250,0.1); }
        .glow-emerald { box-shadow: 0 0 30px rgba(52,211,153,0.3), 0 0 60px rgba(52,211,153,0.1); }
        .glow-rose { box-shadow: 0 0 20px rgba(251,113,133,0.35); }
        .glow-amber { box-shadow: 0 0 20px rgba(251,191,36,0.35); }

        /* ─── ORBS ─── */
        .orb { position: fixed; border-radius: 50%; filter: blur(100px); pointer-events: none; z-index: 1; }
        .orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(14,165,233,0.12), transparent 70%); top: -200px; left: -200px; animation: driftOrb 28s ease-in-out infinite; }
        .orb-2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%); bottom: -150px; right: -150px; animation: driftOrb 22s ease-in-out infinite reverse; }
        .orb-3 { width: 350px; height: 350px; background: radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%); top: 40%; left: 55%; animation: driftOrb 35s ease-in-out infinite 5s; }

        @keyframes driftOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.06); }
          66% { transform: translate(-25px, 20px) scale(0.94); }
        }

        /* ─── PARTICLE DOTS ─── */
        .particles { position: fixed; inset: 0; z-index: 1; pointer-events: none; overflow: hidden; }
        .particle {
          position: absolute;
          width: 2px; height: 2px;
          border-radius: 50%;
          background: rgba(148,163,184,0.4);
          animation: floatParticle linear infinite;
        }
        @keyframes floatParticle {
          0% { transform: translateY(100vh) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-10vh) translateX(20px); opacity: 0; }
        }

        /* ─── SCAN LINE ─── */
        .scanline {
          position: fixed; inset: 0; z-index: 2; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
        }

        /* ─── TITLE GLOW ─── */
        .title-glow {
          text-shadow: 0 0 30px rgba(34,211,238,0.5), 0 0 60px rgba(34,211,238,0.2), 0 0 100px rgba(34,211,238,0.1);
        }

        /* ─── SOUND BUTTON ─── */
        .sound-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .sound-btn::before {
          content: '';
          position: absolute; inset: 0; border-radius: inherit;
          background: inherit;
          filter: blur(15px);
          opacity: 0;
          transition: opacity 0.3s;
          z-index: -1;
          transform: scale(1.2);
        }
        .sound-btn:hover::before, .sound-btn.active::before { opacity: 0.6; }
        .sound-btn:hover { transform: scale(1.08) translateY(-3px); }
        .sound-btn.active { transform: scale(1.12); }

        /* ─── FREQUENCY BUTTON ─── */
        .freq-btn {
          position: relative;
          transition: all 0.3s ease;
          overflow: hidden;
        }
        .freq-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .freq-btn:hover::after { opacity: 1; }
        .freq-btn.active {
          animation: freqPulse 2s ease-in-out infinite;
        }
        @keyframes freqPulse {
          0%, 100% { box-shadow: 0 0 15px currentColor; }
          50% { box-shadow: 0 0 35px currentColor, 0 0 70px currentColor; }
        }

        /* ─── BREATHING ORB ─── */
        .breath-orb {
          border-radius: 50%;
          transition: all 4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .breath-orb.inhale {
          transform: scale(1.4);
          box-shadow: 0 0 60px rgba(34,211,238,0.5), 0 0 100px rgba(34,211,238,0.2);
        }
        .breath-orb.hold {
          transform: scale(1.4);
          box-shadow: 0 0 80px rgba(167,139,250,0.5), 0 0 120px rgba(167,139,250,0.2);
        }
        .breath-orb.exhale {
          transform: scale(1);
          box-shadow: 0 0 20px rgba(16,185,129,0.3), 0 0 40px rgba(16,185,129,0.1);
        }

        /* ─── TIMER RING ─── */
        .timer-ring { transition: stroke-dashoffset 1s linear; }

        /* ─── WAVEFORM ─── */
        .wave-bar {
          border-radius: 2px;
          animation: waveDance 1.2s ease-in-out infinite;
        }
        @keyframes waveDance {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }

        /* ─── FLOAT TITLE ─── */
        @keyframes floatTitle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .float-title { animation: floatTitle 5s ease-in-out infinite; }

        /* ─── LIGHT MODE overrides ─── */
        .light-card {
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(16,185,129,0.2);
          backdrop-filter: blur(20px);
        }

        /* ─── CUSTOM SCROLLBAR ─── */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.3); border-radius: 2px; }

        /* ─── INPUT STYLING ─── */
        input[type=number] {
          -moz-appearance: textfield;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.15);
          color: inherit;
          border-radius: 10px;
        }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }

        /* ─── SEPARATOR LINE ─── */
        .sep { height: 1px; background: linear-gradient(90deg, transparent, rgba(34,211,238,0.3), transparent); }
      `}</style>

      {/* ── COSMIC BG ── */}
      {darkMode && <div className="stars-bg fixed inset-0 z-0" />}
      {darkMode && <div className="scanline" />}

      {/* ── ORBS ── */}
      {darkMode && (
        <>
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </>
      )}

      {/* ── FLOATING PARTICLES ── */}
      {darkMode && (
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${8 + Math.random() * 15}s`,
              animationDelay: `${Math.random() * 10}s`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              opacity: 0.3 + Math.random() * 0.4,
            }} />
          ))}
        </div>
      )}

      {/* ── BACKGROUND IMAGE ── */}
      {bgEnabled && (
        <div className="absolute inset-0 z-0">
          <img
            src={backgrounds[bgIndex].url}
            alt={backgrounds[bgIndex].name}
            className="w-full h-full object-cover transition-all duration-1000"
            style={{ filter: darkMode ? 'brightness(0.22) saturate(0.6) blur(1px)' : 'brightness(0.88) blur(0.5px)' }}
          />
          <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-b from-[#060a0f]/70 via-[#060a0f]/50 to-[#060a0f]/80' : 'bg-gradient-to-b from-white/30 via-emerald-50/20 to-sky-100/40'}`} />
        </div>
      )}

      {/* ── TOP CONTROLS ── */}
      <div className="fixed top-3 left-3 z-50 flex gap-2 items-start" ref={lightPanelRef}>

        {/* ── SUN BUTTON: opens light-mode background picker ── */}
        {darkMode ? (
          <div className="relative">
            <button
              onClick={() => setShowLightPanel(p => !p)}
              className="p-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 glass-dark text-cyan-300 hover:text-yellow-300 border border-cyan-500/20 hover:border-yellow-400/50"
              title="Switch to Light Mode — pick a background"
            >
              {/* Sun icon */}
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" fill="currentColor"/>
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M16.36 16.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M16.36 7.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="hidden md:inline text-xs">Light</span>
              <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24" className={`transition-transform duration-200 ${showLightPanel ? 'rotate-180' : ''}`}>
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>

            {/* ── LIGHT BG PICKER DROPDOWN ── */}
            {showLightPanel && (
              <div className="absolute top-12 left-0 z-50 w-72 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                style={{ background: 'rgba(10,14,20,0.92)', backdropFilter: 'blur(24px)' }}>
                <div className="px-4 pt-4 pb-2">
                  <p className="text-xs tracking-[0.25em] uppercase text-slate-400 mb-3 font-display">Choose Light Background</p>

                  {/* ── Option 0: Plain light gradient ── */}
                  <button
                    onClick={() => {
                      setLightBgChoice('none');
                      setBgEnabled(false);
                      setDarkMode(false);
                      setShowLightPanel(false);
                    }}
                    className={`w-full mb-3 rounded-xl overflow-hidden border-2 transition-all duration-200 flex items-center gap-3 p-2 text-left
                      ${lightBgChoice === 'none' && !darkMode ? 'border-emerald-400 ring-2 ring-emerald-400/30' : 'border-white/10 hover:border-emerald-400/50'}`}
                  >
                    {/* Gradient swatch */}
                    <div className="w-14 h-10 rounded-lg flex-shrink-0 bg-gradient-to-br from-emerald-50 via-white to-sky-100 border border-emerald-100" />
                    <div>
                      <div className="text-white text-xs font-semibold">Plain Light</div>
                      <div className="text-slate-400 text-[10px]">Soft emerald gradient</div>
                    </div>
                    {lightBgChoice === 'none' && !darkMode && (
                      <svg className="ml-auto w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    )}
                  </button>

                  {/* ── Options 1–5: Background images ── */}
                  <div className="grid grid-cols-1 gap-2 pb-3">
                    {backgrounds.map((bg, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setLightBgChoice(idx);
                          setBgIndex(idx);
                          setBgEnabled(true);
                          setDarkMode(false);
                          setShowLightPanel(false);
                        }}
                        className={`w-full rounded-xl overflow-hidden border-2 transition-all duration-200 flex items-center gap-3 p-2 text-left
                          ${lightBgChoice === idx && !darkMode ? 'border-emerald-400 ring-2 ring-emerald-400/30' : 'border-white/10 hover:border-emerald-400/50'}`}
                      >
                        <img src={bg.url} alt={bg.name} className="w-14 h-10 object-cover rounded-lg flex-shrink-0" />
                        <div>
                          <div className="text-white text-xs font-semibold">{bg.name}</div>
                          <div className="text-slate-400 text-[10px]">Light mode + image</div>
                        </div>
                        {lightBgChoice === idx && !darkMode && (
                          <svg className="ml-auto w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── MOON BUTTON: switch back to dark mode ── */
          <button
            onClick={() => { setDarkMode(true); setBgEnabled(false); setLightBgChoice('none'); }}
            className="p-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 bg-white/80 text-slate-700 border border-emerald-200 hover:border-violet-400 hover:text-violet-600"
            title="Switch to Dark Mode"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 0112.21 3a7 7 0 100 14A9 9 0 0021 12.79z" fill="currentColor"/>
            </svg>
            <span className="hidden md:inline text-xs">Dark</span>
          </button>
        )}

        {/* ── HIDE/SHOW BG (only in light mode with bg) ── */}
        {!darkMode && (
          <button
            onClick={() => setBgEnabled(b => !b)}
            className="p-2.5 rounded-xl font-medium text-xs transition-all duration-300 bg-white/80 text-slate-600 border border-emerald-200 hover:border-emerald-400"
          >
            {bgEnabled ? '🏔 Hide BG' : '🌄 Show BG'}
          </button>
        )}
      </div>

      {/* ── DARK MODE: background image thumbnails in top-right ── */}
      {darkMode && bgEnabled && (
        <div className="fixed top-3 right-3 z-50 flex gap-1.5">
          {backgrounds.map((bg, idx) => (
            <button
              key={idx}
              onClick={() => setBgIndex(idx)}
              title={bg.name}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                bgIndex === idx
                  ? 'border-cyan-400 scale-110 ring-2 ring-cyan-400/30'
                  : 'border-white/10 opacity-60 hover:opacity-90'
              }`}
            >
              <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* ══════════════════ MAIN CONTENT ══════════════════ */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start pt-20 pb-24 px-4">

        {/* ── HERO HEADER ── */}
        <div className="flex flex-col items-center mb-10 mt-6">
          {/* Decorative line */}
          <div className={`flex items-center gap-3 mb-6 ${darkMode ? 'text-cyan-400/60' : 'text-emerald-500/60'}`}>
            <div className={`h-px w-16 ${darkMode ? 'bg-gradient-to-r from-transparent to-cyan-400/60' : 'bg-gradient-to-r from-transparent to-emerald-400'}`} />
            <span className="text-xs tracking-[0.4em] uppercase font-display">Tica Rey Presents</span>
            <div className={`h-px w-16 ${darkMode ? 'bg-gradient-to-l from-transparent to-cyan-400/60' : 'bg-gradient-to-l from-transparent to-emerald-400'}`} />
          </div>

          <h1 className={`font-display text-5xl md:text-7xl font-bold text-center float-title tracking-tight leading-none mb-4 ${
            darkMode
              ? 'text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-400 title-glow'
              : 'text-transparent bg-clip-text bg-gradient-to-b from-slate-900 via-emerald-800 to-emerald-600'
          }`}>
            {/* sonic */}
            Pura Vida 
            <br />
            <span className={darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-violet-300 to-cyan-300' : 'text-emerald-600'}>
              {/* healing */}
              Flow
            </span>
          </h1>

          <p className={`text-sm md:text-base text-center max-w-sm tracking-[0.15em] uppercase mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Experience deep relaxation through sound
          </p>
        </div>

        {/* ── MEDITATION ADVICE CARD ── */}
        <div className={`w-full max-w-2xl mb-8 rounded-2xl p-5 text-center text-sm leading-relaxed ${
          darkMode ? 'glass-dark border border-cyan-500/15 text-slate-300' : 'light-card text-slate-600'
        }`}>
          <span className={`text-xs tracking-[0.3em] uppercase block mb-2 ${darkMode ? 'text-cyan-400' : 'text-emerald-600'}`}>
            ✦ Meditation Guidance ✦
          </span>
          Sit comfortably, close your eyes, and anchor your awareness to your breath.
          Let thoughts drift by like clouds, there is no right or wrong way to be here.
          <span className={`font-semibold ${darkMode ? 'text-violet-300' : 'text-emerald-700'}`}> Just be present.</span>
        </div>

        {/* ══ SOUND PLAYER SECTION ══ */}
        <div className={`w-full max-w-2xl rounded-3xl p-6 md:p-8 mb-6 ${darkMode ? 'glass-dark' : 'light-card'}`}>
          <div className="flex items-center gap-3 mb-7">
            <div className={`h-px flex-1 ${darkMode ? 'bg-gradient-to-r from-transparent to-cyan-500/30' : 'bg-gradient-to-r from-transparent to-emerald-300'}`} />
            <h2 className={`font-display text-base tracking-[0.2em] uppercase ${darkMode ? 'text-cyan-300' : 'text-emerald-700'}`}>
              Sound Player
            </h2>
            <div className={`h-px flex-1 ${darkMode ? 'bg-gradient-to-l from-transparent to-cyan-500/30' : 'bg-gradient-to-l from-transparent to-emerald-300'}`} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
            {soundCards.map(({ key, label, color, glow, icon, activeRing }) => {
              const isActive = soundStates[key];
              return (
                <div key={key} className="flex flex-col items-center gap-3">
                  <button
                    onClick={() => toggleSound(key)}
                    className={`sound-btn w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 text-white font-semibold
                      bg-gradient-to-br ${color}
                      ${isActive ? `active shadow-2xl ${glow} ring-2 ${activeRing}` : 'opacity-60 hover:opacity-100'}
                    `}
                  >
                    <span className="text-2xl">{icon}</span>
                    {isActive && (
                      <div className="flex items-end gap-0.5 h-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="wave-bar w-1 bg-white/80" style={{
                            height: `${8 + Math.random() * 8}px`,
                            animationDelay: `${i * 0.15}s`,
                          }} />
                        ))}
                      </div>
                    )}
                  </button>
                  <span className={`text-xs text-center font-medium tracking-wide ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {label}
                  </span>
                  <audio ref={soundRefs[key]} src={sounds[key]} preload="auto" loop />
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ FREQUENCY HEALING ══ */}
        <div className={`w-full max-w-2xl rounded-3xl p-6 md:p-8 mb-6 ${darkMode ? 'glass-dark' : 'light-card'}`}>
          <div className="flex items-center gap-3 mb-7">
            <div className={`h-px flex-1 ${darkMode ? 'bg-gradient-to-r from-transparent to-violet-500/30' : 'bg-gradient-to-r from-transparent to-emerald-300'}`} />
            <h2 className={`font-display text-base tracking-[0.2em] uppercase ${darkMode ? 'text-violet-300' : 'text-emerald-700'}`}>
              Frequencies
            </h2>
            <div className={`h-px flex-1 ${darkMode ? 'bg-gradient-to-l from-transparent to-violet-500/30' : 'bg-gradient-to-l from-transparent to-emerald-300'}`} />
          </div>

          <div className="flex flex-col gap-3">
            {freqCards.map(({ key, hz, label, color, border, glow, badge }) => {
              const isActive = freqStates[key];
              const isFocus = key === 'freq40';
              return (
                <button
                  key={key}
                  onClick={() => toggleFrequency(key)}
                  className={`freq-btn relative w-full rounded-2xl p-4 flex items-center justify-between text-left transition-all duration-300 border ${
                    isActive
                      ? `bg-gradient-to-r ${color} bg-opacity-20 ${border} shadow-lg ${glow} active`
                      : darkMode
                        ? `glass-dark ${border} hover:border-white/20`
                        : `light-card ${border}`
                  } ${isFocus && !isActive ? (darkMode ? 'ring-1 ring-amber-400/20' : 'ring-1 ring-amber-300/40') : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-sm relative ${
                      isActive ? 'bg-white/20 text-white' : darkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isFocus ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.7-3.2A4.5 4.5 0 1 1 9.5 2Z"/>
                          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.7-3.2A4.5 4.5 0 1 0 14.5 2Z"/>
                        </svg>
                      ) : hz}
                    </div>
                    <div>
                      <div className={`font-semibold text-sm flex items-center gap-2 ${isActive ? 'text-white' : darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                        {hz} Hz
                        {badge && (
                          <span className={`text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded-full uppercase ${
                            isActive ? 'bg-white/25 text-white' : 'bg-amber-400/20 text-amber-400'
                          }`}>
                            {badge}
                          </span>
                        )}
                      </div>
                      <div className={`text-xs mt-0.5 ${isActive ? 'text-white/70' : darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {label}
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 text-xs font-semibold tracking-wider ${isActive ? 'text-white' : darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {isActive ? (
                      <>
                        <div className="flex items-end gap-0.5 h-5">
                          {[...Array(isFocus ? 6 : 4)].map((_, i) => (
                            <div key={i} className="wave-bar w-1 bg-current rounded-full" style={{
                              height: `${isFocus ? 4 + (i % 3) * 5 : 6 + i * 3}px`,
                              animationDelay: `${i * (isFocus ? 0.1 : 0.2)}s`,
                              animationDuration: isFocus ? '0.6s' : '1.2s',
                            }} />
                          ))}
                        </div>
                        PLAYING
                      </>
                    ) : 'PLAY ›'}
                  </div>
                  <audio ref={freqRefs[key]} src={sounds[key]} preload="auto" loop />
                </button>
              );
            })}
          </div>
        </div>

        {/* ══ BREATHING GUIDE + TIMER ROW ══ */}
        <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">

          {/* ── BREATHING GUIDE ── */}
          <div className={`rounded-3xl p-6 flex flex-col items-center gap-5 ${darkMode ? 'glass-dark' : 'light-card'}`}>
            <h2 className={`font-display text-sm tracking-[0.2em] uppercase ${darkMode ? 'text-cyan-300' : 'text-emerald-700'}`}>
              Breathing Guide
            </h2>

            {/* Breathing Orb */}
            <div className="relative flex items-center justify-center w-32 h-32">
              {/* Outer ring */}
              <div className={`absolute inset-0 rounded-full border ${darkMode ? 'border-white/5' : 'border-slate-200'}`} />
              {/* Orb */}
              <div className={`breath-orb w-20 h-20 bg-gradient-to-br ${
                breathPhase === 'inhale' ? 'from-cyan-400 to-blue-600' :
                breathPhase === 'hold' ? 'from-violet-400 to-purple-600' :
                'from-emerald-400 to-teal-600'
              } ${breathPhase}`} />
              {/* Phase label */}
              <div className={`absolute inset-0 flex items-center justify-center text-xs font-semibold uppercase tracking-widest ${darkMode ? 'text-white/80' : 'text-white'}`}>
                {breathActive ? breathPhase : ''}
              </div>
            </div>

            <p className={`text-xs text-center ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              4s inhale · 4s hold · 4s exhale
            </p>

            <button
              onClick={() => setBreathActive(a => !a)}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${
                breathActive
                  ? darkMode
                    ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/20'
                    : 'bg-emerald-600 text-white'
                  : darkMode
                    ? 'glass-dark border border-white/10 text-slate-300 hover:border-cyan-500/30 hover:text-cyan-300'
                    : 'border border-emerald-300 text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              {breathActive ? '⏸ Pause' : '▶ Begin'}
            </button>
          </div>

          {/* ── SESSION TIMER ── */}
          <div className={`rounded-3xl p-6 flex flex-col items-center gap-5 ${darkMode ? 'glass-dark' : 'light-card'}`}>
            <h2 className={`font-display text-sm tracking-[0.2em] uppercase ${darkMode ? 'text-violet-300' : 'text-emerald-700'}`}>
              Session Timer
            </h2>

            {/* Circular Timer */}
            <div className="relative flex items-center justify-center w-32 h-32">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
                {/* Track */}
                <circle cx="60" cy="60" r="54" fill="none" stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} strokeWidth="4" />
                {/* Progress */}
                <circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke={darkMode ? 'url(#timerGrad)' : '#10b981'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - timerProgress)}
                  className="timer-ring"
                />
                <defs>
                  <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className={`font-display text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                {formatTime(timerSeconds)}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 w-full justify-center">
              <input
                type="number" min="1" max="60" value={timerMinutes}
                onChange={e => setTimerMinutes(Number(e.target.value))}
                disabled={timerRunning}
                className={`w-16 text-center text-sm py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-400 ${
                  darkMode ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-800'
                }`}
              />
              <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>min</span>
              {!timerRunning ? (
                <button
                  onClick={startTimer}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${
                    darkMode
                      ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-105'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  Start
                </button>
              ) : (
                <button
                  onClick={stopTimer}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${
                    darkMode
                      ? 'bg-[#517c61] border border-yellow-500/40 text-[#000000] hover:bg-[#517c61]'
                      : 'bg-rose-100 border border-rose-300 text-[#517c61]'
                  }`}
                >
                  Stop
                </button>
              )}
            </div>
          </div>
        </div>

      </div>{/* end main content */}

      {/* ── HIDDEN GONG AUDIO ── */}
      <audio ref={gentleGongRef} src={sounds.gong} preload="auto" style={{ display: 'none' }} />

      {/* ── SIGNATURE ── */}
      <div style={{
        position: 'fixed', bottom: '36px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, fontSize: '8px', letterSpacing: '0.4em', textTransform: 'uppercase',
        color: darkMode ? 'rgba(34,211,238,0.15)' : 'rgba(0,0,0,0.1)', fontWeight: 300, whiteSpace: 'nowrap',
        fontFamily: 'Cinzel, serif',
      }}>
        Tica Rey Presents Pura Vida Flow 
      </div>

      {/* ── FOOTER DISCLAIMER ── */}
      <footer className={`w-full text-center py-2.5 text-xs fixed bottom-0 left-0 z-50 ${
        darkMode
          ? 'bg-black/60 backdrop-blur text-slate-600 border-t border-white/5'
          : 'bg-white/80 backdrop-blur text-slate-400 border-t border-slate-100'
      }`}>
        For relaxation and entertainment only. Not a substitute for professional medical advice.
      </footer>

    </div>
  );
}

export default App;






















