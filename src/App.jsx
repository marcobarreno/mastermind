import React, { useState, useEffect, useMemo } from 'react';
import { Play, Brain, User, Trophy, XCircle, RotateCcw, Check, HelpCircle, Users, EyeOff, Eye, AlertCircle, Sparkles } from 'lucide-react';

// --- Constants ---
const COLORS = [
  { id: 'red', color: 'bg-red-500 border-red-600', label: 'Red' },
  { id: 'green', color: 'bg-green-500 border-green-600', label: 'Green' },
  { id: 'blue', color: 'bg-blue-500 border-blue-600', label: 'Blue' },
  { id: 'yellow', color: 'bg-yellow-400 border-yellow-500', label: 'Yellow' },
  { id: 'white', color: 'bg-white border-slate-300', label: 'White' },
  { id: 'black', color: 'bg-slate-900 border-black', label: 'Black' },
  { id: 'empty', color: 'bg-transparent border-2 border-dashed border-slate-400', label: 'Empty' }
];

const CODE_LENGTH = 4;
const MAX_GUESSES = 10;
const COLOR_IDS = COLORS.map(c => c.id);

// --- Logic Helpers ---
const calculateScore = (guess, secret) => {
  let red = 0;
  let white = 0;
  const secretFlags = new Array(CODE_LENGTH).fill(false);
  const guessFlags = new Array(CODE_LENGTH).fill(false);
  
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guess[i] === secret[i]) {
      red++;
      secretFlags[i] = true;
      guessFlags[i] = true;
    }
  }
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (!guessFlags[i]) {
      for (let j = 0; j < CODE_LENGTH; j++) {
        if (!secretFlags[j] && guess[i] === secret[j]) {
          white++;
          secretFlags[j] = true;
          break;
        }
      }
    }
  }
  return { red, white };
};

const generateAllPossibilities = () => {
  const possibilities = [];
  const generate = (current) => {
    if (current.length === CODE_LENGTH) {
      possibilities.push([...current]);
      return;
    }
    for (const color of COLOR_IDS) generate([...current, color]);
  };
  generate([]);
  return possibilities;
};

const getNextAiGuess = (history, possibleCodes) => {
  let nextPool = possibleCodes;
  if (history.length > 0) {
    const lastMove = history[history.length - 1];
    nextPool = possibleCodes.filter(candidate => {
      const hypotheticalScore = calculateScore(lastMove.code, candidate);
      return hypotheticalScore.red === lastMove.score.red && hypotheticalScore.white === lastMove.score.white;
    });
  }
  if (nextPool.length === 0) return { guess: COLOR_IDS.slice(0, 4), newPool: [] };
  return { guess: nextPool[Math.floor(Math.random() * nextPool.length)], newPool: nextPool };
};

// --- Components ---

const Confetti = () => {
  const pieces = useMemo(() => Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
    color: ['#ef4444', '#3b82f6', '#22c55e', '#facc15', '#ffffff'][Math.floor(Math.random() * 5)]
  })), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute top-[-20px] w-2 h-4"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animation: `fall ${p.duration}s linear ${p.delay}s infinite`,
            opacity: 0.8
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(110vh) rotate(720deg); }
        }
      `}</style>
    </div>
  );
};

const Peg = ({ colorId, size = 'md', onClick, selected, isInteractive = false }) => {
  const colorDef = COLORS.find(c => c.id === colorId) || COLORS[6];
  const sizeClasses = { 
    sm: 'w-6 h-6', 
    md: 'w-8 h-8 md:w-10 md:h-10', 
    lg: 'w-10 h-10 md:w-12 md:h-12' 
  };
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`rounded-full flex-shrink-0 transition-all duration-200 ${sizeClasses[size]} ${colorDef.color} border-2 ${selected ? 'ring-4 ring-offset-2 ring-offset-slate-800 ring-indigo-400 scale-110 z-10' : 'ring-0'} ${isInteractive ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'} shadow-sm`}
    />
  );
};

