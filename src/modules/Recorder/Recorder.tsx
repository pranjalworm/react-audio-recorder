import { useRef } from "react";
import { useRecorder } from "./useRecorder";
import Button from "../../components/Button/Button";
import { formatTime } from "../../common/utils";
import { Mic, Pause, Play, Square, Download } from "lucide-react";

interface RecorderProps {
  onRecordingComplete?: (blob: Blob, durationMs: number) => void;
}

function Recorder({ onRecordingComplete }: RecorderProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const { status, elapsedMs, audioBlob, error, start, pause, resume, stop } =
    useRecorder(waveformRef, onRecordingComplete);

  function handleDownload() {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recording-${Date.now()}.mp3`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const isIdle = status === "idle" || status === "stopped";

  return (
    <div className="flex flex-col items-center gap-6">
      <div ref={waveformRef} className="w-full max-w-2xl overflow-hidden" />

      <div className="font-mono text-4xl tabular-nums text-slate-800">
        {formatTime(elapsedMs)}
      </div>

      <div className="flex items-center gap-4">
        {isIdle ? (
          <Button onClick={() => void start()} variant="record">
            <Mic size={18} />
            Record
          </Button>
        ) : (
          <>
            {status === "recording" ? (
              <Button onClick={pause} variant="pause">
                <Pause size={18} />
                Pause
              </Button>
            ) : (
              <Button onClick={resume} variant="resume">
                <Play size={18} />
                Resume
              </Button>
            )}
            <Button onClick={stop} variant="stop">
              <Square size={18} />
              Stop
            </Button>
          </>
        )}
      </div>

      {error && (
        <div className="max-w-md text-center bg-rose-50 text-rose-700 border border-rose-200 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {audioBlob && status === "stopped" && (
        <Button onClick={handleDownload}>
          <Download size={18} />
          Download MP3
        </Button>
      )}
    </div>
  );
}

export default Recorder;
