// app/ClientPage.tsx
"use client";

import React, { useMemo, useRef, useState } from "react";
import rawData from "../data/collections.json";
import { UserData, Item } from "../types";
import { TYPE_THEME } from "../lib/utils";
import { useTheme } from "../hooks/useTheme";

import AnimatedPillsBackground from "./AnimatedPillsBackground";
import Header from "./components/Header";
import SearchFilters from "./components/SearchFilters";
// 1. Import the new LetterboxdProfileCard
import { BookCard, ListItem, MovieCard, LetterboxdProfileCard } from "./components/Cards";
import Footer from "./components/Footer";
import { getLatestMovies } from "./actions"; 

const data: UserData = rawData as unknown as UserData;

export default function ClientPage({ initialMovies }: { initialMovies: Item[] }) {
  const { mounted, theme, toggleTheme } = useTheme();


  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [pillColor, setPillColor] = useState(TYPE_THEME.ALL.rgba);
  const [pillBgLight, setPillBgLight] = useState(TYPE_THEME.ALL.bg.light);
  const [pillBgDark, setPillBgDark] = useState(TYPE_THEME.ALL.bg.dark);
  const [canvasOpacity, setCanvasOpacity] = useState(1);
  const crossfadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [letterboxdMovies] = useState<Item[]>(initialMovies);

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

  // Merge static JSON with dynamically fetched Letterboxd movies
  const allItems = useMemo(() => {
    const staticItems = data.collections.flatMap((col) => 
      col.items.map((item) => ({ ...item, collectionTitle: col.title, collectionType: col.type }))
    );
    
    // Structure our dynamically fetched movies to perfectly mimic a static collection
    const dynamicMovies = letterboxdMovies.map((movie) => ({
      ...movie,
      collectionTitle: "Letterboxd - Recent Activity",
      collectionType: "MOVIES",
    }));

    const combined = [...staticItems, ...dynamicMovies];
    const nonMovies = combined.filter((item) => item.collectionType !== "MOVIES");
    const movies = combined.filter((item) => item.collectionType === "MOVIES");

    return [...nonMovies, ...movies];
  }, [letterboxdMovies]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return allItems.filter((item) => {
      const matchesSearch = !q || item.title.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q) || item.author?.toLowerCase().includes(q) || item.collectionTitle?.toLowerCase().includes(q);
      return matchesSearch && (selectedFilter === "ALL" || item.collectionType === selectedFilter);
    });
  }, [allItems, searchQuery, selectedFilter]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, Item[]> = {};
    for (const item of filteredItems) {
      (groups[item.collectionTitle!] ??= []).push(item);
    }
    return groups;
  }, [filteredItems]);

  const filterOptions = [
    { label: "All", value: "ALL", count: allItems.length },
    { label: "Videos", value: "VIDEOS", count: allItems.filter(i => i.collectionType === "VIDEOS").length },
    { label: "Podcasts", value: "PODCASTS", count: allItems.filter(i => i.collectionType === "PODCASTS").length },
    { label: "Links", value: "LINKS", count: allItems.filter(i => i.collectionType === "LINKS").length },
    { label: "Books", value: "BOOKS", count: allItems.filter(i => i.collectionType === "BOOKS").length },
    { label: "Movies", value: "MOVIES", count: allItems.filter(i => i.collectionType === "MOVIES").length },
  ];

  const currentCanvasBg = mounted && theme === "dark" ? pillBgDark : pillBgLight;

  return (
    <>
      <div style={{ opacity: canvasOpacity, transition: "opacity 0.18s ease" }}>
        <AnimatedPillsBackground color={pillColor} backgroundColor={currentCanvasBg} />
      </div>

      <div className="min-h-screen bg-transparent text-[#111] dark:text-[#FAFAFA] transition-colors duration-200 font-sans antialiased selection:bg-[#FFDE59] selection:text-black dark:selection:text-black relative z-10">
        <div className="max-w-3xl mx-auto px-6 py-8 md:py-10">
          
          <Header user={data.user} mounted={mounted} theme={theme} toggleTheme={toggleTheme} />

          <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-6 max-w-lg text-pretty transition-colors duration-200">
            A curated space of books I&apos;ve read, must-watch tech videos, podcasts, and articles I&apos;ve written. Everything worth revisiting.
          </p>

          <SearchFilters 
            searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
            selectedFilter={selectedFilter} handleFilterChange={handleFilterChange} 
            filterOptions={filterOptions} 
          />

          <main className="space-y-10">
            {Object.keys(groupedItems).length === 0 ? (
              <div className="text-center py-12 border border-black/10 dark:border-white/10 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm transition-colors duration-200">
                <p className="text-neutral-500 dark:text-neutral-400 font-mono text-sm">No items matching &ldquo;{searchQuery}&rdquo;</p>
              </div>
            ) : (
              Object.entries(groupedItems).map(([collectionTitle, items]) => {
                const isBooksSection = items.some(i => i.collectionType === "BOOKS");
                const isMoviesSection = items.some(i => i.collectionType === "MOVIES");

                return (
                  <section key={collectionTitle}>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/10 dark:border-white/10 transition-colors duration-200">
                      <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">{collectionTitle}</h2>
                      <span className="font-mono text-[11px] tabular-nums text-neutral-400 dark:text-neutral-500">{items.length}</span>
                    </div>

                    {isMoviesSection ? (
                      // 2. Updated grid-cols here to fit 5 items on desktop (4 movies + 1 profile link)
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {items.map(item => <MovieCard key={item.id} item={item} />)}
                        
                        {/* 3. Append the View Profile Card */}
                        <LetterboxdProfileCard profileUrl="https://letterboxd.com/himanshubalani" />
                      </div>
                    ) : isBooksSection ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {items.map(item => <BookCard key={item.id} item={item} />)}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {items.map(item => <ListItem key={item.id} item={item} />)}
                      </div>
                    )}
                  </section>
                );
              })
            )}
          </main>

          <Footer />

        </div>
      </div>
    </>
  );
}