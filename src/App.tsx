import React, { useState, useEffect, useCallback } from 'react';
import { 
  GameMode, 
  Stroke, 
  RecognitionResult, 
  DifficultyLevel, 
  GalleryItem, 
  LeaderboardEntry,
  BrushStyle,
  ArFilterType
} from './types';
import { CameraCanvas } from './components/CameraCanvas';
import { TopNavBar } from './components/TopNavBar';
import { Toolbar } from './components/Toolbar';
import { CelebrationOverlay } from './components/CelebrationOverlay';
import { GestureGuideModal } from './components/GestureGuideModal';
import { CertificateModal } from './components/CertificateModal';
import { GalleryDrawer } from './components/GalleryDrawer';
import { LeaderboardView } from './components/LeaderboardView';
import { GameRacePanel } from './components/GameRacePanel';
import { TeamBattlePanel } from './components/TeamBattlePanel';
import { EmojiChallengePanel } from './components/EmojiChallengePanel';
import { LearnModePanel } from './components/LearnModePanel';
import { MysteryWordPanel } from './components/MysteryWordPanel';
import { PROMPTS, SCHOOL_LIST, EMOJI_CHALLENGES, MYSTERY_WORDS, TEAM_BATTLE_PROMPTS } from './data/prompts';
import { GhostTemplate } from './data/templates';
import { recognitionEngine } from './services/recognitionEngine';
import { soundService } from './services/audioService';
import { speechService } from './services/speechService';
import { BrushRenderer } from './services/brushStyles';

