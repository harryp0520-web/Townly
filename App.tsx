import { useState, useEffect, useRef } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────
type AppScreen = "welcome" | "onboard-1" | "onboard-2" | "dashboard"
type Tab = "overview" | "bills" | "budget" | "townsquare" | "profile"
type FeedFilter = "top" | "favor" | "opposed"
type BillFilter = "all" | "state" | "federal" | "local"
type ToastState = "hidden" | "entering" | "visible" | "exiting"

// ─── SVG Donut Chart Helpers ──────────────────────────────────────────────────
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function donutSegmentPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
) {
  const gap = 1.5
  const s = startAngle + gap / 2
  const e = endAngle - gap / 2
  const oS = polarToCartesian(cx, cy, outerR, s)
  const oE = polarToCartesian(cx, cy, outerR, e)
  const iS = polarToCartesian(cx, cy, innerR, e)
  const iE = polarToCartesian(cx, cy, innerR, s)
  const largeArc = e - s > 180 ? 1 : 0
  return [
    `M ${oS.x} ${oS.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${oE.x} ${oE.y}`,
    `L ${iS.x} ${iS.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${iE.x} ${iE.y}`,
    "Z",
  ].join(" ")
}

// ─── Budget Data ──────────────────────────────────────────────────────────────
const BUDGET_SEGMENTS = [
  {
    label: "Public Schools",
    pct: 52,
    amount: "$33.4M",
    color: "#059669",
    yoy: "+4.8%",
    taxImpact: "+$62 / year",
    description:
      "Funds K-12 operations, teacher salaries, and classroom resources across all Livingston public schools.",
  },
  {
    label: "Public Safety",
    pct: 24,
    amount: "$15.4M",
    color: "#2563EB",
    yoy: "+2.1%",
    taxImpact: "+$24 / year",
    description:
      "Covers police department operations, fire prevention, and emergency medical services for the township.",
  },
  {
    label: "Public Works",
    pct: 14,
    amount: "$9.0M",
    color: "#D97706",
    yoy: "+6.3%",
    taxImpact: "+$21 / year",
    description:
      "Maintains roads, bridges, stormwater systems, and town-owned facilities throughout Livingston.",
  },
  {
    label: "Municipal Admin & Library",
    pct: 6,
    amount: "$3.8M",
    color: "#7C3AED",
    yoy: "-1.4%",
    taxImpact: "-$3 / year",
    description:
      "Pays for town hall administration, clerk services, the Livingston Public Library, and parks programming.",
  },
  {
    label: "Capital Debt Service",
    pct: 4,
    amount: "$2.6M",
    color: "#DC2626",
    yoy: "+3.0%",
    taxImpact: "+$14 / year",
    description:
      "Annual principal and interest payments on previously issued municipal bonds for capital improvements.",
  },
]

// ─── Welcome ──────────────────────────────────────────────────────────────────
function TownlyMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-label="Townly"
    >
      <rect x="4" y="4.5" width="16" height="4.5" rx="2.25" fill="currentColor" />
      <rect x="9.75" y="7.5" width="4.5" height="12" rx="2.25" fill="currentColor" />
    </svg>
  )
}

function LaunchNetworkAnimation() {
  const nodes = [
    { cx: 50, cy: 52, label: "N", className: "launch-node-1" },
    { cx: 170, cy: 52, label: "E", className: "launch-node-2" },
    { cx: 42, cy: 150, label: "S", className: "launch-node-3" },
    { cx: 178, cy: 150, label: "W", className: "launch-node-4" },
  ]

  return (
    <svg
      className="h-full w-full overflow-visible"
      viewBox="0 0 220 210"
      fill="none"
      role="img"
      aria-label="Townly connecting local neighborhoods"
    >
      <circle cx="110" cy="104" r="92" fill="#EFF6FF" />
      <circle cx="110" cy="104" r="74" stroke="#DBEAFE" strokeDasharray="3 7" />
      <g className="launch-network-lines" stroke="#2563EB" strokeWidth="3">
        <path d="M91 86 60 61" />
        <path d="m129 86 31-25" />
        <path d="m88 121-35 22" />
        <path d="m132 121 35 22" />
      </g>

      {nodes.map((node) => (
        <g
          key={node.label}
          className={node.className}
          style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
        >
          <circle cx={node.cx} cy={node.cy + 3} r="22" fill="#0F172A" opacity=".1" />
          <circle cx={node.cx} cy={node.cy} r="22" fill="white" stroke="#BFDBFE" strokeWidth="2" />
          <circle cx={node.cx} cy={node.cy} r="14" fill="#DBEAFE" />
          <text
            x={node.cx}
            y={node.cy + 4}
            textAnchor="middle"
            fill="#2563EB"
            fontSize="10"
            fontWeight="800"
          >
            {node.label}
          </text>
        </g>
      ))}

      <g className="launch-network-hub" style={{ transformOrigin: "110px 104px" }}>
        <circle cx="110" cy="109" r="35" fill="#0F172A" opacity=".12" />
        <circle cx="110" cy="104" r="35" fill="#2563EB" />
        <circle cx="110" cy="104" r="27" stroke="#93C5FD" strokeWidth="1.5" opacity=".7" />
        <path
          d="M97 92h26v7h-9v18h-8V99h-9V92Z"
          fill="white"
        />
      </g>

      <g className="launch-network-signal">
        <circle cx="110" cy="104" r="42" stroke="#2563EB" strokeWidth="2" />
      </g>
    </svg>
  )
}

function BallotBoxMascot() {
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 220 220"
      fill="none"
      role="img"
      aria-label="A smiling ballot box mascot"
    >
      <ellipse cx="110" cy="199" rx="67" ry="10" fill="#0F172A" opacity=".18" />
      <g>
        <path
          d="M69 73 94 34c5-8 16-10 24-5l30 20c8 5 10 16 5 24l-18 28"
          fill="#FFF"
          stroke="#0F172A"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <path
          d="m105 47 7 8 15-15"
          stroke="#059669"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="42"
          y="77"
          width="136"
          height="112"
          rx="28"
          fill="#FFF"
          stroke="#0F172A"
          strokeWidth="7"
        />
        <path
          d="M42 106c0-16 13-29 29-29h78c16 0 29 13 29 29v12H42v-12Z"
          fill="#93C5FD"
        />
        <path
          d="M75 94h70"
          stroke="#0F172A"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <circle cx="83" cy="143" r="7" fill="#0F172A" />
        <circle cx="137" cy="143" r="7" fill="#0F172A" />
        <path
          d="M83 160c7 12 19 17 27 17s20-5 27-17"
          stroke="#0F172A"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M51 133c-14 2-23 11-27 24M169 133c14 2 23 11 27 24"
          stroke="#0F172A"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M24 157 13 150M196 157l11-7"
          stroke="#0F172A"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

function WelcomeScreen({
  onGetStarted,
  onLogin,
}: {
  onGetStarted: () => void
  onLogin: () => void
}) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-white text-slate-900">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-blue-50 to-white" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[393px] flex-col px-6 pb-[max(28px,env(safe-area-inset-bottom))] pt-16">
        <div className="welcome-logo-reveal flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-blue-600 text-white">
            <TownlyMark />
          </div>
          <span className="text-[22px] font-800 tracking-tight">Townly</span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center pb-4">
          <div className="welcome-mascot-reveal relative h-52 w-52">
            <LaunchNetworkAnimation />
          </div>
          <div className="welcome-copy-reveal mt-6 text-center">
            <p className="text-[34px] font-800 leading-[1.08] tracking-[-0.035em]">
              Know your town.
              <br />
              Shape what’s next.
            </p>
            <p className="mx-auto mt-4 max-w-xs text-[15px] font-500 leading-relaxed text-slate-500">
              Local budgets, votes, and representatives—made simple for you.
            </p>
          </div>
        </div>

        <div className="welcome-actions-reveal space-y-3">
          <button
            type="button"
            onClick={onGetStarted}
            className="w-full rounded-xl bg-blue-600 py-3.5 text-[15px] font-700 text-white transition-colors hover:bg-blue-700"
          >
            Get Started
          </button>
          <button
            type="button"
            onClick={onLogin}
            className="w-full rounded-xl border border-slate-300 bg-white py-3.5 text-[15px] font-700 text-slate-700 transition-colors hover:bg-slate-50"
          >
            Log In
          </button>
          <p className="pt-2 text-center text-[11px] font-500 text-slate-400">
            Nonpartisan information for every neighbor
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Shared: Onboarding nav bar ───────────────────────────────────────────────
function OnboardNav({ step, onBack }: { step: 1 | 2 onBack?: () => void }) {
  return (
    <div className="bg-white border-b border-slate-100 px-5 pt-14 pb-0 sticky top-0 z-20">
      <div className="flex items-center justify-between h-12">
        <div className="flex items-center gap-2">
          {onBack ? (
            <button
              onClick={onBack}
              className="w-8 h-8 -ml-1 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              <svg
                className="w-4 h-4 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          ) : (
            <div className="w-8" />
          )}
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-[7px] bg-blue-600 text-white">
              <TownlyMark className="h-3.5 w-3.5" />
            </div>
            <span className="text-[15px] font-800 text-slate-800 tracking-tight">
              Townly
            </span>
          </div>
        </div>
        <span className="text-[12px] font-600 text-slate-400">
          Step {step} of 2
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-[3px] bg-slate-100 mt-3 -mx-5">
        <div
          className="h-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: step === 1 ? "50%" : "100%" }}
        />
      </div>
    </div>
  )
}

// ─── Onboarding: Step 1 ───────────────────────────────────────────────────────
function OnboardStep1({ onNext }: { onNext: () => void }) {
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFind(e: React.FormEvent) {
    e.preventDefault()
    if (!address.trim() || loading) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onNext()
    }, 1900)
  }

  function handleLocation() {
    setAddress("15 W Northfield Rd, Livingston, NJ 07039")
  }

  const valueProps = [
    {
      icon: "💰",
      headline: "Follow your tax dollars",
      body: "See every budget line — from school funding to road paving.",
    },
    {
      icon: "🏛️",
      headline: "Track votes that affect you",
      body: "Get plain-English summaries before town council and state votes.",
    },
    {
      icon: "📬",
      headline: "Reach your reps instantly",
      body: "Send a verified constituent message in under 60 seconds.",
    },
  ]

  return (
    <div className="min-h-dvh bg-[#F8FAFC] flex flex-col">
      <OnboardNav step={1} />

      <div className="flex-1 px-5 pt-7 pb-10 overflow-y-auto space-y-6">
        {/* Headline block */}
        <div
          className="onboard-fade-up space-y-2"
          style={{ animationDelay: "0.05s" }}
        >
          <h1 className="text-[28px] font-800 text-[#0F172A] leading-[1.15] tracking-tight">
            Democracy starts
            <br />
            on your block.
          </h1>
          <p className="text-[15px] text-slate-500 leading-relaxed font-400">
            See where your tax dollars go, track what your representatives are
            voting on, and weigh in with 1 click.
          </p>
        </div>

        {/* Value prop cards */}
        <div className="space-y-2.5">
          {valueProps.map((v, i) => (
            <div
              key={i}
              className="onboard-fade-up bg-white rounded-xl border border-slate-100 px-4 py-3.5 flex items-start gap-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
              style={{ animationDelay: `${0.12 + i * 0.09}s` }}
            >
              <span className="text-[22px] leading-none mt-0.5 shrink-0">
                {v.icon}
              </span>
              <div>
                <p className="text-[13px] font-700 text-slate-800">
                  {v.headline}
                </p>
                <p className="text-[12px] text-slate-500 leading-snug mt-0.5">
                  {v.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Address card */}
        <div
          className="onboard-fade-up bg-white rounded-xl border border-slate-100 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-3"
          style={{ animationDelay: "0.4s" }}
        >
          <p className="text-[11px] font-700 uppercase tracking-widest text-slate-400">
            Your Home Address
          </p>

          <form onSubmit={handleFind} className="space-y-3">
            {/* Input */}
            <div
              className={`flex items-center rounded-xl border-2 transition-all duration-200 bg-white ${
                focused
                  ? "border-blue-500 shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
                  : "border-slate-200"
              }`}
            >
              <div className="pl-3.5 shrink-0">
                <svg
                  className={`w-4 h-4 transition-colors duration-150 ${
                    focused ? "text-blue-500" : "text-slate-400"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Enter your home street address"
                className="flex-1 py-3.5 px-2.5 text-[14px] text-slate-800 placeholder:text-slate-400 bg-transparent outline-none"
              />
              {address && (
                <button
                  type="button"
                  onClick={() => setAddress("")}
                  className="pr-3.5 shrink-0"
                >
                  <svg
                    className="w-4 h-4 text-slate-300 hover:text-slate-500 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Helper text */}
            <p className="text-[11px] text-slate-400 flex items-start gap-1.5 leading-relaxed">
              <svg
                className="w-3 h-3 text-slate-400 shrink-0 mt-[1px]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              We use your address strictly to match your exact municipal ward
              and legislative districts. Never sold, never shared.
            </p>

            {/* Use Current Location */}
            <button
              type="button"
              onClick={handleLocation}
              className="flex items-center gap-2 text-[13px] font-600 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span className="text-[15px] leading-none">📍</span>
              Use Current Location
            </button>

            {/* CTA */}
            <button
              type="submit"
              disabled={loading || !address.trim()}
              className={`w-full py-4 rounded-xl text-[15px] font-700 text-white transition-all ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : !address.trim()
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2.5">
                  <span className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/80 dot-1 inline-block" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/80 dot-2 inline-block" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/80 dot-3 inline-block" />
                  </span>
                  Matching your districts…
                </span>
              ) : (
                "Match My Districts"
              )}
            </button>
          </form>
        </div>

        <p
          className="text-center text-[11px] text-slate-400 onboard-fade-up"
          style={{ animationDelay: "0.55s" }}
        >
          Non-partisan · Free forever · No account required
        </p>
      </div>
    </div>
  )
}

// ─── Shared: iOS-style toggle switch ─────────────────────────────────────────
function ToggleSwitch({ on, onToggle }: { on: boolean onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`relative w-[46px] h-[27px] rounded-full border transition-colors duration-200 shrink-0 ${
        on ? "bg-blue-600 border-blue-600" : "bg-slate-200 border-slate-200"
      }`}
    >
      <span
        className={`absolute top-[3px] w-[19px] h-[19px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all duration-200 ${
          on ? "left-[22px]" : "left-[3px]"
        }`}
      />
    </button>
  )
}

