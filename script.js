

const selectPdfBtn = document.getElementById("selectPdfBtn");
const playPauseBtn = document.getElementById("playPause");
const forwardBtn = document.getElementById("forward");
const backwardBtn = document.getElementById("backward");
const speedSelect = document.getElementById("speed");


let markers = [];              
let currentMarkerIndex = 0;    
let isSpeaking = false;
let currentUtterance = null;
let buttonResetTimeout = null;

function setSelectButtonState(state) {
  // clear pending reset
  if (buttonResetTimeout) {
    clearTimeout(buttonResetTimeout);
    buttonResetTimeout = null;
  }

  if (state === 'loading') {
    selectPdfBtn.disabled = true;
    selectPdfBtn.innerHTML = '<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white flex" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>Generating voice';
    return;
  }

  if (state === 'success') {
    selectPdfBtn.disabled = true;
    selectPdfBtn.innerHTML = '<svg class="w-4 h-4 mr-2 flex " xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8z" clip-rule="evenodd"/></svg>Voice generated';
    // reset after 3s
    buttonResetTimeout = setTimeout(() => {
      setSelectButtonState('default');
      buttonResetTimeout = null;
    }, 3000);
    return;
  }

  // default
  selectPdfBtn.disabled = false;
  selectPdfBtn.innerHTML = 'Select File';
}


const fileInput = document.getElementById("fileInput");

selectPdfBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  try {
    // show loading state while we extract and prepare speech
    setSelectButtonState('loading');

    const pages = await extractTextFromPDF(file);

    markers = buildAudioMarkers(pages);
    currentMarkerIndex = 0;

    console.log("PDF loaded:", markers);

    // Auto start reading
    speakCurrentMarker();
  } catch (err) {
    console.error(err);
    alert("Failed to read PDF");
    setSelectButtonState('default');
  } finally {
    // allow selecting the same file again
    fileInput.value = "";
  }
});


function speakCurrentMarker() {
  if (!markers[currentMarkerIndex]) {
    isSpeaking = false;
    playPauseBtn.textContent = "Play";
    console.log("End of document");
    return;
  }

  if (!("speechSynthesis" in window)) {
    alert("Speech not supported in this browser");
    return;
  }

  // Always stop previous speech
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(
    markers[currentMarkerIndex].text
  );

  utterance.rate = Number(speedSelect.value);
  currentUtterance = utterance;

  utterance.onstart = () => {
    isSpeaking = true;
    playPauseBtn.textContent = "Pause";
    console.log("Speaking marker", currentMarkerIndex);
    // speech has started — show success state briefly
    setSelectButtonState('success');
  };

  utterance.onend = () => {
    isSpeaking = false;
    currentMarkerIndex++;       // 🔑 THIS is the “sync”
    speakCurrentMarker();       // auto-continue
  };

  utterance.onerror = (e) => {
    console.error("Speech error", e);
    isSpeaking = false;
    playPauseBtn.textContent = "Play";
  };

  speechSynthesis.speak(utterance);
}


playPauseBtn.addEventListener("click", () => {
  if (!markers.length) return;

  if (isSpeaking) {
    speechSynthesis.pause();
    playPauseBtn.textContent = "Play";
    isSpeaking = false;
  } else {
    speechSynthesis.resume();
    playPauseBtn.textContent = "Pause";
    isSpeaking = true;
  }
});

forwardBtn.addEventListener("click", () => {
  if (!markers.length) return;

  speechSynthesis.cancel();
  currentMarkerIndex++;
  speakCurrentMarker();
});

backwardBtn.addEventListener("click", () => {
  if (!markers.length) return;

  speechSynthesis.cancel();
  currentMarkerIndex = Math.max(0, currentMarkerIndex - 1);
  speakCurrentMarker();
});

speedSelect.addEventListener("change", () => {
  if (!isSpeaking) return;

  // Restart current marker at new speed
  speechSynthesis.cancel();
  speakCurrentMarker();
});

// ================================
// PDF TEXT EXTRACTION
// ================================
async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const pages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map(item => item.str).join(" ");
    pages.push(text);
  }

  return pages;
}


function buildAudioMarkers(pages) {
  return pages.map(text => ({ text }));
}

const menuBtn = document.getElementById("menuBtn");
        const mobileMenu = document.getElementById("mobileMenu");
        const lines = document.querySelectorAll(".line");
        const mobileLinks = document.querySelectorAll(".mobileLink");
        let menuOpen = false;

        menuBtn.addEventListener("click", () => {
            menuOpen = !menuOpen;
            if (menuOpen) {
                mobileMenu.classList.remove("-translate-y-full");
                // Animate hamburger lines
                lines[0].classList.add("rotate-45", "translate-y-2");
                lines[1].classList.add("opacity-0");
                lines[2].classList.add("-rotate-45", "-translate-y-2");
            } else {
                closeMenu();
            }
        });

        function closeMenu() {
            mobileMenu.classList.add("-translate-y-full");
            lines[0].classList.remove("rotate-45", "translate-y-2");
            lines[1].classList.remove("opacity-0");
            lines[2].classList.remove("-rotate-45", "-translate-y-2");
            menuOpen = false;
        }

        mobileLinks.forEach(link => link.addEventListener("click", closeMenu));

