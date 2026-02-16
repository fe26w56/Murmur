'use client';

import { useCallback, useRef, useState } from 'react';

export type AudioCaptureError = 'permission_denied' | 'not_supported' | 'unknown';

interface UseAudioCaptureReturn {
  isCapturing: boolean;
  volume: number;
  silenceWarning: boolean;
  error: AudioCaptureError | null;
  startCapture: (onData: (data: Blob) => void) => Promise<void>;
  stopCapture: () => void;
}

export function useAudioCapture(): UseAudioCaptureReturn {
  const [isCapturing, setIsCapturing] = useState(false);
  const [volume, setVolume] = useState(0);
  const [silenceWarning, setSilenceWarning] = useState(false);
  const [error, setError] = useState<AudioCaptureError | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const startCapture = useCallback(async (onData: (data: Blob) => void) => {
    setError(null);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true, // Boost quiet ambient audio
        },
      });
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('permission_denied');
        } else if (err.name === 'NotFoundError' || err.name === 'NotSupportedError') {
          setError('not_supported');
        } else {
          setError('unknown');
        }
      } else {
        setError('unknown');
      }
      throw err;
    }

    streamRef.current = stream;

    // Audio processing pipeline:
    // source → analyser (volume meter, raw audio)
    // source → gain(3x) → destination → MediaRecorder (amplified for Deepgram)
    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;
    const source = audioCtx.createMediaStreamSource(stream);

    // Volume meter on raw audio
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    // Amplify audio 3x for better ambient speech recognition
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 3.0;
    const destination = audioCtx.createMediaStreamDestination();
    source.connect(gainNode);
    gainNode.connect(destination);

    // Volume monitoring
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const updateVolume = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length;
      const normalized = Math.min(avg / 128, 1);
      setVolume(normalized);

      if (normalized < 0.02) {
        if (!silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => setSilenceWarning(true), 5000);
        }
      } else {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        setSilenceWarning(false);
      }

      animFrameRef.current = requestAnimationFrame(updateVolume);
    };
    updateVolume();

    // MediaRecorder uses amplified stream
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/mp4';

    const recorder = new MediaRecorder(destination.stream, { mimeType });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) onData(e.data);
    };
    recorder.start(250); // 250ms chunks
    mediaRecorderRef.current = recorder;

    // Wake Lock
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch {
      // Wake Lock not available
    }

    setIsCapturing(true);
  }, []);

  const stopCapture = useCallback(() => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    cancelAnimationFrame(animFrameRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    wakeLockRef.current?.release();

    audioCtxRef.current?.close();
    mediaRecorderRef.current = null;
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    wakeLockRef.current = null;

    setIsCapturing(false);
    setVolume(0);
    setSilenceWarning(false);
    setError(null);
  }, []);

  return { isCapturing, volume, silenceWarning, error, startCapture, stopCapture };
}
