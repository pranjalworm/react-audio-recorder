// Self-contained mp3-mediarecorder worker.
// Inlined from mp3-mediarecorder/worker UMD build + init call.

function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) { resolve(value); });
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

const TOTAL_STACK = 5 * 1024 * 1024;
const TOTAL_MEMORY = 128 * 1024 * 1024;
const WASM_PAGE_SIZE = 64 * 1024;
const ctx = self;

const memory = new WebAssembly.Memory({
  initial: TOTAL_MEMORY / WASM_PAGE_SIZE,
  maximum: TOTAL_MEMORY / WASM_PAGE_SIZE,
});

let dynamicTop = TOTAL_STACK;
const imports = {
  env: {
    memory,
    sbrk: (increment) => { const old = dynamicTop; dynamicTop += increment; return old; },
    exit: () => ctx.postMessage({ type: "ERROR", error: "internal" }),
    pow: Math.pow, powf: Math.pow, exp: Math.exp,
    sqrtf: Math.sqrt, cos: Math.cos, log: Math.log, sin: Math.sin,
  },
};

function getWasmModule(url, imports) {
  if (!WebAssembly.instantiateStreaming) {
    return fetch(url).then((r) => r.arrayBuffer()).then((buf) => WebAssembly.instantiate(buf, imports));
  }
  return WebAssembly.instantiateStreaming(fetch(url), imports).catch(() =>
    fetch(url).then((r) => r.arrayBuffer()).then((buf) => WebAssembly.instantiate(buf, imports))
  );
}

const vmsg = getWasmModule("/vmsg.wasm", imports).then((w) => w.instance.exports);
let isRecording = false;
let vmsgRef;
let pcmLeft;

const onStartRecording = (config) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const inst = yield vmsg;
    isRecording = true;
    vmsgRef = inst.vmsg_init(config.sampleRate);
    if (!vmsgRef || !inst) throw new Error("init_failed");
    const pcmLeftRef = new Uint32Array(memory.buffer, vmsgRef, 1)[0];
    pcmLeft = new Float32Array(memory.buffer, pcmLeftRef);
  });

const onStopRecording = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    const inst = yield vmsg;
    isRecording = false;
    if (inst.vmsg_flush(vmsgRef) < 0) throw new Error("flush_failed");
    const mp3BytesRef = new Uint32Array(memory.buffer, vmsgRef + 4, 1)[0];
    const size = new Uint32Array(memory.buffer, vmsgRef + 8, 1)[0];
    const mp3Bytes = new Uint8Array(memory.buffer, mp3BytesRef, size);
    const blob = new Blob([mp3Bytes], { type: "audio/mpeg" });
    inst.vmsg_free(vmsgRef);
    return blob;
  });

const onDataReceived = (data) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (!isRecording) return;
    pcmLeft.set(data);
    const inst = yield vmsg;
    if (inst.vmsg_encode(vmsgRef, data.length) < 0) throw new Error("encoding_failed");
  });

ctx.addEventListener("message", (event) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const msg = event.data;
    try {
      switch (msg.type) {
        case "START_RECORDING":
          yield onStartRecording(msg.config);
          ctx.postMessage({ type: "WORKER_RECORDING" });
          break;
        case "DATA_AVAILABLE":
          yield onDataReceived(msg.data);
          break;
        case "STOP_RECORDING": {
          const blob = yield onStopRecording();
          ctx.postMessage({ type: "BLOB_READY", blob });
          break;
        }
      }
    } catch (err) {
      ctx.postMessage({ type: "ERROR", error: err.message });
    }
  })
);
