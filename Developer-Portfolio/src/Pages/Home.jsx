import { useState, useEffect, memo } from "react";
import PropTypes from "prop-types";
import {
	Github,
	Linkedin,
	Mail,
	ExternalLink,
	Sparkles,
	User,
	Rocket,
	Star,
	Monitor,
	Server,
	Zap,
	Cloud,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const TECH_TAGS = [
	{ label: "MERN", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
	{ label: "Java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
	{ label: "Spring Boot", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" },
	{ label: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
	{ label: "Docker", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
	{ label: "Socket.io", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/socketio/socketio-original.svg" },
];

const SOCIAL_LINKS = [
	{ icon: Github, link: "https://github.com/JalapatiRavikumar" },
	{ icon: Linkedin, link: "https://www.linkedin.com/in/jalapatiravikumar" },
	{ icon: Mail, link: "mailto:ravikumarjalapatii@gmail.com" },
];

const SUBLINE = "MERN + Java + AI";

const DEVICON_EXPRESS =
	"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg";
const DEVICON_MONGO =
	"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg";

const techStackIcons = [
	{ name: "React", src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg", alt: "React" },
	{ name: "Node.js", src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg", alt: "Node.js" },
	{ name: "Java", src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg", alt: "Java" },
	{ name: "Spring Boot", src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg", alt: "Spring Boot" },
	{ name: "MongoDB", src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg", alt: "MongoDB" },
	{ name: "Docker", src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg", alt: "Docker" },
];

const whatIBuild = [
	{ label: "Responsive Frontends", icon: Monitor },
	{ label: "Scalable APIs", icon: Server },
	{ label: "Real-time Apps", icon: Zap },
	{ label: "AI-Powered Features", icon: Sparkles },
	{ label: "Cloud Ready", icon: Cloud },
];

const StatusBadge = memo(() => (
	<div
		className="inline-flex items-center gap-2 rounded-full border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.15)] px-6 py-3 text-sm font-medium text-[#F8FAFC] shadow-[0_0_30px_rgba(139,92,246,0.35)]"
		data-aos="fade-up"
		data-aos-delay="100"
	>
		<Sparkles className="h-4 w-4 shrink-0 text-[#A855F7]" strokeWidth={2} />
		Ready for new opportunities
	</div>
));
StatusBadge.displayName = "StatusBadge";

const MainTitle = memo(() => (
	<h1 className="space-y-0" data-aos="fade-up" data-aos-delay="200">
		<span className="block text-[clamp(2.75rem,8vw,6rem)] font-extrabold leading-none tracking-[-0.02em] text-[#F8FAFC]">
			Full Stack
		</span>
		<span
			className="mt-1 block text-[clamp(2.75rem,8vw,6rem)] font-extrabold leading-none tracking-[-0.02em] text-transparent"
			style={{
				backgroundImage: "linear-gradient(90deg, #8B5CF6, #A855F7, #C084FC)",
				WebkitBackgroundClip: "text",
				backgroundClip: "text",
			}}
		>
			Developer
		</span>
	</h1>
));
MainTitle.displayName = "MainTitle";

const TechTag = memo(({ label, icon }) => (
	<span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-2 text-sm md:text-lg text-[#F8FAFC] transition-all duration-300 hover:border-[rgba(139,92,246,0.5)] hover:shadow-[0_0_24px_rgba(139,92,246,0.5)]">
		<img src={icon} alt={label} className="w-5 h-5 object-contain" />
		{label}
	</span>
));
TechTag.displayName = "TechTag";
TechTag.propTypes = { label: PropTypes.string.isRequired, icon: PropTypes.string.isRequired };

const PrimaryButton = memo(({ href, children }) => (
	<a
		href={href}
		className="inline-flex h-16 w-[180px] items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-xl font-semibold text-white shadow-[0_0_35px_rgba(139,92,246,0.5)] transition-transform duration-300 hover:translate-y-[-2px] hover:shadow-[0_0_45px_rgba(139,92,246,0.65)]"
	>
		{children}
		<ExternalLink className="h-5 w-5 opacity-95" strokeWidth={2} />
	</a>
));
PrimaryButton.displayName = "PrimaryButton";
PrimaryButton.propTypes = {
	href: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired,
};

const SecondaryButton = memo(({ href, children }) => (
	<a
		href={href}
		className="inline-flex h-16 w-[180px] items-center justify-center gap-2 rounded-[18px] border border-[rgba(255,255,255,0.12)] bg-[rgba(15,23,42,0.45)] text-xl font-semibold text-[#F8FAFC] backdrop-blur-sm transition-all duration-300 hover:border-[rgba(139,92,246,0.35)] hover:shadow-[0_0_28px_rgba(139,92,246,0.25)]"
	>
		{children}
		<Mail className="h-5 w-5 text-[#94A3B8]" strokeWidth={2} />
	</a>
));
SecondaryButton.displayName = "SecondaryButton";
SecondaryButton.propTypes = {
	href: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired,
};

const SocialTile = memo(({ icon: Icon, link }) => {
	const isMail = link.startsWith("mailto:");
	return (
		<a
			href={link}
			{...(isMail ? {} : { target: "_blank", rel: "noopener noreferrer" })}
			className="group flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#94A3B8] transition-all duration-300 hover:-translate-y-[5px] hover:border-[rgba(139,92,246,0.45)] hover:text-[#F8FAFC] hover:shadow-[0_12px_40px_rgba(139,92,246,0.35)]"
		>
			<Icon className="h-6 w-6" strokeWidth={1.75} />
		</a>
	);
});
SocialTile.displayName = "SocialTile";
SocialTile.propTypes = {
	icon: PropTypes.elementType.isRequired,
	link: PropTypes.string.isRequired,
};

const HeroBuiltScene = memo(() => (
	<div
		className="relative w-full select-none"
		style={{ height: "clamp(520px, 72vh, 700px)" }}
		data-aos="fade-left"
		data-aos-delay="150"
	>
		{/* Slow rotating glow orbs */}
		<div
			className="pointer-events-none absolute -left-[20%] top-[8%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.22)_0%,transparent_68%)] blur-3xl animate-hero-glow-spin opacity-80"
			aria-hidden
		/>
		<div
			className="pointer-events-none absolute -right-[10%] bottom-[18%] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.18)_0%,transparent_65%)] blur-3xl animate-hero-glow-spin [animation-direction:reverse] [animation-duration:34s]"
			aria-hidden
		/>
		<div
			className="pointer-events-none absolute left-[30%] top-[40%] h-[200px] w-[200px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.12)_0%,transparent_70%)] blur-2xl animate-hero-glow-spin [animation-duration:22s]"
			aria-hidden
		/>

		{/* Desk orbit rings */}
		<div className="pointer-events-none absolute left-1/2 top-[58%] z-0 h-[min(72vw,420px)] w-[min(72vw,420px)] -translate-x-1/2 rounded-full border border-[rgba(139,92,246,0.12)] shadow-[0_0_60px_rgba(139,92,246,0.08)]" />
		<div className="pointer-events-none absolute left-1/2 top-[60%] z-0 h-[min(88vw,500px)] w-[min(88vw,500px)] -translate-x-1/2 rounded-full border border-[rgba(139,92,246,0.08)]" />

		{/* Purple desk glow dots */}
		{[
			{ t: "78%", l: "12%", d: "0s" },
			{ t: "62%", l: "88%", d: "0.4s" },
			{ t: "88%", l: "48%", d: "0.9s" },
		].map((dot, i) => (
			<span
				key={i}
				className="pointer-events-none absolute z-[1] h-2 w-2 rounded-full bg-[#8B5CF6] shadow-[0_0_16px_rgba(139,92,246,0.9)] animate-pulse"
				style={{ top: dot.t, left: dot.l, animationDelay: dot.d }}
				aria-hidden
			/>
		))}

		{/* Laptop + desk cluster — absolute center */}
		<div className="absolute left-0 right-[10%] top-[16%] z-[2] flex justify-center">
			<div className="relative w-full max-w-[580px] animate-hero-laptop-float">
				<div
					className="relative origin-center -rotate-12"
					style={{
						filter: "drop-shadow(0 0 80px rgba(139,92,246,0.3))",
					}}
				>
					{/* Neon reflection under laptop */}
					<div
						className="pointer-events-none absolute -bottom-6 left-1/2 h-16 w-[78%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.45)_0%,transparent_70%)] blur-xl"
						aria-hidden
					/>

					{/* Screen */}
					<div className="relative mx-auto aspect-[16/10] w-[92%] overflow-hidden rounded-xl border border-white/10 bg-[#0d1117] shadow-2xl">
						<div className="flex h-7 items-center gap-1.5 border-b border-white/5 bg-[#161b22] px-3">
							<span className="h-2 w-2 rounded-full bg-red-500/85" />
							<span className="h-2 w-2 rounded-full bg-amber-400/85" />
							<span className="h-2 w-2 rounded-full bg-emerald-500/85" />
							<span className="ml-2 text-[10px] text-[#94A3B8]">portfolio — Visual Studio Code</span>
						</div>
						<div className="grid grid-cols-[88px_1fr] gap-0 p-2 font-mono text-[9px] leading-relaxed sm:text-[10px]">
							<div className="border-r border-white/5 pr-2 text-right text-[#64748B]">
								{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
									<div key={n}>{n}</div>
								))}
							</div>
							<div className="pl-2 text-[#E2E8F0]">
								<p>
									<span className="text-[#C678DD]">import</span>{" "}
									<span className="text-[#E06C75]">React</span>{" "}
									<span className="text-[#C678DD]">from</span>{" "}
									<span className="text-[#98C379]">&apos;react&apos;</span>;
								</p>
								<p>
									<span className="text-[#C678DD]">const</span>{" "}
									<span className="text-[#61AFEF]">api</span>{" "}
									<span className="text-[#C678DD]">=</span>{" "}
									<span className="text-[#98C379]">&quot;/api/v1&quot;</span>;
								</p>
								<p>
									<span className="text-[#C678DD]">export async function</span>{" "}
									<span className="text-[#E5C07B]">build</span>
									<span className="text-[#ABB2BF]">() {"{"}</span>
								</p>
								<p className="pl-3">
									<span className="text-[#C678DD]">await</span>{" "}
									<span className="text-[#61AFEF]">connect</span>
									<span className="text-[#ABB2BF]">(</span>
									<span className="text-[#98C379]">&quot;mongodb+srv://...&quot;</span>
									<span className="text-[#ABB2BF]">);</span>
								</p>
								<p className="pl-3">
									<span className="text-[#C678DD]">return</span>{" "}
									<span className="text-[#ABB2BF]">{"{"}</span> <span className="text-[#98C379]">ok</span>
									<span className="text-[#ABB2BF]">: </span>
									<span className="text-[#D19A66]">true</span> <span className="text-[#ABB2BF]">{"}"};</span>
								</p>
								<p>
									<span className="text-[#ABB2BF]">{"}"}</span>
								</p>
							</div>
						</div>
					</div>
					<div className="mx-auto -mt-px h-2.5 w-[94%] rounded-b-sm bg-gradient-to-b from-[#2f3136] to-[#1e1f22]" />
					<div className="mx-auto mt-0 h-6 w-full max-w-[min(100%,640px)] rounded-b-xl border border-white/5 bg-gradient-to-b from-[#25262b] to-[#121316] shadow-[inset_0_2px_8px_rgba(0,0,0,0.45)]" />
				</div>

				{/* Coffee mug */}
				<div className="absolute -left-2 bottom-[8%] z-[4] sm:left-4 sm:bottom-[10%]">
					<div className="relative flex h-16 w-14 flex-col items-center justify-end rounded-b-xl rounded-t-md border border-[rgba(139,92,246,0.35)] bg-gradient-to-b from-[#1a1025] to-[#0b0f1a] shadow-[0_0_28px_rgba(139,92,246,0.35)]">
						<div className="absolute -right-2 top-4 h-8 w-3 rounded-r-md border border-[rgba(139,92,246,0.25)] border-l-0 bg-[#0f0a18]" />
						<span className="mb-2 font-mono text-xs font-bold text-[#A855F7] drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">
							&lt;/&gt;
						</span>
						<div className="absolute -top-6 left-1/2 flex -translate-x-1/2 gap-1">
							<span className="h-6 w-0.5 rounded-full bg-[rgba(139,92,246,0.35)] animate-hero-steam" />
							<span className="h-6 w-0.5 rounded-full bg-[rgba(139,92,246,0.25)] animate-hero-steam [animation-delay:0.2s]" />
							<span className="h-6 w-0.5 rounded-full bg-[rgba(139,92,246,0.2)] animate-hero-steam [animation-delay:0.45s]" />
						</div>
					</div>
				</div>

				{/* Plant */}
				<div className="absolute bottom-[6%] left-[18%] z-[3] sm:bottom-[8%] sm:left-[22%]">
					<div className="h-5 w-8 rounded-b-md bg-[#0f172a] shadow-lg ring-1 ring-white/10" />
					<div className="mx-auto -mt-1 h-10 w-10 rounded-full bg-[radial-gradient(circle_at_30%_30%,#22c55e,#14532d)] shadow-[0_0_20px_rgba(34,197,94,0.25)]" />
				</div>

				{/* Notebook + pen */}
				<div className="absolute -right-1 bottom-[5%] z-[3] flex items-end gap-1 sm:right-6 sm:bottom-[7%]">
					<div className="relative h-20 w-16 rounded-md border border-[rgba(139,92,246,0.45)] bg-[#0f172a]/90 p-2 shadow-[0_0_24px_rgba(139,92,246,0.25)] backdrop-blur-sm">
						<div className="space-y-1 text-[7px] font-medium leading-tight text-[#94A3B8]">
							<p className="text-[#C084FC]">✓ Clean Code</p>
							<p>✓ Problem Solving</p>
							<p>✓ Performance</p>
							<p>✓ User Experience</p>
						</div>
					</div>
					<div className="mb-1 h-20 w-1.5 rounded-full bg-gradient-to-b from-zinc-800 to-black shadow-md ring-1 ring-white/10" />
				</div>
			</div>
		</div>



		{/* Tech Stack card — top right, beside the name/details column */}
		<div className="absolute right-0 top-0 z-[20] w-[min(100%,300px)] max-w-[88vw] rounded-[24px] border border-[rgba(139,92,246,0.25)] bg-[rgba(15,23,42,0.8)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-[20px] animate-float">
			<p className="mb-3 text-sm font-semibold tracking-wide text-[#F8FAFC]">Tech Stack</p>
			<div className="grid grid-cols-3 gap-3">
				{techStackIcons.map(({ name, src, alt }) => (
					<div key={name} className="flex flex-col items-center gap-1.5 text-center">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 transition-all duration-300 hover:ring-[rgba(139,92,246,0.5)] hover:bg-white/10">
							<img src={src} alt={alt} className="h-7 w-7 object-contain" loading="lazy" />
						</div>
						<span className="text-[10px] font-medium text-[#94A3B8]">{name}</span>
					</div>
				))}
			</div>
		</div>

		{/* What I Build — lower right */}
		<div className="absolute bottom-[2%] right-0 z-[5] w-[min(100%,280px)] max-w-[88vw] rounded-[24px] border border-[rgba(139,92,246,0.2)] bg-[rgba(15,23,42,0.7)] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.4)] backdrop-blur-[18px] animate-float [animation-delay:1.2s]">
			<p className="mb-3 text-sm font-semibold text-[#F8FAFC]">What I Build</p>
			<ul className="space-y-2.5">
				{whatIBuild.map(({ label, icon: Icon }) => (
					<li key={label} className="flex items-start gap-2.5 text-[13px]">
						<Icon
							className="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4] drop-shadow-[0_0_10px_rgba(139,92,246,0.85)]"
							strokeWidth={2}
							aria-hidden
						/>
						<span className="leading-snug text-[#E2E8F0]">{label}</span>
					</li>
				))}
			</ul>
		</div>
	</div>
));
HeroBuiltScene.displayName = "HeroBuiltScene";

const HeroStatsBar = memo(() => {
	const items = [
		{
			key: "projects",
			icon: (
				<span className="font-mono text-lg font-semibold text-[#8B5CF6] sm:text-xl">
					&lt;/&gt;
				</span>
			),
			value: "15+",
			label: "Projects Completed",
		},
		{
			key: "years",
			icon: <User className="h-6 w-6 text-[#8B5CF6]" strokeWidth={1.75} />,
			value: "2+",
			label: "Years Learning & Building",
		},
		{
			key: "tech",
			icon: <Rocket className="h-6 w-6 text-[#8B5CF6]" strokeWidth={1.75} />,
			value: "5+",
			label: "Technologies",
		},
		{
			key: "commit",
			icon: <Star className="h-6 w-6 text-[#8B5CF6]" strokeWidth={1.75} />,
			value: "100%",
			label: "Commitment",
		},
	];

	return (
		<div
			className="relative z-10 mx-auto mt-6 w-full max-w-[900px] px-4 pb-10 sm:mt-8 sm:pb-12"
			data-aos="fade-up"
			data-aos-delay="250"
		>
			<div className="flex h-auto min-h-[140px] w-full max-w-[900px] flex-wrap items-center justify-center gap-y-4 rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[rgba(15,23,42,0.65)] px-4 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-[20px] sm:flex-nowrap sm:px-8">
				{items.map(({ key, icon, value, label }) => (
					<div
						key={key}
						className="flex min-w-[45%] flex-1 flex-col items-center justify-center gap-1 text-center sm:min-w-0 sm:flex-1"
					>
						<div className="flex h-9 items-center justify-center">{icon}</div>
						<span className="text-[40px] font-bold tabular-nums leading-none text-[#F8FAFC] sm:text-[48px]">
							{value}
						</span>
						<span className="max-w-[12rem] text-lg font-medium leading-snug text-[#94A3B8]">{label}</span>
					</div>
				))}
			</div>
		</div>
	);
});
HeroStatsBar.displayName = "HeroStatsBar";

const Home = () => {
	const [isLoaded, setIsLoaded] = useState(false);
	const [typedSub, setTypedSub] = useState("");

	useEffect(() => {
		const initAOS = () => {
			AOS.init({ once: true, offset: 10 });
		};
		initAOS();
		window.addEventListener("resize", initAOS);
		return () => window.removeEventListener("resize", initAOS);
	}, []);

	useEffect(() => {
		setIsLoaded(true);
		return () => setIsLoaded(false);
	}, []);

	useEffect(() => {
		let i = 0;
		const id = window.setInterval(() => {
			i += 1;
			setTypedSub(SUBLINE.slice(0, i));
			if (i >= SUBLINE.length) window.clearInterval(id);
		}, 70);
		return () => window.clearInterval(id);
	}, []);

	return (
		<div
			className="relative min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden bg-[#050816]"
			id="Home"
		>
			{/* Layered background + grid */}
			<div className="pointer-events-none absolute inset-0 hero-premium-grid" aria-hidden />
			<div
				className="pointer-events-none absolute inset-0 opacity-100"
				style={{
					background: `
            radial-gradient(ellipse 90% 70% at 15% 10%, rgba(20, 10, 42, 0.95), transparent 55%),
            radial-gradient(ellipse 70% 55% at 85% 90%, rgba(11, 16, 38, 0.9), transparent 50%),
            radial-gradient(ellipse 50% 45% at 70% 25%, rgba(27, 15, 58, 0.55), transparent 45%)
          `,
				}}
				aria-hidden
			/>

			<div
				className={`relative z-10 transition-opacity duration-1000 ${
					isLoaded ? "opacity-100" : "opacity-0"
				}`}
			>
				<div className="mx-auto flex min-h-[100dvh] max-w-[100vw] flex-col px-5 pb-4 pt-24 lg:grid lg:min-h-[100dvh] lg:flex-none lg:grid-rows-[1fr_auto] lg:px-20 lg:pt-28">
					{/* Main 2-col grid: left=details, right=scene */}
					<div className="flex flex-1 flex-col items-center gap-14 lg:grid lg:max-h-none lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] lg:items-center lg:gap-x-10 lg:gap-y-0 xl:gap-x-14">
						{/* Left column — text details + floating Tech Stack card beside it */}
						<div className="relative w-full max-w-xl space-y-6 lg:max-w-none" data-aos="fade-right" data-aos-delay="50">
							<StatusBadge />
							<MainTitle />

							<div className="flex min-h-[2.5rem] flex-wrap items-baseline gap-1 pt-1" data-aos="fade-up" data-aos-delay="280">
								<span className="text-2xl font-light text-[#F8FAFC] sm:text-3xl">{typedSub}</span>
								<span className="animate-blink text-2xl font-light text-[#8B5CF6] sm:text-3xl">|</span>
							</div>

							<p
								className="max-w-[620px] text-lg leading-[1.8] text-[#94A3B8] md:text-2xl"
								data-aos="fade-up"
								data-aos-delay="320"
							>
								Bengaluru-based developer building scalable, real-time web apps with the MERN stack, Java, and
								Python — from React frontends to Spring Boot and Node.js backends, plus Gemini AI, Socket.io, and
								cloud-ready DevOps.
							</p>

							<div className="flex flex-wrap gap-4" data-aos="fade-up" data-aos-delay="380">
								{TECH_TAGS.map((tech) => (
									<TechTag key={tech.label} {...tech} />
								))}
							</div>

							<div className="flex flex-wrap gap-4" data-aos="fade-up" data-aos-delay="420">
								<PrimaryButton href="#Portofolio">Projects</PrimaryButton>
								<SecondaryButton href="#Contact">Contact</SecondaryButton>
							</div>

							<div className="flex flex-wrap gap-4 pt-1" data-aos="fade-up" data-aos-delay="460">
								{SOCIAL_LINKS.map((s) => (
									<SocialTile key={s.link} {...s} />
								))}
							</div>
						</div>

						{/* Right column — laptop scene only */}
						<div className="relative w-full lg:min-h-[560px]">
							<HeroBuiltScene />
						</div>
					</div>

					<HeroStatsBar />
				</div>
			</div>
		</div>
	);
};

export default memo(Home);
