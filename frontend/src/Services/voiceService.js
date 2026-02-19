// src/services/voiceService.js
import axios from "axios";

const ELEVENLABS_KEY = import.meta.env.VITE_ELEVENLABS_KEY || "";
const VOICE_ID = import.meta.env.VITE_ELEVEN_VOICE_ID || "pNInz6obpgDQGcFmaJgB"; // "Adam" - Deep Male

// Helper: Pauses execution to simulate taking a breath
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Generates slight random variations for pitch and rate
const randomize = (base, variance) => base + (Math.random() * variance * 2 - variance);

/**
 * 1. CLOUD AI VOICE (The only true human-sounding option)
 */
async function elevenSpeak(text) {
  if (!ELEVENLABS_KEY) throw new Error("Missing API Key");
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

  const payload = {
    text: text,
    model_id: "eleven_turbo_v2_5", // Use turbo for best conversational pacing
    voice_settings: { stability: 0.35, similarity_boost: 0.8 }
  };

  const resp = await axios.post(url, payload, {
    headers: { "xi-api-key": ELEVENLABS_KEY, "Content-Type": "application/json" },
    responseType: "arraybuffer",
    timeout: 15000
  });

  const blob = new Blob([resp.data], { type: "audio/mpeg" });
  const audio = new Audio(URL.createObjectURL(blob));
  
  return new Promise((resolve) => {
    audio.onended = resolve;
    audio.play();
  });
}

/**
 * 2. ADVANCED BROWSER MODULATION ALGORITHM
 * Hunts for the best male voice, splits text into clauses, and manipulates 
 * the pitch/rate dynamically to fight the "flat" robotic sound.
 */
function getBestMaleVoice() {
  const voices = window.speechSynthesis.getVoices();
  
  // Strict priority for Neural/High-Quality OS voices
  const premiumMaleVoices = [
    "Microsoft Christopher Online (Natural) - English (United States)",
    "Microsoft Guy Online (Natural) - English (United States)",
    "Microsoft Eric Online (Natural) - English (United States)",
    "Google UK English Male",
    "Alex", 
    "Daniel"
  ];

  for (const name of premiumMaleVoices) {
    const found = voices.find(v => v.name.includes(name) || v.name === name);
    if (found) return found;
  }

  // Generic fallback
  return voices.find(v => /en-?/.test(v.lang) && /male|boy|man/i.test(v.name)) || voices[0];
}

async function advancedBrowserSpeak(text) {
  return new Promise(async (resolve) => {
    if (!("speechSynthesis" in window)) return resolve();
    window.speechSynthesis.cancel(); // Clear queue

    const voice = getBestMaleVoice();

    // CHUNKING: Split the text by natural sentence boundaries and pauses
    // Matches sentences ending in . ! ? or pausing at , ; :
    const phraseRegex = /([^.,!?:;]+[.,!?:;]*)/g;
    const phrases = text.match(phraseRegex) || [text];

    for (let i = 0; i < phrases.length; i++) {
      const phrase = phrases[i].trim();
      if (!phrase) continue;

      await new Promise((phraseResolve) => {
        const u = new SpeechSynthesisUtterance(phrase);
        if (voice) u.voice = voice;

        // MODULATION: Base calm male settings
        let targetPitch = 0.90;
        let targetRate = 0.90;

        // Apply slight randomization so it doesn't sound completely static
        u.rate = randomize(targetRate, 0.02);

        // Prosody adjustments based on punctuation
        if (phrase.endsWith("?")) {
          // Questions usually end with an upward inflection
          u.pitch = randomize(1.05, 0.03); 
        } else if (phrase.endsWith(".") || phrase.endsWith("!")) {
          // Statements often drop in pitch at the end
          u.pitch = randomize(0.85, 0.02);
        } else {
          // Mid-sentence clauses remain steady
          u.pitch = randomize(targetPitch, 0.02);
        }

        u.volume = 1.0;
        u.onend = () => phraseResolve();
        u.onerror = () => phraseResolve(); // Prevent hanging on error

        window.speechSynthesis.speak(u);
      });

      // SIMULATED BREATHING: Inject physical time delays between phrases
      if (phrase.endsWith(".") || phrase.endsWith("!") || phrase.endsWith("?")) {
        await sleep(500); // Deep breath between full sentences
      } else if (phrase.endsWith(",") || phrase.endsWith(";") || phrase.endsWith(":")) {
        await sleep(200); // Quick breath for commas
      }
    }

    resolve();
  });
}

/**
 * 3. PUBLIC EXPORT
 */
export async function speak(text) {
  if (!text) return;
  
  try {
    console.log("Attempting ElevenLabs Cloud Voice...");
    await elevenSpeak(text);
  } catch (error) {
    console.error("🔴 ElevenLabs Failed (Check API Key). Triggering local modulation engine.");
    
    // Wait for voices to load if it's the first time
    if (window.speechSynthesis.getVoices().length > 0) {
      await advancedBrowserSpeak(text);
    } else {
      window.speechSynthesis.onvoiceschanged = async () => {
        window.speechSynthesis.onvoiceschanged = null;
        await advancedBrowserSpeak(text);
      };
    }
  }
}