import { Search } from "lucide-react";
import { getAccent } from "@/lib/utils";

interface Props {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedFilter: string;
  handleFilterChange: (f: string) => void;
  filterOptions: { label: string; value: string; count: number }[];
}

export default function SearchFilters({ searchQuery, setSearchQuery, selectedFilter, handleFilterChange, filterOptions }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-10 overflow-hidden md:overflow-visible">
      {/* 1. Search Input */}
      <div className="relative w-full md:flex-1 md:max-w-xs shrink-0">
        <Search className="size-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5] pointer-events-none" />
        <input
          type="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search"
          /* Note: Fixed pl-4 to pl-9 so the text doesn't overlap your Search icon */
          className="w-full bg-white/60 dark:bg-white/5 backdrop-blur-md pl-4 pr-4 py-2 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none text-black dark:text-white border border-black/20 dark:border-white/20 rounded-xl focus:border-black dark:focus:border-white transition-all duration-150 shadow-sm"
        />
      </div>

      {/* 2. Scrollable Filters with Edge Fade Mask */}
      {/* On mobile: negative margin pulls it to the screen edge. On md+: resets to normal. */}
      <div className="relative w-full md:w-auto -mr-6 md:mr-0 min-w-0">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 md:pb-0 scrollbar-none pr-12 md:pr-0 [mask-image:linear-gradient(to_right,black_calc(100%-3rem),transparent_100%)] md:[mask-image:none]">
          {filterOptions.map((tab) => {
            const isActive = selectedFilter === tab.value;
            const accent = getAccent(tab.value);
            return (
              <button
                key={tab.value}
                onClick={() => handleFilterChange(tab.value)}
                style={isActive ? { backgroundColor: accent, color: '#000', borderColor: 'rgba(0,0,0,0.2)' } : undefined}
                className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 font-medium border transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.96] bg-white/60 dark:bg-white/5 backdrop-blur-md ${
                  isActive ? "shadow-sm" : "border-black/15 dark:border-white/15 text-neutral-600 dark:text-neutral-400 hover:border-black/30 dark:hover:border-white/30 hover:text-black dark:hover:text-white"
                }`}
              >
                {tab.label}
                <span className={`font-mono text-[10px] tabular-nums px-1.5 py-0.5 rounded-md leading-none transition-[background-color,color] duration-150 ${
                  isActive ? "bg-black/10 text-black" : "bg-black/5 dark:bg-white/5 text-neutral-500 dark:text-neutral-400"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}