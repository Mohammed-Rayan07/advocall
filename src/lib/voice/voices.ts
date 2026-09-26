// Per-language voice + speech-to-text settings. Owner: Rayan.
// ONE table so we can swap a voice live without touching prompts. `npm run voice:check` validates it against Vapi.
import type { Lang } from "@/types";

export interface VapiVoice {
  provider: string;
  voiceId: string;
}

export interface VapiTranscriber {
  provider: string;
  model?: string;
  language: string;
}

export const VOICES: Record<Lang, { voice: VapiVoice; transcriber: VapiTranscriber }> = {
  // Hindi speakers code-mix English ("UPI", "refund", numbers), so a multilingual model hears Hinglish best.
  hi: {
    voice: { provider: "azure", voiceId: "hi-IN-SwaraNeural" },
    transcriber: { provider: "deepgram", model: "nova-3", language: "multi" },
  },
  en: {
    voice: { provider: "azure", voiceId: "en-IN-NeerjaNeural" },
    transcriber: { provider: "deepgram", model: "nova-3", language: "en" },
  },
  kn: {
    voice: { provider: "azure", voiceId: "kn-IN-SapnaNeural" },
    transcriber: { provider: "azure", language: "kn-IN" },
  },
};

export const LANG_NAME: Record<Lang, string> = { hi: "Hindi", en: "English", kn: "Kannada" };
