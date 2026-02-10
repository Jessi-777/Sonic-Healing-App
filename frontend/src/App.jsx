import { useState, useRef, useEffect } from 'react';

function App() {
    // Gong audio ref for timer end
    const gentleGongRef = useRef(null);
  const backgrounds = [
    {
      name: 'Forest Morning',
      url: 'https://res.cloudinary.com/ninjagrvl/image/upload/v1770699492/jh4qmpefsevkiftotewa.jpg',
    },
  
    {
      name: 'Mountain Sunrise',
      url: "https://res.cloudinary.com/ninjagrvl/image/upload/v1700296980/socialmedia_folder/bnjsga8xrryuh40sij7y.jpg"
    },
    {
      name: 'Peaceful after rain',
      url: 'https://res.cloudinary.com/dk25jqckw/image/upload/v1770703218/FullSizeRender_1_s97o2a.jpg',
    },
      {
      name: 'Cosmic Calm',
      url: 'https://res.cloudinary.com/ninjagrvl/image/upload/v1770702761/pdrmy7ks6mcevjopjj05.jpg',
    },
  ];

  const [bgIndex, setBgIndex] = useState(0);

      // Use local mp3 files for sounds
      const sounds = {
          crystalBowl: '/src/assets/sounds/1.mp3',
          tibetanGong: '/src/assets/sounds/2.mp3',
          nature: '/src/assets/sounds/3.mp3',
          magical: '/src/assets/sounds/4.mp3',
          freq528: '/src/assets/sounds/frequencies/528hz.mp3',
          freq432: '/src/assets/sounds/frequencies/432hz.mp3',
          freq396: '/src/assets/sounds/frequencies/396hz.mp3',
      };

      const audioRefs = {
          crystalBowl: useRef(null),
          tibetanGong: useRef(null),
          nature: useRef(null),
          magical: useRef(null),
          freq528: useRef(null),
          freq432: useRef(null),
          freq396: useRef(null),
      };

      // Stop all sounds
      const stopAllSounds = () => {
        Object.values(audioRefs).forEach(ref => {
          if (ref.current) {
            ref.current.pause();
            ref.current.currentTime = 0;
          }
        });
      };

      // Play only one sound at a time
      const playSound = (type) => {
        stopAllSounds();
        const audio = audioRefs[type].current;
        if (audio) {
          audio.currentTime = 0;
          audio.play();
        }
      };
  // Icon SVGs for each sound
  const soundIcons = {
    crystalBowl: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#f9a8d4"/><ellipse cx="12" cy="16" rx="7" ry="3" fill="#fff"/><ellipse cx="12" cy="16" rx="5" ry="2" fill="#f9a8d4"/></svg>
    ),
    tibetanGong: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fde68a"/><circle cx="12" cy="12" r="6" fill="#fff"/><circle cx="12" cy="12" r="3" fill="#fde68a"/></svg>
    ),
    nature: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#6ee7b7"/><path d="M12 8c2 0 4 2 4 4s-2 4-4 4-4-2-4-4 2-4 4-4z" fill="#fff"/></svg>
    ),
    magical: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#c4b5fd"/><path d="M12 7l2 4h-4l2-4zm0 10l-2-4h4l-2 4z" fill="#fff"/></svg>
    ),
  };

  // Timer state and logic
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [timerSeconds, setTimerSeconds] = useState(10 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setTimerSeconds(timerMinutes * 60);
  }, [timerMinutes]);

  useEffect(() => {
    if (!timerRunning) return;
    if (timerSeconds <= 0) {
      setTimerRunning(false);
      // Play gentle gong sound at timer end
      if (gentleGongRef.current) {
        gentleGongRef.current.currentTime = 0;
        gentleGongRef.current.play();
      }
      return;
    }
    timerRef.current = setTimeout(() => {
      setTimerSeconds(s => s - 1);
    }, 1000);
    return () => clearTimeout(timerRef.current);
  }, [timerRunning, timerSeconds]);

  const startTimer = () => {
    // Play gentle gong sound at start, then start timer
    if (gentleGongRef.current) {
      gentleGongRef.current.currentTime = 0;
      gentleGongRef.current.play().then(() => {
        setTimerSeconds(timerMinutes * 60);
        setTimerRunning(true);
      }).catch(() => {
        // If autoplay fails, still start timer
        setTimerSeconds(timerMinutes * 60);
        setTimerRunning(true);
      });
    } else {
      setTimerSeconds(timerMinutes * 60);
      setTimerRunning(true);
    }
  };
  const stopTimer = () => {
    setTimerRunning(false);
    clearTimeout(timerRef.current);
  };

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center font-sans">

      {/* BACKGROUND IMAGE LAYER */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgrounds[bgIndex].url}
          alt={backgrounds[bgIndex].name}
          className="w-full h-full object-cover"
        />
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* BACKGROUND SELECTOR */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        {backgrounds.map((bg, idx) => (
          <button
            key={idx}
            onClick={() => setBgIndex(idx)}
            className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
              bgIndex === idx
                ? 'ring-4 ring-emerald-400 scale-110 border-emerald-400'
                : 'border-white/50 opacity-80'
            }`}
            title={bg.name}
          >
            <img
              src={bg.url}
              alt={bg.name}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* MAIN GLASS CARD */}
      <div className="relative z-10 backdrop-blur-md bg-white/30 border border-white/40 rounded-3xl shadow-2xl p-10 w-full max-w-2xl mx-4 flex flex-col gap-8">

        <h1 className="text-6xl font-extrabold text-center text-white drop-shadow-lg tracking-tight mb-2 animate-float">
          Sonic Healing App
        </h1>
        <p className="text-xl text-white/80 text-center mb-4">Experience deep relaxation and healing through sound.</p>

        {/* SOUND PLAYER */}
        <section className="rounded-2xl p-8 bg-white/70 shadow-3xl flex flex-col items-center gap-6 border border-white/40 backdrop-blur-xl">
          <h2 className="text-3xl font-bold text-black mb-2 tracking-tight drop-shadow">Sound Healing Player</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
            <div className="flex flex-col items-center gap-2">
              <button className="w-20 h-20 rounded-full bg-linear-to-br from-pink-300 to-[#002a55] shadow-lg flex items-center justify-center hover:scale-110 transition-all border-4 border-white/60" onClick={() => playSound('crystalBowl')} title="Crystal Bowl">
                {soundIcons.crystalBowl}
              </button>
              <span className="text-lg font-semibold text-pink-700">Native Flute</span>
              <audio ref={audioRefs.crystalBowl} src={sounds.crystalBowl} preload="auto" loop />
            </div>
            <div className="flex flex-col items-center gap-2">
              <button className="w-20 h-20 rounded-full bg-linear-to-br from-yellow-300 to-yellow-500 shadow-lg flex items-center justify-center hover:scale-110 transition-all border-4 border-white/60" onClick={() => playSound('tibetanGong')} title="Tibetan Gong">
                {soundIcons.tibetanGong}
              </button>
              <span className="text-lg font-semibold text-yellow-700">Tibetan Gong</span>
              <audio ref={audioRefs.tibetanGong} src={sounds.tibetanGong} preload="auto" loop />
            </div>
            <div className="flex flex-col items-center gap-2">
              <button className="w-20 h-20 rounded-full bg-linear-to-br from-green-300 to-green-500 shadow-lg flex items-center justify-center hover:scale-110 transition-all border-4 border-white/60" onClick={() => playSound('nature')} title="Nature Sound">
                {soundIcons.nature}
              </button>
              <span className="text-lg font-semibold text-green-700">Nature Sound</span>
              <audio ref={audioRefs.nature} src={sounds.nature} preload="auto" loop />
            </div>
            <div className="flex flex-col items-center gap-2">
              <button className="w-20 h-20 rounded-full bg-linear-to-br from-purple-300 to-purple-500 shadow-lg flex items-center justify-center hover:scale-110 transition-all border-4 border-white/60" onClick={() => playSound('magical')} title="Magical Sound">
                {soundIcons.magical}
              </button>
              <span className="text-lg font-semibold text-purple-700">Magical Lake Under The Stars</span>
              <audio ref={audioRefs.magical} src={sounds.magical} preload="auto" loop />
            </div>
          </div>
          <button className="mt-6 px-8 py-3 rounded-full bg-linear-to-r from-gray-100 to-gray-300 text-gray-800 font-bold shadow-3xl hover:scale-110 transition border-2 border-white/60" onClick={stopAllSounds}>
            Stop All Sounds
          </button>
        </section>

        {/* Frequency Healing Tones until it's time */}
          {/* <div className="w-full flex flex-col items-center gap-2 mt-4">
            <h3 className="text-xl font-bold text-black mb-2" style={{letterSpacing:'0.05em'}}>Frequency Healing</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-6 py-2 rounded-full bg-linear-to-br from-blue-300 to-[#002a55] text-white font-bold shadow-lg hover:scale-110 transition-all" onClick={() => playSound('freq528')}>
                528 Hz (Love/Transformation)
              </button>
              <audio ref={audioRefs.freq528} src={sounds.freq528} preload="auto" loop />
              <button className="px-6 py-2 rounded-full bg-linear-to-br from-indigo-300 to-[#002a55] text-white font-bold shadow-lg hover:scale-110 transition-all" onClick={() => playSound('freq432')}>
                432 Hz (Harmony/Nature)
              </button>
              <audio ref={audioRefs.freq432} src={sounds.freq432} preload="auto" loop />
              <button className="px-6 py-2 rounded-full bg-linear-to-br from-pink-300 to-[#002a55] text-white font-bold shadow-lg hover:scale-110 transition-all" onClick={() => playSound('freq396')}>
                396 Hz (Liberation/Fear)
              </button>
              <audio ref={audioRefs.freq396} src={sounds.freq396} preload="auto" loop />
            </div>
          </div> */}

        {/* TIMER */}
        <section className="rounded-2xl p-8 bg-white/70 shadow-3xl flex flex-col items-center gap-8 border border-white/40 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-black">Session Timer</h2>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="60"
              value={timerMinutes}
              onChange={e => setTimerMinutes(Number(e.target.value))}
              disabled={timerRunning}
              className="w-20 px-3 py-2 rounded-lg bg-white/80 text-center text-lg"
            />
            <span className="text-gray-700 text-lg">minutes</span>
            {!timerRunning ? (
              <button className="ml-4 px-6 py-3 rounded-full bg-linear-to-r bg-black text-white font-bold hover:scale-110 transition" onClick={startTimer}>
                Start
              </button>
            ) : (
              <button className="ml-4 px-6 py-3 rounded-full bg-linear-to-r from-[#16abcc] to-[#04133d60] text-white font-bold hover:scale-110 transition" onClick={stopTimer}>
                Stop
              </button>
            )}
          </div>
          <div className="text-3xl font-mono text-blue-800 animate-timer">{formatTime(timerSeconds)}</div>
        </section>

        {/* NOTES */}
        {/* <section className="rounded-2xl p-6 bg-white/60 shadow-lg flex flex-col gap-3">
          <h2 className="text-2xl font-semibold text-pink-700">Mindful Notes</h2>
          <textarea
            rows="3"
          
          {/*
          <textarea
            placeholder="Write your thoughts..."
            className="w-full px-4 py-3 rounded-lg bg-white/80 resize-none text-lg"
          />
          <button className="self-end px-8 py-3 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold hover:scale-110 transition">
            Save Note
          </button>
          */}

      </div>

      {/* Hidden gentle gong audio for timer end */}
      <audio ref={gentleGongRef} src="/src/assets/sounds/gong1.mp3" preload="auto" style={{ display: 'none' }} />
      {/* ANIMATIONS */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float2 { animation: float 8s ease-in-out infinite; }
        .animate-float3 { animation: float 10s ease-in-out infinite; }

        @keyframes timer {
          0% { color: #3b82f6; }
          50% { color: #a78bfa; }
          100% { color: #3b82f6; }
        }
        .animate-timer { animation: timer 3s ease-in-out infinite; }

        .shadow-3xl {
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
        }
      `}</style>
    {/* Disclaimer */}
    <footer className="w-full text-center py-2 bg-white/70 text-gray-700 text-xs fixed bottom-0 left-0 z-50 shadow-inner">
      This app is for relaxation and entertainment purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.
    </footer>
    </div>
  );
}

export default App;