const FeedbackPegs = ({ score }) => {
  const pegs = [];
  for (let i = 0; i < score.red; i++) pegs.push(<div key={`r-${i}`} className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-red-500 border border-red-700 shadow-sm" />);
  for (let i = 0; i < score.white; i++) pegs.push(<div key={`w-${i}`} className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-white border-2 border-slate-400 shadow-sm" />);
  const remaining = 4 - (score.red + score.white);
  for (let i = 0; i < remaining; i++) pegs.push(<div key={`e-${i}`} className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-slate-700/50" />);
  return <div className="grid grid-cols-2 gap-1 w-8 md:w-10">{pegs}</div>;
};

const PrivacyGate = ({ title, message, onContinue, buttonIcon: Icon }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-slate-800 rounded-2xl border border-slate-700 animate-in fade-in zoom-in duration-300 shadow-2xl">
    <EyeOff className="w-16 h-16 text-slate-500 mb-4" />
    <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
    <p className="text-slate-400 text-center mb-8">{message}</p>
    <button onClick={onContinue} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-lg transition-all active:scale-95">
      I'm Ready <Icon className="w-4 h-4" />
    </button>
  </div>
);

// --- Main App ---

const App = () => {
  const [phase, setPhase] = useState('menu'); 
  const [gameMode, setGameMode] = useState(null); 
  const [privacyTarget, setPrivacyTarget] = useState(null); 
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState(new Array(CODE_LENGTH).fill(null));
  const [secretCode, setSecretCode] = useState([]);
  const [selectedColor, setSelectedColor] = useState('red');
  const [gameStatus, setGameStatus] = useState('playing');
  const [aiPool, setAiPool] = useState([]);
  const [manualScore, setManualScore] = useState({ red: 0, white: 0 });
  const [scoreError, setScoreError] = useState(false);

  // AI Logic Loop
  useEffect(() => {
    if (gameMode === 'maker' && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        const { guess, newPool } = getNextAiGuess(guesses, aiPool.length > 0 ? aiPool : generateAllPossibilities());
        setAiPool(newPool);
        submitTurn(guess);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [guesses, gameMode, gameStatus]);

  const startNewGame = (mode) => {
    setGameMode(mode);
    setGuesses([]);
    setGameStatus('playing');
    setSelectedColor('red'); // Reset color selector on game start
    if (mode === 'breaker') {
      setSecretCode(Array.from({ length: 4 }, () => COLOR_IDS[Math.floor(Math.random() * COLOR_IDS.length)]));
      setPhase('playing');
      setCurrentGuess(new Array(CODE_LENGTH).fill(null));
    } else {
      setPhase('setup');
      setCurrentGuess(new Array(CODE_LENGTH).fill(COLOR_IDS[0]));
    }
  };

  const finalizeSetup = () => {
    setSecretCode([...currentGuess]);
    setSelectedColor('red'); // RESET: prevent leakage of Maker's last choice
    
    if (gameMode === 'two-player') {
      setPrivacyTarget('breaker');
      setPhase('privacy');
    } else {
      setAiPool(generateAllPossibilities());
      setPhase('playing');
    }
    setCurrentGuess(new Array(CODE_LENGTH).fill(null));
  };

  const handleBreakerSubmit = () => {
    if (currentGuess.some(c => c === null)) return;
    
    if (gameMode === 'two-player') {
      // Immediate Win Check for 2P
      const realScore = calculateScore(currentGuess, secretCode);
      if (realScore.red === CODE_LENGTH) {
        submitTurn(currentGuess, realScore);
      } else {
        setManualScore({ red: 0, white: 0 });
        setScoreError(false);
        setPrivacyTarget('maker');
        setPhase('privacy');
      }
    } else {
      submitTurn(currentGuess);
    }
  };

  const submitTurn = (guessCode, validatedScore = null) => {
    const actualScore = calculateScore(guessCode, secretCode);
    const scoreToUse = validatedScore || actualScore;
    const newGuesses = [...guesses, { code: guessCode, score: scoreToUse }];
    
    setGuesses(newGuesses);
    setCurrentGuess(new Array(CODE_LENGTH).fill(null));

    if (scoreToUse.red === CODE_LENGTH) {
      setGameStatus('won');
      setPhase('playing');
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameStatus('lost');
      setPhase('playing');
    } else if (gameMode === 'two-player' && phase === 'scoring') {
      setPrivacyTarget('breaker');
      setPhase('privacy');
    }
  };

  const validateAndSubmitManualScore = () => {
    const realScore = calculateScore(currentGuess, secretCode);
    if (manualScore.red === realScore.red && manualScore.white === realScore.white) {
      submitTurn(currentGuess, realScore);
    } else {
      setScoreError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-10">
      {gameStatus === 'won' && <Confetti />}
      
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-20 shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="text-indigo-400 w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">Mastermind</h1>
          </div>
          {phase !== 'menu' && (
            <button onClick={() => setPhase('menu')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Exit</button>
          )}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 md:py-8">
        
        {/* MENU */}
        {phase === 'menu' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2 mb-12 mt-8">
              <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">Mastermind</h2>
              <p className="text-slate-400">The Ultimate Logic Challenge</p>
            </div>
            <div className="grid gap-4">
              <button onClick={() => startNewGame('breaker')} className="flex items-center gap-4 p-6 bg-slate-800 rounded-2xl border border-slate-700 hover:border-indigo-500 transition-all text-left group">
                <div className="w-12 h-12 bg-indigo-900/50 text-indigo-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><User /></div>
                <div>
                  <h3 className="font-bold">Single Player</h3>
                  <p className="text-sm text-slate-400">Crack the computer's secret code.</p>
                </div>
              </button>
              <button onClick={() => startNewGame('two-player')} className="flex items-center gap-4 p-6 bg-slate-800 rounded-2xl border border-slate-700 hover:border-emerald-500 transition-all text-left group">
                <div className="w-12 h-12 bg-emerald-900/50 text-emerald-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><Users /></div>
                <div>
                  <h3 className="font-bold">Two Player Duel</h3>
                  <p className="text-sm text-slate-400">Challenge a friend in person.</p>
                </div>
              </button>
              <button onClick={() => startNewGame('maker')} className="flex items-center gap-4 p-6 bg-slate-800 rounded-2xl border border-slate-700 hover:border-rose-500 transition-all text-left group">
                <div className="w-12 h-12 bg-rose-900/50 text-rose-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><Brain /></div>
                <div>
                  <h3 className="font-bold">AI Challenge</h3>
                  <p className="text-sm text-slate-400">Set a code and watch the AI work.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* SETUP */}
        {phase === 'setup' && (
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Set Secret Code</h2>
              <p className="text-slate-400">{gameMode === 'two-player' ? "Don't let your opponent see!" : "Pick a tricky pattern."}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex justify-center mb-4 shadow-xl">
              <div className="flex gap-4">
                {currentGuess.map((c, i) => (
                  <Peg key={i} colorId={c} size="lg" isInteractive onClick={() => {
                    const ng = [...currentGuess]; ng[i] = selectedColor; setCurrentGuess(ng);
                  }} />
                ))}
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3 bg-slate-800 p-4 rounded-xl border border-slate-700">
              {COLORS.map(c => <Peg key={c.id} colorId={c.id} selected={selectedColor === c.id} onClick={() => setSelectedColor(c.id)} isInteractive />)}
            </div>
            <button onClick={finalizeSetup} className="w-full py-4 bg-indigo-600 rounded-xl font-bold shadow-lg hover:bg-indigo-500 transition-all active:scale-95 flex items-center justify-center gap-2">
              Lock in Code <Check className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* PRIVACY GATES */}
        {phase === 'privacy' && (
          <PrivacyGate 
            title={privacyTarget === 'maker' ? "Pass to Code Maker" : "Pass to Code Breaker"}
            message={privacyTarget === 'maker' ? "The Breaker has made a move. Time to score their logic." : "The Secret Code is set. Can you crack it in 10 tries?"}
            buttonIcon={privacyTarget === 'maker' ? Eye : Play}
            onContinue={() => setPhase(privacyTarget === 'maker' ? 'scoring' : 'playing')}
          />
        )}

        {/* SCORING (2P MODE) */}
        {phase === 'scoring' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Manual Scoring</h2>
              <p className="text-slate-400">Compare the guess to your secret code.</p>
            </div>
            
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-6 shadow-2xl">
              <div className="flex flex-col items-center gap-4">
                <span className="text-xs font-bold text-slate-500 uppercase">Their Guess</span>
                <div className="flex gap-3">
                  {currentGuess.map((c, i) => <Peg key={i} colorId={c} size="md" />)}
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase mt-2">Your Secret</span>
                <div className="flex gap-3 opacity-60">
                  {secretCode.map((c, i) => <Peg key={i} colorId={c} size="sm" />)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-red-400 uppercase">Red (Exact)</label>
                  <div className="flex gap-1 justify-between bg-slate-900 p-2 rounded-lg">
                    {[0,1,2,3,4].map(n => (
                      <button key={n} onClick={() => setManualScore({...manualScore, red: n})} className={`w-8 h-8 rounded-md transition-all font-bold ${manualScore.red === n ? 'bg-red-500 text-white shadow-lg scale-110' : 'bg-slate-700 text-slate-500'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200 uppercase">White (Color)</label>
                  <div className="flex gap-1 justify-between bg-slate-900 p-2 rounded-lg">
                    {[0,1,2,3,4].map(n => (
                      <button key={n} onClick={() => setManualScore({...manualScore, white: n})} className={`w-8 h-8 rounded-md transition-all font-bold ${manualScore.white === n ? 'bg-white text-slate-900 shadow-lg scale-110' : 'bg-slate-700 text-slate-500'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {scoreError && (
                <div className="flex items-center gap-2 p-3 bg-red-900/30 text-red-400 border border-red-700 rounded-lg text-sm animate-bounce">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>The score you entered is incorrect. Double check the colors!</span>
                </div>
              )}

              <button onClick={validateAndSubmitManualScore} className="w-full py-4 bg-emerald-600 rounded-xl font-bold shadow-lg hover:bg-emerald-500 transition-all active:scale-95">
                Confirm Score
              </button>
            </div>
          </div>
        )}

        {/* BOARD */}
        {phase === 'playing' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center px-2">
              <span className="text-sm text-slate-400 font-medium">Turn {guesses.length + 1} / {MAX_GUESSES}</span>
              <div className="flex gap-1 items-center bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 shadow-sm">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mr-1">Secret:</span>
                <div className="flex gap-1">
                  {gameStatus !== 'playing' ? secretCode.map((c, i) => <Peg key={i} colorId={c} size="sm" />) : [1,2,3,4].map(i => <div key={i} className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] text-slate-600">?</div>)}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-3 md:p-4 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md mx-auto">
              {Array.from({ length: MAX_GUESSES }).map((_, i) => {
                const idx = MAX_GUESSES - 1 - i;
                const past = guesses[idx];
                const active = idx === guesses.length && gameStatus === 'playing';
                const isBreakerTurn = gameMode !== 'maker';
                
                return (
                  <div key={idx} className={`flex items-center gap-3 p-2 rounded-xl mb-2 border transition-all ${active ? 'bg-slate-800 border-indigo-500/50 shadow-lg scale-[1.02]' : 'bg-slate-800/40 border-transparent opacity-60'}`}>
                    <span className="w-6 text-[10px] font-mono font-bold text-slate-600">{idx + 1}</span>
                    <div className="flex gap-2 flex-1 justify-center">
                      {(past?.code || (active ? currentGuess : new Array(4).fill(null))).map((c, pi) => (
                        <Peg key={pi} colorId={c} size="md" isInteractive={active && isBreakerTurn} onClick={active && isBreakerTurn ? () => {
                          const ng = [...currentGuess]; ng[pi] = selectedColor; setCurrentGuess(ng);
                        } : null} />
                      ))}
                    </div>
                    <div className="border-l border-slate-700 pl-3 min-w-[3rem] flex justify-center">
                      {past ? <FeedbackPegs score={past.score} /> : active && isBreakerTurn ? (
                        <button onClick={handleBreakerSubmit} disabled={currentGuess.some(c => c === null)} className={`p-2 rounded-full transition-all ${currentGuess.every(c => c !== null) ? 'bg-emerald-500 text-white shadow-md hover:scale-110' : 'bg-slate-700 text-slate-500 opacity-30 cursor-not-allowed'}`}><Check className="w-4 h-4" /></button>
                      ) : <div className="w-8 h-8 opacity-5" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {gameStatus === 'playing' && gameMode !== 'maker' && (
              <div className="flex flex-wrap justify-center gap-3 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl">
                {COLORS.map(c => <Peg key={c.id} colorId={c.id} selected={selectedColor === c.id} onClick={() => setSelectedColor(c.id)} isInteractive />)}
              </div>
            )}

            {gameStatus !== 'playing' && (
              <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center animate-in zoom-in-95 duration-500 shadow-2xl relative z-10">
                <div className="mx-auto w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 shadow-inner">
                  {gameStatus === 'won' ? <Sparkles className="text-yellow-400 w-8 h-8" /> : <XCircle className="text-red-500 w-8 h-8" />}
                </div>
                <h3 className="text-3xl font-bold mb-2 text-white">{gameStatus === 'won' ? 'Code Broken!' : 'Out of Tries!'}</h3>
                <p className="text-slate-400 mb-8">{gameStatus === 'won' ? 'The secret sequence has been revealed.' : 'The code-maker wins this round.'}</p>
                
                <div className="bg-slate-900/50 p-6 rounded-2xl mb-8 border border-slate-700/50">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">Final Secret Code</span>
                  <div className="flex gap-4 justify-center">
                    {secretCode.map((c, i) => <Peg key={i} colorId={c} size="md" />)}
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button onClick={() => setPhase('menu')} className="px-8 py-3 rounded-xl border border-slate-600 text-slate-300 font-bold hover:bg-slate-700 transition-all">Menu</button>
                  <button onClick={() => startNewGame(gameMode)} className="px-8 py-3 bg-indigo-600 rounded-xl text-white font-bold hover:bg-indigo-500 flex items-center gap-2 transition-all shadow-lg active:scale-95"><RotateCcw className="w-4 h-4" /> Try Again</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
