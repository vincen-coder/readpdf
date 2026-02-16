// uiController.js
// Responsibility: DOM reads/writes and small UI helpers (progress, messages, rendering sentences)

// Cache DOM elements
const el = {
  selectPdfBtn: document.getElementById('selectPdfBtn'),
  fileInput: document.getElementById('fileInput'),
  playPauseBtn: document.getElementById('playPause'),
  stopBtn: document.getElementById('stopBtn'),
  forwardBtn: document.getElementById('forward'),
  backwardBtn: document.getElementById('backward'),
  speedSelect: document.getElementById('speed'),
  progressBar: document.getElementById('progressBar'),
  progressText: document.getElementById('progressText'),
  etaText: document.getElementById('etaText'),
  seekSlider: document.getElementById('seekSlider'),
  sentencesContainer: document.getElementById('sentencesContainer'),
  messageBox: document.getElementById('messageBox'),
  menuBtn: document.getElementById('menuBtn'),
  mobileMenu: document.getElementById('mobileMenu')
};

export { el };

export function renderSentences(sentences) {
  if (!el.sentencesContainer) return;
  el.sentencesContainer.innerHTML = '';
  sentences.forEach((s, i) => {
    const d = document.createElement('div');
    d.className = 'sentence';
    d.dataset.idx = i;
    d.textContent = s;
    el.sentencesContainer.appendChild(d);
  });
}

export function highlightSentence(idx) {
  if (!el.sentencesContainer) return;
  const prev = el.sentencesContainer.querySelector('.current-sentence');
  if (prev) prev.classList.remove('current-sentence');
  const cur = el.sentencesContainer.querySelector(`[data-idx="${idx}"]`);
  if (cur) {
    cur.classList.add('current-sentence');
    cur.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

export function setSelectButtonState(state) {
  const btn = el.selectPdfBtn;
  if (!btn) return;
  if (state === 'loading') {
    btn.disabled = true;
    btn.innerHTML = '<span><svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>Generating voice</span>';
    return;
  }
  if (state === 'success') {
    btn.disabled = true;
    btn.innerHTML = '<span class="flex gap-2"><svg class="w-4 h-4 mr-2 " xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8z" clip-rule="evenodd"/></svg>Voice Genarated</span>';
    return;
  }
  btn.disabled = false;
  btn.innerHTML = 'Select File';
}

export function updateProgressUI(percent, etaText, percentText) {
  if (el.progressBar) el.progressBar.style.width = percent + '%';
  if (el.progressText) el.progressText.textContent = percentText || Math.round(percent) + '%';
  if (el.etaText) el.etaText.textContent = etaText || '';
  if (el.seekSlider && document.activeElement !== el.seekSlider) el.seekSlider.value = percent;
}

export function showMessage(type, text, timeout = 5000) {
  if (!el.messageBox) {
    try { alert(text); } catch (e) {}
    return;
  }
  const map = {
    error: 'bg-red-100 text-red-800 border border-red-200 px-3 py-2 rounded',
    success: 'bg-green-100 text-green-800 border border-green-200 px-3 py-2 rounded',
    info: 'bg-gray-100 text-gray-800 border border-gray-200 px-3 py-2 rounded'
  };
  el.messageBox.className = map[type] || map.info;
  el.messageBox.textContent = text;
  if (timeout > 0) setTimeout(() => { el.messageBox.textContent = ''; el.messageBox.className = ''; }, timeout);
}
