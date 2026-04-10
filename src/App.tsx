import Header from "./components/Header/Header";
import Tabs from "./components/Tabs/Tabs";
import Recorder from "./modules/Recorder/Recorder";
import RecordingHistory from "./modules/RecordingHistory/RecordingHistory";
import About from "./modules/About/About";
import { useRecordingHistory } from "./modules/RecordingHistory/useRecordingHistory";

function App() {
  const { recordings, loading, save, remove, getPlaybackUrl } =
    useRecordingHistory();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Header />
        <Tabs
          tabs={[
            {
              label: "Overview",
              content: <About />,
            },
            {
              label: "Record",
              content: (
                <Recorder
                  onRecordingComplete={(blob, durationMs) =>
                    void save(blob, durationMs)
                  }
                />
              ),
            },
            {
              label: "Recordings",
              content: (
                <RecordingHistory
                  recordings={recordings}
                  loading={loading}
                  onDelete={remove}
                  onGetPlaybackUrl={getPlaybackUrl}
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}

export default App;
