// speechService.js
// Responsibility: provide small helpers around SpeechSynthesis (voice loading, selection, utterance creation)

export function ensureVoicesLoaded() {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length) return resolve(voices);
    speechSynthesis.onvoiceschanged = () => resolve(speechSynthesis.getVoices());
  });
}

export function getBestEnglishVoice() {
  const voices = speechSynthesis.getVoices();
  if (!voices || !voices.length) return null;
  let v = voices.find(x => x.lang && x.lang.toLowerCase().startsWith('en-us'));
  if (v) return v;
  v = voices.find(x => x.lang && x.lang.toLowerCase().startsWith('en'));
  if (v) return v;
  return voices[0];
}

export function createUtterance(text, rate = 0.95, voice = null) {
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate;
  if (voice) u.voice = voice;
  return u;
}

export function speakUtterance(utterance) {
  speechSynthesis.speak(utterance);
}
