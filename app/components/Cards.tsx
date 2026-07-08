import Image from "next/image";
import { BookOpen, Video, Disc, Link as LinkIcon, ArrowUpRight, Clapperboard } from "lucide-react";
import { siLetterboxd } from 'simple-icons';
import { Item } from "@/types";
import { getAccent, getDomain } from "@/lib/utils";

export const TypeIcon = ({ type }: { type: string }) => {
	const cls = "size-3.5 stroke-[2.5] text-black";
	switch (type) {
		case "BOOKS": return <BookOpen className={cls} />;
		case "VIDEOS": return <Video className={cls} />;
		case "PODCASTS": return <Disc className={cls} />;
		case "MOVIES": return <Clapperboard className={cls} />;
		default: return <LinkIcon className={cls} />;
	}
};

const LetterboxdIcon = () => {
	return (
		<svg
		role="img"
		viewBox="0 0 24 24"
		width="32"
		height="32"
		fill={`#${siLetterboxd.hex}`}
		dangerouslySetInnerHTML={{ __html: siLetterboxd.svg }}
		/>
	);
};

export function BookCard({ item }: { item: Item }) {
	const hasLink = Boolean(item.url);
	const Wrapper = hasLink ? "a" : "div";
	const wrapperProps = hasLink ? { href: item.url!, target: "_blank", rel: "noopener noreferrer" } : {};
	
	return (
		<Wrapper {...wrapperProps as any} className="group flex flex-col p-1 pb-2 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
		<div className="w-full aspect-[3/4] relative rounded-lg overflow-hidden border border-black/10 dark:border-white/10 mb-3 shadow-[2px_2px_0_0_rgba(0,0,0,0.05)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.05)] group-hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.08)] dark:group-hover:shadow-[4px_4px_0_0_rgba(255,255,255,0.08)] transition-shadow bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
		{item.image?.startsWith("http") ? (
			<Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out" unoptimized />
		) : (
			<BookOpen className="size-8 text-neutral-400 dark:text-neutral-500 stroke-[1.5]" />
		)}
		</div>
		<div className="flex flex-col min-w-0 px-0.5">
		<span className="font-bold text-sm text-black dark:text-white truncate leading-tight mb-1 transition-colors duration-200">{item.title}</span>
		<span className="text-xs text-neutral-600 dark:text-neutral-400 truncate font-medium transition-colors duration-200">{item.author ?? item.description}</span>
		</div>
		</Wrapper>
	);
}

export function ListItem({ item }: { item: Item }) {
	const domain = getDomain(item.url, item.type, item.author);
	const accent = getAccent(item.collectionType ?? "");
	const hasLink = Boolean(item.url);
	const Wrapper = hasLink ? "a" : "div";
	const wrapperProps = hasLink ? { href: item.url!, target: "_blank", rel: "noopener noreferrer" } : {};
	
	return (
		<Wrapper {...wrapperProps as any} className="group relative hover:z-50 flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-200 cursor-pointer select-none active:scale-[0.98] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
		
		{/* HOVER PREVIEW */}
		{item.image?.startsWith("http") && (
			<div className="absolute right-[calc(100%+24px)] xl:right-[calc(100%+32px)] top-1/2 -translate-y-1/2 hidden xl:block opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 origin-right pointer-events-none">
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
			src={item.image}
			alt={`${item.title} preview`}
			loading="lazy"
			className="
      block
      max-w-[320px]
      max-h-[220px]
      w-auto
      h-auto
      rounded-2xl
      border border-black/10 dark:border-white/10
      shadow-[0_20px_40px_rgba(0,0,0,0.12)]
      dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)]
      bg-neutral-100 dark:bg-neutral-800
    "
			/>
			</div>
		)}
		
		<div className="flex items-center gap-3.5 min-w-0 flex-1 relative z-10">
		<div style={{ backgroundColor: accent }} className="size-9 rounded-lg shrink-0 flex items-center justify-center overflow-hidden relative border border-black/10 dark:border-black/20 shadow-[1px_1px_0_0_rgba(0,0,0,0.1)] dark:shadow-[1px_1px_0_0_rgba(0,0,0,0.3)] group-hover:shadow-none transition-shadow">
		{item.image?.startsWith("http") ? (
			<Image src={item.image} alt={item.title} fill sizes="36px" className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out" unoptimized />
		) : (
			<TypeIcon type={item.type} />
		)}
		</div>
		<span className="font-semibold text-sm text-black dark:text-white truncate leading-none transition-colors duration-200">{item.title}</span>
		</div>
		
		<div className="flex items-center gap-1.5 shrink-0 relative z-10">
		<span className="font-mono text-[10px] leading-none px-2 py-1.5 rounded-md border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 group-hover:border-black/20 dark:group-hover:border-white/20 group-hover:text-black dark:group-hover:text-white group-hover:bg-white/90 dark:group-hover:bg-white/20 transition-colors duration-150">
		{domain}
		</span>
		{hasLink && <ArrowUpRight className="size-4 stroke-[2.5] text-black/40 dark:text-white/40 md:text-black/60 md:dark:text-white/60 opacity-100 translate-x-0 md:opacity-0 md:-translate-x-1 md:group-hover:opacity-100 md:group-hover:translate-x-0 md:group-hover:text-black md:dark:group-hover:text-white transition-all duration-150" />}
		</div>
		</Wrapper>
	);
}

