// main.js
// Responsibility: wire UI, PDF extraction and player controller together.

import { extractTextFromPDF, splitToSentences } from './pdfService.js';
import * as ui from './uiController.js';
import * as player from './playerController.js';

// Wire UI elements to actions
const { el } = ui;

if (el.selectPdfBtn) el.selectPdfBtn.addEventListener('click', () => el.fileInput && el.fileInput.click());

if (el.fileInput) el.fileInput.addEventListener('change', async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) { ui.showMessage('info', 'No file selected.'); return; }
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) { ui.showMessage('error', 'Please select a valid PDF file.'); return; }

  try {
    ui.setSelectButtonState('loading');
    const pages = await extractTextFromPDF(file);
    const sentences = pages.flatMap(p => splitToSentences(p));
    player.loadMarkersFromSentences(sentences);
    ui.showMessage('success', 'PDF loaded — starting voice');
    // ensure voices loaded then start
    // start speaking using selected speed multiplier
    const speedMult = Number(el.speedSelect ? el.speedSelect.value : 1) || 1;
    player.speakCurrent(speedMult);
  } catch (err) {
    console.error(err);
    ui.showMessage('error', 'Failed to read PDF: ' + (err && err.message ? err.message : String(err)));
    ui.setSelectButtonState('default');
  } finally {
    if (el.fileInput) el.fileInput.value = '';
  }
});

// Play / Pause
if (el.playPauseBtn) el.playPauseBtn.addEventListener('click', () => {
  if (!speechSynthesis.speaking || speechSynthesis.paused) {
    // resume or start
    if (speechSynthesis.paused) player.resume(); else player.speakCurrent(Number(el.speedSelect.value || 1));
    el.playPauseBtn.textContent = 'Pause';
  } else {
    player.pause();
    el.playPauseBtn.textContent = 'Play';
  }
});

if (el.stopBtn) el.stopBtn.addEventListener('click', () => { player.stop(); el.playPauseBtn.textContent = 'Play'; ui.setSelectButtonState('default'); });
if (el.forwardBtn) el.forwardBtn.addEventListener('click', () => player.next());
if (el.backwardBtn) el.backwardBtn.addEventListener('click', () => player.prev());

if (el.speedSelect) el.speedSelect.addEventListener('change', () => {
  // if speaking, restart current sentence with new speed
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    player.speakCurrent(Number(el.speedSelect.value || 1));
  }
});

// Seek slider handlers
if (el.seekSlider) {
  let isSeeking = false;
  el.seekSlider.addEventListener('input', (e) => {
    isSeeking = true;
    const val = Number(e.target.value);
    // preview percent
    ui.updateProgressUI(val, ui.formatSeconds ? ui.formatSeconds(0) : '', Math.round(val) + '%');
  });
  el.seekSlider.addEventListener('change', (e) => {
    isSeeking = false;
    const val = Number(e.target.value);
    player.seekToPercent(val);
  });
}

// Expose a simple init for potential future hooks
export function init() {
  // nothing yet — module side-effects already wired handlers
}

init();
