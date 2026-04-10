function About() {
  return (
    <div className="max-w-2xl mx-auto text-slate-800 text-sm leading-relaxed">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Overview</h2>
      <p>
        Hey there Maqsood and Manuel! First off, irrespective of whatever the
        result turns out to be I'm glad I got to work on this project. This was
        my first time working with Audio based technologies and APIs and I
        learned a lot while developing this app.
      </p>

      <p className="mt-4">
        I have named the application&nbsp;
        <a
          className="text-blue-400 hover:text-blue-800"
          href="https://www.google.com/search?q=amae+meaning+in+japanese&oq=amae+meaning"
          target="_blank"
        >
          Amae
        </a>
        , which is the Japanese concept of "permissible dependence"—the profound
        sense of trust that allows one to feel safe, vulnerable, and
        unconditionally supported; seemed apt for the usecase :)
      </p>

      <p className="mt-4">
        The app allows users to record audio sessions (in the Record tab) and
        listen to them later (in the Recordings tab). It's a Progressive Web
        App, which enables the user to install it locally for offline use and
        gives a native-like experience.
      </p>

      <h3 className="text-base font-semibold text-slate-800 mt-6 mb-2">
        Technologies Used
      </h3>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <span className="font-semibold">Wavesurfer.js</span>: For real-time
          waveform visualisation during recording.
        </li>
        <li>
          <span className="font-semibold">Mp3MediaRecorder</span>: A
          MediaRecorder ponyfill that encodes audio directly to MP3 in real time
          using a WebAssembly-compiled LAME encoder running in a Web Worker.
          This eliminates the need for post-recording format conversion; so when
          the user clicks "Stop", the MP3 is already complete.
        </li>
        <li>
          <span className="font-semibold">IndexedDB (via idb)</span>: Persistent
          storage using a two-store schema: one for lightweight metadata (name,
          duration, size) and one for audio blobs. Listing recordings only reads
          metadata, keeping the UI fast regardless of how many or how large the
          recordings are.
        </li>
        <li>
          <span className="font-semibold">Workbox (via vite-plugin-pwa)</span>:
          Generates the service worker and web manifest at build time. Precaches
          all assets including the WASM encoder for offline use.
        </li>
        <li>
          <span className="font-semibold">Lucide React</span>: Lightweight,
          tree-shakeable icon library for the UI controls.
        </li>
      </ul>

      <h3 className="text-base font-semibold text-slate-800 mt-6 mb-2">
        Recording Pipeline
      </h3>
      <p>
        The recording pipeline flows: Microphone → Mp3MediaRecorder (captures
        PCM via ScriptProcessorNode) → WASM Worker (encodes to MP3 via LAME in
        real time) → MP3 Blob on stop → auto-saved to IndexedDB. A{" "}
        <code className="text-xs bg-slate-100">beforeunload</code> handler
        ensures recordings are saved even if the user accidentally closes the
        tab.
      </p>

      <h3 className="text-base font-semibold text-slate-800 mt-6 mb-2">
        Key Design Decisions & Tradeoffs
      </h3>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <span className="font-semibold">
            Real-time MP3 encoding vs post-recording conversion
          </span>{" "}
          : My first approach used lamejs to convert WebM→MP3 after recording.
          This caused a huge memory spike and also while downloading the mp3
          file the user had to wait a bit while the audio file was being
          processed. Switching to mp3-mediarecorder dropped peak memory to ~370
          MB and made export instant.
        </li>
        <li>
          <span className="font-semibold">
            Injecting into wavesurfer's private API
          </span>{" "}
          : The Record plugin doesn't expose a way to swap the MediaRecorder. I
          read the source, found it checks{" "}
          <code className="text-xs bg-slate-100">this.mediaRecorder</code>{" "}
          before creating a native one, and inject the Mp3MediaRecorder there.
          Fragile but effective.
        </li>
        <li>
          <span className="font-semibold">Two-store IndexedDB schema</span> :
          Metadata and blobs in separate stores so listing never loads audio
          data into memory.
        </li>
      </ul>

      <h3 className="text-base font-semibold text-slate-800 mt-6 mb-2">
        Assumptions & Limitations
      </h3>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          Transcription uses a mock API returning canned text. In production,
          this would proxy to Whisper or Google Speech-to-Text.
        </li>
        <li>
          Mp3MediaRecorder uses the deprecated ScriptProcessorNode internally.
          Still works across all browsers but could be removed in a future
          browser version.
        </li>
        <li>
          The WASM worker and vmsg.wasm are self-hosted in the public directory
          due to Vite bundling limitations with the npm package's worker entry.
        </li>
        <li>
          Crash recovery covers tab close and refresh (via beforeunload) but not
          browser crashes or OS force-quit. A production-grade solution would
          stream MP3 chunks to OPFS during recording via an AudioWorklet +
          Worker pipeline.
        </li>
      </ul>

      <h3 className="text-base font-semibold text-slate-800 mt-6 mb-2">
        Future Enhancements
      </h3>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          Stream MP3 chunks to OPFS during recording for true crash recovery and
          near-zero runtime memory
        </li>
        <li>Real transcription API integration (Whisper / Google STT)</li>
        <li>Giving the user ability to rename recordings.</li>
        <li>Showing a confirmation dialog before deleting a recording.</li>
        <li>Light / dark theme toggle</li>
      </ul>
    </div>
  );
}

export default About;
