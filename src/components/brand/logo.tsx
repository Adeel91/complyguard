export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <svg
        width="30"
        height="30"
        viewBox="0 0 30 30"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M15 2.8 25.2 8.4v13.2L15 27.2 4.8 21.6V8.4L15 2.8Z"
          stroke="#A98CFF"
          strokeWidth="1.55"
        />

        <path
          d="M9.7 15.2 13 18.5l7.1-7.1"
          stroke="#7FE1CF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle
          cx="15"
          cy="15"
          r="11.6"
          stroke="white"
          strokeOpacity=".05"
        />
      </svg>

      <div>
        <div className="text-[14px] font-bold tracking-[-0.045em] text-white">
          ComplyGuard
        </div>

        <div className="mt-[2px] text-[8px] uppercase tracking-[0.13em] text-white/28">
          evidence engine
        </div>
      </div>
    </div>
  );
}
