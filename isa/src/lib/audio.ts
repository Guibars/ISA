import { ai, SYSTEM_INSTRUCTION } from './gemini';
import { Modality, LiveServerMessage } from '@google/genai';

let audioContext: AudioContext | null = null;
let mediaStream: MediaStream | null = null;
let scriptProcessor: ScriptProcessorNode | null = null;
let source: MediaStreamAudioSourceNode | null = null;
let currentSessionPromise: any = null;

// Audio playback queue
let audioQueue: Float32Array[] = [];
let isPlaying = false;

function pcmToFloat32(data: string): Float32Array {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }
  return float32Array;
}

async function playQueue() {
  if (isPlaying || audioQueue.length === 0 || !audioContext) return;
  isPlaying = true;

  const data = audioQueue.shift()!;
  const buffer = audioContext.createBuffer(1, data.length, 24000);
  buffer.getChannelData(0).set(data);

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);

  source.onended = () => {
    isPlaying = false;
    playQueue();
  };

  source.start();
}

function stopPlayback() {
  audioQueue = [];
  isPlaying = false;
}

export async function startLiveSession(
  onSpeakStatusChanged: (isSpeaking: boolean) => void,
  onServerMessage: (text: string) => void
) {
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    source = audioContext.createMediaStreamSource(mediaStream);
    scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
    
    currentSessionPromise = ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: SYSTEM_INSTRUCTION,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } }
        }
      },
      callbacks: {
        onopen: () => {
          // Connected
          console.log("Live API connected");
        },
        onmessage: (message: LiveServerMessage) => {
          const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64Audio) {
             const float32Data = pcmToFloat32(base64Audio);
             audioQueue.push(float32Data);
             playQueue();
             onSpeakStatusChanged(true);
          }

          if (message.serverContent?.interrupted) {
             stopPlayback();
             onSpeakStatusChanged(false);
          }
        },
        onclose: () => {
           console.log("Live API closed");
           onSpeakStatusChanged(false);
        }
      }
    });

    const session = await currentSessionPromise;

    scriptProcessor.onaudioprocess = (e) => {
      const channelData = e.inputBuffer.getChannelData(0);
      const pcm16 = new Int16Array(channelData.length);
      for (let i = 0; i < channelData.length; i++) {
        let s = Math.max(-1, Math.min(1, channelData[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      
      const uint8Array = new Uint8Array(pcm16.buffer);
      let binary = '';
      for (let i = 0; i < uint8Array.byteLength; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64Audio = btoa(binary);

      session.sendRealtimeInput({
        audio: { data: base64Audio, mimeType: 'audio/pcm;rate=16000' }
      });
    };

    source.connect(scriptProcessor);
    scriptProcessor.connect(audioContext.destination);
    
  } catch (error) {
    console.error("Error starting live session", error);
  }
}

export function endLiveSession() {
  if (scriptProcessor) scriptProcessor.disconnect();
  if (source) source.disconnect();
  if (mediaStream) mediaStream.getTracks().forEach(t => t.stop());
  if (audioContext && audioContext.state !== 'closed') audioContext.close();
  
  stopPlayback();
  
  if (currentSessionPromise) {
    currentSessionPromise.then((session: any) => session.close());
    currentSessionPromise = null;
  }
}
