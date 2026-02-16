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

/* ===============================
   SPEECH SYNTHESIS GUARD
================================ */
if (!window.speechSynthesis) {
  console.warn('Speech synthesis not supported');
  if (el.playPauseBtn) el.playPauseBtn.disabled = true;
}

/* ===============================
   PLAYER CONTROLS
================================ */
if (window.speechSynthesis) {

  // PLAY / PAUSE
  if (el.playPauseBtn) {
    el.playPauseBtn.addEventListener('click', () => {
      if (!player.hasMarkers()) return;

      if (speechSynthesis.speaking && !speechSynthesis.paused) {
        player.pause();
        el.playPauseBtn.textContent = 'Play';
      } else {
        player.resumeOrSpeak(Number(el.speedSelect?.value || 1));
        el.playPauseBtn.textContent = 'Pause';
      }
    });
  }

  // STOP
  if (el.stopBtn) {
    el.stopBtn.addEventListener('click', () => {
      player.stop();
      el.playPauseBtn.textContent = 'Play';
      ui.setSelectButtonState('default');
    });
  }

  // NEXT / PREV
  if (el.forwardBtn) el.forwardBtn.addEventListener('click', () => player.next());
  if (el.backwardBtn) el.backwardBtn.addEventListener('click', () => player.prev());

  // SPEED CHANGE
  if (el.speedSelect) {
    el.speedSelect.addEventListener('change', () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        player.speakCurrent(Number(el.speedSelect.value || 1));
      }
    });
  }

  // SEEK SLIDER
  if (el.seekSlider) {
    el.seekSlider.addEventListener('change', (e) => {
      const percent = Number(e.target.value);
      player.seekToPercent(percent);
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
