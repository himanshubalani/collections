export default function Footer() {
	return (
		<footer className="mt-14 pt-6 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-200">
		<p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono text-pretty">
		© {new Date().getFullYear()} Himanshu Balani. Curated with care.
		</p>
		</footer>
	);
}