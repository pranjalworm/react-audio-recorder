import { useState, useRef, useCallback, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";
import { Mp3MediaRecorder } from "mp3-mediarecorder";

export type RecorderStatus = "idle" | "recording" | "paused" | "stopped";

const MAX_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours

export function useRecorder(
  containerRef: React.RefObject<HTMLDivElement | null>,
  onRecordingComplete?: (blob: Blob, durationMs: number) => void,
) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WaveSurfer | null>(null);
  const recRef = useRef<RecordPlugin | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const record = RecordPlugin.create({
      scrollingWaveform: true,
      scrollingWaveformWindow: 5,
      renderRecordedAudio: false,
    });

    const ws = WaveSurfer.create({
      container,
      waveColor: "#93c5fd",
      progressColor: "#60a5fa",
      height: 160,
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      plugins: [record],
    });

    record.on("record-progress", (time: number) => {
      setElapsedMs(time);
      elapsedRef.current = time;
    });

    record.on("record-end", (blob: Blob) => {
      setAudioBlob(blob);
      setStatus("stopped");
      onRecordingComplete?.(blob, elapsedRef.current);
      setElapsedMs(0);
      elapsedRef.current = 0;
    });

    record.on("record-pause", () => {
      setStatus("paused");
    });

    record.on("record-resume", () => {
      setStatus("recording");
    });

    wsRef.current = ws;
    recRef.current = record;

    return () => {
      ws.destroy();
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [containerRef, onRecordingComplete]);

  const start = useCallback(async () => {
    const rec = recRef.current;
    if (!rec) return;

    setAudioBlob(null);
    setElapsedMs(0);
    setError(null);
    elapsedRef.current = 0;

    let stream: MediaStream;
    try {
      stream = await rec.startMic();
    } catch {
      setError(
        "Microphone access is required to record audio. Please allow microphone access in your browser settings and try again.",
      );
      return;
    }

    workerRef.current ??= new Worker("/mp3-worker.js");

    const mp3Recorder = new Mp3MediaRecorder(stream, {
      worker: workerRef.current,
    });

    // Inject our MP3 recorder into the Record plugin's private mediaRecorder property
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
    (rec as any).mediaRecorder = mp3Recorder;

    await rec.startRecording();
    setStatus("recording");
  }, []);

  const pause = useCallback(() => {
    recRef.current?.pauseRecording();
  }, []);

  const resume = useCallback(() => {
    recRef.current?.resumeRecording();
  }, []);

  const stop = useCallback(() => {
    if (recRef.current?.isRecording() || recRef.current?.isPaused()) {
      recRef.current.stopRecording();
    }
  }, []);

  // auto-stop at 4-hour cap
  useEffect(() => {
    if (elapsedMs >= MAX_DURATION_MS && status === "recording") {
      stop();
    }
  }, [elapsedMs, status, stop]);

  // save recording if user closes the tab or navigates away mid-recording
  useEffect(() => {
    if (status !== "recording" && status !== "paused") return;

    const handleBeforeUnload = () => {
      stop();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [status, stop]);

  return { status, elapsedMs, audioBlob, error, start, pause, resume, stop };
}
