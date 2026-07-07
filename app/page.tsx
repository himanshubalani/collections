"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  Search, ArrowUpRight, BookOpen, Video, Disc, Link as LinkIcon, Sun, Moon
} from "lucide-react";
import rawData from "../data/collections.json";
import AnimatedPillsBackground from "./AnimatedPillsBackground";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Item {
  id: string;
  title: string;
  url?: string;
  image?: string;
  type: string;
  description?: string;
  author?: string;
  createdAt: string;
}

interface Collection {
  id: string;
  title: string;
  type: "BOOKS" | "VIDEOS" | "PODCASTS" | "LINKS";
  itemsCount: number;
  items: Item[];
}

interface UserData {
  user: { profileHandle: string; firstName: string; lastName: string };
  collections: Collection[];
}

const data: UserData = rawData as unknown as UserData;

// ─── Design tokens ────────────────────────────────────────────────────────────

const TYPE_ACCENT: Record<string, string> = {
  BOOKS:    "#FFDE59",
  VIDEOS:   "#FF66C4",
  PODCASTS: "#C58FFF",
  LINKS:    "#5CE1E6",
  ALL:      "#9BDBAF",
};

const getAccent = (type: string) => TYPE_ACCENT[type] ?? "#7ED957";

const TYPE_THEME: Record<string, { rgba: string; bg: { light: string; dark: string } }> = {
  ALL:      { rgba: "rgba(155, 219, 175, 1)", bg: { light: "#f0fdf4", dark: "#0f1712" } },
  BOOKS:    { rgba: "rgba(255, 222, 89,  1)", bg: { light: "#fffdf0", dark: "#1a190f" } },
  VIDEOS:   { rgba: "rgba(255, 102, 196, 1)", bg: { light: "#fff5fc", dark: "#1a0b14" } },
  PODCASTS: { rgba: "rgba(197, 143, 255, 1)", bg: { light: "#f8f0ff", dark: "#130e1a" } },
  LINKS:    { rgba: "rgba(92,  225, 230, 1)", bg: { light: "#edfafb", dark: "#0e1a1a" } },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDomain = (url?: string, type?: string, author?: string) => {
  if (author) return author.toLowerCase();
  if (!url) return type?.toLowerCase() ?? "item";
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "link";
  }
};

