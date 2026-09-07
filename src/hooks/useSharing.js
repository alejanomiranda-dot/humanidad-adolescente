import { useState, useEffect, useRef } from 'react';
import { projectShareText } from '../content/shared.js';

export default function useSharing(quizResult) {
  const shareDialogRef = useRef(null);
  const shareTriggerRef = useRef(null);
  const shareTextRef = useRef(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareStatus, setShareStatus] = useState('');

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

  const openShareModal = (e) => { shareTriggerRef.current = e.currentTarget; setShareStatus(''); setShowShareModal(true); };
  const handleShareDialogCancel = (e) => { e.preventDefault(); setShowShareModal(false); };
  const handleShareDialogClick = (e) => { if (e.target === e.currentTarget) setShowShareModal(false); };
  const closeShareModal = () => setShowShareModal(false);
  const resultTweetText = `Mi resultado en La Humanidad Adolescente: ${quizResult?.stage}.`;

  return {
    shareDialogRef,
    shareTextRef,
    shareStatus,
    resultShareText,
    resultTweetText,
    shareUrl,
    shareProject,
    copyResult,
    openShareModal,
    closeShareModal,
    handleShareDialogKeyDown,
    handleShareDialogCancel,
    handleShareDialogClick,
  };
}
