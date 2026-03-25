import { audioState } from "./api";

const TTS_ENDPOINT = "http://localhost:8000/api/tts";

let audioContext = null;
let analyser = null;
let source = null;
let animationFrameId = null;
let currentAudio = null;
let currentObjectUrl = null;
let isActive = false;

// Initialize the Web Audio API context
function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256; 
    analyser.smoothingTimeConstant = 0.5; // Smooths out the mouth jitter
  }
}

// Analyzes the actual sound waves to drive the mouth
function tickAnimation() {
  if (!isActive || !analyser) {
    audioState.targetMouth = 0;
    return;
  }

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);

  // Calculate average volume (0 to 255)
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i];
  }
  let averageVolume = sum / dataArray.length;

  // Map the volume to mouth openness (0.0 to 1.0)
  // Tweak the 50.0 value to make the mouth open wider or less wide
  let mouthOpenness = Math.min(averageVolume / 50.0, 1.0);
  
  // Set a small threshold so background noise doesn't twitch the lips
  if (averageVolume < 2) {
      mouthOpenness = 0;
  }

  audioState.targetMouth = mouthOpenness;

  animationFrameId = requestAnimationFrame(tickAnimation);
}

function stopEngine() {
  isActive = false;
  audioState.targetMouth = 0;
  audioState.isWebSpeech = false;

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function cleanupAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
  if (source) {
    source.disconnect();
    source = null;
  }
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

export function speak(text) {
  return new Promise(async (resolve) => {
    if (!text || typeof window === "undefined") {
      resolve();
      return;
    }

    stopSpeaking();

    try {
      const response = await fetch(TTS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice: "en-IN-PrabhatNeural",
          rate: "+0%",
          volume: "+0%",
        }),
      });

      if (!response.ok) throw new Error("TTS request failed");

      const blob = await response.blob();
      currentObjectUrl = URL.createObjectURL(blob);
      currentAudio = new Audio(currentObjectUrl);
      currentAudio.crossOrigin = "anonymous";

      // Hook the audio up to the Analyzer
      initAudioContext();
      if (audioContext.state === 'suspended') {
          await audioContext.resume();
      }

      source = audioContext.createMediaElementSource(currentAudio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      currentAudio.onplay = () => {
        isActive = true;
        audioState.isWebSpeech = true;
        tickAnimation(); // Start real-time analysis
      };

      currentAudio.onended = () => {
        stopEngine();
        cleanupAudio();
        resolve();
      };

      currentAudio.onerror = () => {
        stopEngine();
        cleanupAudio();
        resolve();
      };

      await currentAudio.play();
    } catch (error) {
      console.error("TTS failed:", error);
      stopEngine();
      cleanupAudio();
      resolve();
    }
  });
}

export function stopSpeaking() {
  stopEngine();
  cleanupAudio();
}

export function isCurrentlySpeaking() {
  return isActive;
}