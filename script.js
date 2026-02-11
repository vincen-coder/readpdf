

const selectPdfBtn = document.getElementById("selectPdfBtn");
const playPauseBtn = document.getElementById("playPause");
const forwardBtn = document.getElementById("forward");
const backwardBtn = document.getElementById("backward");
const speedSelect = document.getElementById("speed");


let markers = [];              
let currentMarkerIndex = 0;    
let isSpeaking = false;
let currentUtterance = null;


selectPdfBtn.addEventListener("click", async () => {
  try {
    const [handle] = await window.showOpenFilePicker({
      types: [
        {
          description: "PDF Files",
          accept: { "application/pdf": [".pdf"] }
        }
      ]
    });

    const file = await handle.getFile();

    const pages = await extractTextFromPDF(file);

    markers = buildAudioMarkers(pages);
    currentMarkerIndex = 0;

    console.log("PDF loaded:", markers);

    // Auto start reading
    speakCurrentMarker();

  } catch (err) {
    if (err.name === "AbortError") {
      console.log("User cancelled PDF selection");
      return;
    }
    console.error(err);
    alert("Failed to read PDF");
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