const getTypeIcon = (type: string) => {
  const cls = "size-3.5 stroke-[2.5] text-black";
  switch (type) {
    case "BOOKS":    return <BookOpen className={cls} />;
    case "VIDEOS":   return <Video    className={cls} />;
    case "PODCASTS": return <Disc     className={cls} />;
    default:         return <LinkIcon className={cls} />;
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CollectionsPage() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme]     = useState<"light" | "dark">("light");

  const [searchQuery,    setSearchQuery]    = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  
  const [pillColor,      setPillColor]      = useState(TYPE_THEME.ALL.rgba);
  const [pillBgLight,    setPillBgLight]    = useState(TYPE_THEME.ALL.bg.light);
  const [pillBgDark,     setPillBgDark]     = useState(TYPE_THEME.ALL.bg.dark);
  
  const [canvasOpacity,  setCanvasOpacity]  = useState(1);
  const crossfadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Dark Mode Init & Sync ─────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      setTheme("dark");
    }

    const observer = new MutationObserver(() => {
      setTheme(root.classList.contains("dark") ? "dark" : "light");
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  // ── Filter change with crossfade ──────────────────────────────────────────
  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    if (crossfadeTimer.current) clearTimeout(crossfadeTimer.current);

    setCanvasOpacity(0);
    crossfadeTimer.current = setTimeout(() => {
      const activeTheme = TYPE_THEME[value] ?? TYPE_THEME.ALL;
      setPillColor(activeTheme.rgba);
      setPillBgLight(activeTheme.bg.light); 
      setPillBgDark(activeTheme.bg.dark);
      setCanvasOpacity(1);
    }, 180);
  };

  // ── Data ─────────────────────────────────────────────────────────────────
  const allItems = useMemo(() =>
    data.collections.flatMap((col) =>
      col.items.map((item) => ({
        ...item,
        collectionTitle: col.title,
        collectionType:  col.type,
      }))
    ), []);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return allItems.filter((item) => {
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.author?.toLowerCase().includes(q) ||
        item.collectionTitle.toLowerCase().includes(q);
      return matchesSearch && (selectedFilter === "ALL" || item.collectionType === selectedFilter);
    });
  }, [allItems, searchQuery, selectedFilter]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof filteredItems> = {};
    for (const item of filteredItems) {
      (groups[item.collectionTitle] ??= []).push(item);
    }
    return groups;
  }, [filteredItems]);

  const filterOptions = [
    { label: "All",      value: "ALL",      count: allItems.length },
    { label: "Links",    value: "LINKS",    count: allItems.filter(i => i.collectionType === "LINKS").length },
    { label: "Videos",   value: "VIDEOS",   count: allItems.filter(i => i.collectionType === "VIDEOS").length },
    { label: "Books",    value: "BOOKS",    count: allItems.filter(i => i.collectionType === "BOOKS").length },
    { label: "Podcasts", value: "PODCASTS", count: allItems.filter(i => i.collectionType === "PODCASTS").length },
  ];

  const currentCanvasBg = mounted && theme === "dark" ? pillBgDark : pillBgLight;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div style={{ opacity: canvasOpacity, transition: "opacity 0.18s ease" }}>
        <AnimatedPillsBackground color={pillColor} backgroundColor={currentCanvasBg} />
      </div>

      <div className="min-h-screen bg-transparent text-[#111] dark:text-[#FAFAFA] transition-colors duration-200 font-sans antialiased selection:bg-[#FFDE59] selection:text-black dark:selection:text-black relative z-10">
        <div className="max-w-3xl mx-auto px-6 py-8 md:py-10">

          {/* ── HEADER ────────────────────────────────────────────────────── */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3.5">
              <div className="size-14 rounded-full border border-black/20 dark:border-white/20 shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.4)] flex-shrink-0 overflow-hidden relative transition-all duration-200">
                <Image
                  src="https://dqy38fnwh4fqs.cloudfront.net/UH6A8N9K6BRJDRK297GA67REAGEL/h6a8n9k6brjdrk297ga67reagel-profile.webp"
                  alt={`${data.user.firstName} ${data.user.lastName}`}
                  fill
                  sizes="36px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight text-black dark:text-white transition-colors duration-200">
                  {data.user.firstName} {data.user.lastName}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5 transition-colors duration-200">
                  @{data.user.profileHandle}
                </p>
              </div>
            </div>

            <nav className="flex items-center gap-2">
              <a
                href={`https://peerlist.io/${data.user.profileHandle}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-150 active:scale-[0.96]"
              >
                Peerlist
                <ArrowUpRight className="size-3.5 stroke-[2.5]" />
              </a>
              
              <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className="flex items-center justify-center size-8 rounded-lg border border-black/15 dark:border-white/15 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-150 active:scale-[0.96]"
              >
                {mounted && theme === "dark" ? (
                  <Sun className="size-4 stroke-[2.5]" />
                ) : (
                  <Moon className="size-4 stroke-[2.5]" />
                )}
              </button>
            </nav>
          </header>

          <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-6 max-w-lg text-pretty transition-colors duration-200">
            A curated space of books I&apos;ve read, must-watch tech videos, podcasts, and articles I&apos;ve written. Everything worth revisiting.
          </p>

          {/* ── SEARCH + FILTERS ──────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-10">
            <div className="relative flex-1 max-w-xs">
              <Search className="size-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5] pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collections…"
                className="w-full bg-white/60 dark:bg-white/5 backdrop-blur-md pl-9 pr-4 py-2 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none text-black dark:text-white border border-black/20 dark:border-white/20 rounded-xl focus:border-black dark:focus:border-white transition-all duration-150 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 md:pb-0 scrollbar-none">
              {filterOptions.map((tab) => {
                const isActive = selectedFilter === tab.value;
                const accent   = getAccent(tab.value);
                return (
                  <button
                    key={tab.value}
                    onClick={() => handleFilterChange(tab.value)}
                    style={isActive ? { backgroundColor: accent, color: '#000', borderColor: 'rgba(0,0,0,0.2)' } : undefined}
                    className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 font-medium border transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.96] bg-white/60 dark:bg-white/5 backdrop-blur-md ${
                      isActive
                        ? "shadow-sm"
                        : "border-black/15 dark:border-white/15 text-neutral-600 dark:text-neutral-400 hover:border-black/30 dark:hover:border-white/30 hover:text-black dark:hover:text-white"
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

          {/* ── COLLECTIONS ───────────────────────────────────────────────── */}
          <main className="space-y-10">
            {Object.keys(groupedItems).length === 0 ? (
              <div className="text-center py-12 border border-black/10 dark:border-white/10 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm transition-colors duration-200">
                <p className="text-neutral-500 dark:text-neutral-400 font-mono text-sm">No items matching &ldquo;{searchQuery}&rdquo;</p>
              </div>
            ) : (
              Object.entries(groupedItems).map(([collectionTitle, items]) => {
                const isBooksSection = items.some(i => i.collectionType === "BOOKS");

                return (
                  <section key={collectionTitle}>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/10 dark:border-white/10 transition-colors duration-200">
                      <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                        {collectionTitle}
                      </h2>
                      <span className="font-mono text-[11px] tabular-nums text-neutral-400 dark:text-neutral-500">
                        {items.length}
                      </span>
                    </div>

                    {isBooksSection ? (
                      /* --- BOOKS GRID LAYOUT --- */
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {items.map((item) => {
                          const hasLink = Boolean(item.url);
                          const Wrapper = hasLink ? "a" : "div";
                          const wrapperProps = hasLink ? { href: item.url!, target: "_blank", rel: "noopener noreferrer" } : {};

                          return (
                            <Wrapper
                              key={item.id}
                              {...(wrapperProps as Record<string, string>)}
                              className="group flex flex-col p-3 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
                            >
                              <div className="w-full aspect-[3/4] relative rounded-lg overflow-hidden border border-black/10 dark:border-white/10 mb-3 shadow-[2px_2px_0_0_rgba(0,0,0,0.05)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.05)] group-hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.08)] dark:group-hover:shadow-[4px_4px_0_0_rgba(255,255,255,0.08)] transition-shadow bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                {item.image?.startsWith("http") ? (
                                  <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                                    unoptimized
                                  />
                                ) : (
                                  <BookOpen className="size-8 text-neutral-400 dark:text-neutral-500 stroke-[1.5]" />
                                )}
                              </div>
                              <div className="flex flex-col min-w-0 px-0.5">
                                <span className="font-bold text-sm text-black dark:text-white truncate leading-tight mb-1 transition-colors duration-200">
                                  {item.title}
                                </span>
                                <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate font-medium transition-colors duration-200">
                                  {item.author ?? item.description}
                                </span>
                              </div>
                            </Wrapper>
                          );
                        })}
                      </div>
                    ) : (
                      /* --- STANDARD LIST LAYOUT --- */
                      <div className="space-y-2">
                        {items.map((item) => {
                          const domain  = getDomain(item.url, item.type, item.author);
                          const accent  = getAccent(item.collectionType);
                          const hasLink = Boolean(item.url);
                          const Wrapper = hasLink ? "a" : "div";
                          const wrapperProps = hasLink ? { href: item.url!, target: "_blank", rel: "noopener noreferrer" } : {};

                          return (
                            <Wrapper
                              key={item.id}
                              {...(wrapperProps as Record<string, string>)}
                              // Added relative & hover:z-50 to ensure the floating preview renders correctly outside this box and above other list items
                              className="group relative hover:z-50 flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-200 cursor-pointer select-none active:scale-[0.98] shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                            >
                              
                              {/* ── PER-ITEM HOVER PREVIEW ── */}
                              {/* By positioning it absolutely right-[calc(100%+...)] it breaks out to the left of the item card exactly on center */}
                              {item.image?.startsWith("http") && (
                                <div className="absolute right-[calc(100%+24px)] xl:right-[calc(100%+32px)] top-1/2 -translate-y-1/2 hidden xl:block w-64 2xl:w-80 aspect-video rounded-2xl overflow-hidden pointer-events-none z-50 border border-black/10 dark:border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] bg-neutral-100 dark:bg-neutral-800 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 origin-right">
                                  <Image
                                    src={item.image}
                                    alt={`${item.title} preview`}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 1536px) 256px, 320px"
                                    unoptimized
                                  />
                                </div>
                              )}

                              <div className="flex items-center gap-3.5 min-w-0 flex-1 relative z-10">
                                <div
                                  style={{ backgroundColor: accent }}
                                  className="size-9 rounded-[8px] flex-shrink-0 flex items-center justify-center overflow-hidden relative border border-black/10 dark:border-black/20 shadow-[1px_1px_0_0_rgba(0,0,0,0.1)] dark:shadow-[1px_1px_0_0_rgba(0,0,0,0.3)] group-hover:shadow-none transition-shadow"
                                >
                                  {item.image?.startsWith("http") ? (
                                    <Image
                                      src={item.image}
                                      alt={item.title}
                                      fill
                                      sizes="36px"
                                      className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                                      unoptimized
                                    />
                                  ) : (
                                    getTypeIcon(item.type)
                                  )}
                                </div>

                                <span className="font-semibold text-sm text-black dark:text-white truncate leading-none transition-colors duration-200">
                                  {item.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 flex-shrink-0 relative z-10">
                                <span className="font-mono text-[10px] leading-none px-2 py-1.5 rounded-md border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 group-hover:border-black/20 dark:group-hover:border-white/20 group-hover:text-black dark:group-hover:text-white group-hover:bg-white/90 dark:group-hover:bg-white/20 transition-colors duration-150">
                                  {domain}
                                </span>
                                {hasLink && (
                                  <ArrowUpRight className="size-4 stroke-[2.5] text-black/60 dark:text-white/60 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-black dark:group-hover:text-white transition-all duration-150" />
                                )}
                              </div>
                            </Wrapper>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })
            )}
          </main>

          {/* ── FOOTER ────────────────────────────────────────────────────── */}
          <footer className="mt-14 pt-6 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-200">
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono text-pretty">
              © {new Date().getFullYear()} Himanshu Balani. Curated with care.
            </p>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder="you@domain.com"
                className="flex-1 sm:w-48 bg-white/60 dark:bg-white/5 backdrop-blur-md border border-black/20 dark:border-white/20 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-all duration-150 font-mono"
              />
              <button className="bg-[#FF914D] hover:bg-[#f07730] text-black font-bold text-[11px] uppercase tracking-wider px-4 py-1.5 rounded-lg border border-black/20 dark:border-black/50 shadow-[1px_1px_0_0_rgba(0,0,0,0.4)] transition-all duration-150 hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.4)] active:scale-[0.96] whitespace-nowrap font-mono">
                Subscribe
              </button>
            </div>
          </footer>

        </div>
      </div>
    </>
  );
}