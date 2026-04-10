// Dummy implementation of the transcription API.

const MOCK_TRANSCRIPTION =
  "This is just a dummy implementation of the transcription service. Let's pretend everything's working here as expected ;)";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function mockTranscribe(_audio: Blob): Promise<string> {
  // fake network latency
  await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));

  return MOCK_TRANSCRIPTION;
}