export const App: React.FC = () => {
  // Modes & UI state
  const [currentMode, setCurrentMode] = useState<GameMode>('free_draw');
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [celebrationResult, setCelebrationResult] = useState<RecognitionResult | null>(null);
  const [isRecognizing, setIsRecognizing] = useState<boolean>(false);

  // Drawing Tools, Styles & AR Filters
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentColor, setCurrentColor] = useState<string>('#4285F4');
  const [brushStyle, setBrushStyle] = useState<BrushStyle>('laser_glow');
  const [arFilter, setArFilter] = useState<ArFilterType>('cyberpunk');
  const [isRainbow, setIsRainbow] = useState<boolean>(false);
  const [brushSize, setBrushSize] = useState<number>(12);
  const [useDepthSizing, setUseDepthSizing] = useState<boolean>(true);
  const [twoHandMode, setTwoHandMode] = useState<boolean>(false);

  // Audio & Voice
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [bgmPlaying, setBgmPlaying] = useState<boolean>(false);

  // Scoring & Gallery
  const [score, setScore] = useState<number>(250);
  const [accuracy, setAccuracy] = useState<number>(92);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  // Sample PM Shri School Leaderboard
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([
    { id: '1', rank: 1, name: 'Aditya Kumar', school: SCHOOL_LIST[0], score: 850, mode: 'AI Race', time: '18s' },
    { id: '2', rank: 2, name: 'Priya Sharma', school: SCHOOL_LIST[1], score: 790, mode: 'Emoji Challenge', time: '22s' },
    { id: '3', rank: 3, name: 'Rohan Rawat', school: SCHOOL_LIST[2], score: 720, mode: 'Team Battle', time: '25s' },
    { id: '4', rank: 4, name: 'Khushi Bisht', school: SCHOOL_LIST[3], score: 670, mode: 'Free Draw', time: '30s' },
    { id: '5', rank: 5, name: 'Aman Verma', school: SCHOOL_LIST[4], score: 610, mode: 'Learn Mode', time: '35s' }
  ]);

  // Game Mode 1: AI Race State
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [racePromptIndex, setRacePromptIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const totalTime = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 25 : 20;

  // Game Mode 2: Team Battle State
  const [teamAScore, setTeamAScore] = useState<number>(300);
  const [teamBScore, setTeamBScore] = useState<number>(250);
  const [activeTeam, setActiveTeam] = useState<'Team A' | 'Team B'>('Team A');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [teamBattlePromptIndex, setTeamBattlePromptIndex] = useState<number>(0);

  // Game Mode 3: Emoji Challenge State
  const [emojiIndex, setEmojiIndex] = useState<number>(0);
  const [emojiSimilarity, setEmojiSimilarity] = useState<number>(0);

  // Game Mode 4: Learn Mode State
  const [selectedTemplate, setSelectedTemplate] = useState<GhostTemplate | null>(null);
  const [showGhostGuide, setShowGhostGuide] = useState<boolean>(true);

  // Game Mode 5: Mystery Word State
  const [mysteryWordIndex, setMysteryWordIndex] = useState<number>(0);

  // Distinct mode-specific active prompts (Eliminating any prompt duplication across modes)
  const activePrompts = PROMPTS.filter(p => p.difficulty === difficulty);
  const currentPrompt = activePrompts[racePromptIndex % activePrompts.length] || PROMPTS[0];
  const currentTeamBattlePrompt = TEAM_BATTLE_PROMPTS[teamBattlePromptIndex % TEAM_BATTLE_PROMPTS.length];
  const currentMysteryWord = MYSTERY_WORDS[mysteryWordIndex % MYSTERY_WORDS.length];

  const allModes: GameMode[] = [
    'free_draw',
    'virtual_drums',
    'finger_gun',
    'ai_race',
    'emoji_challenge',
    'learn_mode',
    'team_battle',
    'mystery_word',
    'air_signature',
    'leaderboard'
  ];


  const handleNextMode = useCallback(() => {
    const currentIndex = allModes.indexOf(currentMode);
    const nextMode = allModes[(currentIndex + 1) % allModes.length];
    handleModeChange(nextMode);
    soundService.playColorSwitch();
  }, [currentMode]);

  // Welcome announcement
  useEffect(() => {
    const timer = setTimeout(() => {
      speechService.speakWelcome();
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // AI Race Countdown Timer
  useEffect(() => {
    if (currentMode !== 'ai_race') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          soundService.playCountdownTick(true);
          handleRaceTimeout();
          return totalTime;
        }
        if (prev <= 6) {
          soundService.playCountdownTick(true);
          if (prev === 6) speechService.speakTimeWarning();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentMode, totalTime, racePromptIndex]);

  const handleRaceTimeout = () => {
    setRacePromptIndex(prev => prev + 1);
    setStrokes([]);
  };

  // Color Cycling
  const colorPalette = ['#06b6d4', '#10b981', '#ec4899', '#eab308', '#a855f7', '#ffffff'];
  const handleColorCycle = useCallback(() => {
    const currentIndex = colorPalette.indexOf(currentColor);
    const nextIndex = (currentIndex + 1) % colorPalette.length;
    setCurrentColor(colorPalette[nextIndex]);
    setIsRainbow(false);
  }, [currentColor]);

  // Clear Canvas
  const handleClearCanvas = useCallback(() => {
    setStrokes([]);
    setEmojiSimilarity(0);
  }, []);

  // Undo Last Stroke
  const handleUndo = useCallback(() => {
    if (strokes.length > 0) {
      setStrokes(prev => prev.slice(0, -1));
    }
  }, [strokes]);

  // AI Recognition Handler
  const handleRecognize = useCallback(() => {
    if (strokes.length === 0) return;
    setIsRecognizing(true);

    setTimeout(() => {
      let targetId: string | undefined = undefined;
      if (currentMode === 'ai_race') {
        targetId = currentPrompt.id;
      } else if (currentMode === 'team_battle') {
        targetId = currentTeamBattlePrompt.id;
      } else if (currentMode === 'mystery_word') {
        targetId = currentMysteryWord.id;
      } else if (currentMode === 'emoji_challenge') {
        targetId = EMOJI_CHALLENGES[emojiIndex % EMOJI_CHALLENGES.length].name;
      } else if (currentMode === 'learn_mode' && selectedTemplate) {
        targetId = selectedTemplate.label;
      }

      const result = recognitionEngine.recognize(strokes, targetId);

      if (result) {
        soundService.playChime();
        soundService.playVictoryApplause();
        speechService.speakCorrectGuess(result.label);

        const points = Math.round(result.confidence * 120);
        setScore(prev => prev + points);
        setAccuracy(Math.round(result.confidence * 100));

        if (currentMode === 'team_battle') {
          if (activeTeam === 'Team A') {
            setTeamAScore(prev => prev + points);
          } else {
            setTeamBScore(prev => prev + points);
          }
        }

        saveToGallery(result);
        setCelebrationResult(result);
      }
      setIsRecognizing(false);
    }, 250);
  }, [strokes, currentMode, currentPrompt, currentTeamBattlePrompt, currentMysteryWord, emojiIndex, selectedTemplate, activeTeam]);

  // Save drawing snapshot to gallery
  const saveToGallery = (result: RecognitionResult) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, 640, 360);

    strokes.forEach(s => {
      if (s.points.length < 2) return;
      // Scaled points for thumbnail
      const scaledPoints = s.points.map(p => ({ ...p, x: p.x * 0.5, y: p.y * 0.5 }));
      BrushRenderer.renderStroke(ctx, scaledPoints, s.color, Math.max(2, s.width * 0.5), s.style);
    });

    const newItem: GalleryItem = {
      id: Date.now().toString(),
      dataUrl: canvas.toDataURL('image/png'),
      label: result.label,
      date: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      score: Math.round(result.confidence * 100),
      mode: currentMode
    };

    setGalleryItems(prev => [newItem, ...prev.slice(0, 19)]);
  };

  // Real-time similarity check for Emoji challenge
  useEffect(() => {
    if (currentMode !== 'emoji_challenge' || strokes.length === 0) return;
    const currentEmoji = EMOJI_CHALLENGES[emojiIndex % EMOJI_CHALLENGES.length];
    const sim = recognitionEngine.calculateEmojiSimilarity(currentEmoji.name, strokes);
    setEmojiSimilarity(sim);

    if (sim >= 80) {
      soundService.playVictoryApplause();
      speechService.speak(`Superb! ${currentEmoji.name} matched with high accuracy!`, true);
      setScore(prev => prev + 150);
      setCelebrationResult({
        label: currentEmoji.name,
        category: 'object',
        confidence: sim / 100,
        funFact: 'Your air sketch matched the target emoji contour accurately!'
      });
    }
  }, [strokes, currentMode, emojiIndex]);

  // Fullscreen / Projector Mode Toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Mode Change Handler
  const handleModeChange = (mode: GameMode) => {
    setCurrentMode(mode);
    setStrokes([]);
    setEmojiSimilarity(0);

    if (mode === 'ai_race') {
      setTimeLeft(totalTime);
      speechService.speakNewRound(currentPrompt.english);
    } else if (mode === 'virtual_drums') {
      speechService.speak('Virtual Drum Kit activated! Strike the drums in the air with your fingers!');
    } else if (mode === 'finger_gun') {
      speechService.speak('Finger Gun detector active! Point your index finger forward, cock your thumb, and drop your thumb to shoot!');
    } else if (mode === 'air_signature') {
      speechService.speak('Sign or write your name in the air, it will be printed on your certificate!');
    }
  };


  return (
    <div className="flex flex-col w-screen h-screen bg-slate-950 text-white select-none overflow-hidden font-['Outfit',sans-serif]">
      {/* Top Header Navigation */}
      <TopNavBar
        currentMode={currentMode}
        onModeChange={handleModeChange}
        arFilter={arFilter}
        onArFilterChange={setArFilter}
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled(speechService.toggle())}
        soundMuted={soundMuted}
        onToggleSound={() => setSoundMuted(soundService.toggleMute())}
        bgmPlaying={bgmPlaying}
        onToggleBgm={() => {
          if (bgmPlaying) {
            soundService.stopBackgroundMusic();
            setBgmPlaying(false);
          } else {
            soundService.startBackgroundMusic();
            setBgmPlaying(true);
          }
        }}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenCertificate={() => setIsCertificateOpen(true)}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Mode-Specific Panels */}
      {currentMode === 'ai_race' && (
        <GameRacePanel
          currentPrompt={currentPrompt}
          timeLeft={timeLeft}
          totalTime={totalTime}
          score={score}
          difficulty={difficulty}
          onDifficultyChange={(diff) => {
            setDifficulty(diff);
            setRacePromptIndex(0);
            setTimeLeft(diff === 'easy' ? 30 : diff === 'medium' ? 25 : 20);
          }}
          onNextPrompt={() => {
            setRacePromptIndex(prev => prev + 1);
            setStrokes([]);
            setTimeLeft(totalTime);
          }}
          onSkip={() => {
            setRacePromptIndex(prev => prev + 1);
            setStrokes([]);
            setTimeLeft(totalTime);
          }}
        />
      )}

      {currentMode === 'team_battle' && (
        <TeamBattlePanel
          currentPrompt={currentTeamBattlePrompt}
          teamAScore={teamAScore}
          teamBScore={teamBScore}
          activeTeam={activeTeam}
          currentRound={currentRound}
          maxRounds={8}
          onSwitchTeam={() => {
            const next = activeTeam === 'Team A' ? 'Team B' : 'Team A';
            setActiveTeam(next);
            setTeamBattlePromptIndex(prev => prev + 1);
            setCurrentRound(prev => (prev < 8 ? prev + 1 : 1));
            setStrokes([]);
            speechService.speak(`It is now ${next === 'Team A' ? 'Team Alpha' : 'Team Beta'}'s turn! Next item: ${TEAM_BATTLE_PROMPTS[(teamBattlePromptIndex + 1) % TEAM_BATTLE_PROMPTS.length].english}`);
          }}
          onResetBattle={() => {
            setTeamAScore(0);
            setTeamBScore(0);
            setCurrentRound(1);
            setActiveTeam('Team A');
            setTeamBattlePromptIndex(0);
            setStrokes([]);
          }}
        />
      )}

      {currentMode === 'emoji_challenge' && (
        <EmojiChallengePanel
          currentChallengeIndex={emojiIndex}
          similarityScore={emojiSimilarity}
          onNextChallenge={() => {
            setEmojiIndex(prev => prev + 1);
            setStrokes([]);
            setEmojiSimilarity(0);
          }}
        />
      )}

      {currentMode === 'learn_mode' && (
        <LearnModePanel
          selectedTemplate={selectedTemplate}
          onSelectTemplate={(tpl) => setSelectedTemplate(tpl)}
          showGhostGuide={showGhostGuide}
          onToggleGhostGuide={() => setShowGhostGuide(prev => !prev)}
        />
      )}

      {currentMode === 'mystery_word' && (
        <MysteryWordPanel
          currentPrompt={currentMysteryWord}
          onNextWord={() => {
            setMysteryWordIndex(prev => prev + 1);
            setStrokes([]);
            speechService.speak('Next secret word loaded for the drawer!');
          }}
          onWordGuessed={() => {
            soundService.playVictoryApplause();
            speechService.speak('Team guessed correctly! Outstanding job!', true);
            setScore(prev => prev + 150);
            setMysteryWordIndex(prev => prev + 1);
            setStrokes([]);
          }}
        />
      )}

      {/* Main Center Canvas / Leaderboard */}
      <main className="flex-1 relative w-full h-full overflow-hidden p-2 flex items-stretch justify-center">
        {currentMode === 'leaderboard' ? (
          <LeaderboardView
            entries={leaderboardEntries}
            onBackToDraw={() => setCurrentMode('free_draw')}
          />
        ) : (
          <CameraCanvas
            currentMode={currentMode}
            currentColor={currentColor}
            isRainbow={isRainbow}
            brushSize={brushSize}
            brushStyle={brushStyle}
            onBrushStyleChange={setBrushStyle}
            arFilter={arFilter}
            onArFilterChange={setArFilter}
            useDepthSizing={useDepthSizing}
            twoHandMode={twoHandMode}
            strokes={strokes}
            onStrokesChange={setStrokes}
            onColorCycle={handleColorCycle}
            onClearCanvas={handleClearCanvas}
            onTriggerCheck={handleRecognize}
            onUndo={handleUndo}
            onNextMode={handleNextMode}
            onNextWord={() => {
              if (currentMode === 'ai_race') {
                setRacePromptIndex(prev => prev + 1);
                setStrokes([]);
                setTimeLeft(totalTime);
                const nextP = activePrompts[(racePromptIndex + 1) % activePrompts.length];
                if (nextP) speechService.speakNewRound(nextP.english);
              } else if (currentMode === 'emoji_challenge') {
                setEmojiIndex(prev => prev + 1);
                setStrokes([]);
                setEmojiSimilarity(0);
              } else if (currentMode === 'mystery_word') {
                setMysteryWordIndex(prev => prev + 1);
                setStrokes([]);
                speechService.speak('Next secret word loaded!');
              } else if (currentMode === 'team_battle') {
                const next = activeTeam === 'Team A' ? 'Team B' : 'Team A';
                setActiveTeam(next);
                setTeamBattlePromptIndex(prev => prev + 1);
                setCurrentRound(prev => (prev < 8 ? prev + 1 : 1));
                setStrokes([]);
                speechService.speak(`Switched to ${next === 'Team A' ? 'Team Alpha' : 'Team Beta'}!`);
              }
            }}
            ghostTemplate={
              currentMode === 'learn_mode' && showGhostGuide && selectedTemplate
                ? { path: selectedTemplate.path, label: selectedTemplate.label }
                : null
            }
          />
        )}
      </main>

      {/* Bottom Floating Toolbar */}
      {currentMode !== 'leaderboard' && (
        <Toolbar
          currentMode={currentMode}
          currentColor={currentColor}
          onColorChange={(color) => {
            setCurrentColor(color);
            setIsRainbow(false);
          }}
          isRainbow={isRainbow}
          onToggleRainbow={() => setIsRainbow(prev => !prev)}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          brushStyle={brushStyle}
          onBrushStyleChange={setBrushStyle}
          arFilter={arFilter}
          onArFilterChange={setArFilter}
          useDepthSizing={useDepthSizing}
          onToggleDepthSizing={() => setUseDepthSizing(prev => !prev)}
          twoHandMode={twoHandMode}
          onToggleTwoHandMode={() => setTwoHandMode(prev => !prev)}
          onUndo={handleUndo}
          onClear={handleClearCanvas}
          onRecognize={handleRecognize}
          canUndo={strokes.length > 0}
          isRecognizing={isRecognizing}
          strokesCount={strokes.length}
        />
      )}

      {/* Overlays and Modals */}
      <CelebrationOverlay
        result={celebrationResult}
        onClose={() => {
          setCelebrationResult(null);
          if (currentMode === 'ai_race') {
            setRacePromptIndex(prev => prev + 1);
            setStrokes([]);
            setTimeLeft(totalTime);
          }
        }}
      />

      <GestureGuideModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        strokes={strokes}
        score={score}
        accuracy={accuracy}
      />

      <GalleryDrawer
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        items={galleryItems}
        onClearGallery={() => setGalleryItems([])}
      />
    </div>
  );
};

export default App;