export function MovieCard({ item }: { item: Item }) {
	const hasLink = Boolean(item.url);
	const Wrapper = hasLink ? "a" : "div";
	const wrapperProps = hasLink ? { href: item.url!, target: "_blank", rel: "noopener noreferrer" } : {};
	
	return (
		<Wrapper {...wrapperProps as any} className="group relative flex flex-col p-1 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
		{/* Movie Aspect Ratio is generally 2/3 */}
		<div className="w-full aspect-[2/3] relative rounded-lg overflow-hidden border border-black/10 dark:border-white/10 shadow-[2px_2px_0_0_rgba(0,0,0,0.05)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.05)] group-hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.08)] dark:group-hover:shadow-[4px_4px_0_0_rgba(255,255,255,0.08)] transition-shadow bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
		{item.image?.startsWith("http") ? (
			<Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out" unoptimized />
		) : (
			<Clapperboard className="size-8 text-neutral-400 dark:text-neutral-500 stroke-[1.5]" />
		)}
		</div>
		
		{/* Floating Tooltip for Movie Title */}
		<div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 bg-white/60 dark:bg-white/5 backdrop-blur-md border border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25 hover:bg-white/80 dark:hover:bg-white/10  text-black dark:bg-neutral-900 dark:text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
		{item.title}
		</div>
		
		</Wrapper>
	);
}

export function LetterboxdProfileCard({ profileUrl }: { profileUrl: string }) {
	return (
		<a 
		href={profileUrl} 
		target="_blank" 
		rel="noopener noreferrer" 
		className="group relative flex flex-col p-1.5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-black/10 dark:border-white/10 hover:border-[#00E054]/50 dark:hover:border-[#40bcf4]/50 hover:bg-white/80 dark:hover:bg-[#00E054]/10 transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
		>
		<div className="w-full aspect-[2/3] relative rounded-xl overflow-hidden border border-black/10 dark:border-white/10 shadow-[2px_2px_0_0_rgba(0,0,0,0.05)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.05)] group-hover:shadow-[4px_4px_0_0_rgba(64,188,244,0.2)] transition-shadow bg-neutral-100 dark:bg-neutral-800 flex flex-col items-center justify-center gap-3">
		<div className="size-12 rounded-full bg-[#00E054]/10 dark:bg-[#40bcf4]/20 flex items-center justify-center text-[#00E054] group-hover:scale-110 group-hover:bg-[#00E054] dark:group-hover:bg-[#40bcf4] group-hover:text-black transition-all duration-300">
		<LetterboxdIcon />
		</div>
		<span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
		Letterboxd
		</span>
		</div>
		</a>
	);
}