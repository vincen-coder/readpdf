// playerController.js
// Responsibility: manage playback state (markers, current index), persistence, and orchestration
import { createUtterance, ensureVoicesLoaded, getBestEnglishVoice, speakUtterance } from './speechService.js';
import { renderSentences, highlightSentence, updateProgressUI, setSelectButtonState, showMessage } from './uiController.js';

const STORAGE_KEY = 'readPdf-currentIndex';

let markers = [];
let currentIndex = 0;
let isSpeaking = false;
let pauseBetweenMs = 200; // 200ms pause

function savePosition() {
  try { localStorage.setItem(STORAGE_KEY, String(currentIndex)); } catch (e) { }
}

function loadPosition() {
  try { const v = localStorage.getItem(STORAGE_KEY); const n = parseInt(v, 10); return Number.isNaN(n) ? 0 : Math.max(0, n); } catch (e) { return 0; }
}

export function loadMarkersFromSentences(sentences) {
  // build marker objects
  markers = sentences.map(s => ({ text: s.trim() })).filter(m => m.text.length);
  renderSentences(sentences);
  // restore saved position
  const saved = loadPosition();
  currentIndex = Math.min(saved, Math.max(0, markers.length - 1));
  updateProgress();
}

export function getTotal() { return markers.length; }
export function getCurrentIndex() { return currentIndex; }

// Return whether we have any content loaded to speak
export function hasContent() { return markers && markers.length > 0; }

function updateProgress() {
  const total = markers.length;
  const completed = Math.min(currentIndex, total);
  const percent = total ? (completed / total) * 100 : 0;
  // estimate words remaining
  const wordsPerMinute = 150;
  const wordsPerSecond = wordsPerMinute / 60;
  const wordsRemaining = markers.slice(currentIndex).reduce((s,m) => s + (m.text ? m.text.split(/\s+/).filter(Boolean).length : 0), 0);
  const secondsRemaining = wordsRemaining / wordsPerSecond;
  updateProgressUI(percent, formatSeconds(secondsRemaining), Math.round(percent) + '%');
}

function formatSeconds(sec) {
  if (!sec || sec <= 0) return 'Done';
  const mins = Math.floor(sec / 60); const s = Math.round(sec % 60).toString().padStart(2,'0'); return `${mins}:${s} remaining`;
}

export function setIndex(idx) {
  const max = Math.max(0, markers.length - 1);
  const clamped = Math.min(Math.max(0, Math.floor(idx)), max);
  currentIndex = clamped;
  savePosition();
  updateProgress();
  highlightSentence(currentIndex);
}

export async function speakCurrent(speedMultiplier = 1) {
  if (!markers[currentIndex]) { isSpeaking = false; return; }
  if (!('speechSynthesis' in window)) { showMessage('error', 'Speech synthesis not supported'); return; }

  // cancel any previous and prepare utterance
  speechSynthesis.cancel();
  await ensureVoicesLoaded();
  const voice = getBestEnglishVoice();
  const baseRate = 0.95;
  const utter = createUtterance(markers[currentIndex].text, baseRate * (speedMultiplier || 1), voice);

  utter.onstart = () => {
    isSpeaking = true;
    setSelectButtonState('success');
  };

  utter.onend = () => {
    isSpeaking = false;
    // advance after a short pause
    setTimeout(() => {
      setIndex(currentIndex + 1);
      // auto-continue if there are more markers
      if (markers[currentIndex]) speakCurrent(speedMultiplier);
    }, pauseBetweenMs);
  };

  utter.onerror = (e) => {
    console.error('Speech error', e);
    showMessage('error', 'Speech playback error');
    isSpeaking = false;
  };

  highlightSentence(currentIndex);
  speakUtterance(utter);
}

export function pause() { if (speechSynthesis.speaking && !speechSynthesis.paused) speechSynthesis.pause(); }
export function resume() { if (speechSynthesis.paused) speechSynthesis.resume(); }
export function stop() { speechSynthesis.cancel(); setIndex(0); }

export function next() { speechSynthesis.cancel(); setIndex(currentIndex + 1); speakCurrent(); }
export function prev() { speechSynthesis.cancel(); setIndex(Math.max(0, currentIndex - 1)); speakCurrent(); }

export function seekToPercent(percent) {
  const total = markers.length || 0; if (!total) return;
  let idx = Math.floor((percent / 100) * total); if (idx >= total) idx = total - 1; if (idx < 0) idx = 0;
  speechSynthesis.cancel(); setIndex(idx); speakCurrent();
}
