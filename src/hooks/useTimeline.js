import { useState, useEffect, useRef } from 'react';
import { stages } from '../content/stages.js';

export default function useTimeline() {
  const [currentStage, setCurrentStage] = useState(0);
  const touchStart = useRef(null);
  const timelineRef = useRef(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [timelineVisible, setTimelineVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [showScrollHint, setShowScrollHint] = useState(true);

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

  const handleTouchCancel = () => { touchStart.current = null; };

  return {
    currentStage,
    autoPlay,
    setAutoPlay,
    reducedMotion,
    showScrollHint,
    timelineRef,
    navigateStage,
    handleTimelineKeyDown,
    handleTouchStart,
    handleTouchEnd,
    handleTouchCancel,
    scrollToTimeline,
  };
}
