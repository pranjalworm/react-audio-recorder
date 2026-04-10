# Amae

A browser-based audio recording PWA built with React, TypeScript, and Vite. Records audio directly to MP3 in real time, persists recordings in IndexedDB, and supports playback, download, and mock transcription.

## Quick start

```bash
make install   # install dependencies (requires pnpm)
make dev       # start dev server on http://localhost:5173
```

Or without Make:

```bash
pnpm install
pnpm dev
```

## Architecture

```
src/
├── common/
│   └── utils.ts                         # formatTime, formatFileSize helpers
├── components/
│   ├── Button/Button.tsx                # Reusable button with semantic variants
│   ├── Header/Header.tsx                # Branding / app title
│   └── Tabs/Tabs.tsx                    # Tabbed navigation component
├── modules/
│   ├── About/About.tsx                  # Overview tab content
│   ├── Recorder/
│   │   ├── Recorder.tsx                 # Recording UI — controls, timer, download
│   │   └── useRecorder.ts              # Hook: wavesurfer.js + mp3-mediarecorder
│   └── RecordingHistory/
│       ├── RecordingHistory.tsx          # Recording list with play/download/transcribe/delete
│       └── useRecordingHistory.ts        # Hook: recording list state + IndexedDB ops
├── services/
│   ├── RecordingStorageService.ts        # IndexedDB via idb (two-store schema)
│   └── TranscriptionService.ts          # Mock transcription endpoint
├── App.tsx
├── main.tsx
└── index.css
public/
├── mp3-worker.js                        # WASM worker for real-time MP3 encoding
├── vmsg.wasm                            # LAME encoder compiled to WebAssembly
└── icon.svg                             # App icon
```

## Scripts

| Command | Description |
|---------|-------------|
| `make install` | Install dependencies |
| `make dev` | Start dev server |
| `make build` | Production build |
| `make preview` | Build + preview production bundle |
| `pnpm lint` | Run ESLint |
