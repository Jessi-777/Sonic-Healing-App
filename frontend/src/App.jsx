import { useState, useRef, useEffect } from 'react';
import sound1 from './assets/sounds/1.mp3';
import sound2 from './assets/sounds/2.mp3';
import sound3 from './assets/sounds/3.mp3';
import sound4 from './assets/sounds/4.mp3';
import freq528 from './assets/sounds/frequencies/528hz.mp3';
import freq432 from './assets/sounds/frequencies/432hz.mp3';
import freq396 from './assets/sounds/frequencies/396hz.mp3';
import gong1 from './assets/sounds/gong1.mp3';

function App() {
    // Gong audio ref for timer end
    const gentleGongRef = useRef(null);
  const backgrounds = [
    {
      name: 'Zen Bamboo Forest',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Misty Lake',
      url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Mountain Sunrise',
      url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Peaceful Waterfall',
      url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Japanese Garden',
      url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80',
    },
    // {
    //   name: 'Cosmic Calm',
    //   url: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b41?auto=format&fit=crop&w=1200&q=80',
    // },
  ];

  const [bgIndex, setBgIndex] = useState(0);

      // Use local mp3 files for sounds
      const sounds = {
        sound1: sound1,
        sound2: sound2,
        sound3: sound3,
        sound4: sound4,
        freq528: freq528,
        freq432: freq432,
        freq396: freq396,
      };

      const audioRefs = {
        sound1: useRef(null),
        sound2: useRef(null),
        sound3: useRef(null),
        sound4: useRef(null),
        freq528: useRef(null),
        freq432: useRef(null),
        freq396: useRef(null),
      };

      // Frequency toggle state
      const [freqStates, setFreqStates] = useState({
        freq528: false,
        freq432: false,
        freq396: false,
      });

      // Toggle frequency on/off
      const toggleFrequency = (freqKey) => {
        setFreqStates(prev => {
          const isOn = !prev[freqKey];
          // Play or pause the audio
          const audio = audioRefs[freqKey].current;
          if (audio) {
            if (isOn) {
              audio.currentTime = 0;
              audio.play();
            } else {
              audio.pause();
              audio.currentTime = 0;
            }
          }
          return { ...prev, [freqKey]: isOn };
        });
      };

      // State for toggling main sounds
      const [soundStates, setSoundStates] = useState({
        sound1: false,
        sound2: false,
        sound3: false,
        sound4: false,
      });

      // Toggle main sound on/off (only one at a time)
      const toggleSound = (type) => {
        setSoundStates(prev => {
          const isOn = !prev[type];
          // Pause all sounds first
          Object.entries(audioRefs).forEach(([key, ref]) => {
            if (["sound1","sound2","sound3","sound4"].includes(key) && ref.current) {
              ref.current.pause();
              ref.current.currentTime = 0;
            }
          });
          // If turning on, play this one
          if (isOn) {
            const audio = audioRefs[type].current;
            if (audio) {
              audio.currentTime = 0;
              audio.play();
            }
          }
          return {
            sound1: false,
            sound2: false,
            sound3: false,
            sound4: false,
            [type]: isOn
          };
        });
      };
  // Icon SVGs for each sound
  const soundIcons = {
    sound1: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#f9a8d4"/><ellipse cx="12" cy="16" rx="7" ry="3" fill="#fff"/><ellipse cx="12" cy="16" rx="5" ry="2" fill="#f9a8d4"/></svg>
    ),
    sound2: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fde68a"/><circle cx="12" cy="12" r="6" fill="#fff"/><circle cx="12" cy="12" r="3" fill="#fde68a"/></svg>
    ),
    sound3: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#6ee7b7"/><path d="M12 8c2 0 4 2 4 4s-2 4-4 4-4-2-4-4 2-4 4-4z" fill="#fff"/></svg>
    ),
    sound4: (
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
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center font-serif bg-gradient-to-br from-emerald-50 via-white to-sky-100">

      {/* BACKGROUND IMAGE LAYER */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgrounds[bgIndex].url}
          alt={backgrounds[bgIndex].name}
          className="w-full h-full object-cover transition-all duration-1000 ease-in-out"
          style={{filter:'brightness(0.92) blur(0.5px)'}}
        />
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-emerald-50/30 to-sky-100/40" />
        {/* Animated floating leaves overlay */}
        <div className="pointer-events-none absolute inset-0 z-10">
          <svg className="absolute animate-float-leaf" style={{left:'10%',top:'10%',width:'60px',height:'60px',opacity:0.18}} viewBox="0 0 60 60"><ellipse cx="30" cy="30" rx="28" ry="12" fill="#7fc8a9"/><ellipse cx="30" cy="30" rx="18" ry="8" fill="#b6e2d3"/></svg>
          <svg className="absolute animate-float-leaf2" style={{left:'70%',top:'30%',width:'40px',height:'40px',opacity:0.13}} viewBox="0 0 60 60"><ellipse cx="30" cy="30" rx="20" ry="8" fill="#b6e2d3"/><ellipse cx="30" cy="30" rx="12" ry="5" fill="#7fc8a9"/></svg>
          <svg className="absolute animate-float-leaf3" style={{left:'40%',top:'70%',width:'50px',height:'50px',opacity:0.15}} viewBox="0 0 60 60"><ellipse cx="30" cy="30" rx="22" ry="9" fill="#7fc8a9"/><ellipse cx="30" cy="30" rx="14" ry="6" fill="#b6e2d3"/></svg>
        </div>
      </div>

      {/* BACKGROUND SELECTOR */}
      <div
        className="fixed md:absolute top-2 md:top-4 right-0 left-0 md:right-4 md:left-auto z-20 flex flex-row justify-center md:justify-end gap-2 px-2 md:px-0"
        style={{pointerEvents:'none'}}
      >
        <div className="flex flex-row gap-2 bg-white/40 md:bg-transparent rounded-xl py-1 px-2 shadow md:shadow-none backdrop-blur-sm md:backdrop-blur-0" style={{pointerEvents:'auto'}}>
          {backgrounds.map((bg, idx) => (
            <button
              key={idx}
              onClick={() => setBgIndex(idx)}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
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
      </div>

      {/* MAIN GLASS CARD */}
      <div className="relative z-10 backdrop-blur-xl bg-white/60 border border-emerald-100 rounded-[2.5rem] shadow-3xl p-10 w-full max-w-2xl mx-4 flex flex-col gap-10">

        {/* App Title and Description below thumbnails */}
        <div className="flex flex-col items-center w-full mt-8 md:mt-12 mb-2 md:mb-4">
          <h1 className="text-5xl p-4 font-extrabold text-center text-emerald-700 drop-shadow-lg tracking-tight animate-float" style={{letterSpacing:'0.04em'}}>
            Sonic Healing App
          </h1>
          <p className="text-xl text-emerald-900/80 text-center mt-2 mb-4 font-light" style={{letterSpacing:'0.02em'}}>Experience deep relaxation and healing through sound.</p>
        </div>
        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50/80 border border-emerald-100 text-emerald-800 text-center text-base shadow-sm max-w-xl mx-auto">
          <span className="font-semibold">Meditation Advice:</span> <br/>
          Sit comfortably, close your eyes, and focus on your breath. Let thoughts drift by like clouds. If your mind wanders, gently return to your breath or the sound. Be kind to yourself—there is no right or wrong way to meditate. Just be present and enjoy this peaceful moment.
        </div>

        {/* SOUND PLAYER */}
        <section className="rounded-[1.5rem] p-8 bg-gradient-to-br from-white via-emerald-50 to-sky-50 shadow-3xl flex flex-col items-center gap-8 border border-emerald-100/60 backdrop-blur-2xl">
          <h2 className="text-3xl font-bold text-emerald-800 mb-2 tracking-tight drop-shadow" style={{letterSpacing:'0.03em'}}>Sound Healing Player</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
            <div className="flex flex-col items-center gap-3">
              <button
                className={`w-20 h-20 rounded-full shadow-xl flex items-center justify-center border-4 border-emerald-100/60 transition-all font-bold
                  ${soundStates.sound1 ? 'bg-gradient-to-br from-emerald-200 to-emerald-50 scale-110 text-emerald-900 ring-4 ring-emerald-200' : 'bg-gradient-to-br from-pink-50 to-white hover:scale-105 text-pink-700'}`}
                onClick={() => toggleSound('sound1')}
                title="Native Flute"
              >
                {soundIcons.sound1}
              </button>
              <span className="text-lg font-semibold text-emerald-800" style={{letterSpacing:'0.02em'}}>Native Flute</span>
              <audio ref={audioRefs.sound1} src={sounds.sound1} preload="auto" loop />
            </div>
            <div className="flex flex-col items-center gap-3">
              <button
                className={`w-20 h-20 rounded-full shadow-xl flex items-center justify-center border-4 border-emerald-100/60 transition-all font-bold
                  ${soundStates.sound2 ? 'bg-gradient-to-br from-yellow-200 to-emerald-50 scale-110 text-yellow-900 ring-4 ring-yellow-200' : 'bg-gradient-to-br from-yellow-50 to-white hover:scale-105 text-yellow-700'}`}
                onClick={() => toggleSound('sound2')}
                title="Tibetan bowls"
              >
                {soundIcons.sound2}
              </button>
              <span className="text-lg font-semibold text-emerald-800" style={{letterSpacing:'0.02em'}}>Tibetan bowls</span>
              <audio ref={audioRefs.sound2} src={sounds.sound2} preload="auto" loop />
            </div>
            <div className="flex flex-col items-center gap-3">
              <button
                className={`w-20 h-20 rounded-full shadow-xl flex items-center justify-center border-4 border-emerald-100/60 transition-all font-bold
                  ${soundStates.sound3 ? 'bg-gradient-to-br from-green-200 to-emerald-50 scale-110 text-green-900 ring-4 ring-green-200' : 'bg-gradient-to-br from-green-50 to-white hover:scale-105 text-green-700'}`}
                onClick={() => toggleSound('sound3')}
                title="nature woods"
              >
                {soundIcons.sound3}
              </button>
              <span className="text-lg font-semibold text-emerald-800" style={{letterSpacing:'0.02em'}}>nature woods</span>
              <audio ref={audioRefs.sound3} src={sounds.sound3} preload="auto" loop />
            </div>
            <div className="flex flex-col items-center gap-3">
              <button
                className={`w-20 h-20 rounded-full shadow-xl flex items-center justify-center border-4 border-emerald-100/60 transition-all font-bold
                  ${soundStates.sound4 ? 'bg-gradient-to-br from-purple-200 to-emerald-50 scale-110 text-purple-900 ring-4 ring-purple-200' : 'bg-gradient-to-br from-purple-50 to-white hover:scale-105 text-purple-700'}`}
                onClick={() => toggleSound('sound4')}
                title="Lake under the stars"
              >
                {soundIcons.sound4}
              </button>
              <span className="text-lg font-semibold text-emerald-800" style={{letterSpacing:'0.02em'}}>Lake under the stars</span>
              <audio ref={audioRefs.sound4} src={sounds.sound4} preload="auto" loop />
            </div>
          </div>

        </section>

        {/* Frequency Healing Tones */}
        <div className="w-full flex flex-col items-center gap-2 mt-4">
          <h3 className="text-xl font-bold text-black mb-2" style={{letterSpacing:'0.05em'}}>Frequency Healing</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              className={`px-6 py-2 rounded-full font-semibold shadow-lg hover:scale-105 transition-all border-2 border-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-200
                ${freqStates.freq528
                  ? 'bg-gradient-to-r from-emerald-200 via-emerald-100 to-white text-emerald-900'
                  : 'bg-gradient-to-r from-emerald-50 via-white to-emerald-100 text-emerald-700 hover:from-emerald-100 hover:to-white'}
              `}
              style={{letterSpacing:'0.03em'}}
              onClick={() => toggleFrequency('freq528')}
            >
              {freqStates.freq528 ? 'Pause' : 'Play'} 528 Hz <span className="opacity-70 text-xs">(Love/Transformation)</span>
            </button>
            <audio ref={audioRefs.freq528} src={sounds.freq528} preload="auto" loop />
            <button
              className={`px-6 py-2 rounded-full font-semibold shadow-lg hover:scale-105 transition-all border-2 border-white/40 focus:outline-none focus:ring-2 focus:ring-sky-200
                ${freqStates.freq432
                  ? 'bg-gradient-to-r from-sky-200 via-sky-100 to-white text-sky-900'
                  : 'bg-gradient-to-r from-sky-50 via-white to-sky-100 text-sky-700 hover:from-sky-100 hover:to-white'}
              `}
              style={{letterSpacing:'0.03em'}}
              onClick={() => toggleFrequency('freq432')}
            >
              {freqStates.freq432 ? 'Pause' : 'Play'} 432 Hz <span className="opacity-70 text-xs">(Harmony/Nature)</span>
            </button>
            <audio ref={audioRefs.freq432} src={sounds.freq432} preload="auto" loop />
            <button
              className={`px-6 py-2 rounded-full font-semibold shadow-lg hover:scale-105 transition-all border-2 border-white/40 focus:outline-none focus:ring-2 focus:ring-rose-200
                ${freqStates.freq396
                  ? 'bg-gradient-to-r from-rose-200 via-rose-100 to-white text-rose-900'
                  : 'bg-gradient-to-r from-rose-50 via-white to-rose-100 text-rose-700 hover:from-rose-100 hover:to-white'}
              `}
              style={{letterSpacing:'0.03em'}}
              onClick={() => toggleFrequency('freq396')}
            >
              {freqStates.freq396 ? 'Pause' : 'Play'} 396 Hz <span className="opacity-70 text-xs">(Liberation/Fear)</span>
            </button>
            <audio ref={audioRefs.freq396} src={sounds.freq396} preload="auto" loop />
          </div>
        </div>

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
      <audio ref={gentleGongRef} src={gong1} preload="auto" style={{ display: 'none' }} />
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

        /* Floating leaves animation */
        @keyframes float-leaf {
          0% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-30px) rotate(4deg); }
          100% { transform: translateY(0) rotate(-2deg); }
        }
        .animate-float-leaf { animation: float-leaf 12s ease-in-out infinite; }
        .animate-float-leaf2 { animation: float-leaf 16s ease-in-out infinite; }
        .animate-float-leaf3 { animation: float-leaf 20s ease-in-out infinite; }

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

