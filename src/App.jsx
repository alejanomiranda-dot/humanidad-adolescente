import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import { futures } from './content/futures.js';
import { stages } from './content/stages.js';
import { questions, quizResults } from './content/quiz.js';
import { avatarConfigs } from './content/avatars.js';
import { maturitySignals, personalActions, communityActions, institutionalActions } from './content/reflections.js';
import { perspectiveKeys, projectShareText } from './content/shared.js';

const QuizComponent = ({ onComplete }) => {
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQ]: value };
    setAnswers(newAnswers);
    
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (ans) => {
    const total = Object.values(ans).reduce((a, b) => a + b, 0);
    const avg = total / questions.length;
    
    let result;
    if (avg <= 1.5) {
      result = { ...quizResults.earlyAdolescence };
    } else if (avg <= 2.5) {
      result = { ...quizResults.fullAdolescence };
    } else {
      result = { ...quizResults.emergingAdulthood };
    }
    onComplete(result);
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Pregunta {currentQ + 1} de {questions.length}</span>
          <span>{Math.round(((currentQ) / questions.length) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
            style={{ width: `${((currentQ) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h3 className="text-xl font-bold mb-6">{questions[currentQ].q}</h3>
      
      <div className="space-y-3">
        {questions[currentQ].options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(option.value)}
            className="w-full p-4 text-left bg-gray-700/50 hover:bg-gray-600/50 rounded-xl transition-colors border border-gray-600/50 hover:border-orange-500/50"
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
};

const AdultAvatar = ({ future, size = 200 }) => {
  return (
    <div className="relative flex justify-center items-center">
      <div className="absolute bottom-0 w-32 h-8 bg-black/20 blur-[40px] rounded-full" />
      <div className="relative z-10">
        <svg width={size} height={size + 40} viewBox={`0 0 ${size} ${size + 40}`}>
          <circle cx={size / 2} cy={80 / 2} r={80 / 2} fill={future.color} />
          <circle cx={size / 2 - 10} cy={80 / 2 - 5} r={4} fill="#2C1810" />
          <circle cx={size / 2 + 10} cy={80 / 2 - 5} r={4} fill="#2C1810" />
          <rect
            x={(size - 70) / 2}
            y={80}
            width={70}
            height={120}
            fill={future.color}
            rx={5}
          />
          <rect x={(size - 80) / 2 - 6} y={85} width={6} height={60} fill={future.color} rx={3} />
          <rect x={(size + 80) / 2} y={85} width={6} height={60} fill={future.color} rx={3} />
        </svg>
      </div>
    </div>
  );
};

const FutureCard = ({ future }) => {
  const [activeTab, setActiveTab] = useState('achievements');

  return (
    <div className="min-w-0 transition-all duration-700 opacity-0 translate-y-3 animate-[cardFadeIn_0.7s_ease-out_forwards] bg-gradient-to-b from-gray-800/80 to-gray-900/80 rounded-2xl p-5 sm:p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl hover:shadow-2xl hover:border-gray-600/50 hover:-translate-y-1">
      <div className="flex flex-col items-center mb-8">
        <AdultAvatar future={future} />
        <h3 className="text-2xl font-bold text-white mt-6 mb-2">{future.name}</h3>
        <div className="mx-auto mt-2 mb-4 w-16 h-[2px] bg-white/20 rounded-full" />
        <p className="text-lg text-gray-300 text-center">{future.subtitle}</p>
      </div>

      <p className="text-gray-200 leading-relaxed mb-8 max-w-[720px] mx-auto">
        {future.description}
      </p>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-1 sm:gap-2 border-b border-gray-700" role="group" aria-label={`Perspectivas: ${future.name}`}>
          {perspectiveKeys.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              aria-pressed={activeTab === tab}
              className={`px-3 sm:px-4 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab === 'achievements' && 'Logros'}
              {tab === 'wounds' && 'Heridas'}
              {tab === 'risks' && 'Riesgos'}
            </button>
          ))}
        </div>

        <ul className="space-y-3">
          {future[activeTab].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-gray-300">
              <Circle className="w-2 h-2 mt-2 flex-shrink-0 fill-current" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Avatar = ({ stage, isActive }) => {
  const config = avatarConfigs[stage.avatar_key];

  return (
    <div className="relative flex justify-center items-center">
      {/* Shadow */}
      <div className="absolute bottom-0 w-20 sm:w-24 md:w-28 h-6 bg-black/20 blur-[40px] rounded-full" />
      
      {/* Avatar */}
      <div className={`relative z-10 transition-all duration-700 ${isActive ? 'scale-100 opacity-100 animate-[avatarPop_0.4s_ease-out]' : 'scale-90 opacity-0'}`}>
        <svg width={config.size} height={config.size + 40} viewBox={`0 0 ${config.size} ${config.size + 40}`}>
        {/* Head */}
        <circle
          cx={config.size / 2}
          cy={config.head / 2}
          r={config.head / 2}
          fill={config.color}
          className="transition-all duration-700"
        />
        {/* Eyes */}
        <circle cx={config.size / 2 - 8} cy={config.head / 2 - 5} r={3} fill="#2C1810" />
        <circle cx={config.size / 2 + 8} cy={config.head / 2 - 5} r={3} fill="#2C1810" />
        {/* Body */}
        <rect
          x={(config.size - config.body * 0.6) / 2}
          y={config.head}
          width={config.body * 0.6}
          height={config.body}
          fill={config.color}
          rx={5}
          className="transition-all duration-700"
        />
        {/* Arms */}
        <rect
          x={(config.size - config.body * 0.8) / 2 - 5}
          y={config.head + 5}
          width={5}
          height={config.body * 0.5}
          fill={config.color}
          rx={3}
        />
        <rect
          x={(config.size + config.body * 0.8) / 2}
          y={config.head + 5}
          width={5}
          height={config.body * 0.5}
          fill={config.color}
          rx={3}
        />
      </svg>
      <div className="text-center mt-4 text-sm font-medium text-gray-400">
        {stage.age_human}
      </div>
    </div>
    </div>
  );
};

const TimelineStage = ({ stage, isActive, onReadingChange }) => {
  const [activeTab, setActiveTab] = useState('achievements');

  return (
    <div hidden={!isActive} id={`stage-${stage.id}`} role="group" aria-labelledby={`stage-title-${stage.id}`}>
      <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
        {/* Avatar */}
        <div className="flex-shrink-0 flex flex-col items-center my-8 lg:my-12">
          <Avatar stage={stage} isActive={isActive} />
          <div className="mt-8 text-center">
            <div className="text-2xl font-bold text-white">{stage.age_label}</div>
            <div className="text-sm text-gray-400 mt-1">{stage.age_real}</div>
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-6">
          <div>
            <h2 id={`stage-title-${stage.id}`} className="text-3xl lg:text-4xl font-bold text-white mb-2">
              {stage.title}
            </h2>
            <div className="mx-auto mt-4 mb-8 w-16 h-[2px] bg-white/20 rounded-full" />
            <p className="text-xl text-gray-300 mt-3">{stage.subtitle}</p>
          </div>

          <p className="text-gray-200 leading-relaxed text-lg max-w-[720px] mt-8">
            {stage.text}
          </p>

          {/* Tabs */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1 sm:gap-2 border-b border-gray-700" role="group" aria-label={`Perspectivas: ${stage.age_label}`}>
              {perspectiveKeys.map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); onReadingChange(); }}
                  aria-pressed={activeTab === tab}
                  className={`px-3 sm:px-4 py-3 font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-white border-b-2 border-white'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab === 'achievements' && 'Logros'}
                  {tab === 'wounds' && 'Heridas'}
                  {tab === 'risks' && 'Riesgos'}
                </button>
              ))}
            </div>

            <ul className="space-y-3">
              {stage[activeTab].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-300">
                  <Circle className="w-2 h-2 mt-2 flex-shrink-0 fill-current" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HumanityAdolescence() {
  const [currentStage, setCurrentStage] = useState(0);
  const touchStart = useRef(null);
  const timelineRef = useRef(null);
  const shareDialogRef = useRef(null);
  const shareTriggerRef = useRef(null);
  const shareTextRef = useRef(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [timelineVisible, setTimelineVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [quizResult, setQuizResult] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareStatus, setShareStatus] = useState('');

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => setReducedMotion(media.matches);
    const onVisibilityChange = () => setPageVisible(!document.hidden);
    media.addEventListener('change', onMotionChange);
    document.addEventListener('visibilitychange', onVisibilityChange);
    const observer = new IntersectionObserver(([entry]) => {
      setTimelineVisible(entry.isIntersecting);
    });
    observer.observe(timelineRef.current);
    return () => {
      media.removeEventListener('change', onMotionChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!autoPlay) return;
    if (!timelineVisible || !pageVisible || reducedMotion || currentStage === stages.length - 1) {
      setAutoPlay(false);
      return;
    }
    const stage = stages[currentStage];
    // Allow time to read the whole stage, including its three perspectives.
    const words = [stage.title, stage.subtitle, stage.text, ...stage.achievements, ...stage.wounds, ...stage.risks].join(' ').split(/\s+/).length;
    const readingTime = Math.max(30000, Math.ceil(words / 180 * 60000));
    const timer = setTimeout(() => setCurrentStage(prev => Math.min(stages.length - 1, prev + 1)), readingTime);
    return () => clearTimeout(timer);
  }, [autoPlay, currentStage, timelineVisible, pageVisible, reducedMotion]);

  useEffect(() => {
    if (!showShareModal) return;
    const dialog = shareDialogRef.current;
    const trigger = shareTriggerRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    dialog.querySelector('button')?.focus();
    shareTextRef.current.scrollTop = 0;
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      trigger?.focus({ preventScroll: true });
    };
  }, [showShareModal]);

  const navigateStage = (index) => {
    setAutoPlay(false);
    setCurrentStage(Math.max(0, Math.min(stages.length - 1, index)));
    setShowScrollHint(false);
  };

  const handleTimelineKeyDown = (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey ||
        e.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="slider"]')) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      // A stage change hides its buttons; keep keyboard focus on the timeline.
      if (e.target.closest('[id^="stage-"]')) timelineRef.current.focus({ preventScroll: true });
      navigateStage(currentStage + (e.key === 'ArrowRight' ? 1 : -1));
    }
  };

  const handleTouchStart = (e) => {
    setAutoPlay(false);
    if (e.touches.length !== 1 || e.target.closest('button, a, input, textarea, select')) {
      touchStart.current = null;
      return;
    }
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY, id: touch.identifier };
  };

  const handleTouchEnd = (e) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || e.touches.length) return;
    const end = Array.from(e.changedTouches).find(touch => touch.identifier === start.id);
    if (!end) return;
    const dx = start.x - end.clientX;
    const dy = start.y - end.clientY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      navigateStage(currentStage + (dx > 0 ? 1 : -1));
    }
  };

  const scrollToTimeline = () => {
    timelineRef.current.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    timelineRef.current.focus({ preventScroll: true });
  };

  const resultShareText = quizResult
    ? `Mi resultado en La Humanidad Adolescente: ${quizResult.stage}. ${quizResult.description} ${quizResult.message}`
    : projectShareText;
  const shareUrl = `${window.location.origin}${window.location.pathname}`;

  const shareProject = (platform, text = projectShareText) => {
    const urls = {
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    };
    if (urls[platform]) window.open(urls[platform], '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(`${resultShareText}\n${shareUrl}`);
      setShareStatus('Resultado copiado. Podés pegarlo en la red que prefieras.');
    } catch {
      shareTextRef.current?.focus();
      shareTextRef.current?.select();
      setShareStatus('No se pudo copiar automáticamente. El texto quedó seleccionado para que lo copies.');
    }
  };

  const handleShareDialogKeyDown = (e) => {
    if (e.key !== 'Tab') return;
    const controls = e.currentTarget.querySelectorAll('button:not(:disabled), textarea');
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 text-white relative overflow-x-clip">
      {/* Starfield background */}
      <div className="fixed inset-0 opacity-40 pointer-events-none" aria-hidden="true">
        <div className="absolute w-1 h-1 bg-white rounded-full top-[10%] left-[20%] animate-pulse"></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[15%] left-[80%] animate-pulse" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[25%] left-[40%] animate-pulse" style={{animationDelay: '0.6s'}}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[35%] left-[70%] animate-pulse" style={{animationDelay: '0.9s'}}></div>
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[45%] left-[15%] animate-pulse" style={{animationDelay: '1.2s'}}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[55%] left-[85%] animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[65%] left-[30%] animate-pulse" style={{animationDelay: '1.8s'}}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[75%] left-[60%] animate-pulse" style={{animationDelay: '2.1s'}}></div>
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[85%] left-[45%] animate-pulse" style={{animationDelay: '2.4s'}}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[20%] left-[50%] animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[40%] left-[90%] animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[60%] left-[10%] animate-pulse" style={{animationDelay: '1.7s'}}></div>
      </div>
      
      {/* Nebula effects */}
      <div className="fixed inset-0 opacity-30 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-600/15 rounded-full blur-[180px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[200px]"></div>
      </div>
      
      <div className="relative z-10">
      <style>{`
        html {
          scroll-behavior: smooth;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 0.6s ease-out;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        @keyframes avatarPop {
          0% { transform: translateY(8px) scale(0.96); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes cardFadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .parallax-slow {
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-float,
          .parallax-slow {
            animation: none;
            transform: none;
          }
        }
        .text-glow {
          text-shadow: 0 0 20px rgba(251, 191, 36, 0.5), 0 0 40px rgba(251, 191, 36, 0.3);
        }
        .text-glow-white {
          text-shadow: 0 0 30px rgba(255, 255, 255, 0.4), 0 0 60px rgba(255, 255, 255, 0.2);
        }
      `}</style>
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center pt-[clamp(5rem,12vh,8rem)] pb-20 relative overflow-hidden">
        {/* Illustrated background - Cosmic sunset with silhouettes */}
        <svg className="absolute inset-0 w-full h-full opacity-40 parallax-slow" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="heroSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#1a0b2e', stopOpacity: 1}} />
              <stop offset="50%" style={{stopColor: '#7b2cbf', stopOpacity: 0.8}} />
              <stop offset="100%" style={{stopColor: '#ff6b35', stopOpacity: 0.9}} />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroSky)" />
          {/* Mountains silhouette */}
          <path d="M0,600 L200,400 L400,500 L600,350 L800,450 L1000,300 L1200,400 L1400,250 L1920,400 L1920,1080 L0,1080 Z" 
                fill="#0a0118" opacity="0.9" />
          <path d="M0,700 L300,550 L600,650 L900,500 L1200,600 L1500,450 L1920,550 L1920,1080 L0,1080 Z" 
                fill="#1a0b2e" opacity="0.7" />
          {/* Stars */}
          <circle cx="100" cy="100" r="3" fill="white" opacity="1" />
          <circle cx="300" cy="150" r="2" fill="white" opacity="0.8" />
          <circle cx="500" cy="80" r="3" fill="white" opacity="1" />
          <circle cx="700" cy="120" r="2" fill="white" opacity="0.9" />
          <circle cx="900" cy="90" r="3" fill="white" opacity="1" />
          <circle cx="1100" cy="140" r="2" fill="white" opacity="0.8" />
          <circle cx="1300" cy="110" r="2.5" fill="white" opacity="0.9" />
        </svg>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-orange-900/20 to-gray-900/50"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 mb-12 animate-fade-in-up">
          <div className="animate-float">
            <Avatar stage={stages[5]} isActive={true} />
          </div>
        </div>
        
        <h1 tabIndex={-1} className="hero-title relative z-10 text-5xl lg:text-7xl font-black mb-4 max-w-5xl leading-tight animate-fade-in-up text-glow-white" style={{animationDelay: '0.2s'}}>
          LA HUMANIDAD
        </h1>
        <h2 className="hero-title relative z-10 text-5xl lg:text-7xl font-black mb-8 max-w-5xl leading-tight animate-fade-in-up text-glow" style={{animationDelay: '0.3s', color: '#FDB813'}}>
          ADOLESCENTE
        </h2>
        
        <p className="relative z-10 text-xl lg:text-2xl text-gray-200 mb-4 max-w-3xl animate-fade-in-up font-medium" style={{animationDelay: '0.4s'}}>
          ¿En qué etapa emocional está nuestra especie?
        </p>
        
        <p className="relative z-10 text-lg lg:text-xl text-gray-300 mb-12 max-w-2xl animate-fade-in-up" style={{animationDelay: '0.5s'}}>
          Una web interactiva para entender nuestra época
        </p>
        
        <button
          onClick={scrollToTimeline}
          className="relative z-10 px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-gray-900 rounded-full font-bold text-lg hover:from-orange-400 hover:to-amber-400 transition-all shadow-lg shadow-orange-500/50 animate-fade-in-up"
          style={{animationDelay: '0.6s'}}
        >
          Explorar la línea de tiempo
        </button>
      </section>

      {/* Timeline Section */}
      <section id="timeline" ref={timelineRef} tabIndex={0} aria-labelledby="timeline-title" onKeyDown={handleTimelineKeyDown} className="min-h-screen py-20 px-6 relative overflow-hidden">
        {/* Illustrated background - Path through ages */}
        <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="timelineSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#0f172a', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#1e293b', stopOpacity: 1}} />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#timelineSky)" />
          {/* Winding path/timeline */}
          <path d="M-100,800 Q400,700 800,600 T1600,400 T2400,300" 
                stroke="#fbbf24" strokeWidth="6" fill="none" opacity="0.6" strokeDasharray="20,10" />
          {/* Ancient structures silhouettes */}
          <rect x="100" y="650" width="80" height="150" fill="#1a1a2e" opacity="0.8" />
          <polygon points="140,650 100,620 180,620" fill="#1a1a2e" opacity="0.8" />
          {/* City skyline */}
          <rect x="1200" y="500" width="40" height="300" fill="#1a1a2e" opacity="0.7" />
          <rect x="1250" y="450" width="50" height="350" fill="#1a1a2e" opacity="0.8" />
          <rect x="1310" y="480" width="45" height="320" fill="#1a1a2e" opacity="0.7" />
          {/* Additional details */}
          <circle cx="400" cy="700" r="8" fill="#fbbf24" opacity="0.5" />
          <circle cx="800" cy="600" r="8" fill="#fbbf24" opacity="0.5" />
          <circle cx="1200" cy="500" r="8" fill="#fbbf24" opacity="0.5" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 id="timeline-title" className="text-4xl lg:text-5xl font-black text-center mb-20 text-glow-white">
            Nuestro crecimiento como especie
          </h2>

          {/* Stage Display */}
          <div 
            className="relative min-h-[600px] mb-16 pt-14"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={() => { touchStart.current = null; }}
            onFocusCapture={() => setAutoPlay(false)}
            onPointerDown={() => setAutoPlay(false)}
          >
            {/* Scroll hint */}
            {showScrollHint && currentStage === 0 && (
              <div className="absolute top-4 inset-x-0 text-gray-300 text-sm animate-bounce z-20 flex items-center justify-center gap-2 whitespace-nowrap">
                <span>←</span> Desliza para explorar <span>→</span>
              </div>
            )}
            
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700 z-20" role="progressbar" aria-label="Progreso de la cronología" aria-valuemin={1} aria-valuemax={stages.length} aria-valuenow={currentStage + 1} aria-valuetext={stages[currentStage].age_label}>
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                style={{ width: `${((currentStage + 1) / stages.length) * 100}%` }}
              />
            </div>

            {stages.map((stage, idx) => (
              <TimelineStage
                key={stage.id}
                stage={stage}
                isActive={currentStage === idx}
                onReadingChange={() => setAutoPlay(false)}
              />
            ))}
          </div>

          {/* Navigation with autoplay */}
          <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-6 mb-6">
            <button
              onClick={() => navigateStage(currentStage - 1)}
              disabled={currentStage === 0}
              aria-label="Etapa anterior"
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex gap-0 sm:gap-1" role="group" aria-label="Elegir etapa">
              {stages.map((stage, idx) => (
                <button
                  key={idx}
                  onClick={() => navigateStage(idx)}
                  aria-label={`Ir a ${stage.age_label}`}
                  aria-current={currentStage === idx ? 'step' : undefined}
                  aria-controls={`stage-${stage.id}`}
                  className="w-7 sm:w-9 h-11 flex items-center justify-center rounded-full"
                >
                  <span aria-hidden="true" className={`h-3 rounded-full transition-all ${currentStage === idx ? 'bg-white w-6 sm:w-8' : 'bg-gray-500 w-3'}`} />
                </button>
              ))}
            </div>

            <button
              onClick={() => navigateStage(currentStage + 1)}
              disabled={currentStage === stages.length - 1}
              aria-label="Etapa siguiente"
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Autoplay toggle */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              disabled={reducedMotion || currentStage === stages.length - 1}
              aria-pressed={autoPlay}
              aria-describedby="autoplay-help"
              className="px-6 py-3 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2"
            >
              {autoPlay ? '⏸' : '▶'} {autoPlay ? 'Pausar' : 'Reproducir automático'}
            </button>
            <p id="autoplay-help" className="text-sm text-gray-300 text-center max-w-xl">
              {reducedMotion ? 'La reproducción automática está desactivada por tu preferencia de movimiento reducido.' : 'El avance da tiempo para leer. Se pausa al interactuar o salir de la cronología.'}
            </p>
            <p className="sr-only" role="status">Etapa {currentStage + 1} de {stages.length}: {stages[currentStage].age_label}</p>
          </div>
        </div>
      </section>

      {/* Futures Section */}
      <section className="pt-20 pb-6 px-6 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 relative overflow-hidden">
        {/* Illustrated background - Multiple paths diverging */}
        <svg className="absolute inset-0 w-full h-full opacity-25 parallax-slow" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="futuresSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#0a0a1a', stopOpacity: 1}} />
              <stop offset="50%" style={{stopColor: '#1a0b2e', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#2d1b4e', stopOpacity: 1}} />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#futuresSky)" />
          {/* Three diverging paths */}
          <path d="M960,900 L960,700 L700,500" 
                stroke="#4A9B6F" strokeWidth="5" fill="none" opacity="0.7" strokeDasharray="10,5" />
          <path d="M960,900 L960,650 L960,400" 
                stroke="#6B7280" strokeWidth="5" fill="none" opacity="0.7" strokeDasharray="10,5" />
          <path d="M960,900 L960,700 L1220,500" 
                stroke="#7C2D12" strokeWidth="5" fill="none" opacity="0.7" strokeDasharray="10,5" />
          {/* Future city left (green) */}
          <rect x="650" y="450" width="30" height="80" fill="#4A9B6F" opacity="0.6" />
          <rect x="690" y="470" width="25" height="60" fill="#4A9B6F" opacity="0.6" />
          <rect x="625" y="480" width="20" height="50" fill="#4A9B6F" opacity="0.5" />
          {/* Neutral structures center */}
          <rect x="950" y="350" width="20" height="50" fill="#6B7280" opacity="0.6" />
          <rect x="975" y="370" width="18" height="30" fill="#6B7280" opacity="0.5" />
          {/* Broken structures right (red) */}
          <polygon points="1200,520 1180,500 1220,500" fill="#7C2D12" opacity="0.6" />
          <rect x="1200" y="520" width="20" height="30" fill="#7C2D12" opacity="0.6" />
          <path d="M1215,505 L1225,515" stroke="#7C2D12" strokeWidth="2" opacity="0.5" />
        </svg>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-4xl lg:text-5xl font-black text-center mb-6 text-glow-white">
            ¿En qué tipo de adultos podemos convertirnos?
          </h2>
          
          {/* Temporal window explanation */}
          <div className="max-w-3xl mx-auto mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <h3 className="text-2xl font-bold text-white mb-4">
              ¿Cuándo dejaríamos de ser adolescentes como especie?
            </h3>
            <div className="text-gray-200 leading-relaxed space-y-3">
              <p>
                Si la humanidad fuera una persona, hoy tendría unos 15 años. Convertirnos en adultos no depende del calendario, sino de las decisiones colectivas que tomemos.
              </p>
              <p>
                Pero si usamos el paralelismo humano, la adultez ocurre entre los 20 y los 25 años. En escala histórica, esto equivale a que nuestra especie podría alcanzar la madurez dentro de 200 a 500 años, si elegimos un camino de crecimiento.
              </p>
              <p>
                También podríamos quedarnos estancados… o no llegar nunca a la adultez. Esa ventana es nuestro momento más formativo y también el más peligroso.
              </p>
            </div>
          </div>
          
          {/* Línea divisoria elegante */}
          <div className="w-16 h-0.5 bg-white/20 mx-auto mt-4 mb-6 rounded-full"></div>
          
          <p className="text-xl text-gray-300 text-center mb-8 max-w-3xl mx-auto">
            Tres futuros posibles. Ninguno está garantizado. Todos dependen de lo que elijamos hacer hoy.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {futures.map(future => (
              <FutureCard key={future.id} future={future} />
            ))}
          </div>
        </div>
      </section>

      {/* Quiz Section */}
      <section id="quiz" className="py-20 px-6 bg-gradient-to-b from-gray-900 via-indigo-900/20 to-gray-900 relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl lg:text-5xl font-black text-center mb-6 text-glow-white">
            ¿En qué etapa estás tú?
          </h2>
          <p className="text-xl text-gray-300 text-center mb-12">
            Respondé este breve quiz y descubrí tu madurez individual
          </p>

          {!quizResult ? (
            <div className="bg-gray-800/80 rounded-2xl p-5 sm:p-8 backdrop-blur-sm border border-gray-700/50">
              <QuizComponent onComplete={setQuizResult} />
            </div>
          ) : (
            <div className="bg-gradient-to-b from-gray-800/80 to-gray-900/80 rounded-2xl p-5 sm:p-8 backdrop-blur-sm border border-gray-700/50 text-center" role="status">
              <h3 className="text-3xl font-bold mb-4 text-glow">
                Eres: {quizResult.stage}
              </h3>
              <p className="text-lg text-gray-300 mb-6">{quizResult.description}</p>
              <p className="text-gray-400 mb-8">{quizResult.message}</p>
              <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setQuizResult(null)}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-gray-900 rounded-full font-bold hover:from-orange-400 hover:to-amber-400 transition-all"
              >
                Volver a hacer el quiz
              </button>
              <button
                onClick={(e) => { shareTriggerRef.current = e.currentTarget; setShareStatus(''); setShowShareModal(true); }}
                className="px-8 py-3 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-all"
              >
                Compartir resultado
              </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Share Modal */}
      <dialog ref={shareDialogRef} aria-labelledby="share-title" aria-describedby="share-description" onKeyDown={handleShareDialogKeyDown} onCancel={(e) => { e.preventDefault(); setShowShareModal(false); }} className="share-dialog bg-gray-800 text-white rounded-2xl p-0" onClick={(e) => { if (e.target === e.currentTarget) setShowShareModal(false); }}>
          <div className="p-5 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <h3 id="share-title" className="text-2xl font-bold mb-4 text-center">Compartir resultado</h3>
            <p id="share-description" className="text-gray-300 mb-4">Compartí tu resultado en X o WhatsApp. Para otras redes, copiá el texto.</p>
            <textarea ref={shareTextRef} readOnly aria-label="Texto del resultado para compartir" value={`${resultShareText}\n${shareUrl}`} className="w-full min-h-40 bg-gray-900 text-gray-200 border border-gray-600 rounded-lg p-3 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <button onClick={copyResult} className="p-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-colors col-span-2">Copiar resultado</button>
              <button onClick={() => shareProject('x', `Mi resultado en La Humanidad Adolescente: ${quizResult?.stage}.`)} className="p-4 bg-black hover:bg-gray-900 rounded-xl font-semibold transition-colors">
                𝕏 (Twitter)
              </button>
              <button onClick={() => shareProject('whatsapp', resultShareText)} className="p-4 bg-green-500 hover:bg-green-600 text-gray-900 rounded-xl font-semibold transition-colors">
                WhatsApp
              </button>
            </div>
            <p role="status" className="text-sm text-gray-200 mt-4">{shareStatus}</p>
            <button onClick={() => setShowShareModal(false)} className="mt-6 w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors">
              Cerrar
            </button>
          </div>
      </dialog>

      {/* Maturity Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-6">
            ¿Qué significa madurar como especie?
          </h2>
          <div className="mx-auto mt-4 mb-12 w-16 h-[2px] bg-white/20 rounded-full" />

          <p className="text-gray-200 leading-relaxed text-lg mb-8 max-w-[720px] mx-auto">
            Madurar como especie no es dejar de cometer errores, sino aprender a qué costo queremos seguir cometiéndolos. No se trata de volvernos perfectos, sino de asumir que nuestras decisiones tienen impacto en millones de vidas y en un planeta finito.
          </p>

          <p className="text-gray-300 text-lg mb-6 max-w-[720px] mx-auto">
            Algunas señales de madurez serían:
          </p>

          <ul className="space-y-4 max-w-[720px] mx-auto">
            {maturitySignals.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-gray-300">
                <Circle className="w-2 h-2 mt-2 flex-shrink-0 fill-current" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="text-gray-200 leading-relaxed text-lg mt-8 max-w-[720px] mx-auto">
            Madurar como especie, en resumen, sería pasar de preguntarnos "qué podemos hacer" a preguntarnos "qué tipo de mundo queremos sostener juntos".
          </p>
        </div>
      </section>

      {/* Action Section */}
      <section className="py-20 px-6 bg-gray-800/30 relative overflow-hidden">
        {/* Illustrated background - Hands reaching/building */}
        <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="actionSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: '#0f172a', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#1e293b', stopOpacity: 1}} />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#actionSky)" />
          {/* Network of connections */}
          <circle cx="300" cy="300" r="50" stroke="#fbbf24" strokeWidth="3" fill="none" opacity="0.6" />
          <circle cx="700" cy="400" r="50" stroke="#fbbf24" strokeWidth="3" fill="none" opacity="0.6" />
          <circle cx="1100" cy="350" r="50" stroke="#fbbf24" strokeWidth="3" fill="none" opacity="0.6" />
          <circle cx="500" cy="600" r="50" stroke="#fbbf24" strokeWidth="3" fill="none" opacity="0.6" />
          <circle cx="900" cy="650" r="50" stroke="#fbbf24" strokeWidth="3" fill="none" opacity="0.6" />
          {/* Connecting lines */}
          <line x1="300" y1="300" x2="700" y2="400" stroke="#fbbf24" strokeWidth="2" opacity="0.4" />
          <line x1="700" y1="400" x2="1100" y2="350" stroke="#fbbf24" strokeWidth="2" opacity="0.4" />
          <line x1="300" y1="300" x2="500" y2="600" stroke="#fbbf24" strokeWidth="2" opacity="0.4" />
          <line x1="700" y1="400" x2="900" y2="650" stroke="#fbbf24" strokeWidth="2" opacity="0.4" />
          <line x1="500" y1="600" x2="900" y2="650" stroke="#fbbf24" strokeWidth="2" opacity="0.4" />
          <line x1="1100" y1="350" x2="900" y2="650" stroke="#fbbf24" strokeWidth="2" opacity="0.3" />
          {/* Center nodes */}
          <circle cx="300" cy="300" r="10" fill="#fbbf24" opacity="0.7" />
          <circle cx="700" cy="400" r="10" fill="#fbbf24" opacity="0.7" />
          <circle cx="1100" cy="350" r="10" fill="#fbbf24" opacity="0.7" />
          <circle cx="500" cy="600" r="10" fill="#fbbf24" opacity="0.7" />
          <circle cx="900" cy="650" r="10" fill="#fbbf24" opacity="0.7" />
        </svg>
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-4xl font-bold text-center mb-6">
            Qué podemos hacer hoy
          </h2>
          <p className="text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            Siendo adolescentes con tecnología de adulto
          </p>

          <p className="text-gray-200 leading-relaxed text-lg mb-12 max-w-[720px] mx-auto">
            No podemos decidir solos el futuro de la humanidad, pero sí podemos influir en la dirección en la que empujamos. Lo que hagamos a escala individual, comunitaria y política no es suficiente por sí solo, pero tampoco es irrelevante.
          </p>

          <div className="space-y-12 max-w-[720px] mx-auto">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">1. A nivel personal</h3>
              <ul className="space-y-3">
                {personalActions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-300">
                    <Circle className="w-2 h-2 mt-2 flex-shrink-0 fill-current" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-4">2. A nivel comunitario</h3>
              <ul className="space-y-3">
                {communityActions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-300">
                    <Circle className="w-2 h-2 mt-2 flex-shrink-0 fill-current" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-4">3. A nivel institucional y político</h3>
              <ul className="space-y-3">
                {institutionalActions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-300">
                    <Circle className="w-2 h-2 mt-2 flex-shrink-0 fill-current" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-gray-200 leading-relaxed text-lg mt-12 max-w-[720px] mx-auto">
            No podemos elegir si la humanidad va a dejar de ser adolescente mañana. Pero sí podemos decidir si cada gesto nuestro refuerza la parte más destructiva de la adolescencia… o la parte que aprende, repara y crece.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-gray-700">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6">
            Compartí esta reflexión
          </h2>
          <div className="mx-auto mt-4 mb-8 w-16 h-[2px] bg-white/20 rounded-full" />
          
          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            <button onClick={() => shareProject('x')} className="px-6 py-3 bg-blue-400 hover:bg-blue-500 text-gray-900 rounded-full font-semibold transition-colors">
              𝕏 X (ex Twitter)
            </button>
            <button onClick={() => shareProject('facebook')} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold transition-colors">
              📘 Facebook
            </button>
            <button onClick={() => shareProject('whatsapp')} className="px-6 py-3 bg-green-500 hover:bg-green-600 text-gray-900 rounded-full font-semibold transition-colors">
              💬 WhatsApp
            </button>
            <button onClick={() => shareProject('linkedin')} className="px-6 py-3 bg-blue-700 hover:bg-blue-800 rounded-full font-semibold transition-colors">
              💼 LinkedIn
            </button>
          </div>

          <div className="text-gray-300 space-y-4 max-w-[720px] mx-auto">
            <p className="leading-relaxed">
              Este ensayo interactivo fue creado como una metáfora para entender dónde estamos como especie y hacia dónde podríamos ir.
            </p>
            <p className="leading-relaxed">
              <strong className="text-white">Idea y texto original:</strong> Alejandro Miranda Baremberg (Alejano910 - Curioso Profesional y Emprendedor)
            </p>
            <p className="leading-relaxed">
              <strong className="text-white">Desarrollo interactivo:</strong> Colaboración entre humanos e inteligencias artificiales.
            </p>
            <p className="leading-relaxed mt-8 text-center text-gray-400">
              No pretende dar respuestas definitivas, sino abrir una conversación:<br />
              Si la humanidad tiene apenas 15 años… ¿qué tipo de adultos queremos ser?
            </p>
          </div>
        </div>
      </footer>

      {/* Footer minimalista */}
      <footer className="text-center text-white/40 text-sm py-10 mt-20 border-t border-white/10">
        Creado por Alejano910 · 2025
      </footer>

      <div className="back-to-top fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {/* Back to top */}
        <button
          onClick={() => { window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }); document.querySelector('h1')?.focus({ preventScroll: true }); }}
          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur text-white flex items-center justify-center transition shadow-lg"
          aria-label="Volver arriba"
          title="Volver arriba"
        >
          ↑
        </button>
      </div>
      </div>
    </div>
  );
}