// ─── Onboarding: Step 2 ───────────────────────────────────────────────────────
function OnboardStep2({
  onBack,
  onEnter,
}: {
  onBack: () => void
  onEnter: () => void
}) {
  const [govLevels, setGovLevels] = useState({
    local: true,
    state: true,
    federal: false,
  })
  const [topics, setTopics] = useState(new Set(["taxes", "zoning", "schools"]))
  const [delivery, setDelivery] = useState<"instant" | "weekly">("instant")

  function toggleTopic(key: string) {
    setTopics((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const govRows = [
    {
      key: "local" as const,
      label: "Local / Municipal",
      sub: "Town Council, Mayor, School Board, Planning Board",
    },
    {
      key: "state" as const,
      label: "State Level",
      sub: "NJ State Senate & General Assembly",
    },
    {
      key: "federal" as const,
      label: "Federal Level",
      sub: "US House & Senate",
    },
  ]

  const topicChips = [
    { key: "taxes", icon: "🏠", label: "Property Taxes & Town Budget" },
    { key: "zoning", icon: "🏗️", label: "Zoning & Local Development" },
    { key: "schools", icon: "🏫", label: "Public Schools & Education" },
    { key: "roads", icon: "🚦", label: "Roads, Traffic & Transit" },
    { key: "parks", icon: "🌳", label: "Parks & Environment" },
    { key: "safety", icon: "👮", label: "Public Safety & First Responders" },
    { key: "biz", icon: "💼", label: "Small Business & Commercial" },
  ]

  return (
    <div className="step-transition min-h-dvh bg-[#F8FAFC] flex flex-col">
      <OnboardNav step={2} onBack={onBack} />

      {/* Scrollable body + sticky footer */}
      <div className="flex-1 overflow-y-auto pb-28">
        <div className="px-5 pt-5 space-y-4">
          {/* Confirmation banner */}
          <div
            className="onboard-fade-up bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-3 flex items-start gap-3"
            style={{ animationDelay: "0.04s" }}
          >
            <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="white"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-700 text-emerald-800 leading-snug">
                📍 Livingston, NJ 07039
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5 leading-snug">
                Matched to Essex County · LD-27 · NJ-11
              </p>
            </div>
          </div>

          {/* Headline */}
          <div
            className="onboard-fade-up space-y-1"
            style={{ animationDelay: "0.1s" }}
          >
            <h2 className="text-[26px] font-800 text-[#0F172A] leading-tight tracking-tight">
              Customize your alerts
            </h2>
            <p className="text-[14px] text-slate-500 leading-relaxed">
              Choose what reaches your phone. You can change these anytime.
            </p>
          </div>

          {/* Section A: Government levels */}
          <div
            className="onboard-fade-up bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden"
            style={{ animationDelay: "0.18s" }}
          >
            <div className="px-4 pt-3.5 pb-2">
              <p className="text-[10px] font-700 uppercase tracking-widest text-slate-400">
                Government Levels
              </p>
            </div>
            {govRows.map((row, i) => (
              <div key={row.key}>
                {i > 0 && <div className="h-px bg-slate-100 mx-4" />}
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-600 text-slate-800">
                      {row.label}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                      {row.sub}
                    </p>
                  </div>
                  <ToggleSwitch
                    on={govLevels[row.key]}
                    onToggle={() =>
                      setGovLevels((g) => ({ ...g, [row.key]: !g[row.key] }))
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Section B: Topic chips */}
          <div
            className="onboard-fade-up bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-4"
            style={{ animationDelay: "0.26s" }}
          >
            <p className="text-[10px] font-700 uppercase tracking-widest text-slate-400 mb-3">
              Topics That Matter to You
            </p>
            <div className="grid grid-cols-2 gap-2">
              {topicChips.map((chip) => {
                const sel = topics.has(chip.key)
                return (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => toggleTopic(chip.key)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                      sel
                        ? "bg-[#0F172A] border-[#0F172A] text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-[15px] leading-none shrink-0">
                      {chip.icon}
                    </span>
                    <span
                      className={`text-[11px] font-600 leading-tight ${
                        sel ? "text-white" : "text-slate-700"
                      }`}
                    >
                      {chip.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Delivery frequency */}
          <div
            className="onboard-fade-up bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-4 py-3.5"
            style={{ animationDelay: "0.34s" }}
          >
            <p className="text-[10px] font-700 uppercase tracking-widest text-slate-400 mb-3">
              Notification Delivery
            </p>
            <div className="flex gap-2">
              {(["instant", "weekly"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDelivery(mode)}
                  className={`flex-1 py-2.5 rounded-xl border text-[13px] font-600 transition-all ${
                    delivery === mode
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-100"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {mode === "instant" ? "⚡ Instant Push" : "📋 Weekly Digest"}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {delivery === "instant"
                ? "Get notified within minutes of relevant votes and hearings."
                : "Receive a Sunday evening digest of the week's civic activity."}
            </p>
          </div>
        </div>
      </div>

      {/* Sticky footer CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] bg-white border-t border-slate-100 px-5 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <button
          onClick={onEnter}
          className="w-full py-4 rounded-xl bg-blue-600 text-white text-[15px] font-700 shadow-sm shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          Complete Setup & Enter Dashboard
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>
        <p className="text-center text-[11px] text-slate-400 mt-2">
          You can edit these preferences anytime in Settings
        </p>
      </div>
    </div>
  )
}

// ─── Town Square data ────────────────────────────────────────────────────────
const TS_COMMENTS = [
  {
    id: "c1",
    stance: "opposed" as const,
    initials: "MB",
    avatarBg: "#DC2626",
    name: "Michael B.",
    street: "Hillside Ave (Ward 2)",
    badge: "Verified Homeowner · 12 yrs",
    tag: "Traffic & School Density",
    tagBg: "#FEF2F2",
    tagFg: "#DC2626",
    body: "The Northfield Rd intersection is already backed up during 8:00 AM school drop-offs. Adding a 45-unit mixed-use complex without widening the turn lane will gridlock the avenue.",
    agrees: 42,
    replies: 8,
  },
  {
    id: "c2",
    stance: "favor" as const,
    initials: "SL",
    avatarBg: "#059669",
    name: "Sarah L.",
    street: "S. Livingston Ave",
    badge: "Verified Local Resident",
    tag: "Walkability & Downtown Vibrancy",
    tagBg: "#F0FDF4",
    tagFg: "#059669",
    body: "Our downtown needs foot traffic to keep independent restaurants and coffee shops alive. Young professionals and empty-nester seniors need downsized housing options.",
    agrees: 19,
    replies: 3,
  },
  {
    id: "c3",
    stance: "opposed" as const,
    initials: "RK",
    avatarBg: "#7C3AED",
    name: "Richard K.",
    street: "Maple Ave (Ward 1)",
    badge: "Verified Homeowner · 8 yrs",
    tag: "Infrastructure & Parking",
    tagBg: "#FEF2F2",
    tagFg: "#DC2626",
    body: "There is zero additional parking planned. The existing municipal lot on W. Northfield is already at capacity on weekends. Who absorbs the 45 additional cars this development will generate?",
    agrees: 31,
    replies: 5,
  },
  {
    id: "c4",
    stance: "favor" as const,
    initials: "AP",
    avatarBg: "#2563EB",
    name: "Amanda P.",
    street: "E. Mt. Pleasant Ave",
    badge: "Verified Local Resident",
    tag: "Housing Affordability",
    tagBg: "#EFF6FF",
    tagFg: "#2563EB",
    body: "My daughter grew up here and can't afford to move back. This development includes 8 affordable units at 80% AMI — that's real housing for local families who want to stay.",
    agrees: 28,
    replies: 6,
  },
]

// ─── Stance Perspective Drawer ────────────────────────────────────────────────
function StancePerspectiveDrawer({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: () => void
}) {
  const [stance, setStance] = useState<"support" | "oppose" | null>(null)
  const [reason, setReason] = useState("")
  const [street, setStreet] = useState("")
  const [focused, setFocused] = useState<"reason" | "street" | null>(null)

  const canSubmit = stance !== null && reason.trim().length > 12

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div
        className="overlay-enter absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="sheet-enter relative w-full bg-white rounded-t-3xl shadow-2xl max-h-[88dvh] overflow-y-auto scrollbar-show">
        <div className="flex justify-center pt-3 pb-0">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>
        <div className="px-4 pt-3 pb-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[11px] font-700 uppercase tracking-widest text-blue-600 mb-0.5">
                Ordinance 14-2026
              </p>
              <p className="text-[17px] font-800 text-slate-800 leading-snug">
                Share Your Perspective
              </p>
              <p className="text-[12px] text-slate-400 mt-0.5">
                Only verified Livingston residents can post
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mt-0.5"
            >
              <svg
                className="w-4 h-4 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Step 1: Stance */}
          <div className="mb-4">
            <p className="text-[11px] font-700 uppercase tracking-widest text-slate-400 mb-2">
              Your Stance
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["support", "oppose"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStance(s)}
                  className={`py-3 rounded-xl border-2 text-[13px] font-700 transition-all ${
                    stance === s
                      ? s === "support"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-red-400 bg-red-50 text-red-700"
                      : "border-slate-200 text-slate-500 bg-white"
                  }`}
                >
                  {s === "support" ? "👍 I Support" : "👎 I Oppose"}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: One concrete reason */}
          <div className="mb-4">
            <p className="text-[11px] font-700 uppercase tracking-widest text-slate-400 mb-2">
              One Concrete Reason
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onFocus={() => setFocused("reason")}
              onBlur={() => setFocused(null)}
              placeholder="e.g. The intersection at Northfield Rd already backs up during school drop-off…"
              rows={4}
              className={`w-full rounded-xl border-2 p-3 text-[14px] text-slate-800 placeholder:text-slate-400 outline-none resize-none transition-all ${
                focused === "reason"
                  ? "border-blue-500 shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
                  : "border-slate-200"
              }`}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {reason.trim().length} / 280 characters · Be specific and
              fact-based.
            </p>
          </div>

          {/* Step 3: Street name */}
          <div className="mb-5">
            <p className="text-[11px] font-700 uppercase tracking-widest text-slate-400 mb-2">
              Your Street Name{" "}
              <span className="normal-case font-500 text-slate-400">
                (displayed publicly)
              </span>
            </p>
            <div
              className={`flex items-center gap-2 rounded-xl border-2 transition-all px-3 ${
                focused === "street"
                  ? "border-blue-500 shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
                  : "border-slate-200"
              }`}
            >
              <svg
                className="w-3.5 h-3.5 text-slate-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                onFocus={() => setFocused("street")}
                onBlur={() => setFocused(null)}
                placeholder="e.g. Hillside Ave (Ward 2)"
                className="flex-1 py-3 text-[14px] text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <svg
                className="w-3 h-3 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Full address is never shown. Street name only, for community
              context.
            </p>
          </div>

          <button
            onClick={() => {
              if (canSubmit) onSubmit()
            }}
            disabled={!canSubmit}
            className={`w-full py-3.5 rounded-xl text-[14px] font-700 text-white transition-all ${
              canSubmit
                ? "bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-100"
                : "bg-blue-300 cursor-not-allowed"
            }`}
          >
            Submit to Community Feed
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── View: Town Square ────────────────────────────────────────────────────────
function TownSquareView() {
  const [userVote, setUserVote] = useState<"support" | "oppose" | null>(null)
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("top")
  const [showStanceDrawer, setShowStanceDrawer] = useState(false)
  const [savedPoints, setSavedPoints] = useState<Set<string>>(new Set())
  const [agreedIds, setAgreedIds] = useState<Set<string>>(new Set())
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [rsvped, setRsvped] = useState(false)
  const [signed, setSigned] = useState(false)
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(msg: string) {
    setToastMsg(msg)
    if (toastRef.current) clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setToastMsg(null), 2600)
  }

  function toggleSaved(id: string, label: string) {
    setSavedPoints((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        showToast("Removed from letter draft")
      } else {
        next.add(id)
        showToast("📌 Talking point saved to your rep letter")
      }
      return next
    })
  }

  function toggleAgree(id: string) {
    setAgreedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered =
    feedFilter === "top"
      ? TS_COMMENTS
      : feedFilter === "favor"
        ? TS_COMMENTS.filter((c) => c.stance === "favor")
        : TS_COMMENTS.filter((c) => c.stance === "opposed")

  const filterOptions: { key: FeedFilter label: string }[] = [
    { key: "top", label: "Top Perspectives" },
    { key: "favor", label: "In Favor (48)" },
    { key: "opposed", label: "Opposed (112)" },
  ]

  const delegationAvatars = [
    { initials: "TM", bg: "#2563EB" },
    { initials: "JS", bg: "#059669" },
    { initials: "LW", bg: "#7C3AED" },
    { initials: "KR", bg: "#D97706" },
    { initials: "PB", bg: "#0F172A" },
  ]
  const avatarClasses = [
    "avatar-1",
    "avatar-2",
    "avatar-3",
    "avatar-4",
    "avatar-5",
  ]

  return (
    <div className="tab-content-enter pb-44 space-y-3">
      {/* ── Page header ── */}
      <div className="bg-[#0F172A] -mx-4 -mt-4 px-4 pt-4 pb-4">
        {/* Verified badge */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="flex items-center gap-1.5 bg-slate-700/60 border border-slate-600 rounded-full px-2.5 py-1">
            <div className="live-blip w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-700 text-slate-300 uppercase tracking-wider">
              🔒 Verified Neighbors Only (Matched by Ward/Street)
            </span>
          </div>
        </div>
        <h1 className="text-[20px] font-800 text-white leading-tight tracking-tight">
          Community Discourse
        </h1>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Verified Livingston Residents · Ordinance 14-2026 Discussion
        </p>
      </div>

      {/* ── Live Community Pulse Meter ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[14px] font-800 text-slate-800 leading-tight">
              Where the Community Stands
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Based on 284 verified local votes across Wards 1–4
            </p>
          </div>
          <div className="flex items-center gap-1">
            <div className="live-blip w-2 h-2 rounded-full bg-red-400" />
            <span className="text-[10px] font-700 text-red-500 uppercase tracking-wider">
              Live
            </span>
          </div>
        </div>

        {/* Split bar */}
        <div className="rounded-xl overflow-hidden flex h-3 bg-slate-100 mb-2">
          <div
            className="bar-fill-oppose h-full bg-red-400 rounded-l-xl"
            style={{ width: "64%" }}
          />
          <div
            className="bar-fill-favor h-full bg-emerald-500"
            style={{ width: "28%" }}
          />
          <div
            className="bar-fill-neutral h-full bg-slate-300 rounded-r-xl"
            style={{ width: "8%" }}
          />
        </div>

        {/* Legend */}
        <div className="flex gap-3 mb-4">
          {[
            { label: "Opposed", pct: "64%", color: "#EF4444", bg: "#FEF2F2" },
            { label: "In Favor", pct: "28%", color: "#10B981", bg: "#F0FDF4" },
            { label: "Undecided", pct: "8%", color: "#94A3B8", bg: "#F8FAFC" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] text-slate-500">{item.pct}</span>
              <span className="text-[11px] font-600 text-slate-600">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Vote buttons */}
        <div className="flex gap-2">
          {(["support", "oppose"] as const).map((v) => {
            const active = userVote === v
            const isSupport = v === "support"
            return (
              <button
                key={v}
                onClick={() => setUserVote(userVote === v ? null : v)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-[13px] font-700 transition-all ${
                  active
                    ? isSupport
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-100"
                      : "bg-red-500 border-red-500 text-white shadow-sm shadow-red-100"
                    : isSupport
                      ? "border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                      : "border-red-200 text-red-600 bg-red-50 hover:bg-red-100"
                }`}
              >
                {active && (
                  <svg
                    className="w-3.5 h-3.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                {isSupport ? "👍 I Support" : "👎 I Oppose"}
              </button>
            )
          })}
        </div>
        {userVote && (
          <p className="text-[11px] text-center text-slate-400 mt-2">
            Your vote is counted ·{" "}
            <button
              onClick={() => setUserVote(null)}
              className="text-blue-500 underline"
            >
              Change
            </button>
          </p>
        )}
      </div>

      {/* ── Discussion Feed ── */}
      <div className="space-y-3">
        {/* Segmented filter */}
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-0.5">
          {filterOptions.map((f) => (
            <button
              key={f.key}
              onClick={() => setFeedFilter(f.key)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-600 border transition-all ${
                feedFilter === f.key
                  ? "bg-[#0F172A] text-white border-[#0F172A]"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => setShowStanceDrawer(true)}
            className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-600 border border-blue-300 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Submit Stance
          </button>
        </div>

        {/* Comment cards */}
        {filtered.map((comment) => {
          const isOpposed = comment.stance === "opposed"
          const agreed = agreedIds.has(comment.id)
          const saved = savedPoints.has(comment.id)
          return (
            <div
              key={comment.id}
              className={`bg-white rounded-2xl border shadow-sm p-4 ${
                isOpposed
                  ? "border-l-[3px] border-l-red-300 border-slate-100"
                  : "border-l-[3px] border-l-emerald-400 border-slate-100"
              }`}
            >
              {/* Author header */}
              <div className="flex items-start gap-2.5 mb-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[13px] font-800 shrink-0"
                  style={{ backgroundColor: comment.avatarBg }}
                >
                  {comment.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-700 text-slate-800 leading-tight">
                    {comment.name} ·{" "}
                    <span className="font-500 text-slate-500">
                      {comment.street}
                    </span>
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-[10px] font-700 bg-[#0F172A] text-white px-2 py-0.5 rounded-full">
                      {comment.badge}
                    </span>
                    <span
                      className={`text-[10px] font-700 px-2 py-0.5 rounded-full`}
                      style={{
                        backgroundColor: comment.tagBg,
                        color: comment.tagFg,
                      }}
                    >
                      {comment.tag}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-700 px-2 py-0.5 rounded-full shrink-0 ${
                    isOpposed
                      ? "bg-red-50 text-red-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {isOpposed ? "Opposed" : "In Favor"}
                </span>
              </div>

              {/* Body */}
              <p className="text-[13px] text-slate-700 leading-relaxed mb-3">
                &ldquo;{comment.body}&rdquo;
              </p>

              {/* Action row */}
              <div className="flex items-center gap-1 pt-2 border-t border-slate-100">
                <button
                  onClick={() => toggleAgree(comment.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-600 transition-all ${
                    agreed
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <span
                    className={
                      agreed ? "agree-pop inline-block" : "inline-block"
                    }
                  >
                    🔺
                  </span>
                  Agree ({comment.agrees + (agreed ? 1 : 0)})
                </button>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-600 text-slate-500 hover:bg-slate-100">
                  💬 {comment.replies} Replies
                </button>
                <div className="flex-1" />
                <button
                  onClick={() =>
                    toggleSaved(comment.id, comment.body.slice(0, 40))
                  }
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-700 transition-all ${
                    saved
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  📌 {saved ? "Saved to Letter" : "Add to Letter"}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Neighbor Action Group ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-[18px]">
            🤝
          </div>
          <div>
            <p className="text-[14px] font-800 text-slate-800 leading-snug">
              Join the Community Delegation
            </p>
            <p className="text-[12px] text-slate-500 leading-relaxed mt-0.5">
              14 neighbors are attending{" "}
              <span className="font-700 text-slate-700">Tuesday's 7:30 PM</span>{" "}
              Town Council meeting to speak during the 3-minute public comment
              window.
            </p>
          </div>
        </div>

        {/* Avatar stack */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-2">
            {delegationAvatars.map((av, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-[11px] font-800 ${avatarClasses[i]}`}
                style={{ backgroundColor: av.bg, zIndex: 5 - i }}
              >
                {av.initials}
              </div>
            ))}
            <div
              className={`w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-700 text-slate-600 avatar-6`}
              style={{ zIndex: 0 }}
            >
              +9
            </div>
          </div>
          <p className="text-[11px] text-slate-400 ml-1">
            14 confirmed attendees
          </p>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => setRsvped(!rsvped)}
            className={`w-full py-3 rounded-xl text-[13px] font-700 transition-all flex items-center justify-center gap-2 ${
              rsvped
                ? "bg-emerald-500 text-white shadow-sm shadow-emerald-100"
                : "bg-blue-600 text-white shadow-sm shadow-blue-100 hover:bg-blue-700"
            }`}
          >
            {rsvped ? (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                You're Attending — Seat Reserved
              </>
            ) : (
              "RSVP to Sit Together at Meeting"
            )}
          </button>
          <button
            onClick={() => setSigned(!signed)}
            className={`w-full py-3 rounded-xl text-[13px] font-700 border-2 transition-all flex items-center justify-center gap-2 ${
              signed
                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {signed
              ? "✅ Statement Signed"
              : "Sign the Joint Resident Statement"}
          </button>
        </div>
      </div>

      {/* ── Stance Drawer ── */}
      <StancePerspectiveDrawer
        open={showStanceDrawer}
        onClose={() => setShowStanceDrawer(false)}
        onSubmit={() => {
          setShowStanceDrawer(false)
          showToast("✅ Your perspective has been added to the feed!")
        }}
      />

      {/* ── Toast ── */}
      {toastMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 toast-enter">
          <div className="bg-[#0F172A] text-white text-[12px] font-600 px-4 py-2.5 rounded-2xl shadow-xl whitespace-nowrap">
            {toastMsg}
          </div>
        </div>
      )}

      {/* ── Floating bottom action bar ── */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[393px] z-20 px-4 py-3 bg-white/90 backdrop-blur-md border-t border-slate-200 flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.07)]">
        <button
          onClick={() => setShowStanceDrawer(true)}
          className="flex items-center gap-2 flex-1 py-2.5 px-3.5 rounded-xl bg-blue-600 text-white text-[13px] font-700 shadow-sm shadow-blue-100 hover:bg-blue-700 transition-all"
        >
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Share Your Perspective
        </button>
        <button
          onClick={() => showToast("📲 Invite link copied!")}
          className="w-11 h-11 rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shrink-0"
          aria-label="Invite a neighbor"
        >
          <svg
            className="w-4.5 h-4.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── View: Community Social Feed ─────────────────────────────────────────────
type CommunityPost = {
  id: number
  name: string
  handle: string
  initials: string
  avatar: string
  time: string
  body: string
  topic: string
  likes: number
  comments: number
  verified?: boolean
  attachment?: "event" | "project" | "cleanup" | "user-media"
  mediaUrl?: string
  mediaKind?: "photo" | "video"
  area: "northfield" | "center" | "riker"
  topComment?: {
    name: string
    initials: string
    body: string
    source: "official" | "neighbor"
  }
}

function CommunityFeedView({ onOpenBudget }: { onOpenBudget: () => void }) {
  const [activeArea, setActiveArea] = useState<
    "townwide" | "northfield" | "center" | "riker"
  >("townwide")
  const [activeFilter, setActiveFilter] =
    useState<"foryou" | "latest" | "following">("foryou")
  const [likedPosts, setLikedPosts] = useState(new Set<number>([2]))
  const [savedPosts, setSavedPosts] = useState(new Set<number>())
  const [following, setFollowing] = useState(
    new Set(["Livingston Public Library"]),
  )
  const [showComposer, setShowComposer] = useState(false)
  const [draft, setDraft] = useState("")
  const [composerMode, setComposerMode] = useState<"text" | "media">("text")
  const [composerMedia, setComposerMedia] = useState<string | null>(null)
  const [composerMediaKind, setComposerMediaKind] = useState<
    "photo" | "video"
  >("photo")
  const [rsvped, setRsvped] = useState(false)
  const [eventReminder, setEventReminder] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showMessages, setShowMessages] = useState(false)
  const [activeConversation, setActiveConversation] = useState<number | null>(
    null,
  )
  const [dmDraft, setDmDraft] = useState("")
  const [sentMessages, setSentMessages] = useState<Record<number, string[]>>({})
  const [activeStory, setActiveStory] = useState<number | null>(null)
  const [heartPost, setHeartPost] = useState<number | null>(null)
  const [livePulse, setLivePulse] = useState(0)
  const [ballotVotes, setBallotVotes] = useState<Record<number, string>>({})
  const [feedTouchStart, setFeedTouchStart] = useState<number | null>(null)
  const [mediaViewer, setMediaViewer] = useState<
    "project" | "budget-pdf" | null
  >(null)
  const [expandedComments, setExpandedComments] = useState(new Set<number>())
  const [replyFilter, setReplyFilter] = useState<
    "top" | "officials" | "verified"
  >("top")
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({})
  const [newComments, setNewComments] = useState<Record<number, string[]>>({})
  const [feedToast, setFeedToast] = useState<{
    message: string
    undo?: () => void
  } | null>(null)
  const feedToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const timer = window.setInterval(
      () => setLivePulse((current) => (current + 1) % 20),
      4200,
    )
    return () => window.clearInterval(timer)
  }, [])
  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: 1,
      name: "Sarah L.",
      handle: "@sarahwalks",
      initials: "SL",
      avatar: "bg-emerald-600",
      time: "18m",
      body: "Spotted the new curb extensions going in near Northfield Center this morning. This should make the crossing much easier for families and older neighbors.",
      topic: "Walkability",
      likes: 34,
      comments: 7,
      verified: true,
      attachment: "project",
      area: "northfield",
      topComment: {
        name: "Jordan K.",
        initials: "JK",
        body: "This looks great. I hope the next phase includes the school crossing too.",
        source: "neighbor",
      },
    },
    {
      id: 2,
      name: "Livingston Public Library",
      handle: "@livingstonlibrary",
      initials: "LP",
      avatar: "bg-blue-600",
      time: "1h",
      body: "Join us Thursday for a plain-English walkthrough of the proposed municipal budget. Bring your questions—town staff will be there.",
      topic: "Local Event",
      likes: 52,
      comments: 12,
      verified: true,
      attachment: "event",
      area: "center",
      topComment: {
        name: "Livingston Finance Office",
        initials: "LF",
        body: "A recording and the presentation deck will be posted on the township website the following morning.",
        source: "official",
      },
    },
    {
      id: 3,
      name: "Michael B.",
      handle: "@michaelb",
      initials: "MB",
      avatar: "bg-amber-600",
      time: "3h",
      body: "The Memorial Park cleanup crew filled 18 bags this weekend. Thanks to everyone who showed up, especially the student volunteers from LHS.",
      topic: "Community",
      likes: 81,
      comments: 9,
      verified: true,
      attachment: "cleanup",
      area: "riker",
      topComment: {
        name: "Nina R.",
        initials: "NR",
        body: "Our block is joining the next cleanup. Please share the date when it is set.",
        source: "neighbor",
      },
    },
  ])

  function toggleSet(
    setter: React.Dispatch<React.SetStateAction<Set<number>>>,
    id: number,
  ) {
    setter((current) => {
      const next = new Set(current)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleFollow(name: string) {
    const wasFollowing = following.has(name)
    setFollowing((current) => {
      const next = new Set(current)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
    showFeedToast(
      wasFollowing ? `Unfollowed ${name}` : `Following ${name}`,
      () =>
        setFollowing((current) => {
          const next = new Set(current)
          wasFollowing ? next.add(name) : next.delete(name)
          return next
        }),
    )
  }

  function publishPost() {
    if (
      (composerMode === "text" && !draft.trim()) ||
      (composerMode === "media" && !composerMedia)
    )
      return
    setPosts((current) => [
      {
        id: Date.now(),
        name: "Alex Morgan",
        handle: "@alexinlivingston",
        initials: "AM",
        avatar: "bg-slate-900",
        time: "Now",
        body: draft.trim(),
        topic: "Neighborhood",
        likes: 0,
        comments: 0,
        verified: true,
        attachment: composerMode === "media" ? "user-media" : undefined,
        mediaUrl: composerMode === "media" ? composerMedia ?? undefined : undefined,
        mediaKind: composerMode === "media" ? composerMediaKind : undefined,
        area: activeArea === "townwide" ? "center" : activeArea,
      },
      ...current,
    ])
    setDraft("")
    setComposerMode("text")
    setComposerMedia(null)
    setShowComposer(false)
  }

  function toggleComments(id: number) {
    setExpandedComments((current) => {
      const next = new Set(current)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function publishComment(id: number) {
    const comment = commentDrafts[id]?.trim()
    if (!comment) return
    setNewComments((current) => ({
      ...current,
      [id]: [...(current[id] ?? []), comment],
    }))
    setCommentDrafts((current) => ({ ...current, [id]: "" }))
  }

  function showFeedToast(message: string, undo?: () => void) {
    if (feedToastTimer.current) window.clearTimeout(feedToastTimer.current)
    setFeedToast({ message, undo })
    feedToastTimer.current = window.setTimeout(
      () => setFeedToast(null),
      undo ? 4200 : 2200,
    )
  }

  function toggleSavedPost(id: number, wasSaved: boolean) {
    toggleSet(setSavedPosts, id)
    showFeedToast(wasSaved ? "Removed from saved posts" : "Saved for later", () =>
      setSavedPosts((current) => {
        const next = new Set(current)
        wasSaved ? next.add(id) : next.delete(id)
        return next
      }),
    )
  }

  function toggleEventRsvp() {
    const wasRsvped = rsvped
    setRsvped(!wasRsvped)
    showFeedToast(
      wasRsvped ? "RSVP canceled" : "You’re going to Budget Q&A Night",
      () => setRsvped(wasRsvped),
    )
  }

  function toggleEventReminder() {
    const next = !eventReminder
    setEventReminder(next)
    showFeedToast(next ? "Reminder set for one hour before" : "Reminder removed")
  }

  function downloadCalendarEvent() {
    const calendar = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      "DTSTART:20261010T223000Z",
      "DTEND:20261011T000000Z",
      "SUMMARY:Livingston Budget Q&A Night",
      "LOCATION:Livingston Community Room",
      "DESCRIPTION:Plain-English walkthrough of the proposed municipal budget.",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n")
    const url = URL.createObjectURL(
      new Blob([calendar], { type: "text/calendar" }),
    )
    const link = document.createElement("a")
    link.href = url
    link.download = "townly-budget-qa.ics"
    link.click()
    URL.revokeObjectURL(url)
    showFeedToast("Calendar event downloaded")
  }

  function undoToastAction() {
    feedToast?.undo?.()
    if (feedToastTimer.current) window.clearTimeout(feedToastTimer.current)
    setFeedToast(null)
  }

  const visiblePosts = posts.filter(
    (post) =>
      (activeArea === "townwide" || post.area === activeArea) &&
      (activeFilter !== "following" || following.has(post.name)),
  )

  const searchItems = [
    {
      type: "Bill",
      title: "A4120 Clean Water Infrastructure Bond",
      detail: "Floor vote next week · Effective July 1, 2027 if enacted",
    },
    {
      type: "Hearing",
      title: "Municipal Budget Public Hearing",
      detail: "Oct 7 at 7:30 PM · Town Hall",
    },
    {
      type: "Discussion",
      title: "Northfield Center curb extensions",
      detail: "34 reactions · 7 neighborhood replies",
    },
    {
      type: "Event",
      title: "Budget Q&A Night",
      detail: "Oct 10 at 6:30 PM · Community Room",
    },
  ].filter((item) =>
    `${item.type} ${item.title} ${item.detail}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  )

  const stories = [
    {
      label: "Budget Live",
      initials: "LF",
      color: "from-blue-700 to-blue-500",
      eyebrow: "Live now",
      title: "Budget Q&A from Town Hall",
      detail: "Finance staff are answering resident questions about the proposed 2026 municipal budget.",
      live: true,
    },
    {
      label: "DPW Paving",
      initials: "DP",
      color: "from-amber-600 to-orange-400",
      eyebrow: "Public Works",
      title: "Northfield paving update",
      detail: "Crews completed the first asphalt layer this morning. Final striping is scheduled for Friday.",
      live: false,
    },
    {
      label: "Parks",
      initials: "PR",
      color: "from-emerald-700 to-emerald-400",
      eyebrow: "Parks & Recreation",
      title: "Memorial Park trail is open",
      detail: "The renovated loop now includes new lighting, drainage, and accessible seating areas.",
      live: false,
    },
    {
      label: "Schools",
      initials: "BO",
      color: "from-violet-700 to-fuchsia-500",
      eyebrow: "Board of Education",
      title: "Tonight’s board agenda",
      detail: "The meeting includes transportation contracts and the preliminary facilities plan.",
      live: false,
    },
  ]

  useEffect(() => {
    if (activeStory === null) return
    const timer = window.setTimeout(() => {
      setActiveStory((current) => {
        if (current === null) return null
        return current === stories.length - 1 ? null : current + 1
      })
    }, 4800)
    return () => window.clearTimeout(timer)
  }, [activeStory, stories.length])

  const conversations = [
    {
      id: 1,
      name: "Maya Chen",
      initials: "MC",
      color: "bg-fuchsia-600",
      status: "Active 8m ago",
      preview: "I can share the school board agenda with you.",
      time: "12m",
      unread: 2,
      messages: [
        { from: "them", body: "Hi Alex, thanks for following the facilities discussion." },
        { from: "me", body: "Of course. Is the new agenda available yet?" },
        { from: "them", body: "I can share the school board agenda with you." },
      ],
    },
    {
      id: 2,
      name: "Livingston Public Library",
      initials: "LP",
      color: "bg-blue-600",
      status: "Typically replies within an hour",
      preview: "Your seat for Budget Q&A is confirmed.",
      time: "1h",
      unread: 0,
      messages: [
        { from: "them", body: "Your seat for Budget Q&A is confirmed." },
        { from: "them", body: "Doors open at 6:00 PM in the Community Room." },
      ],
    },
    {
      id: 3,
      name: "David R.",
      initials: "DR",
      color: "bg-cyan-600",
      status: "Active yesterday",
      preview: "Let’s compare notes after the hearing.",
      time: "Tue",
      unread: 0,
      messages: [
        { from: "me", body: "Are you attending the water project hearing?" },
        { from: "them", body: "Yes. Let’s compare notes after the hearing." },
      ],
    },
  ]

  function changeFeedBySwipe(endX: number) {
    if (feedTouchStart === null) return
    const delta = endX - feedTouchStart
    if (Math.abs(delta) < 60) return
    const order: Array<"following" | "foryou" | "latest"> = [
      "following",
      "foryou",
      "latest",
    ]
    const current = order.indexOf(activeFilter)
    const next =
      delta < 0
        ? Math.min(current + 1, order.length - 1)
        : Math.max(current - 1, 0)
    setActiveFilter(order[next])
    setFeedTouchStart(null)
  }

  const postMedia: Record<
    number,
    { url: string alt: string slides: number attribution: string }
  > = {
    1: {
      url: "https://images.unsplash.com/photo-1769373667286-32020c29b8a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1080",
      alt: "People using a pedestrian crosswalk on a town street",
      slides: 3,
      attribution: "Photo by Oles Borys on Unsplash",
    },
    2: {
      url: "https://images.unsplash.com/photo-1713561530306-ed01dd387940?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1080",
      alt: "Town hall building",
      slides: 2,
      attribution: "Photo by Anushree Deshpande on Unsplash",
    },
    3: {
      url: "https://images.unsplash.com/photo-1758599668299-beebedfabf7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1080",
      alt: "Community volunteers cleaning a park",
      slides: 4,
      attribution: "Photo by Vitaly Gariev on Unsplash",
    },
  }

  function doubleTapLike(postId: number) {
    setLikedPosts((current) => {
      const next = new Set(current)
      next.add(postId)
      return next
    })
    setHeartPost(postId)
    window.setTimeout(() => setHeartPost(null), 700)
  }

  function sendDirectMessage() {
    if (activeConversation === null || !dmDraft.trim()) return
    setSentMessages((current) => ({
      ...current,
      [activeConversation]: [
        ...(current[activeConversation] ?? []),
        dmDraft.trim(),
      ],
    }))
    setDmDraft("")
  }

  const currentConversation =
    conversations.find((conversation) => conversation.id === activeConversation) ??
    null

  return (
    <div className="tab-content-enter -mx-4 -mt-4 bg-[#F4F6F8] pb-28 text-slate-900">
      <div className="relative border-b border-slate-200 bg-white px-4 pb-4 pt-5">
        <div className="relative flex items-center justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1">
              <span className="live-blip h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-700 uppercase tracking-wider text-emerald-700">
                1,284 neighbors online
              </span>
            </div>
            <span className="ml-1.5 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[8px] font-800 uppercase tracking-wider text-amber-700">
              3 day civic streak
            </span>
            <p className="text-[22px] font-800 leading-tight tracking-tight text-slate-900">
              Town Square
            </p>
            <p className="mt-1 text-[11px] font-500 text-slate-500">
              Live sentiment and verified local updates
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowSearch(true)}
              aria-label="Search Town Square"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600"
            >
              <svg
                className="h-4.5 w-4.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setShowMessages(true)}
              aria-label="Open direct messages"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600"
            >
              <svg
                className="h-4.5 w-4.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.7-5.1A7 7 0 0 1 3 12c0-4.4 4-8 9-8s9 3.6 9 8v3Z" />
              </svg>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-blue-600" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowComposer(true)}
          className="relative mt-4 flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-left"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-[11px] font-800 text-white">
            AM
          </div>
          <span className="flex-1 text-[12px] font-600 text-slate-400">
            Share something with your neighbors…
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </button>
      </div>

      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex gap-4 overflow-x-auto">
          {stories.map((story, index) => (
            <button
              key={story.label}
              type="button"
              onClick={() => setActiveStory(index)}
              className="flex w-16 shrink-0 flex-col items-center gap-1.5"
            >
              <span
                className={`relative rounded-full p-[2px] ${
                  story.live
                    ? "bg-gradient-to-br from-red-400 via-orange-400 to-amber-300 shadow-[0_0_16px_rgba(248,113,113,0.55)]"
                    : "bg-gradient-to-br from-cyan-400 to-emerald-400 shadow-[0_0_14px_rgba(34,211,238,0.3)]"
                }`}
              >
                <span className="block rounded-full bg-white p-[2px]">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${story.color} text-[10px] font-800 text-white`}
                  >
                    {story.initials}
                  </span>
                </span>
                {story.live && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded bg-red-500 px-1.5 py-0.5 text-[6px] font-800 uppercase tracking-wider text-white">
                    Live
                  </span>
                )}
              </span>
              <span className="w-full truncate text-[9px] font-600 text-slate-600">
                {story.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="hidden">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-800 uppercase tracking-wider text-slate-800">
            Explore your town
          </p>
          <button className="text-[10px] font-700 text-blue-600">
            See all
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto">
          {[
            {
              label: "Schools",
              color: "bg-blue-600",
              icon: "M4 19V8l8-5 8 5v11M8 21v-8h8v8",
            },
            {
              label: "Events",
              color: "bg-emerald-600",
              icon: "M6 3v3M18 3v3M4 8h16M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2Z",
            },
            {
              label: "Roads",
              color: "bg-amber-500",
              icon: "M9 3 7 21M15 3l2 18M12 6v3M12 13v3M12 20v1",
            },
            {
              label: "Parks",
              color: "bg-emerald-700",
              icon: "M12 22V8M5 12l7-10 7 10M7 17l5-8 5 8",
            },
            {
              label: "Business",
              color: "bg-slate-700",
              icon: "M4 8h16v12H4V8ZM8 8V4h8v4",
            },
          ].map((topic) => (
            <button
              key={topic.label}
              className="flex shrink-0 flex-col items-center gap-1.5"
            >
              <span className="rounded-[18px] bg-gradient-to-br from-blue-400 via-emerald-300 to-amber-300 p-[2px] shadow-sm">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white text-white ${topic.color}`}
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={topic.icon} />
                  </svg>
                </span>
              </span>
              <span className="text-[10px] font-700 text-slate-600">
                {topic.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="sticky top-[76px] z-20 border-b border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur-xl">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-8">
            {[
              { key: "following" as const, label: "Following" },
              { key: "foryou" as const, label: "For You" },
              { key: "latest" as const, label: "Livingston" },
            ].map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={`relative py-2 text-[11px] font-700 ${
                  activeFilter === filter.key
                    ? "text-slate-900"
                    : "text-slate-400"
                }`}
              >
                {filter.label}
                {activeFilter === filter.key && (
                  <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenBudget}
        className="mx-4 mt-3 flex w-[calc(100%_-_2rem)] items-center gap-3 overflow-hidden rounded-2xl border border-emerald-200 bg-white p-3.5 text-left shadow-sm"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[9px] font-800 uppercase tracking-widest text-emerald-700">
            Trending near you
          </span>
          <span className="block truncate text-[13px] font-800 text-slate-900">
            Town budget Q&A is getting attention
          </span>
          <span className="block text-[9px] font-600 text-slate-500">
            128 neighbors are following
          </span>
        </span>
        <svg
          className="h-5 w-5 shrink-0 text-emerald-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      <div className="hidden">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-800 text-slate-800">
              Neighbors to know
            </p>
            <p className="text-[9px] font-600 text-slate-400">
              Based on your interests and town
            </p>
          </div>
          <button className="text-[10px] font-700 text-blue-600">
            View all
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {[
            {
              name: "Maya Chen",
              detail: "Schools · Parks",
              reason: "Active in school board discussions",
              initials: "MC",
              color: "bg-fuchsia-600",
            },
            {
              name: "David R.",
              detail: "Housing · Transit",
              reason: "Attended 3 recent town halls",
              initials: "DR",
              color: "bg-cyan-600",
            },
            {
              name: "Green Livingston",
              detail: "Local organization",
              reason: "Shares your parks interest",
              initials: "GL",
              color: "bg-emerald-600",
            },
          ].map((person) => {
            const isFollowing = following.has(person.name)
            return (
              <div
                key={person.name}
                className="flex w-40 shrink-0 flex-col rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center"
              >
                <div
                  className={`mx-auto flex h-11 w-11 items-center justify-center rounded-2xl text-[11px] font-800 text-white ring-4 ring-white ${person.color}`}
                >
                  {person.initials}
                </div>
                <p className="mt-2 truncate text-[10px] font-800 text-slate-800">
                  {person.name}
                </p>
                <p className="mt-0.5 truncate text-[8px] font-600 text-slate-400">
                  {person.detail}
                </p>
                <div className="mt-2 flex min-h-9 items-start gap-1.5 rounded-lg bg-white px-2 py-1.5 text-left">
                  <svg
                    className="mt-0.5 h-3 w-3 shrink-0 text-blue-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                  <p className="text-[8px] font-600 leading-snug text-slate-500">
                    {person.reason}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFollow(person.name)}
                  className={`mt-auto w-full rounded-lg py-1.5 text-[9px] font-700 ${
                    isFollowing
                      ? "bg-slate-200 text-slate-600"
                      : "bg-blue-600 text-white shadow-[0_2px_0_#1E40AF]"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="hidden">
        {[
          { key: "foryou" as const, label: "For You" },
          { key: "latest" as const, label: "Latest" },
          { key: "following" as const, label: "Following" },
        ].map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setActiveFilter(filter.key)}
            className={`rounded-full px-3.5 py-2 text-[11px] font-700 ${
              activeFilter === filter.key
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-500"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div
        className="space-y-3 px-4"
        onTouchStart={(event) => setFeedTouchStart(event.touches[0].clientX)}
        onTouchEnd={(event) => changeFeedBySwipe(event.changedTouches[0].clientX)}
      >
        {visiblePosts.map((post) => {
          const liked = likedPosts.has(post.id)
          const saved = savedPosts.has(post.id)
          const isFollowing = following.has(post.name)
          if (post.attachment) {
            const media = post.mediaUrl
              ? {
                  url: post.mediaUrl,
                  alt: "Media shared by a verified Livingston resident",
                  slides: 1,
                  attribution: "Shared by a verified resident",
                }
              : postMedia[post.id]
            const ballot =
              post.id === 1
                ? {
                    question: "Should Livingston expand curb extensions to nearby school crossings?",
                    choices: ["Yes, expand", "Revise the plan", "No expansion"],
                  }
                : post.id === 2
                  ? {
                      question: "How will you participate in the Budget Q&A?",
                      choices: ["Attend in person", "Watch online", "Read the recap"],
                    }
                  : {
                      question: "Would you join the next Memorial Park cleanup?",
                      choices: ["Count me in", "Maybe", "Follow updates"],
                    }
            return (
              <article
                key={post.id}
                className="-mx-4 snap-start snap-always border-y border-slate-200 bg-white"
              >
                <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                <header className="flex h-14 items-center gap-3 px-4">
                  <span className="rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 p-[2px] shadow-[0_0_12px_rgba(34,211,238,0.35)]">
                    <span className="block rounded-full bg-white p-[2px]">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-800 text-white ${post.avatar}`}
                      >
                        {post.initials}
                      </span>
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="truncate text-[11px] font-800 text-slate-900">
                        {post.handle.replace("@", "")}
                      </p>
                      {post.verified && (
                        <svg
                          className="h-3 w-3 text-blue-600"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-label="Verified"
                        >
                          <path d="m12 2 2.1 2.1 3-.4.9 2.8 2.7 1.4-1.3 2.7 1.3 2.7-2.7 1.4-.9 2.8-3-.4L12 19.2l-2.1-2.1-3 .4-.9-2.8-2.7-1.4 1.3-2.7-1.3-2.7L6 6.5l.9-2.8 3 .4L12 2Z" />
                        </svg>
                      )}
                    </div>
                    <p className="truncate text-[9px] font-500 text-slate-500">
                      {post.area === "northfield" ? "Northfield Center" : post.area === "riker" ? "Memorial Park" : "Livingston Town Hall"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFollow(post.name)}
                    className={`rounded-full px-3 py-1.5 text-[9px] font-800 ${
                      isFollowing
                        ? "bg-slate-100 text-slate-500"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                  <button
                    type="button"
                    onClick={() => showFeedToast("Post options opened")}
                    className="flex h-8 w-8 items-center justify-center text-slate-600"
                    aria-label="Post options"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <circle cx="5" cy="12" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="19" cy="12" r="1.5" />
                    </svg>
                  </button>
                </header>

                <div
                  className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100"
                  onDoubleClick={() => doubleTapLike(post.id)}
                >
                  {post.mediaKind === "video" ? (
                    <video
                      src={media.url}
                      className="h-full w-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      aria-label={media.alt}
                    />
                  ) : (
                    <img
                      src={media.url}
                      alt={media.alt}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent" />
                  <div className="absolute left-3 top-3 space-y-1.5">
                    <span className="block w-fit rounded-full border border-cyan-300/30 bg-slate-950/75 px-2.5 py-1 text-[8px] font-800 uppercase tracking-wider text-cyan-300 backdrop-blur-md">
                      Local update
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-20 text-white">
                    <span className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/15 px-2.5 py-1 text-[8px] font-800 text-amber-200 backdrop-blur-sm">
                      Trending #{post.id} in Livingston
                    </span>
                    <p className="mt-2 line-clamp-3 text-[12px] font-600 leading-relaxed text-white/95">
                      <span className="mr-1.5 font-800">
                        {post.handle.replace("@", "")}
                      </span>
                      {post.body}
                    </p>
                    <p className="mt-1 text-[9px] font-700 text-cyan-300">
                      #LivingstonNJ #{post.topic.replace(/\s/g, "")}
                    </p>
                  </div>
                  <div className="absolute right-3 top-3 space-y-1.5 text-right">
                    <span className="block rounded-full bg-black/55 px-2 py-1 text-[9px] font-700 text-white backdrop-blur-sm">
                      1 / {media.slides}
                    </span>
                    <span
                      key={`views-${livePulse}`}
                      className="counter-tick block text-[8px] font-700 text-white/85 drop-shadow"
                    >
                      {(8.4 + post.id * 1.3 + livePulse / 100).toFixed(1)}k views
                    </span>
                  </div>
                  {heartPost === post.id && (
                    <span className="ig-heart-burst pointer-events-none absolute inset-0 flex items-center justify-center">
                      <svg
                        className="h-24 w-24 text-white drop-shadow-2xl"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
                      </svg>
                    </span>
                  )}
                  <div className="absolute bottom-4 right-3 flex flex-col items-center gap-3 rounded-full border border-white/10 bg-slate-950/60 px-2 py-3 text-white shadow-xl backdrop-blur-md">
                    <button
                      type="button"
                      onClick={() => toggleSet(setLikedPosts, post.id)}
                      className="flex flex-col items-center gap-0.5"
                      aria-label={liked ? "Unlike post" : "Like post"}
                    >
                      <svg
                        className={`h-5 w-5 ${liked ? "text-red-400" : "text-white"}`}
                        viewBox="0 0 24 24"
                        fill={liked ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
                      </svg>
                      <span
                        key={`likes-${livePulse}`}
                        className="counter-tick text-[7px] font-700"
                      >
                        {post.likes +
                          (liked ? 1 : 0) +
                          Math.floor(livePulse / 4)}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleComments(post.id)}
                      className="flex flex-col items-center gap-0.5"
                      aria-label="Comments"
                    >
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9 8.4 8.4 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8v.5Z" />
                      </svg>
                      <span
                        key={`comments-${livePulse}`}
                        className="counter-tick text-[7px] font-700"
                      >
                        {post.comments + Math.floor(livePulse / 7)}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => showFeedToast("Post link copied")}
                      aria-label="Share post"
                    >
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m22 2-7 20-4-9-9-4 20-7Z" />
                        <path d="M22 2 11 13" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSavedPost(post.id, saved)}
                      aria-label={saved ? "Remove saved post" : "Save post"}
                    >
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill={saved ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M6 3h12v18l-6-4-6 4V3Z" />
                      </svg>
                    </button>
                  </div>
                  {post.id === 1 && (
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-[8px] font-700 uppercase tracking-wider text-white/80 backdrop-blur-sm">
                      Swipe up for next
                    </span>
                  )}
                </div>

                <div className="hidden">
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      onClick={() => toggleSet(setLikedPosts, post.id)}
                      className="flex h-8 w-8 items-center justify-center"
                      aria-label={liked ? "Unlike post" : "Like post"}
                    >
                      <svg
                        className={`h-6 w-6 ${liked ? "text-red-500" : "text-slate-900"}`}
                        viewBox="0 0 24 24"
                        fill={liked ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
                      </svg>
                    </button>
                    <button type="button" onClick={() => toggleComments(post.id)} className="flex h-8 w-8 items-center justify-center" aria-label="Comments">
                      <svg className="h-6 w-6 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9 8.4 8.4 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8v.5Z" />
                      </svg>
                    </button>
                    <button type="button" onClick={() => showFeedToast("Post link copied")} className="flex h-8 w-8 items-center justify-center" aria-label="Share post">
                      <svg className="h-6 w-6 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m22 2-7 20-4-9-9-4 20-7Z" />
                        <path d="M22 2 11 13" />
                      </svg>
                    </button>
                  </div>
                  <div className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 gap-1">
                    {Array.from({ length: media.slides }).map((_, index) => (
                      <span
                        key={index}
                        className={`h-1.5 w-1.5 rounded-full ${index === 0 ? "bg-blue-500" : "bg-slate-300"}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSavedPost(post.id, saved)}
                    className="ml-auto flex h-8 w-8 items-center justify-center"
                    aria-label={saved ? "Remove saved post" : "Save post"}
                  >
                    <svg className="h-6 w-6 text-slate-900" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 3h12v18l-6-4-6 4V3Z" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-center border-b border-slate-100 px-4 py-2.5">
                  <div className="flex gap-1">
                    {Array.from({ length: media.slides }).map((_, index) => (
                      <span
                        key={index}
                        className={`h-1.5 w-1.5 rounded-full ${
                          index === 0 ? "bg-blue-600" : "bg-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div
                  className={`ballot-card-reveal relative mx-4 my-3 overflow-hidden rounded-2xl border p-4 ${
                    ballotVotes[post.id]
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      key={ballotVotes[post.id] ?? "empty"}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        ballotVotes[post.id]
                          ? "ballot-cast bg-emerald-100 text-emerald-700"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      <svg
                        className="h-[18px] w-[18px]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M5 10h14l-1 10H6L5 10Z" />
                        <path d="M8 10V6h8v4M9 15h6" />
                        {ballotVotes[post.id] && (
                          <path
                            className="ballot-paper-drop"
                            d="m9 5 2 2 4-4"
                          />
                        )}
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p
                            className={`text-[9px] font-700 uppercase tracking-[0.14em] ${
                              ballotVotes[post.id]
                                ? "text-emerald-700"
                                : "text-slate-500"
                            }`}
                          >
                            {ballotVotes[post.id]
                              ? "Response saved"
                              : "Quick community vote"}
                          </p>
                        </div>
                        {ballotVotes[post.id] && (
                          <span className="flex items-center gap-1 text-[8px] font-700 text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Counted
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[12px] font-700 leading-snug text-slate-800">
                        {ballot.question}
                      </p>
                      <p className="mt-1 text-[9px] font-500 text-slate-400">
                        {284 + post.id * 37} verified responses
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {ballot.choices.map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        onClick={() =>
                          setBallotVotes((current) => ({
                            ...current,
                            [post.id]: choice,
                          }))
                        }
                        className={`ballot-choice-reveal min-h-11 border-r border-slate-200 px-2 py-2 text-[9px] font-700 leading-tight last:border-r-0 ${
                          ballotVotes[post.id] === choice
                            ? "bg-blue-600 text-white"
                            : "bg-transparent text-slate-600 hover:bg-white"
                        }`}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                  {ballotVotes[post.id] && (
                    <div className="ballot-confirm-reveal mt-2.5 flex items-center gap-2 border-t border-emerald-200 pt-2.5">
                      <svg
                        className="h-4 w-4 shrink-0 text-emerald-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m5 12 4 4L19 6" />
                      </svg>
                      <p className="text-[9px] font-600 text-emerald-800">
                        Your response is counted. Select another option to update.
                      </p>
                    </div>
                  )}
                </div>

                <div className="px-4 pb-4 pt-3">
                  <p className="text-[11px] font-800 text-slate-900">
                    {post.likes +
                      (liked ? 1 : 0) +
                      Math.floor(livePulse / 4)} likes
                  </p>
                  <p className="hidden">
                    <span className="mr-1.5 font-800 text-slate-900">
                      {post.handle.replace("@", "")}
                    </span>
                    {post.body}
                  </p>
                  <p className="hidden">
                    #LivingstonNJ #{post.topic.replace(/\s/g, "")}
                  </p>
                  {post.attachment === "event" && (
                    <button
                      type="button"
                      onClick={toggleEventRsvp}
                      className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-700 text-blue-700"
                    >
                      {rsvped ? "Going · Oct 10" : "RSVP for Budget Q&A"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleComments(post.id)}
                    className="mt-2 block text-[10px] font-500 text-slate-500"
                  >
                    {expandedComments.has(post.id) ? "Hide comments" : `View all ${post.comments} comments`}
                  </button>
                  {expandedComments.has(post.id) && post.topComment && (
                    <div className="mt-2 border-l-2 border-blue-200 pl-3">
                      <p className="text-[10px] leading-relaxed text-slate-600">
                        <span className="mr-1.5 font-800 text-slate-800">{post.topComment.name}</span>
                        {post.topComment.body}
                      </p>
                    </div>
                  )}
                  <p className="mt-2 text-[8px] uppercase tracking-wide text-slate-600">
                    {post.time} · {media.attribution}
                  </p>
                </div>
              </article>
            )
          }
          return (
            <article
              key={post.id}
              className="snap-start overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-800 text-white ${post.avatar}`}
                  >
                    {post.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="truncate text-[13px] font-800 text-slate-900">
                        {post.name}
                      </p>
                      {post.verified && (
                        <svg
                          className="h-3.5 w-3.5 shrink-0 text-blue-600"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-label="Verified"
                        >
                          <path d="m12 2 2.1 2.1 3-.4.9 2.8 2.7 1.4-1.3 2.7 1.3 2.7-2.7 1.4-.9 2.8-3-.4L12 19.2l-2.1-2.1-3 .4-.9-2.8-2.7-1.4 1.3-2.7-1.3-2.7L6 6.5l.9-2.8 3 .4L12 2Z" />
                        </svg>
                      )}
                    </div>
                    <p className="text-[10px] font-600 text-slate-400">
                      {post.handle} · {post.time}
                    </p>
                  </div>
                  {post.name !== "Alex Morgan" && (
                    <button
                      type="button"
                      onClick={() => toggleFollow(post.name)}
                      className={`px-1 py-1.5 text-[10px] font-700 ${
                        isFollowing
                          ? "text-slate-400"
                          : "text-blue-600"
                      }`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-slate-700">
                  {post.body}
                </p>
                <span className="mt-2.5 inline-flex rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[9px] font-700 text-blue-700">
                  {post.topic}
                </span>
              </div>

              {post.attachment === "project" && (
                <button
                  type="button"
                  onClick={() => setMediaViewer("project")}
                  className="mx-4 mb-3 block w-[calc(100%_-_2rem)] overflow-hidden rounded-2xl border border-blue-100 bg-blue-50 text-left"
                  aria-label="Open Northfield Center project rendering"
                >
                  <div className="relative h-28 bg-gradient-to-br from-blue-500 to-cyan-400">
                    <svg
                      className="absolute inset-0 h-full w-full text-white/35"
                      viewBox="0 0 320 112"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                    >
                      <path d="M-20 92 70 30l65 42 60-50 145 85" />
                      <path d="M45 112V70M260 112V65" />
                    </svg>
                    <div className="absolute bottom-3 left-3 rounded-xl bg-white/90 px-3 py-2 backdrop-blur-sm">
                      <p className="text-[10px] font-800 text-slate-800">
                        Northfield Center
                      </p>
                      <p className="text-[9px] font-600 text-slate-500">
                        Street safety project
                      </p>
                    </div>
                    <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/60 text-white backdrop-blur-sm">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
                      </svg>
                    </span>
                  </div>
                </button>
              )}

              {post.attachment === "event" && (
                <div className="mx-4 mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-3 p-3">
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-600 text-white">
                      <span className="text-[8px] font-700 uppercase">Oct</span>
                      <span className="text-[18px] font-800 leading-none">
                        10
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-800 text-slate-800">
                        Budget Q&A Night
                      </p>
                      <p className="text-[9px] font-600 text-slate-500">
                        6:30 PM · Community Room
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={toggleEventRsvp}
                      className={`rounded-xl px-3 py-2 text-[10px] font-700 ${
                        rsvped
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {rsvped ? "Going" : "RSVP"}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 border-t border-slate-200 bg-white">
                    <button
                      type="button"
                      onClick={downloadCalendarEvent}
                      className="border-r border-slate-100 py-2.5 text-[9px] font-700 text-blue-600"
                    >
                      Add to calendar
                    </button>
                    <button
                      type="button"
                      onClick={toggleEventReminder}
                      className={`border-r border-slate-100 py-2.5 text-[9px] font-700 ${
                        eventReminder ? "text-emerald-600" : "text-slate-500"
                      }`}
                    >
                      {eventReminder ? "Reminder on" : "Remind me"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaViewer("budget-pdf")}
                      className="py-2.5 text-[9px] font-700 text-slate-500"
                    >
                      View budget PDF
                    </button>
                  </div>
                </div>
              )}

              <div className="hidden">
                <div className="flex -space-x-1.5">
                  {["bg-fuchsia-500", "bg-emerald-500", "bg-amber-500"].map(
                    (color, index) => (
                      <span
                        key={color}
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-[6px] font-800 text-white ${color}`}
                      >
                        {["M", "J", "P"][index]}
                      </span>
                    ),
                  )}
                </div>
                <p className="text-[9px] font-600 text-slate-400">
                  Liked by{" "}
                  <span className="font-700 text-slate-600">
                    neighbors you follow
                  </span>
                </p>
              </div>

              <div className="flex items-center border-t border-slate-100 px-3 py-2">
                <button
                  type="button"
                  onClick={() => toggleSet(setLikedPosts, post.id)}
                  className={`flex items-center gap-1.5 px-2 py-2 text-[10px] font-700 ${
                    liked ? "text-red-500" : "text-slate-700"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill={liked ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
                  </svg>
                  {post.likes + (liked ? 1 : 0)}
                </button>
                <button
                  type="button"
                  onClick={() => toggleComments(post.id)}
                  className={`flex items-center gap-1.5 px-2 py-2 text-[10px] font-700 ${
                    expandedComments.has(post.id)
                      ? "text-blue-600"
                      : "text-slate-700"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9 8.4 8.4 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8v.5Z" />
                  </svg>
                  {post.comments + (newComments[post.id]?.length ?? 0)}
                </button>
                <button
                  type="button"
                  onClick={() => showFeedToast("Post link copied")}
                  className="px-2 py-2 text-slate-700"
                  aria-label="Share post"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m22 2-7 20-4-9-9-4 20-7Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => toggleSavedPost(post.id, saved)}
                  className="ml-auto p-2 text-slate-700"
                  aria-label={saved ? "Remove saved post" : "Save post"}
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill={saved ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M6 3h12v18l-6-4-6 4V3Z" />
                  </svg>
                </button>
              </div>

              {expandedComments.has(post.id) && (
                <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3">
                  <div className="mb-3">
                    <p className="mb-2 text-[9px] font-700 uppercase tracking-wider text-slate-400">
                      Sort replies
                    </p>
                    <div className="flex gap-1.5">
                      {[
                        { key: "top" as const, label: "Top comments" },
                        { key: "officials" as const, label: "Town officials" },
                        {
                          key: "verified" as const,
                          label: "Verified neighbors",
                        },
                      ].map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => setReplyFilter(option.key)}
                          className={`rounded-full px-2.5 py-1.5 text-[9px] font-700 ${
                            replyFilter === option.key
                              ? "bg-slate-900 text-white"
                              : "border border-slate-200 bg-white text-slate-500"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {post.topComment &&
                    (replyFilter === "top" ||
                      (replyFilter === "officials" &&
                        post.topComment.source === "official") ||
                      (replyFilter === "verified" &&
                        post.topComment.source === "neighbor")) && (
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-[8px] font-800 text-blue-700">
                        {post.topComment.initials}
                      </div>
                      <div className="rounded-2xl rounded-tl-sm bg-white px-3 py-2 shadow-sm">
                        <p className="text-[9px] font-800 text-slate-700">
                          {post.topComment.name}
                        </p>
                        <p
                          className={`mt-0.5 text-[8px] font-700 ${
                            post.topComment.source === "official"
                              ? "text-blue-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {post.topComment.source === "official"
                            ? "Verified town official"
                            : "Verified Livingston neighbor"}
                        </p>
                        <p className="mt-0.5 text-[10px] leading-relaxed text-slate-600">
                          {post.topComment.body}
                        </p>
                      </div>
                    </div>
                  )}
                  {replyFilter !== "officials" &&
                    (newComments[post.id] ?? []).map((comment, index) => (
                      <div
                        key={`${comment}-${index}`}
                        className="mt-2 flex items-start gap-2.5"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[8px] font-800 text-white">
                          AM
                        </div>
                        <div className="rounded-2xl rounded-tl-sm bg-white px-3 py-2 shadow-sm">
                          <p className="text-[9px] font-800 text-slate-700">
                            Alex Morgan
                          </p>
                          <p className="mt-0.5 text-[8px] font-700 text-emerald-600">
                            Verified Livingston neighbor
                          </p>
                          <p className="mt-0.5 text-[10px] leading-relaxed text-slate-600">
                            {comment}
                          </p>
                        </div>
                      </div>
                    ))}
                  {post.topComment &&
                    ((replyFilter === "officials" &&
                      post.topComment.source !== "official") ||
                      (replyFilter === "verified" &&
                        post.topComment.source !== "neighbor" &&
                        !(newComments[post.id] ?? []).length)) && (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-4 text-center">
                        <p className="text-[10px] font-600 text-slate-400">
                          No replies from this group yet.
                        </p>
                      </div>
                    )}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[8px] font-800 text-white">
                      AM
                    </div>
                    <div className="flex flex-1 items-center rounded-xl border border-slate-200 bg-white pl-3 pr-1.5">
                      <input
                        value={commentDrafts[post.id] ?? ""}
                        onChange={(event) =>
                          setCommentDrafts((current) => ({
                            ...current,
                            [post.id]: event.target.value,
                          }))
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") publishComment(post.id)
                        }}
                        placeholder="Write a reply…"
                        className="min-w-0 flex-1 bg-transparent py-2 text-[11px] text-slate-700 outline-none placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => publishComment(post.id)}
                        disabled={!commentDrafts[post.id]?.trim()}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white disabled:bg-blue-200"
                        aria-label="Post reply"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="m22 2-7 20-4-9-9-4 20-7Z" />
                          <path d="M22 2 11 13" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </article>
          )
        })}
        {visiblePosts.length === 0 && (
          <div className="rounded-3xl border border-slate-100 bg-white px-6 py-10 text-center shadow-sm">
            <p className="text-[14px] font-800 text-slate-700">
              Your following feed is quiet
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Follow neighbors and local organizations to see their posts here.
            </p>
          </div>
        )}
      </div>

      {showMessages && (
        <div className="fixed inset-0 z-[55] flex justify-center bg-slate-950/45 backdrop-blur-sm">
          <section className="flex min-h-dvh w-full max-w-[393px] flex-col bg-white">
            <header className="flex items-center gap-3 border-b border-slate-200 px-4 pb-3 pt-[max(16px,env(safe-area-inset-top))]">
              <button
                type="button"
                onClick={() => {
                  if (activeConversation !== null) {
                    setActiveConversation(null)
                  } else {
                    setShowMessages(false)
                  }
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700"
                aria-label={
                  activeConversation !== null
                    ? "Back to messages"
                    : "Close messages"
                }
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>

              {currentConversation ? (
                <>
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-[9px] font-800 text-white ${currentConversation.color}`}
                  >
                    {currentConversation.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-800 text-slate-900">
                      {currentConversation.name}
                    </p>
                    <p className="truncate text-[9px] font-500 text-slate-400">
                      {currentConversation.status}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => showFeedToast("Conversation details opened")}
                    className="flex h-9 w-9 items-center justify-center text-slate-600"
                    aria-label="Conversation details"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 11v5M12 8h.01" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-[19px] font-800 tracking-tight text-slate-900">
                      Messages
                    </h2>
                    <p className="text-[9px] font-500 text-slate-400">
                      Private conversations with your community
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveConversation(1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white"
                    aria-label="New message"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" />
                    </svg>
                  </button>
                </>
              )}
            </header>

            {currentConversation ? (
              <>
                <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-5">
                  <p className="mb-5 text-center text-[9px] font-600 uppercase tracking-wider text-slate-400">
                    This conversation is private
                  </p>
                  <div className="space-y-3">
                    {currentConversation.messages.map((message, index) => (
                      <div
                        key={`${message.body}-${index}`}
                        className={`flex ${
                          message.from === "me" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed ${
                            message.from === "me"
                              ? "rounded-br-sm bg-blue-600 text-white"
                              : "rounded-bl-sm border border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          {message.body}
                        </div>
                      </div>
                    ))}
                    {(sentMessages[currentConversation.id] ?? []).map(
                      (message, index) => (
                        <div
                          key={`${message}-${index}`}
                          className="flex justify-end"
                        >
                          <div className="max-w-[78%] rounded-2xl rounded-br-sm bg-blue-600 px-3.5 py-2.5 text-[11px] leading-relaxed text-white">
                            {message}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
                <div className="border-t border-slate-200 bg-white px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
                  <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 pl-3">
                    <textarea
                      value={dmDraft}
                      onChange={(event) => setDmDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault()
                          sendDirectMessage()
                        }
                      }}
                      rows={1}
                      placeholder="Message privately…"
                      className="max-h-24 min-h-8 flex-1 resize-none bg-transparent py-2 text-[12px] text-slate-800 outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={sendDirectMessage}
                      disabled={!dmDraft.trim()}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white disabled:bg-blue-200"
                      aria-label="Send message"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m22 2-7 20-4-9-9-4 20-7Z" />
                        <path d="M22 2 11 13" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <div className="border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3">
                    <svg
                      className="h-4 w-4 text-slate-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-4-4" />
                    </svg>
                    <input
                      type="search"
                      placeholder="Search messages"
                      className="min-w-0 flex-1 bg-transparent py-2.5 text-[11px] text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <div>
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => setActiveConversation(conversation.id)}
                      className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3.5 text-left"
                    >
                      <div
                        className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[11px] font-800 text-white ${conversation.color}`}
                      >
                        {conversation.initials}
                        {conversation.unread > 0 && (
                          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`truncate text-[12px] ${
                              conversation.unread > 0
                                ? "font-800 text-slate-900"
                                : "font-700 text-slate-700"
                            }`}
                          >
                            {conversation.name}
                          </p>
                          <span
                            className={`shrink-0 text-[9px] ${
                              conversation.unread > 0
                                ? "font-700 text-blue-600"
                                : "text-slate-400"
                            }`}
                          >
                            {conversation.time}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2">
                          <p
                            className={`min-w-0 flex-1 truncate text-[10px] ${
                              conversation.unread > 0
                                ? "font-700 text-slate-700"
                                : "font-500 text-slate-400"
                            }`}
                          >
                            {conversation.preview}
                          </p>
                          {conversation.unread > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[8px] font-800 text-white">
                              {conversation.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {activeStory !== null && (
        <div className="fixed inset-0 z-[60] flex justify-center bg-black">
          <div
            className={`relative min-h-dvh w-full max-w-[393px] overflow-hidden bg-gradient-to-br ${stories[activeStory].color}`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/85" />
            <div className="absolute -right-20 top-32 h-72 w-72 rounded-full border-[42px] border-white/10" />
            <div className="absolute -left-16 bottom-40 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
            <div className="relative z-10 px-4 pt-[max(18px,env(safe-area-inset-top))]">
              <div className="flex gap-1">
                {stories.map((story, index) => (
                  <span
                    key={story.label}
                    className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30"
                  >
                    <span
                      className={`block h-full rounded-full bg-white ${
                        index < activeStory
                          ? "w-full"
                          : index === activeStory
                            ? "story-progress-active"
                            : "w-0"
                      }`}
                    />
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2.5 text-white">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/80 bg-black/20 text-[9px] font-800">
                  {stories[activeStory].initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-800">
                    {stories[activeStory].label}
                  </p>
                  <p className="text-[9px] font-600 text-white/65">
                    {stories[activeStory].eyebrow}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStory(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm"
                  aria-label="Close story"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveStory(Math.max(0, activeStory - 1))}
              className="absolute bottom-24 left-0 top-20 z-10 w-1/2"
              aria-label="Previous story"
            />
            <button
              type="button"
              onClick={() =>
                activeStory === stories.length - 1
                  ? setActiveStory(null)
                  : setActiveStory(activeStory + 1)
              }
              className="absolute bottom-24 right-0 top-20 z-10 w-1/2"
              aria-label="Next story"
            />
            <div className="absolute bottom-[max(36px,env(safe-area-inset-bottom))] left-5 right-5 z-20 text-white">
              {stories[activeStory].live && (
                <span className="mb-3 inline-flex items-center gap-1.5 rounded bg-red-500 px-2 py-1 text-[8px] font-800 uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  Live
                </span>
              )}
              <p className="text-[28px] font-800 leading-tight tracking-tight">
                {stories[activeStory].title}
              </p>
              <p className="mt-3 text-[13px] font-500 leading-relaxed text-white/80">
                {stories[activeStory].detail}
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveStory(null)
                  showFeedToast("Opening full update")
                }}
                className="mt-5 rounded-full bg-white px-4 py-2.5 text-[10px] font-800 text-slate-900"
              >
                View full update
              </button>
            </div>
          </div>
        </div>
      )}

      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/55 px-4 pt-[max(56px,env(safe-area-inset-top))] backdrop-blur-sm">
          <div className="w-full max-w-[361px] overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="border-b border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[15px] font-800 text-slate-900">
                    Search Townly
                  </p>
                  <p className="text-[9px] font-600 text-slate-400">
                    Bills, hearings, events, and discussions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowSearch(false)
                    setSearchQuery("")
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                  aria-label="Close search"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl border-2 border-blue-500 bg-blue-50/40 px-3">
                <svg
                  className="h-4 w-4 shrink-0 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search clean water, budget, roads…"
                  className="min-w-0 flex-1 bg-transparent py-3 text-[12px] text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
            <div className="max-h-[62dvh] space-y-2 overflow-y-auto p-3">
              <p className="px-1 text-[9px] font-700 uppercase tracking-wider text-slate-400">
                {searchQuery ? `${searchItems.length} matching results` : "Suggested results"}
              </p>
              {searchItems.map((item) => (
                <button
                  key={`${item.type}-${item.title}`}
                  type="button"
                  onClick={() => {
                    setShowSearch(false)
                    showFeedToast(`Opening ${item.title}`)
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 p-3 text-left"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[9px] font-800 ${
                      item.type === "Bill"
                        ? "bg-violet-50 text-violet-700"
                        : item.type === "Hearing"
                          ? "bg-amber-50 text-amber-700"
                          : item.type === "Event"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {item.type.slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[9px] font-700 uppercase tracking-wider text-slate-400">
                      {item.type}
                    </span>
                    <span className="block truncate text-[11px] font-800 text-slate-800">
                      {item.title}
                    </span>
                    <span className="block truncate text-[9px] font-600 text-slate-500">
                      {item.detail}
                    </span>
                  </span>
                  <svg
                    className="h-4 w-4 shrink-0 text-slate-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              ))}
              {searchItems.length === 0 && (
                <div className="px-6 py-10 text-center">
                  <p className="text-[12px] font-800 text-slate-700">
                    No civic records found
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Try a bill number, topic, neighborhood, or meeting name.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {mediaViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setMediaViewer(null)}
            className="absolute inset-0"
            aria-label="Close media viewer"
          />
          <div className="relative w-full max-w-[361px] overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <p className="text-[12px] font-800 text-slate-800">
                  {mediaViewer === "project"
                    ? "Northfield Center safety plan"
                    : "Proposed 2026 Municipal Budget"}
                </p>
                <p className="text-[9px] font-600 text-slate-400">
                  {mediaViewer === "project"
                    ? "Architectural rendering · Updated Sep 28"
                    : "Official document · 48 pages · PDF"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMediaViewer(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                aria-label="Close viewer"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            {mediaViewer === "project" ? (
              <div className="relative h-72 bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-400">
                <svg
                  className="absolute inset-0 h-full w-full text-white/40"
                  viewBox="0 0 360 288"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                >
                  <path d="M-40 240 75 70l90 105 65-92 165 178" />
                  <path d="M50 288V180M300 288V160" />
                  <path d="M0 250h360" strokeDasharray="18 14" />
                </svg>
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 p-3 backdrop-blur-sm">
                  <p className="text-[11px] font-800 text-slate-800">
                    Proposed curb extensions and raised crossing
                  </p>
                  <p className="mt-1 text-[9px] leading-relaxed text-slate-500">
                    The rendering shows shorter pedestrian crossings, new rain gardens, and updated ADA ramps.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-100 p-4">
                <div className="mx-auto min-h-80 rounded-sm bg-white p-6 shadow-md">
                  <div className="h-2 w-20 rounded bg-blue-600" />
                  <p className="mt-5 text-[18px] font-800 leading-tight text-slate-900">
                    Township of Livingston
                    <br />
                    2026 Proposed Budget
                  </p>
                  <p className="mt-2 text-[10px] font-600 text-slate-400">
                    Public hearing edition · October 2026
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[8px] text-slate-400">Total budget</p>
                      <p className="text-[16px] font-800 text-slate-800">$64.2M</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[8px] text-slate-400">Tax impact</p>
                      <p className="text-[16px] font-800 text-amber-600">+$118</p>
                    </div>
                  </div>
                  <div className="mt-6 space-y-2">
                    {[88, 100, 76, 94, 64].map((width) => (
                      <div
                        key={width}
                        className="h-2 rounded bg-slate-100"
                        style={{ width: `${width}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {feedToast && (
        <div
          className="toast-enter fixed bottom-24 left-1/2 z-50 flex w-[calc(100%_-_2rem)] max-w-[361px] -translate-x-1/2 items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-xl"
          role="status"
          aria-live="polite"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
          </span>
          <span className="min-w-0 flex-1 text-[11px] font-700">
            {feedToast.message}
          </span>
          {feedToast.undo && (
            <button
              type="button"
              onClick={undoToastAction}
              className="shrink-0 rounded-lg bg-white/10 px-2.5 py-1.5 text-[10px] font-800 text-blue-200"
            >
              Undo
            </button>
          )}
        </div>
      )}

      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-end">
          <button
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setShowComposer(false)}
            aria-label="Close composer"
          />
          <div className="sheet-enter relative w-full rounded-t-3xl bg-white px-4 pb-8 pt-3 shadow-2xl">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowComposer(false)}
                className="text-[12px] font-700 text-slate-500"
              >
                Cancel
              </button>
              <p className="text-[14px] font-800 text-slate-800">New post</p>
              <button
                onClick={publishPost}
                disabled={
                  composerMode === "text" ? !draft.trim() : !composerMedia
                }
                className={`rounded-full px-3 py-1.5 text-[11px] font-700 text-white ${
                  (composerMode === "text" && draft.trim()) ||
                  (composerMode === "media" && composerMedia)
                    ? "bg-blue-600"
                    : "bg-blue-300"
                }`}
              >
                Post
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              {[
                { key: "text" as const, label: "Text update" },
                { key: "media" as const, label: "Photo or video" },
              ].map((mode) => (
                <button
                  key={mode.key}
                  type="button"
                  onClick={() => setComposerMode(mode.key)}
                  className={`rounded-lg py-2.5 text-[11px] font-700 ${
                    composerMode === mode.key
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <div className="mt-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-800 text-white">
                AM
              </div>
              <textarea
                autoFocus
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={composerMode === "text" ? 6 : 3}
                maxLength={500}
                placeholder={
                  composerMode === "text"
                    ? "Share an update or start a discussion…"
                    : "Add context for your photo or video…"
                }
                className="flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
            {composerMode === "media" && (
              <div className="mt-3">
                {composerMedia ? (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                    {composerMediaKind === "video" ? (
                      <video
                        src={composerMedia}
                        controls
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={composerMedia}
                        alt="Selected post preview"
                        className="h-full w-full object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setComposerMedia(null)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/70 text-white backdrop-blur-sm"
                      aria-label="Remove selected media"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="M6 6l12 12M18 6 6 18" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-blue-300 bg-blue-50/60 px-4 py-8 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                    <span className="mt-2 text-[11px] font-800 text-slate-800">
                      Add a photo or video
                    </span>
                    <span className="mt-0.5 text-[9px] font-500 text-slate-500">
                      Images and short clips work best
                    </span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (!file) return
                        setComposerMediaKind(
                          file.type.startsWith("video/") ? "video" : "photo",
                        )
                        setComposerMedia(URL.createObjectURL(file))
                      }}
                    />
                  </label>
                )}
              </div>
            )}
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
                <span className="text-[10px] font-700">
                  Verified residents only
                </span>
              </div>
              <span className="text-[10px] font-600 text-slate-400">
                {draft.length}/500
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({
  label,
  variant,
}: {
  label: string
  variant: "orange" | "blue" | "green" | "red" | "navy"
}) {
  const styles: Record<string, string> = {
    orange: "bg-orange-50 text-orange-700 border border-orange-200",
    blue: "bg-blue-50 text-blue-700 border border-blue-200",
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    red: "bg-red-50 text-red-700 border border-red-200",
    navy: "bg-slate-800 text-white",
  }
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-600 px-2 py-0.5 rounded-full ${styles[variant]}`}
    >
      {label}
    </span>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-700 uppercase tracking-widest text-slate-400 mb-1">
      {children}
    </p>
  )
}

type OfficialVotingRecord = {
  key: "sherrill" | "mckeon" | "mukherji"
  name: string
  title: string
  initials: string
  color: string
  participation: number
  partyAlignment: number
  bipartisan: number
  summary: string
  tendencies: Array<{ label: string value: number tone: string }>
  recentVotes: Array<{
    bill: string
    title: string
    vote: "Yes" | "No"
    date: string
  }>
}

const OFFICIAL_VOTING_RECORDS: Record<
  OfficialVotingRecord["key"],
  OfficialVotingRecord
> = {
  sherrill: {
    key: "sherrill",
    name: "Mikie Sherrill",
    title: "U.S. Representative · NJ-11",
    initials: "MS",
    color: "bg-blue-600",
    participation: 97,
    partyAlignment: 91,
    bipartisan: 24,
    summary:
      "Most often supports infrastructure investment, federal-local grants, and environmental resilience funding.",
    tendencies: [
      { label: "Infrastructure funding", value: 89, tone: "bg-blue-600" },
      { label: "Local government aid", value: 84, tone: "bg-emerald-500" },
      { label: "Fiscal restraint", value: 58, tone: "bg-amber-500" },
    ],
    recentVotes: [
      {
        bill: "HR 5321",
        title: "Community Water Systems Grants",
        vote: "Yes",
        date: "Sep 18",
      },
      {
        bill: "HR 4180",
        title: "Municipal Transit Modernization",
        vote: "Yes",
        date: "Aug 7",
      },
      {
        bill: "HR 3904",
        title: "Federal Spending Rescission",
        vote: "No",
        date: "Jul 22",
      },
      {
        bill: "HR 3427",
        title: "Emergency Services Grant Renewal",
        vote: "Yes",
        date: "Jun 12",
      },
      {
        bill: "HR 2981",
        title: "Regional Rail Funding Act",
        vote: "Yes",
        date: "May 20",
      },
      {
        bill: "HR 2419",
        title: "Unfunded Mandates Expansion",
        vote: "No",
        date: "Apr 9",
      },
    ],
  },
  mckeon: {
    key: "mckeon",
    name: "John McKeon",
    title: "State Senator · District 27",
    initials: "JM",
    color: "bg-emerald-600",
    participation: 98,
    partyAlignment: 94,
    bipartisan: 31,
    summary:
      "Frequently supports municipal infrastructure, property-tax relief programs, and environmental protections.",
    tendencies: [
      { label: "Property-tax relief", value: 92, tone: "bg-blue-600" },
      { label: "Water infrastructure", value: 95, tone: "bg-emerald-500" },
      { label: "Municipal mandates", value: 61, tone: "bg-amber-500" },
    ],
    recentVotes: [
      {
        bill: "S 3112",
        title: "Lead Service Line Replacement",
        vote: "Yes",
        date: "Sep 25",
      },
      {
        bill: "S 2847",
        title: "Senior Property Tax Relief",
        vote: "Yes",
        date: "Sep 11",
      },
      {
        bill: "S 1980",
        title: "Municipal Fee Expansion",
        vote: "No",
        date: "Jun 30",
      },
      {
        bill: "S 1764",
        title: "School Facilities Modernization",
        vote: "Yes",
        date: "May 23",
      },
      {
        bill: "S 1428",
        title: "Flood Resilience Grants",
        vote: "Yes",
        date: "Apr 18",
      },
      {
        bill: "S 1102",
        title: "Local Services Consolidation",
        vote: "No",
        date: "Mar 7",
      },
    ],
  },
  mukherji: {
    key: "mukherji",
    name: "Raj Mukherji",
    title: "State Assemblymember · District 27",
    initials: "RM",
    color: "bg-slate-700",
    participation: 96,
    partyAlignment: 93,
    bipartisan: 27,
    summary:
      "Often supports state-local capital projects, housing initiatives, and public-service funding.",
    tendencies: [
      { label: "Capital projects", value: 90, tone: "bg-blue-600" },
      { label: "Housing programs", value: 86, tone: "bg-violet-500" },
      { label: "Tax incentives", value: 63, tone: "bg-amber-500" },
    ],
    recentVotes: [
      {
        bill: "A 4120",
        title: "Clean Water Infrastructure Bond",
        vote: "Yes",
        date: "Sep 19",
      },
      {
        bill: "A 3774",
        title: "Local Housing Partnership Act",
        vote: "Yes",
        date: "Aug 29",
      },
      {
        bill: "A 2216",
        title: "Corporate Tax Credit Extension",
        vote: "No",
        date: "Jun 14",
      },
      {
        bill: "A 1908",
        title: "Community College Capital Fund",
        vote: "Yes",
        date: "May 17",
      },
      {
        bill: "A 1640",
        title: "Affordable Housing Partnership",
        vote: "Yes",
        date: "Apr 11",
      },
      {
        bill: "A 1097",
        title: "State Procurement Exemption",
        vote: "No",
        date: "Mar 3",
      },
    ],
  },
}

function VotingRecordDrawer({
  record,
  onClose,
}: {
  record: OfficialVotingRecord | null
  onClose: () => void
}) {
  if (!record) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close voting record"
      />
      <section className="sheet-enter relative max-h-[88dvh] w-full overflow-y-auto rounded-t-3xl bg-white px-4 pb-8 pt-3 shadow-2xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[11px] font-800 text-white ${record.color}`}
          >
            {record.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[16px] font-800 text-slate-900">{record.name}</p>
            <p className="text-[10px] font-600 text-slate-500">
              {record.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500"
            aria-label="Close"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200">
          {[
            { label: "Participation", value: `${record.participation}%` },
            { label: "Party alignment", value: `${record.partyAlignment}%` },
            { label: "Bipartisan votes", value: `${record.bipartisan}%` },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className={`px-2 py-3 text-center ${
                index > 0 ? "border-l border-slate-200" : ""
              }`}
            >
              <p className="text-[16px] font-800 text-slate-900">{stat.value}</p>
              <p className="mt-0.5 text-[8px] font-600 leading-tight text-slate-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <p className="text-[9px] font-800 uppercase tracking-wider text-slate-400">
            Overall pattern
          </p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-slate-600">
            {record.summary}
          </p>
        </div>

        <div className="mt-5 space-y-3">
          <p className="text-[9px] font-800 uppercase tracking-wider text-slate-400">
            Issue tendencies
          </p>
          {record.tendencies.map((tendency) => (
            <div key={tendency.label}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] font-700 text-slate-600">
                  {tendency.label}
                </span>
                <span className="text-[10px] font-800 text-slate-800">
                  {tendency.value}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${tendency.tone}`}
                  style={{ width: `${tendency.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[9px] font-800 uppercase tracking-wider text-slate-400">
              All tracked votes this term
            </p>
            <span className="text-[9px] font-700 text-blue-600">
              {record.recentVotes.length} votes
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            {record.recentVotes.map((vote, index) => (
              <div
                key={vote.bill}
                className={`flex items-center gap-3 px-3 py-3 ${
                  index > 0 ? "border-t border-slate-100" : ""
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[9px] font-800 ${
                    vote.vote === "Yes"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {vote.vote}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-800 text-slate-800">
                    {vote.bill} · {vote.title}
                  </p>
                  <p className="mt-0.5 text-[8px] font-600 text-slate-400">
                    Recorded {vote.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-[9px] leading-relaxed text-slate-400">
          Pattern summaries are based on votes tracked in this prototype and
          describe past behavior; they do not predict a future vote.
        </p>
      </section>
    </div>
  )
}

// ─── View: Overview ───────────────────────────────────────────────────────────
function OverviewView({ onContact }: { onContact: () => void }) {
  const [selectedRecord, setSelectedRecord] =
    useState<OfficialVotingRecord | null>(null)
  const representatives = [
    {
      name: "Mikie Sherrill",
      title: "U.S. Representative",
      district: "New Jersey’s 11th District",
      party: "Democrat",
      phone: "(973) 526-5668",
      initials: "MS",
      accent: "bg-blue-600",
      recordKey: "sherrill" as const,
    },
    {
      name: "John McKeon",
      title: "State Senator",
      district: "New Jersey District 27",
      party: "Democrat",
      phone: "(973) 535-5115",
      initials: "JM",
      accent: "bg-emerald-600",
      recordKey: "mckeon" as const,
    },
    {
      name: "Raj Mukherji",
      title: "State Assemblymember",
      district: "New Jersey District 27",
      party: "Democrat",
      phone: "(201) 659-9637",
      initials: "RM",
      accent: "bg-slate-700",
      recordKey: "mukherji" as const,
    },
  ]

  const upcomingElections = [
    {
      level: "Local",
      race: "Livingston Township Council",
      date: "Nov 3, 2026",
      detail: "2 council seats",
      stage: "General election",
      milestone: "Early voting · Oct 24–Nov 1",
      color: "bg-emerald-600",
      light: "bg-emerald-50 text-emerald-700 border-emerald-100",
      initials: "LC",
    },
    {
      level: "Federal",
      race: "U.S. House · New Jersey 11",
      date: "Nov 3, 2026",
      detail: "1 congressional seat",
      stage: "General election",
      milestone: "Mail ballot return · by Nov 3",
      color: "bg-blue-600",
      light: "bg-blue-50 text-blue-700 border-blue-100",
      initials: "NJ",
    },
    {
      level: "State",
      race: "NJ Legislature · District 27",
      date: "Nov 2, 2027",
      detail: "1 Senate · 2 Assembly seats",
      stage: "Next election cycle",
      milestone: "Candidate filing opens in 2027",
      color: "bg-violet-600",
      light: "bg-violet-50 text-violet-700 border-violet-100",
      initials: "27",
    },
  ]

  return (
    <div className="tab-content-enter space-y-5 pb-8">
      {/* Daily briefing */}
      <section className="overflow-hidden rounded-[24px] bg-[#0F172A] text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)]">
        <div className="relative px-5 pb-5 pt-5">
          <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full border-[28px] border-blue-500/15" />
          <div className="absolute -bottom-20 right-14 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />
          <div className="relative">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300">
                Your civic briefing
              </span>
              <span className="rounded-full border border-slate-600 bg-slate-800/80 px-2.5 py-1 text-[10px] font-semibold text-slate-300">
                Updated today
              </span>
            </div>
            <h1 className="max-w-[270px] text-[24px] font-extrabold leading-[1.15] tracking-[-0.02em]">
              Good morning, Alex.
            </h1>
            <p className="mt-2 max-w-[300px] text-[12px] font-medium leading-relaxed text-slate-300">
              Three public decisions in Livingston may affect your household
              this month.
            </p>
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-800/75 p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
                <svg
                  className="h-[18px] w-[18px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 3v10M12 17h.01" />
                  <path d="M10.3 4.3 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-white">
                  Budget amendment vote on Oct 7
                </p>
                <p className="mt-0.5 text-[10px] leading-snug text-slate-400">
                  Estimated household impact: +$118 per year
                </p>
              </div>
              <svg
                className="h-4 w-4 shrink-0 text-slate-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* At a glance */}
      <section>
        <div className="mb-2.5 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              At a glance
            </p>
            <h2 className="mt-0.5 text-[16px] font-extrabold tracking-tight text-slate-900">
              Livingston this month
            </h2>
          </div>
          <span className="text-[10px] font-semibold text-slate-400">
            October 2026
          </span>
        </div>
        <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.05)]">
          {[
            { value: "7", label: "Active bills", tone: "text-blue-600" },
            { value: "3", label: "Open hearings", tone: "text-violet-600" },
            { value: "$64.2M", label: "Town budget", tone: "text-emerald-600" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className={`px-2 py-4 text-center ${
                index > 0 ? "border-l border-slate-100" : ""
              }`}
            >
              <p
                className={`text-[18px] font-extrabold leading-none tracking-tight ${stat.tone}`}
              >
                {stat.value}
              </p>
              <p className="mt-1.5 text-[9px] font-semibold leading-tight text-slate-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* District identity */}
      <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_4px_16px_rgba(15,23,42,0.05)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Your districts
              </p>
              <h2 className="text-[15px] font-extrabold text-slate-900">
                Livingston, NJ 07039
              </h2>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Verified
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { level: "Federal", district: "NJ–11" },
            { level: "State", district: "District 27" },
            { level: "Local", district: "Livingston" },
          ].map((item) => (
            <div
              key={item.level}
              className="rounded-xl bg-slate-50 px-2.5 py-3"
            >
              <p className="text-[9px] font-semibold text-slate-400">
                {item.level}
              </p>
              <p className="mt-0.5 truncate text-[11px] font-bold text-slate-800">
                {item.district}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Representatives */}
      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Representation
            </p>
            <h2 className="mt-0.5 text-[16px] font-extrabold tracking-tight text-slate-900">
              Your elected officials
            </h2>
          </div>
          <span className="text-[10px] font-semibold text-blue-600">
            3 officials
          </span>
        </div>
        <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.05)]">
          {representatives.map((rep, index) => (
            <article
              key={rep.name}
              className={`p-4 ${index > 0 ? "border-t border-slate-100" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-extrabold text-white ${rep.accent}`}
                >
                  {rep.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="truncate text-[13px] font-extrabold text-slate-900">
                      {rep.name}
                    </h3>
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[8px] font-bold text-blue-700">
                      {rep.party}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] font-medium text-slate-500">
                    {rep.title} · {rep.district}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSelectedRecord(OFFICIAL_VOTING_RECORDS[rep.recordKey])
                }
                className="mt-3 flex w-full items-center gap-2.5 rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2 text-left"
              >
                <svg
                  className="h-4 w-4 shrink-0 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 19V9M10 19V5M16 19v-7M22 19V3" />
                </svg>
                <span className="min-w-0 flex-1">
                  <span className="block text-[9px] font-800 text-blue-700">
                    View past voting pattern
                  </span>
                  <span className="block text-[8px] font-600 text-slate-500">
                    {OFFICIAL_VOTING_RECORDS[rep.recordKey].participation}%
                    participation · issue tendencies
                  </span>
                </span>
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={onContact}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-[10px] font-bold text-white shadow-[0_3px_0_#1E40AF]"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.7-5.1A7 7 0 0 1 3 12c0-4.4 4-8 9-8s9 3.6 9 8v3Z" />
                  </svg>
                  Send a message
                </button>
                <a
                  href={`tel:${rep.phone.replace(/\D/g, "")}`}
                  aria-label={`Call ${rep.name} at ${rep.phone}`}
                  className="flex h-[38px] w-[42px] items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 1.9Z" />
                  </svg>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <VotingRecordDrawer
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />

      {/* Upcoming elections */}
      <section>
        <div className="mb-2.5 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Election center
            </p>
            <h2 className="mt-0.5 text-[16px] font-extrabold tracking-tight text-slate-900">
              Upcoming races
            </h2>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[9px] font-700 text-slate-500">
            Nonpartisan
          </span>
        </div>
        <div className="space-y-2.5">
          {upcomingElections.map((election) => (
            <article
              key={election.level}
              className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[10px] font-800 text-white ${election.color}`}
                >
                  {election.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[8px] font-800 uppercase tracking-wider ${election.light}`}
                    >
                      {election.level}
                    </span>
                    <span className="text-[10px] font-800 text-slate-700">
                      {election.date}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-[12px] font-800 text-slate-900">
                    {election.race}
                  </h3>
                  <p className="mt-0.5 text-[9px] font-600 text-slate-500">
                    {election.detail} · {election.stage}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 10h18" />
                </svg>
                <p className="text-[9px] font-700 text-slate-600">
                  Next milestone: {election.milestone}
                </p>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-2 px-1 text-[8px] leading-relaxed text-slate-400">
          Race information is shown as prototype content. Confirm dates and
          candidate certification with official election authorities.
        </p>
      </section>

      {/* Upcoming events */}
      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Civic calendar
            </p>
            <h2 className="mt-0.5 text-[16px] font-extrabold tracking-tight text-slate-900">
              Coming up
            </h2>
          </div>
          <button type="button" className="text-[10px] font-bold text-blue-600">
            View calendar
          </button>
        </div>
        <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.05)]">
          {[
            {
              month: "OCT",
              day: "07",
              title: "Town Council Meeting",
              detail: "Budget amendment vote · 7:30 PM",
              color: "bg-blue-600",
            },
            {
              month: "OCT",
              day: "14",
              title: "Public Hearing",
              detail: "Main Street water project · 6:00 PM",
              color: "bg-amber-500",
            },
            {
              month: "OCT",
              day: "21",
              title: "State Assembly Vote",
              detail: "A4120 Clean Water Bond",
              color: "bg-emerald-600",
            },
          ].map((event, index) => (
            <div
              key={event.day}
              className={`flex items-center gap-3.5 p-3.5 ${
                index > 0 ? "border-t border-slate-100" : ""
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-50">
                <span className="text-[8px] font-bold tracking-wider text-slate-400">
                  {event.month}
                </span>
                <span className="text-[16px] font-extrabold leading-none text-slate-900">
                  {event.day}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-bold text-slate-800">
                  {event.title}
                </p>
                <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400">
                  {event.detail}
                </p>
              </div>
              <span className={`h-2 w-2 rounded-full ${event.color}`} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ─── View: Budget ─────────────────────────────────────────────────────────────
function BudgetView({ onFeedback }: { onFeedback: () => void }) {
  const [activeSegment, setActiveSegment] = useState<number | null>(0)
  const [budgetOpinions, setBudgetOpinions] = useState<
    Record<string, "support" | "modify" | "oppose">
  >({})

  const cx = 110,
    cy = 110,
    outerR = 95,
    innerR = 58
  let cumAngle = 0

  const segments = BUDGET_SEGMENTS.map((s) => {
    const start = cumAngle
    const end = cumAngle + (s.pct / 100) * 360
    cumAngle = end
    return { ...s, start, end }
  })

  const active = activeSegment !== null ? BUDGET_SEGMENTS[activeSegment] : null

  return (
    <div className="tab-content-enter space-y-3 pb-6">
      {/* Header Stat Card */}
      <div className="bg-[#0F172A] rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-600 uppercase tracking-widest text-slate-400 mb-1">
              2026 Municipal Budget
            </p>
            <p className="text-[32px] font-800 leading-none">$64.2M</p>
            <p className="text-[12px] text-slate-300 mt-1.5 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              Avg. Tax Impact:{" "}
              <span className="font-700 text-amber-300">+$118 / yr</span> per
              household
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              vs. 2025
            </p>
            <p className="text-[18px] font-700 text-emerald-400">+3.2%</p>
          </div>
        </div>
        <div className="mt-3 h-[3px] bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: "72%" }}
          />
        </div>
        <p className="text-[10px] text-slate-500 mt-1">
          72% of fiscal year elapsed
        </p>
      </div>

      {/* Donut Chart */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <p className="text-[13px] font-700 text-slate-800 mb-0.5">
          Where Your Tax Dollar Goes
        </p>
        <p className="text-[11px] text-slate-400 mb-3">
          Tap any segment for details
        </p>

        <div className="flex min-w-0 items-center gap-3">
          {/* SVG Donut */}
          <div className="w-[148px] shrink-0">
            <svg
              className="block h-auto w-full"
              viewBox="0 0 220 220"
              role="img"
              aria-label="Municipal budget allocation chart"
            >
              {segments.map((seg, i) => (
                <path
                  key={i}
                  className="donut-segment"
                  d={donutSegmentPath(
                    cx,
                    cy,
                    outerR,
                    innerR,
                    seg.start,
                    seg.end,
                  )}
                  fill={seg.color}
                  opacity={
                    activeSegment === null || activeSegment === i ? 1 : 0.3
                  }
                  onClick={() =>
                    setActiveSegment(activeSegment === i ? null : i)
                  }
                  style={{
                    transform: activeSegment === i ? `scale(1.04)` : "scale(1)",
                    transformOrigin: `${cx}px ${cy}px`,
                    transition: "transform 0.18s ease, opacity 0.15s ease",
                  }}
                />
              ))}
              {/* Center label */}
              <text
                x={cx}
                y={cy - 6}
                textAnchor="middle"
                className="font-800"
                fontSize="22"
                fontWeight="800"
                fill={active ? active.color : "#0F172A"}
              >
                {active ? `${active.pct}%` : "100%"}
              </text>
              <text
                x={cx}
                y={cy + 14}
                textAnchor="middle"
                fontSize="9.5"
                fontWeight="600"
                fill="#64748B"
                letterSpacing="0.04em"
              >
                {active
                  ? active.label.toUpperCase().slice(0, 14)
                  : "TOTAL BUDGET"}
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="min-w-0 flex-1 space-y-2">
            {BUDGET_SEGMENTS.map((seg, i) => (
              <button
                key={i}
                onClick={() => setActiveSegment(activeSegment === i ? null : i)}
                className="flex w-full min-w-0 items-center gap-2 text-left"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: seg.color,
                    opacity:
                      activeSegment === null || activeSegment === i ? 1 : 0.35,
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[11px] leading-tight truncate transition-all ${
                      activeSegment === i
                        ? "font-700 text-slate-800"
                        : "font-500 text-slate-600"
                    }`}
                  >
                    {seg.label}
                  </p>
                </div>
                <span
                  className="text-[11px] font-700 shrink-0"
                  style={{ color: activeSegment === i ? seg.color : "#94A3B8" }}
                >
                  {seg.pct}%
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Detail callout */}
        {active && (
          <div
            className="mt-3 p-3 rounded-xl border-l-[3px] bg-slate-50"
            style={{ borderColor: active.color }}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-[12px] font-700 text-slate-800">
                {active.label}
              </p>
              <span
                className="text-[13px] font-800"
                style={{ color: active.color }}
              >
                {active.amount}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {active.description}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-white px-2.5 py-2">
                <p className="text-[8px] font-700 uppercase tracking-wider text-slate-400">
                  vs. last year
                </p>
                <p className="mt-0.5 text-[12px] font-800 text-slate-800">
                  {active.yoy}
                </p>
              </div>
              <div className="rounded-lg bg-white px-2.5 py-2">
                <p className="text-[8px] font-700 uppercase tracking-wider text-slate-400">
                  Household impact
                </p>
                <p className="mt-0.5 text-[12px] font-800 text-slate-800">
                  {active.taxImpact}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <p className="mb-2 text-[9px] font-700 uppercase tracking-wider text-slate-400">
                Your input on this category
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {(["support", "modify", "oppose"] as const).map((opinion) => (
                  <button
                    key={opinion}
                    type="button"
                    onClick={() =>
                      setBudgetOpinions((current) => ({
                        ...current,
                        [active.label]: opinion,
                      }))
                    }
                    className={`rounded-lg border py-2 text-[9px] font-700 capitalize ${
                      budgetOpinions[active.label] === opinion
                        ? opinion === "support"
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : opinion === "modify"
                            ? "border-amber-500 bg-amber-500 text-white"
                            : "border-red-500 bg-red-500 text-white"
                        : "border-slate-200 bg-white text-slate-500"
                    }`}
                  >
                    {opinion}
                  </button>
                ))}
              </div>
              {budgetOpinions[active.label] && (
                <p className="mt-2 text-[9px] font-600 text-slate-500">
                  Response saved for the Oct 7 budget hearing.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Capital Projects */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <p className="text-[13px] font-700 text-slate-800 mb-3">
          Active Capital Projects
        </p>
        <div className="space-y-3">
          {[
            {
              title: "Main St Water Pipe Replacement",
              amount: "$1.2M allocated",
              status: "In Progress",
              tag: "orange" as const,
              note: "Phase 2 of 3 underway — Maple Ave to Eisenhower Pkwy",
            },
            {
              title: "Memorial Park Turf Renewal",
              amount: "$450K allocated",
              status: "Public Hearing Oct 14",
              tag: "blue" as const,
              note: "Artificial turf replacement; public comment open until Oct 20",
            },
          ].map((project) => (
            <div
              key={project.title}
              className="border border-slate-100 rounded-xl p-3 card-hover"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-[12px] font-700 text-slate-800 leading-tight">
                  {project.title}
                </p>
                <StatusBadge label={project.status} variant={project.tag} />
              </div>
              <p className="text-[11px] font-700 text-slate-500 mb-1">
                {project.amount}
              </p>
              <p className="text-[10px] text-slate-400 leading-relaxed mb-2.5">
                {project.note}
              </p>
              <button
                onClick={onFeedback}
                className="w-full py-2 px-3 rounded-lg bg-[#0F172A] text-white text-[12px] font-600 hover:bg-slate-700 active:bg-slate-900"
              >
                Give Feedback at Meeting
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── View: Bills ──────────────────────────────────────────────────────────────
function BillsView({ onWeighIn }: { onWeighIn: () => void }) {
  const [filter, setFilter] = useState<BillFilter>("all")
  const [selectedRecord, setSelectedRecord] =
    useState<OfficialVotingRecord | null>(null)

  const bills = [
    {
      id: "A4120",
      chamber: "state",
      title: "Clean Water Infrastructure Bond Act",
      status: "Floor Vote Next Week",
      statusTag: "blue" as const,
      impact: "high",
      officialKey: "mukherji" as const,
      effectiveDate: "July 1, 2027",
      effectiveNote: "If enacted in the current legislative session",
      plainEnglish:
        "Allocates $45M in state grants to replace lead utility lines and upgrade aging water infrastructure across North Jersey municipalities including Livingston.",
      whoPays:
        "State infrastructure bond; zero direct municipal property tax hike. Funded by state-level bonding authority approved in the 2024 budget.",
      localImpact:
        "Livingston is eligible for up to $3.1M for its aging pipe network.",
    },
    {
      id: "S2847",
      chamber: "state",
      title: "Property Tax Relief for Seniors Act",
      status: "Committee Review",
      statusTag: "orange" as const,
      impact: "high",
      officialKey: "mckeon" as const,
      effectiveDate: "January 1, 2027",
      effectiveNote: "If approved and signed by the governor",
      plainEnglish:
        "Expands the NJ Senior Freeze program to freeze property taxes for homeowners 62+ earning under $100K annually.",
      whoPays:
        "State budget offset; municipalities are reimbursed for revenue shortfall. No direct increase for other taxpayers.",
      localImpact: "Approx. 2,400 Livingston households would qualify.",
    },
    {
      id: "HR8421",
      chamber: "federal",
      title: "INVEST in America Infrastructure Reauth.",
      status: "Senate Markup",
      statusTag: "blue" as const,
      impact: "medium",
      officialKey: "sherrill" as const,
      effectiveDate: "90 days after enactment",
      effectiveNote: "Funding would phase in over five fiscal years",
      plainEnglish:
        "Reauthorizes $55B in federal highway and bridge funding over 5 years, with formula dollars flowing to NJ-11 district roads.",
      whoPays:
        "Federal general fund and gas-tax trust fund. No local property tax impact.",
      localImpact:
        "NJ-11 is projected to receive ~$87M in formula allocations over the authorization period.",
    },
  ].filter((b) => {
    if (filter === "all") return true
    if (filter === "state") return b.chamber === "state"
    if (filter === "federal") return b.chamber === "federal"
    if (filter === "local") return b.impact === "high"
    return true
  })

  const filters: { key: BillFilter label: string }[] = [
    { key: "all", label: "All" },
    { key: "state", label: "State" },
    { key: "federal", label: "Federal" },
    { key: "local", label: "High Local Impact" },
  ]

  return (
    <div className="tab-content-enter space-y-3 pb-6">
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-600 border transition-all ${
              filter === f.key
                ? "bg-[#0F172A] text-white border-[#0F172A]"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bill cards */}
      {bills.map((bill) => (
        <div
          key={bill.id}
          className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-700 text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">
                {bill.id}
              </span>
              <StatusBadge label={bill.status} variant={bill.statusTag} />
            </div>
            <span
              className={`text-[10px] font-700 uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                bill.chamber === "state"
                  ? "text-violet-600 border-violet-200 bg-violet-50"
                  : "text-blue-600 border-blue-200 bg-blue-50"
              }`}
            >
              {bill.chamber}
            </span>
          </div>

          <p className="text-[14px] font-700 text-slate-800 mb-3 leading-snug">
            {bill.title}
          </p>

          <div className="mb-3 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18" />
                <path d="m9 16 2 2 4-5" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-700 uppercase tracking-wider text-blue-600">
                Takes effect
              </p>
              <p className="text-[12px] font-800 text-slate-800">
                {bill.effectiveDate}
              </p>
              <p className="mt-0.5 text-[9px] leading-snug text-slate-500">
                {bill.effectiveNote}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setSelectedRecord(OFFICIAL_VOTING_RECORDS[bill.officialKey])
            }
            className="mb-3 flex w-full items-center gap-3 rounded-xl border border-violet-100 bg-violet-50/70 px-3 py-2.5 text-left"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 19V9M10 19V5M16 19v-7M22 19V3" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-800 uppercase tracking-wider text-violet-600">
                Relevant voting pattern
              </p>
              <p className="mt-0.5 truncate text-[11px] font-800 text-slate-800">
                {OFFICIAL_VOTING_RECORDS[bill.officialKey].name}
              </p>
              <p className="mt-0.5 text-[9px] font-600 text-slate-500">
                {OFFICIAL_VOTING_RECORDS[bill.officialKey].summary}
              </p>
            </div>
            <svg
              className="h-4 w-4 shrink-0 text-violet-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          <div className="space-y-2.5">
            <div>
              <SectionLabel>In Plain English</SectionLabel>
              <p className="text-[12px] text-slate-600 leading-relaxed">
                {bill.plainEnglish}
              </p>
            </div>
            <div>
              <SectionLabel>Who Pays</SectionLabel>
              <p className="text-[12px] text-slate-600 leading-relaxed">
                {bill.whoPays}
              </p>
            </div>
            <div className="bg-emerald-50 rounded-xl px-3 py-2 border border-emerald-100">
              <SectionLabel>Local Impact — Livingston</SectionLabel>
              <p className="text-[12px] text-emerald-800 font-500 leading-relaxed">
                {bill.localImpact}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-3.5">
            <button
              onClick={onWeighIn}
              className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 text-white text-[12px] font-700 hover:bg-blue-700 shadow-sm shadow-blue-200"
            >
              Weigh In (Contact Rep)
            </button>
            <button className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[12px] font-600 hover:bg-slate-50">
              Read Full Text
            </button>
          </div>
        </div>
      ))}
      <VotingRecordDrawer
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  )
}

// ─── Outreach Drawer ──────────────────────────────────────────────────────────
function OutreachDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [stance, setStance] = useState<"support" | "oppose" | null>(null)
  const [contexts, setContexts] = useState<string[]>([])
  const [toastState, setToastState] = useState<ToastState>("hidden")
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const contextOptions = [
    "Taxpayer",
    "Parent",
    "Local Business Owner",
    "Daily Commuter",
  ]

  function toggleContext(c: string) {
    setContexts((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    )
  }

  function handleCopy() {
    const letter = generateLetter()
    navigator.clipboard?.writeText(letter).catch(() => {})
    triggerToast()
  }

  function triggerToast() {
    setToastState("entering")
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToastState("exiting"), 2800)
    toastTimerRef.current = setTimeout(() => setToastState("hidden"), 3200)
  }

  function generateLetter() {
    const contextStr =
      contexts.length > 0 ? contexts.join(", ").toLowerCase() : "resident"
    const stanceWord = stance === "oppose" ? "opposition to" : "support for"
    return `Dear Representative McKeon,\n\nAs a ${contextStr} and resident of Livingston, NJ, I am writing to express my ${stanceWord} Assembly Bill A4120, the Clean Water Infrastructure Bond Act.\n\nThis legislation would provide critical funding to replace aging lead utility lines in our community. ${
      stance === "support"
        ? "I urge you to vote YES on A4120 and protect our community's drinking water."
        : "I have concerns about the fiscal implications and ask you to carefully review the bonding authority provisions before casting your vote."
    }\n\nThank you for your service to District 27.\n\nSincerely,\nA constituent of Livingston, NJ 07039`
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Overlay */}
      <div
        className="overlay-enter absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="sheet-enter relative w-full bg-white rounded-t-3xl shadow-2xl max-h-[92dvh] overflow-y-auto scrollbar-show">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        <div className="px-4 pb-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 pt-1">
            <div className="flex-1 pr-3">
              <p className="text-[11px] font-600 uppercase tracking-widest text-blue-600 mb-0.5">
                District 27 · A4120
              </p>
              <p className="text-[16px] font-800 text-slate-800 leading-snug">
                Contact Rep. John McKeon & Sen. McKeon
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5"
            >
              <svg
                className="w-4 h-4 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Step 1: Stance */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-[10px] font-800 text-white">1</span>
              </div>
              <p className="text-[13px] font-700 text-slate-700">
                Your Position on A4120
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["support", "oppose"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStance(s)}
                  className={`py-3 rounded-xl border-2 text-[13px] font-700 transition-all ${
                    stance === s
                      ? s === "support"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-red-400 bg-red-50 text-red-700"
                      : "border-slate-200 text-slate-500"
                  }`}
                >
                  {s === "support" ? "✅ I Support" : "❌ I Oppose"}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Context */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-[10px] font-800 text-white">2</span>
              </div>
              <p className="text-[13px] font-700 text-slate-700">
                I'm Reaching Out As A…
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {contextOptions.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleContext(c)}
                  className={`px-3.5 py-1.5 rounded-full border text-[12px] font-600 transition-all ${
                    contexts.includes(c)
                      ? "bg-[#0F172A] text-white border-[#0F172A]"
                      : "bg-white text-slate-500 border-slate-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Letter preview */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-[10px] font-800 text-white">3</span>
              </div>
              <p className="text-[13px] font-700 text-slate-700">
                Your Personalized Letter
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[10px] font-700 text-emerald-700 uppercase tracking-wider">
                  Verified — Livingston, NJ 07039
                </p>
              </div>
              <p className="text-[12px] text-slate-600 leading-relaxed whitespace-pre-line font-400 font-mono">
                {generateLetter()}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <button
              onClick={handleCopy}
              className="w-full py-3.5 rounded-2xl bg-blue-600 text-white text-[14px] font-700 shadow-sm shadow-blue-200 hover:bg-blue-700"
            >
              Copy & Open Official Web Form
            </button>
            <a
              href="tel:9735355115"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-slate-200 text-slate-700 text-[13px] font-600 hover:bg-slate-50"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z"
                />
              </svg>
              Call Office (973-535-5115)
            </a>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toastState !== "hidden" && (
        <div
          className={`absolute bottom-28 left-1/2 -translate-x-1/2 z-10 ${
            toastState === "exiting" ? "toast-exit" : "toast-enter"
          }`}
        >
          <div className="flex items-center gap-2.5 bg-emerald-700 text-white text-[13px] font-600 px-4 py-3 rounded-2xl shadow-lg whitespace-nowrap">
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Letter copied! Redirecting to constituent portal.
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Profile ──────────────────────────────────────────────────────────────────
function ProfileTagIcon({ label }: { label: string }) {
  const normalized = label.toLowerCase()
  let icon: React.ReactNode

  if (
    ["democrat", "republican", "independent", "nonpartisan"].includes(
      normalized,
    )
  ) {
    icon = (
      <>
        <path d="M5 21V4" />
        <path d="M5 5h11l-2 4 2 4H5" />
      </>
    )
  } else if (normalized.includes("choice") || normalized.includes("life")) {
    icon = (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    )
  } else if (
    normalized.includes("gun") ||
    normalized.includes("police") ||
    normalized.includes("blue") ||
    normalized.includes("safety")
  ) {
    icon = <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
  } else if (normalized.includes("climate") || normalized.includes("parks")) {
    icon = (
      <>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 18 2 18 2c1 7-2 12-7 13" />
        <path d="M2 21c0-3 1.9-5.5 5-7" />
      </>
    )
  } else if (normalized.includes("housing")) {
    icon = (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    )
  } else if (
    normalized.includes("education") ||
    normalized.includes("schools")
  ) {
    icon = (
      <>
        <path d="m3 6 9-4 9 4-9 4-9-4Z" />
        <path d="M7 8.2V14c3 2 7 2 10 0V8.2M21 6v7" />
      </>
    )
  } else if (
    normalized.includes("immigration") ||
    normalized.includes("border")
  ) {
    icon = (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </>
    )
  } else if (normalized.includes("lgbtq") || normalized.includes("racial")) {
    icon = (
      <>
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="8" r="3" />
        <path d="M2 20a6 6 0 0 1 12 0M10 20a6 6 0 0 1 12 0" />
      </>
    )
  } else if (normalized.includes("values")) {
    icon = (
      <path d="m12 2 3 6 7 .9-5 4.8 1.3 6.8L12 17l-6.3 3.5L7 13.7 2 8.9 9 8l3-6Z" />
    )
  } else {
    icon = (
      <>
        <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />
      </>
    )
  }

  return (
    <svg
      className="h-3 w-3 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icon}
    </svg>
  )
}

function ProfileView({ onSignOut }: { onSignOut: () => void }) {
  const [voteAlerts, setVoteAlerts] = useState(true)
  const [budgetAlerts, setBudgetAlerts] = useState(true)
  const [communityAlerts, setCommunityAlerts] = useState(false)
  const [isDiscoverable, setIsDiscoverable] = useState(true)
  const [civicInterests, setCivicInterests] = useState(
    new Set(["Schools", "Walkability", "Parks"]),
  )
  const [likedActivity, setLikedActivity] = useState(new Set<number>())
  const [politicalAffiliation, setPoliticalAffiliation] =
    useState<string | null>("Independent")
  const [socialIssueTags, setSocialIssueTags] = useState(
    new Set(["Affordable housing", "Climate action", "Pro-choice"]),
  )
  const [showProfileTags, setShowProfileTags] = useState(true)

  const interestOptions = [
    "Schools",
    "Housing",
    "Walkability",
    "Local business",
    "Parks",
    "Public safety",
  ]
  const affiliationOptions = [
    "Democrat",
    "Republican",
    "Independent",
    "Nonpartisan",
  ]
  const socialIssueOptions = [
    "Affordable housing",
    "Climate action",
    "Education equity",
    "LGBTQ+ rights",
    "Pro-choice",
    "Pro-life",
    "Gun rights",
    "Gun safety",
    "Police reform",
    "Back the blue",
    "Immigration reform",
    "Border security",
    "Racial justice",
    "Traditional values",
  ]

  function toggleCivicInterest(interest: string) {
    setCivicInterests((current) => {
      const next = new Set(current)
      next.has(interest) ? next.delete(interest) : next.add(interest)
      return next
    })
  }

  function toggleActivityLike(index: number) {
    setLikedActivity((current) => {
      const next = new Set(current)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }

  function toggleSocialIssue(issue: string) {
    setSocialIssueTags((current) => {
      const next = new Set(current)
      next.has(issue) ? next.delete(issue) : next.add(issue)
      return next
    })
  }

  return (
    <div className="tab-content-enter space-y-4 pb-8">
      <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="relative h-24 overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700">
          <div className="absolute -right-6 -top-10 h-32 w-32 rounded-full border-[18px] border-white/10" />
          <div className="absolute bottom-3 left-32 h-5 w-5 rotate-12 rounded-md bg-emerald-300/70" />
          <div className="absolute left-5 top-5 h-3 w-3 rounded-full bg-amber-300" />
        </div>
        <div className="px-4 pb-4">
          <div className="-mt-11 flex items-end justify-between">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border-4 border-white bg-[#0F172A] text-2xl font-800 text-white shadow-md">
                AM
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
              </div>
            </div>
            <button
              aria-label="Profile options"
              className="mb-1 flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 text-slate-500"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-1.5">
              <p className="text-xl font-800 tracking-tight text-slate-900">
                Alex Morgan
              </p>
              <svg
                className="h-4 w-4 text-blue-600"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-label="Verified resident"
              >
                <path d="m12 2 2.1 2.1 3-.4.9 2.8 2.7 1.4-1.3 2.7 1.3 2.7-2.7 1.4-.9 2.8-3-.4L12 19.2l-2.1-2.1-3 .4-.9-2.8-2.7-1.4 1.3-2.7-1.3-2.7L6 6.5l.9-2.8 3 .4L12 2Z" />
                <path
                  d="m8.5 10.7 2.2 2.2 4.8-5"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-[12px] font-600 text-slate-500">
              @alexinlivingston · Livingston, NJ
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-700">
              Parent, park regular, and local policy nerd. Here to make
              Livingston safer, greener, and easier to get around.
            </p>
            {showProfileTags &&
              (civicInterests.size > 0 ||
                politicalAffiliation ||
                socialIssueTags.size > 0) && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {politicalAffiliation && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-700 text-slate-700">
                      <ProfileTagIcon label={politicalAffiliation} />
                      {politicalAffiliation}
                    </span>
                  )}
                  {Array.from(civicInterests)
                    .slice(0, 2)
                    .map((interest) => (
                      <span
                        key={interest}
                        className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-700 text-blue-700"
                      >
                        <ProfileTagIcon label={interest} />
                        {interest}
                      </span>
                    ))}
                  {Array.from(socialIssueTags)
                    .slice(0, 2)
                    .map((issue) => (
                      <span
                        key={issue}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-700 text-emerald-700"
                      >
                        <ProfileTagIcon label={issue} />
                        {issue}
                      </span>
                    ))}
                  {civicInterests.size +
                    socialIssueTags.size +
                    (politicalAffiliation ? 1 : 0) >
                    5 && (
                    <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-700 text-slate-500">
                      +
                      {civicInterests.size +
                        socialIssueTags.size +
                        (politicalAffiliation ? 1 : 0) -
                        5}
                    </span>
                  )}
                </div>
              )}
          </div>

          <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-slate-50 py-3 text-center">
            {[
              { value: "24", label: "Posts" },
              { value: "138", label: "Neighbors" },
              { value: "42", label: "Following" },
            ].map((stat) => (
              <button key={stat.label} className="flex flex-col items-center">
                <span className="text-[15px] font-800 text-slate-900">
                  {stat.value}
                </span>
                <span className="text-[10px] font-600 text-slate-500">
                  {stat.label}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <button className="flex-1 rounded-xl bg-blue-600 py-2.5 text-[12px] font-700 text-white shadow-[0_3px_0_#1E40AF]">
              Edit Profile
            </button>
            <button
              aria-label="Share profile"
              className="flex h-10 w-11 items-center justify-center rounded-xl border-2 border-slate-200 text-slate-600"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-blue-100 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4M8 11h6M11 8v6" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-800 text-slate-800">
                  Discoverable profile
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                  Let verified neighbors find you in Town Square.
                </p>
              </div>
              <ToggleSwitch
                on={isDiscoverable}
                onToggle={() => setIsDiscoverable(!isDiscoverable)}
              />
            </div>
          </div>
        </div>

        <div
          className={`mt-4 rounded-2xl border p-3.5 transition-colors ${
            isDiscoverable
              ? "border-emerald-100 bg-emerald-50/70"
              : "border-slate-100 bg-slate-50"
          }`}
        >
          <div className="mb-2 flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isDiscoverable ? "bg-emerald-500" : "bg-slate-300"
              }`}
            />
            <p
              className={`text-[10px] font-700 uppercase tracking-wider ${
                isDiscoverable ? "text-emerald-700" : "text-slate-500"
              }`}
            >
              {isDiscoverable
                ? "Visible to verified residents"
                : "Profile hidden"}
            </p>
          </div>
          {isDiscoverable ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-[12px] font-800 text-white">
                  AM
                </div>
                <div>
                  <p className="text-[12px] font-800 text-slate-800">Alex M.</p>
                  <p className="text-[10px] font-600 text-slate-500">
                    Verified resident · Livingston
                  </p>
                </div>
              </div>
              {showProfileTags &&
                (civicInterests.size > 0 ||
                  politicalAffiliation ||
                  socialIssueTags.size > 0) && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {Array.from(civicInterests)
                      .slice(0, 2)
                      .map((interest) => (
                        <span
                          key={interest}
                          className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[9px] font-700 text-blue-700 ring-1 ring-blue-100"
                        >
                          <ProfileTagIcon label={interest} />
                          {interest}
                        </span>
                      ))}
                    {politicalAffiliation && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[9px] font-700 text-slate-700 ring-1 ring-slate-200">
                        <ProfileTagIcon label={politicalAffiliation} />
                        {politicalAffiliation}
                      </span>
                    )}
                    {Array.from(socialIssueTags)
                      .slice(0, 1)
                      .map((issue) => (
                        <span
                          key={issue}
                          className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[9px] font-700 text-emerald-700 ring-1 ring-emerald-100"
                        >
                          <ProfileTagIcon label={issue} />
                          {issue}
                        </span>
                      ))}
                  </div>
                )}
              <p className="mt-3 border-t border-emerald-100 pt-2.5 text-[10px] leading-relaxed text-slate-500">
                Only your first name, last initial, town, verification badge
                {showProfileTags ? ", and selected profile tags" : ""} are
                public. Your address always stays private.
              </p>
            </>
          ) : (
            <p className="text-[10px] leading-relaxed text-slate-500">
              Other residents cannot find or view your profile. Your existing
              Town Square posts remain visible without a profile link.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <p className="text-[11px] font-700 uppercase tracking-widest text-blue-600">
            What you care about
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
            Pick the issues neighbors can connect with you about.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {interestOptions.map((interest) => {
            const selected = civicInterests.has(interest)
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleCivicInterest(interest)}
                aria-pressed={selected}
                className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-2 text-[11px] font-700 transition-all ${
                  selected
                    ? "border-blue-600 bg-blue-600 text-white shadow-[0_2px_0_#1E40AF]"
                    : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                <ProfileTagIcon label={interest} />
                {interest}
              </button>
            )
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 13 11 22l-9-9V4a2 2 0 0 1 2-2h9l7 7v4Z" />
              <circle cx="7.5" cy="7.5" r="1.5" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-800 text-slate-800">
              Edit profile tags
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
              Choose optional tags and control whether anyone else can see them.
            </p>
          </div>
          <ToggleSwitch
            on={showProfileTags}
            onToggle={() => setShowProfileTags(!showProfileTags)}
          />
        </div>

        <div
          className={`mt-3 flex items-center justify-between rounded-xl px-3 py-2.5 ${
            showProfileTags ? "bg-emerald-50" : "bg-slate-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <svg
              className={`h-4 w-4 ${
                showProfileTags ? "text-emerald-600" : "text-slate-400"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {showProfileTags ? (
                <>
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              ) : (
                <>
                  <path d="m3 3 18 18" />
                  <path d="M10.6 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-2.1 3.2M6.6 6.6C3.6 8.5 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 3.4-.6" />
                </>
              )}
            </svg>
            <span
              className={`text-[10px] font-700 ${
                showProfileTags ? "text-emerald-700" : "text-slate-500"
              }`}
            >
              {showProfileTags
                ? "Tags visible on profile"
                : "All tags hidden from profile"}
            </span>
          </div>
          <span className="text-[9px] font-600 text-slate-400">
            Selections saved
          </span>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-[10px] font-700 uppercase tracking-widest text-slate-400">
              Political affiliation
            </p>
            <span className="text-[9px] font-600 text-slate-400">
              Choose one
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {affiliationOptions.map((affiliation) => {
              const selected = politicalAffiliation === affiliation
              return (
                <button
                  key={affiliation}
                  type="button"
                  onClick={() =>
                    setPoliticalAffiliation(selected ? null : affiliation)
                  }
                  aria-pressed={selected}
                  className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-2 text-[11px] font-700 transition-all ${
                    selected
                      ? "border-slate-800 bg-slate-800 text-white shadow-[0_2px_0_#0F172A]"
                      : "border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  <ProfileTagIcon label={affiliation} />
                  {affiliation}
                </button>
              )
            })}
          </div>
          {!politicalAffiliation && (
            <p className="mt-2 text-[10px] font-600 text-slate-400">
              No political affiliation shown
            </p>
          )}
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-[10px] font-700 uppercase tracking-widest text-slate-400">
              Social issues
            </p>
            <span className="text-[9px] font-600 text-slate-400">
              {socialIssueTags.size} selected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {socialIssueOptions.map((issue) => {
              const selected = socialIssueTags.has(issue)
              return (
                <button
                  key={issue}
                  type="button"
                  onClick={() => toggleSocialIssue(issue)}
                  aria-pressed={selected}
                  className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-2 text-[11px] font-700 transition-all ${
                    selected
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-[0_2px_0_#A7F3D0]"
                      : "border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  <ProfileTagIcon label={issue} />
                  {issue}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] font-700 uppercase tracking-widest text-slate-400">
            My civic prompts
          </p>
          <button className="text-[11px] font-700 text-blue-600">
            Edit prompts
          </button>
        </div>
        {[
          {
            prompt: "An issue I’ll always show up for…",
            answer:
              "Safe, walkable streets where kids can get to school without needing a ride.",
          },
          {
            prompt: "The local update I never miss…",
            answer:
              "School board decisions—especially anything that affects classroom funding.",
          },
          {
            prompt: "My favorite way to pitch in…",
            answer:
              "Public meetings, park cleanups, and helping neighbors understand what’s on the ballot.",
          },
        ].map((item) => (
          <div
            key={item.prompt}
            className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <p className="text-[12px] font-700 text-blue-600">{item.prompt}</p>
            <p className="mt-2 text-[17px] font-800 leading-snug text-slate-800">
              {item.answer}
            </p>
            <button
              aria-label={`Edit prompt: ${item.prompt}`}
              className="mt-4 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z" />
              </svg>
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] font-700 uppercase tracking-widest text-slate-400">
            Recent activity
          </p>
          <button className="text-[11px] font-700 text-blue-600">
            See all
          </button>
        </div>
        {[
          {
            context: "Town Square · 2h",
            body: "The new crosswalk proposal near Hillside Elementary is a strong start. Raised crossings would make it even safer during drop-off.",
            likes: 18,
            comments: 5,
          },
          {
            context: "Budget discussion · Yesterday",
            body: "Glad to see park maintenance funding protected this year. These shared spaces are where our community actually meets.",
            likes: 31,
            comments: 8,
          },
        ].map((post, index) => {
          const liked = likedActivity.has(index)
          return (
            <article
              key={post.context}
              className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F172A] text-[11px] font-800 text-white">
                  AM
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-800 text-slate-800">
                    Alex Morgan
                  </p>
                  <p className="text-[10px] font-600 text-slate-400">
                    {post.context}
                  </p>
                </div>
                <button aria-label="Post options" className="text-slate-300">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <circle cx="5" cy="12" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="19" cy="12" r="1.5" />
                  </svg>
                </button>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-slate-700">
                {post.body}
              </p>
              <div className="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => toggleActivityLike(index)}
                  className={`flex items-center gap-1.5 text-[11px] font-700 ${
                    liked ? "text-blue-600" : "text-slate-400"
                  }`}
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill={liked ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M7 10v12M15 5.9 14 10h5.8a2 2 0 0 1 2 2.4l-1.4 7a2 2 0 0 1-2 1.6H7V10l4-8a3 3 0 0 1 4 3.9Z" />
                  </svg>
                  {post.likes + (liked ? 1 : 0)}
                </button>
                <button className="flex items-center gap-1.5 text-[11px] font-700 text-slate-400">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.7-5.1A7 7 0 0 1 3 12c0-4.4 4-8 9-8s9 3.6 9 8v3Z" />
                  </svg>
                  {post.comments}
                </button>
                <button
                  className="ml-auto text-slate-400"
                  aria-label="Share post"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m22 2-7 20-4-9-9-4 20-7Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </button>
              </div>
            </article>
          )
        })}
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="px-4 pb-2 pt-4">
          <p className="text-[11px] font-700 uppercase tracking-widest text-slate-400">
            Notifications
          </p>
        </div>
        {[
          {
            label: "Upcoming votes",
            sub: "Hearings and votes in your districts",
            on: voteAlerts,
            toggle: () => setVoteAlerts(!voteAlerts),
          },
          {
            label: "Budget updates",
            sub: "Changes to local spending and taxes",
            on: budgetAlerts,
            toggle: () => setBudgetAlerts(!budgetAlerts),
          },
          {
            label: "Town Square",
            sub: "Replies and neighborhood discussions",
            on: communityAlerts,
            toggle: () => setCommunityAlerts(!communityAlerts),
          },
        ].map((item, index) => (
          <div
            key={item.label}
            className={`flex items-center gap-3 px-4 py-3.5 ${
              index > 0 ? "border-t border-slate-100" : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-700 text-slate-800">
                {item.label}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
                {item.sub}
              </p>
            </div>
            <ToggleSwitch on={item.on} onToggle={item.toggle} />
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        {[
          {
            label: "Privacy and data",
            icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
          },
          {
            label: "Help and support",
            icon: (
              <>
                <circle cx="12" cy="12" r="10" />
                <path d="M9.1 9a3 3 0 1 1 5.2 2c-1.4 1.1-2.3 1.6-2.3 3M12 18h.01" />
              </>
            ),
          },
          {
            label: "About Townly",
            icon: (
              <>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </>
            ),
          },
        ].map((item, index) => (
          <button
            key={item.label}
            className={`flex w-full items-center gap-3 px-4 py-3.5 text-left ${
              index > 0 ? "border-t border-slate-100" : ""
            }`}
          >
            <svg
              className="h-5 w-5 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {item.icon}
            </svg>
            <span className="flex-1 text-[13px] font-700 text-slate-700">
              {item.label}
            </span>
            <svg
              className="h-4 w-4 text-slate-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        ))}
      </section>

      <button
        type="button"
        onClick={onSignOut}
        className="w-full rounded-2xl border-2 border-red-100 bg-white py-3.5 text-[13px] font-700 text-red-600 shadow-sm"
      >
        Sign Out
      </button>
      <p className="text-center text-[10px] font-600 text-slate-400">
        Townly version 1.0
      </p>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
function TabIcon({ tab }: { tab: Tab }) {
  const paths: Record<Tab, React.ReactNode> = {
    overview: (
      <>
        <path d="M3 10.8 12 3l9 7.8" />
        <path d="M5.5 9.5V21h13V9.5M9.5 21v-7h5v7" />
      </>
    ),
    bills: (
      <>
        <path d="M7 3h10a2 2 0 0 1 2 2v16l-3-2-4 2-4-2-3 2V5a2 2 0 0 1 2-2Z" />
        <path d="m8.5 11 2 2 5-5" />
      </>
    ),
    budget: (
      <>
        <path d="M12 3v18M17.5 7H9.25a3.25 3.25 0 0 0 0 6.5h5.5a3.25 3.25 0 0 1 0 6.5H6" />
      </>
    ),
    townsquare: (
      <>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.7-5.1A7 7 0 0 1 3 12c0-4.42 4.03-8 9-8s9 3.58 9 8v3Z" />
        <path d="M8 11h.01M12 11h.01M16 11h.01" />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
  }

  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[tab]}
    </svg>
  )
}

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("welcome")
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [showDrawer, setShowDrawer] = useState(false)
  const [contentKey, setContentKey] = useState(0)

  function switchTab(tab: Tab) {
    setActiveTab(tab)
    setContentKey((k) => k + 1)
  }

  if (screen === "welcome") {
    return (
      <WelcomeScreen
        onGetStarted={() => setScreen("onboard-1")}
        onLogin={() => setScreen("dashboard")}
      />
    )
  }
  if (screen === "onboard-1") {
    return <OnboardStep1 onNext={() => setScreen("onboard-2")} />
  }
  if (screen === "onboard-2") {
    return (
      <OnboardStep2
        onBack={() => setScreen("onboard-1")}
        onEnter={() => setScreen("dashboard")}
      />
    )
  }

  const tabs: { key: Tab label: string }[] = [
    { key: "overview", label: "Home" },
    { key: "bills", label: "Votes" },
    { key: "budget", label: "Budget" },
    { key: "townsquare", label: "Town Square" },
    { key: "profile", label: "Profile" },
  ]

  return (
    <div className="dashboard-shell flex min-h-dvh justify-center bg-[#F4F6F8]">
      {/* Mobile frame */}
      <div className="relative flex min-h-dvh w-full max-w-[393px] flex-col bg-[#F4F6F8]">
        {/* ── Header ── */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 pb-3 pt-12 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
                <TownlyMark className="h-4 w-4" />
              </div>
              <span className="text-[18px] font-800 tracking-tight text-slate-900">
                Townly
              </span>
            </div>

            {/* Location badge */}
            <button className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-600 hover:bg-slate-100">
              <svg
                className="h-3.5 w-3.5 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              <span className="text-[11px] font-600">Livingston, NJ</span>
              <svg
                className="h-3 w-3 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
              </svg>
            </button>
          </div>
        </header>

        {/* ── Content ── */}
        <main
          className={`flex-1 overflow-y-auto px-4 pb-24 pt-4 ${
            activeTab === "townsquare" ? "snap-y snap-proximity scroll-smooth" : ""
          }`}
          key={contentKey}
        >
          {activeTab === "overview" && (
            <OverviewView onContact={() => setShowDrawer(true)} />
          )}
          {activeTab === "budget" && (
            <BudgetView onFeedback={() => setShowDrawer(true)} />
          )}
          {activeTab === "bills" && (
            <BillsView onWeighIn={() => setShowDrawer(true)} />
          )}
          {activeTab === "townsquare" && (
            <CommunityFeedView onOpenBudget={() => switchTab("budget")} />
          )}
          {activeTab === "profile" && (
            <ProfileView onSignOut={() => setScreen("welcome")} />
          )}
        </main>

        {/* ── Bottom Navigation ── */}
        <nav
          className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-[393px] -translate-x-1/2 items-center justify-around border-t border-slate-200 bg-white/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl"
          aria-label="Primary navigation"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => switchTab(tab.key)}
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
                title={tab.label}
                className={`relative flex h-14 min-w-14 flex-col items-center justify-center gap-0.5 rounded-lg transition-colors ${
                  isActive
                    ? "text-blue-600"
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <TabIcon tab={tab.key} />
                <span
                  className={`text-[9px] ${isActive ? "font-800" : "font-600"}`}
                >
                  {tab.label}
                </span>
                {tab.key === "townsquare" && !isActive && (
                  <span className="absolute right-2 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-red-500 px-0.5 text-[7px] font-800 text-white">
                    4
                  </span>
                )}
                {isActive && (
                  <span className="absolute top-0 h-0.5 w-6 rounded-full bg-blue-600" />
                )}
              </button>
            )
          })}
        </nav>

        {/* ── Outreach Drawer ── */}
        <OutreachDrawer
          open={showDrawer}
          onClose={() => setShowDrawer(false)}
        />
      </div>
    </div>
  )
}
