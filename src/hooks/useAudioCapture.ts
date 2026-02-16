'use client';

import { useCallback, useRef, useState } from 'react';

interface UseAudioCaptureReturn {
  isCapturing: boolean;
  volume: number;
  silenceWarning: boolean;
  startCapture: (onData: (data: Blob) => void) => Promise<void>;
  stopCapture: () => void;
}

export function useAudioCapture(): UseAudioCaptureReturn {
  const [isCapturing, setIsCapturing] = useState(false);
  const [volume, setVolume] = useState(0);
  const [silenceWarning, setSilenceWarning] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const startCapture = useCallback(async (onData: (data: Blob) => void) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    // Audio analysis for volume meter
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

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

    // MediaRecorder
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/mp4';

    const recorder = new MediaRecorder(stream, { mimeType });
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

    mediaRecorderRef.current = null;
    streamRef.current = null;
    analyserRef.current = null;
    wakeLockRef.current = null;

    setIsCapturing(false);
    setVolume(0);
    setSilenceWarning(false);
  }, []);

  return { isCapturing, volume, silenceWarning, startCapture, stopCapture };
}
