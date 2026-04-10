import { useRef, useState } from "react";
import type { RecordingMeta } from "../../services/RecordingStorageService";
import { mockTranscribe } from "../../services/TranscriptionService";
import Button from "../../components/Button/Button";
import { formatTime, formatFileSize } from "../../common/utils";
import { Play, Pause, Download, FileText, Trash2, Loader } from "lucide-react";

interface RecordingHistoryProps {
  recordings: RecordingMeta[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
  onGetPlaybackUrl: (id: string) => Promise<string | undefined>;
}

function RecordingHistory({
  recordings,
  loading,
  onDelete,
  onGetPlaybackUrl,
}: RecordingHistoryProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcripts, setTranscripts] = useState<Record<string, string>>({});
  const [transcribingId, setTranscribingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function handlePlay(id: string) {
    if (activeId === id && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
    }

    const url = await onGetPlaybackUrl(id);
    if (!url) return;

    const audio = new Audio(url);
    audio.onended = () => setIsPlaying(false);
    audioRef.current = audio;
    setActiveId(id);
    await audio.play();
    setIsPlaying(true);
  }

  async function handleDownload(id: string, name: string) {
    const url = await onGetPlaybackUrl(id);
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.mp3`;
    a.click();
  }

  async function handleTranscribe(id: string) {
    setTranscribingId(id);
    try {
      const url = await onGetPlaybackUrl(id);
      if (!url) return;
      const text = await mockTranscribe(new Blob());
      setTranscripts((prev) => ({ ...prev, [id]: text }));
    } finally {
      setTranscribingId(null);
    }
  }

  if (loading) {
    return (
      <div className="text-center text-slate-400 text-sm">
        Loading recordings...
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="text-center text-slate-400 text-sm">
        No recordings yet. Hit Record to get started.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {recordings.map((rec) => (
        <li
          key={rec.id}
          className={`rounded-lg border p-4 ${
            activeId === rec.id
              ? "border-blue-300 bg-blue-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {rec.name}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {formatTime(rec.durationMs)} &middot; {formatFileSize(rec.size)}
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              <Button onClick={() => void handlePlay(rec.id)} variant="resume">
                {activeId === rec.id && isPlaying ? (
                  <Pause size={16} />
                ) : (
                  <Play size={16} />
                )}
              </Button>
              <Button onClick={() => void handleDownload(rec.id, rec.name)} variant="primary">
                <Download size={16} />
              </Button>
              <Button
                onClick={() => void handleTranscribe(rec.id)}
                disabled={transcribingId === rec.id}
                variant="transcribe"
              >
                {transcribingId === rec.id ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <FileText size={16} />
                )}
              </Button>
              <Button
                onClick={() => void onDelete(rec.id)}
                variant="danger"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>

          {transcripts[rec.id] && (
            <div className="mt-3 bg-blue-50 rounded-lg p-3 text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">
              <h4 className="font-semibold mb-1 text-slate-800">
                Transcription
              </h4>
              {transcripts[rec.id]}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default RecordingHistory;
