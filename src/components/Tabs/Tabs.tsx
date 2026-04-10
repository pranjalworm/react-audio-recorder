import { useState, type ReactNode } from "react";

interface Tab {
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultIndex?: number;
}

function Tabs({ tabs, defaultIndex = 0 }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  return (
    <div>
      <div className="flex border-b border-slate-200">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActiveIndex(i)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${
              activeIndex === i
                ? "text-blue-500 border-b-2 border-blue-400"
                : "text-slate-600 hover:text-slate-800 cursor-pointer"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div key={tab.label} className={`mt-6 ${activeIndex === i ? "" : "hidden"}`}>
          {tab.content}
        </div>
      ))}
    </div>
  );
}

export default Tabs;
