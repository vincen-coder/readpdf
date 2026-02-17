// main.js
// Responsibility: wire UI, PDF extraction, and speech player together

import { extractTextFromPDF, splitToSentences } from './pdfService.js';
import * as ui from './uiController.js';
import * as player from './playerController.js';

const { el } = ui;

/* ===============================
   MOBILE MENU
================================ */
if (el.menuBtn && el.mobileMenu) {
  el.menuBtn.addEventListener('click', () => {
    el.mobileMenu.classList.toggle('-translate-y-full');
  });
}

document.querySelectorAll('.mobileLink').forEach(link => {
  link.addEventListener('click', () => {
    if (el.mobileMenu) el.mobileMenu.classList.add('-translate-y-full');
  });
});

/* ===============================
   FILE UPLOAD
================================ */
if (el.selectPdfBtn && el.fileInput) {
  el.selectPdfBtn.addEventListener('click', () => el.fileInput.click());
}

if (el.fileInput) {
  el.fileInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      file.type !== 'application/pdf' &&
      !file.name.toLowerCase().endsWith('.pdf')
    ) {
      ui.showMessage('error', 'Please select a valid PDF file');
      return;
    }

    try {
      ui.setSelectButtonState('loading');

      const pages = await extractTextFromPDF(file);
      const sentences = pages.flatMap(p => splitToSentences(p));

      player.loadMarkersFromSentences(sentences);

      ui.renderSentences(sentences);
      ui.setSelectButtonState('success');
      ui.showMessage('success', 'PDF loaded');

      // Auto start speaking
      const speed = Number(el.speedSelect?.value || 1);
      player.speakCurrent(speed);

    } catch (err) {
      console.error(err);
      ui.showMessage('error', 'Failed to read PDF');
      ui.setSelectButtonState('default');
    } finally {
      el.fileInput.value = '';
    }
  });
}

// /* ===============================
//    SPEECH SYNTHESIS GUARD
// ================================ */
// if (!window.speechSynthesis) {
//   console.warn('Speech synthesis not supported');
//   el.playPauseBtn.disabled = true;
// }

/* ===============================
   PLAYER CONTROLS
================================ */
if (window.speechSynthesis) {

  if (el.playPauseBtn) {
  el.playPauseBtn.addEventListener('click', () => {
    // GUARD 1: SpeechSynthesis not supported
    if (!window.speechSynthesis) return;

    // GUARD 2: Nothing loaded to speak
    if (!player.hasContent()) return;

    // CASE 1: Currently speaking → pause
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      player.pause();
      ui.setPlayPauseIcon(false);
      return;
    }
  

    // CASE 2: Paused → resume
    if (speechSynthesis.paused) {
      player.resume();
      ui.setPlayPauseIcon(true);
      return;
    }

    // CASE 3: Not started yet → start speaking
    const speed = Number(el.speedSelect?.value || 1);
    player.speakCurrent(speed);
    ui.setPlayPauseIcon(true);
  });
}
}


/* ===============================
   INIT
================================ */
export function init() {
  // reserved for future
}

init();
