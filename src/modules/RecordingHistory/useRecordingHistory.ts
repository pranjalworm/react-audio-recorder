import { useState, useEffect, useCallback, useRef } from "react";
import {
  saveRecording,
  listRecordings,
  getRecordingBlob,
  deleteRecording,
  type RecordingMeta,
} from "../../services/RecordingStorageService";

export function useRecordingHistory() {
  const [recordings, setRecordings] = useState<RecordingMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void listRecordings().then((list) => {
      if (!cancelled) {
        setRecordings(list);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const refresh = useCallback(async () => {
    const list = await listRecordings();
    setRecordings(list);
  }, []);

  const save = useCallback(
    async (blob: Blob, durationMs: number) => {
      await saveRecording(blob, durationMs);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteRecording(id);
      await refresh();
    },
    [refresh],
  );

  const getPlaybackUrl = useCallback(
    async (id: string): Promise<string | undefined> => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      const blob = await getRecordingBlob(id);
      if (!blob) return undefined;
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      return url;
    },
    [],
  );

  return { recordings, loading, save, remove, getPlaybackUrl };
}
