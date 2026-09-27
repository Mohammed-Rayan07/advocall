// Per-language voice + speech-to-text settings. Owner: Rayan.
// ONE table so we can swap a voice live without touching prompts. `npm run voice:check` validates it against Vapi.
import type { Lang } from "@/types";

export interface VapiVoice {
  provider: "11labs" | "azure" | "cartesia" | "playht" | "deepgram" | string;
  voiceId: string;
  model?: "eleven_multilingual_v2" | "eleven_flash_v2_5" | "eleven_turbo_v2_5" | string;
  stability?: number; // 0.0 - 1.0 (default 0.5)
  similarityBoost?: number; // 0.0 - 1.0 (default 0.75 - 0.8)
  style?: number; // 0.0 - 1.0
  useSpeakerBoost?: boolean; // true / false
  speed?: number; // 0.7 - 1.2
  temperature?: number;
}

export interface VapiTranscriber {
  provider: string;
  model?: string;
  language: string;
}

export interface VoiceLanguageConfig {
  voice: VapiVoice;
  transcriber: VapiTranscriber;
}

// -----------------------------------------------------------------------------
// PRESETS: ElevenLabs & Azure
// -----------------------------------------------------------------------------
export const ELEVENLABS_PRESETS: Record<Lang, VapiVoice> = {
  // English: User requested voice ID IYUZs7LoFwd5QZsMgrMU with eleven_turbo_v2_5
  en: {
    provider: "11labs",
    voiceId: "IYUZs7LoFwd5QZsMgrMU",
    model: "eleven_turbo_v2_5",
    stability: 0.5,
    similarityBoost: 0.8,
    useSpeakerBoost: true,
  },
  // Hindi: User requested voice ID K2Byg54sHB1oHegvENtI with eleven_turbo_v2_5
  hi: {
    provider: "11labs",
    voiceId: "K2Byg54sHB1oHegvENtI",
    model: "eleven_turbo_v2_5",
    stability: 0.5,
    similarityBoost: 0.8,
    useSpeakerBoost: true,
  },
  // Kannada: eleven_multilingual_v2 fallback
  kn: {
    provider: "11labs",
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    model: "eleven_multilingual_v2",
    stability: 0.5,
    similarityBoost: 0.8,
    useSpeakerBoost: true,
  },
};

export const AZURE_PRESETS: Record<Lang, VapiVoice> = {
  hi: { provider: "azure", voiceId: "hi-IN-SwaraNeural" },
  en: { provider: "azure", voiceId: "en-IN-NeerjaNeural" },
  kn: { provider: "azure", voiceId: "kn-IN-SapnaNeural" },
};

// -----------------------------------------------------------------------------
// CENTRAL VOICE TABLE
// Easily swap provider, model, and voiceId here, or override via .env.local
// -----------------------------------------------------------------------------
// Default is now ElevenLabs ("11labs"). Set VAPI_VOICE_PROVIDER=azure in .env.local if you ever need Azure.
const envProvider = (process.env.VAPI_VOICE_PROVIDER || "11labs").trim().toLowerCase();
export const ACTIVE_PROVIDER: "11labs" | "azure" = envProvider === "azure" ? "azure" : "11labs";

export function cleanVoice(v: VapiVoice): VapiVoice {
  if (v.provider === "11labs") {
    const res: VapiVoice = {
      provider: "11labs",
      voiceId: v.voiceId,
    };
    if (v.model) res.model = v.model;
    if (typeof v.stability === "number") res.stability = v.stability;
    if (typeof v.similarityBoost === "number") res.similarityBoost = v.similarityBoost;
    if (typeof v.style === "number") res.style = v.style;
    if (typeof v.useSpeakerBoost === "boolean") res.useSpeakerBoost = v.useSpeakerBoost;
    if (typeof v.speed === "number") res.speed = v.speed;
    return res;
  }
  // Azure (and other providers) only accept provider and voiceId in Vapi schema:
  return {
    provider: v.provider,
    voiceId: v.voiceId,
  };
}

export const VOICES: Record<Lang, VoiceLanguageConfig> = {
  // Hindi speakers code-mix English ("UPI", "refund", numbers), so a multilingual model hears Hinglish best.
  hi: {
    voice: cleanVoice({
      provider: process.env.VAPI_VOICE_HI_PROVIDER || (ACTIVE_PROVIDER === "11labs" ? "11labs" : "azure"),
      voiceId: process.env.VAPI_VOICE_HI_VOICE_ID || (ACTIVE_PROVIDER === "11labs" ? ELEVENLABS_PRESETS.hi.voiceId : AZURE_PRESETS.hi.voiceId),
      model: process.env.VAPI_VOICE_HI_MODEL || (ACTIVE_PROVIDER === "11labs" ? ELEVENLABS_PRESETS.hi.model : undefined),
      stability: 0.5,
      similarityBoost: 0.8,
      useSpeakerBoost: true,
    }),
    transcriber: { provider: "deepgram", model: "nova-3", language: "multi" },
  },
  en: {
    voice: cleanVoice({
      provider: process.env.VAPI_VOICE_EN_PROVIDER || (ACTIVE_PROVIDER === "11labs" ? "11labs" : "azure"),
      voiceId: process.env.VAPI_VOICE_EN_VOICE_ID || (ACTIVE_PROVIDER === "11labs" ? ELEVENLABS_PRESETS.en.voiceId : AZURE_PRESETS.en.voiceId),
      model: process.env.VAPI_VOICE_EN_MODEL || (ACTIVE_PROVIDER === "11labs" ? ELEVENLABS_PRESETS.en.model : undefined),
      stability: 0.5,
      similarityBoost: 0.8,
      useSpeakerBoost: true,
    }),
    transcriber: { provider: "deepgram", model: "nova-3", language: "en" },
  },
  kn: {
    voice: cleanVoice({
      provider: process.env.VAPI_VOICE_KN_PROVIDER || (ACTIVE_PROVIDER === "11labs" ? "11labs" : "azure"),
      voiceId: process.env.VAPI_VOICE_KN_VOICE_ID || (ACTIVE_PROVIDER === "11labs" ? ELEVENLABS_PRESETS.kn.voiceId : AZURE_PRESETS.kn.voiceId),
      model: process.env.VAPI_VOICE_KN_MODEL || (ACTIVE_PROVIDER === "11labs" ? ELEVENLABS_PRESETS.kn.model : undefined),
      stability: 0.5,
      similarityBoost: 0.8,
      useSpeakerBoost: true,
    }),
    transcriber: { provider: "azure", language: "kn-IN" },
  },
};

export const LANG_NAME: Record<Lang, string> = { hi: "Hindi", en: "English", kn: "Kannada" };

