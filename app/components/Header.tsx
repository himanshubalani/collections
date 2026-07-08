// app/components/Header.tsx
import Image from "next/image";
import { ArrowUpRight, Sun, Moon } from "lucide-react";
import { UserData } from "../../types";

export default function Header({ user, mounted, theme, toggleTheme }: { user: UserData["user"], mounted: boolean, theme: string, toggleTheme: () => void }) {
	return (
		<header className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-4 mb-8">
		{/* Profile Section */}
		<div className="flex items-center gap-3.5">
		<div className="size-16 sm:size-20 rounded-full border-2 border-black dark:border-white/20 flex-shrink-0 overflow-hidden relative transition-all duration-200">
		<Image
		src="https://dqy38fnwh4fqs.cloudfront.net/UH6A8N9K6BRJDRK297GA67REAGEL/h6a8n9k6brjdrk297ga67reagel-profile.webp"
		alt={`${user.firstName} ${user.lastName}`}
		fill
		sizes="(max-width: 640px) 64px, 80px"
		className="object-cover"
		unoptimized
		/>
		</div>
		<div>
		<p className="font-semibold text-base sm:text-sm leading-tight text-black dark:text-white transition-colors duration-200">
		{user.firstName} {user.lastName}
		</p>
		<p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5 transition-colors duration-200">
		@{user.profileHandle}
		</p>
		</div>
		</div>
		
		{/* Navigation Section */}
		<nav className="flex items-center gap-2 w-full sm:w-auto">
		<a 
		href={`https://himanshubalani.com`}
		target="_blank"
		rel="noreferrer"
		className="flex items-center justify-center gap-1.5 text-sm px-3 py-2 sm:py-1.5 rounded-lg font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 sm:border-transparent dark:border-white/10 sm:dark:border-transparent transition-colors duration-150 active:scale-[0.96] flex-1 sm:flex-none"
		>
		Website
		<ArrowUpRight className="size-3.5 stroke-[2.5]" />
		</a>
		<a
		href={`https://peerlist.io/${user.profileHandle}`}
		target="_blank"
		rel="noreferrer"
		className="flex items-center justify-center gap-1.5 text-sm px-3 py-2 sm:py-1.5 rounded-lg font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 sm:border-transparent dark:border-white/10 sm:dark:border-transparent transition-colors duration-150 active:scale-[0.96] flex-1 sm:flex-none"
		>
		Peerlist
		<ArrowUpRight className="size-3.5 stroke-[2.5]" />
		</a>
		<button
		onClick={toggleTheme}
		aria-label="Toggle dark mode"
		className="flex items-center justify-center size-9 sm:size-8 rounded-lg border border-black/15 dark:border-white/15 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-150 active:scale-[0.96] shrink-0 ml-1 sm:ml-0"
		>
		{mounted && theme === "dark" ? <Sun className="size-4 stroke-[2.5]" /> : <Moon className="size-4 stroke-[2.5]" />}
		</button>
		</nav>
		</header>
	);
}