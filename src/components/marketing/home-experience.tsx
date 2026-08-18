"use client";

import Link from "next/link";
import {
  useRef,
} from "react";

import {
  motion,
  useScroll,
  useTransform,
} from "motion/react";

import { AmbientEvidence } from "@/components/visual/ambient-evidence";

const engineSteps = [
  {
    number: "01",
    name: "Profile",
    code:
      "repository.profile()",
    title:
      "Understand the system before judging the code.",
    text:
      "ComplyGuard identifies the repository language, technologies and security sensitive surfaces before interpreting individual findings.",
  },
  {
    number: "02",
    name: "Inspect",
    code:
      "ast.inspect()",
    title:
      "Preserve the exact source evidence.",
    text:
      "Deterministic rules operate on real syntax and retain file, line, column and triggering source expression.",
  },
  {
    number: "03",
    name: "Correlate",
    code:
      "risks.correlate()",
    title:
      "Stop counting the same problem three times.",
    text:
      "Framework specific signals that point to the same underlying engineering problem are grouped into a root risk.",
  },
  {
    number: "04",
    name: "Map",
    code:
      "controls.map()",
    title:
      "Trace one risk across multiple controls.",
    text:
      "The underlying source evidence stays intact while its relationship to GDPR, SOC 2 and ISO 27001 becomes visible.",
  },
];

const pipelineSteps = [
  [
    "Repository",
    "public GitHub source",
  ],
  [
    "Profile",
    "technology + risk surface",
  ],
  [
    "Scan",
    "deterministic AST evidence",
  ],
  [
    "Correlate",
    "signals → root risks",
  ],
  [
    "Map",
    "root risks → controls",
  ],
  [
    "Review",
    "contextual reasoning layer",
  ],
];

function Arrow() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 10h12M11 6l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children:
    React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 34,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.18,
      }}
      transition={{
        duration: 0.72,
        delay,
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      }}
      className={
        className
      }
    >
      {children}
    </motion.div>
  );
}

export function HomeExperience() {
  const heroRef =
    useRef<HTMLElement | null>(
      null,
    );

  const {
    scrollYProgress,
  } =
    useScroll({
      target: heroRef,
      offset: [
        "start start",
        "end start",
      ],
    });

  const heroTextY =
    useTransform(
      scrollYProgress,
      [0, 1],
      [0, 95],
    );

  const heroOpacity =
    useTransform(
      scrollYProgress,
      [0, 0.82],
      [1, 0.16],
    );

  return (
    <>
      <section
        ref={heroRef}
        className="relative min-h-[860px] overflow-hidden pt-[100px]"
      >
        <AmbientEvidence />

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#08070a_0%,rgba(8,7,10,.96)_27%,rgba(8,7,10,.58)_51%,rgba(8,7,10,.08)_78%,rgba(8,7,10,.4)_100%)]" />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_47%,transparent_0%,transparent_18%,rgba(8,7,10,.15)_55%,#08070a_94%)]" />

        <div className="cg-scan-line" />

        <div className="cg-container relative z-10 flex min-h-[730px] items-center">
          <motion.div
            style={{
              y: heroTextY,
              opacity:
                heroOpacity,
            }}
            className="max-w-[760px] pb-12 pt-16"
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 14,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.65,
              }}
              className="cg-eyebrow"
            >
              Evidence first compliance engineering
            </motion.div>

            <motion.h1
              initial={{
                opacity: 0,
                y: 35,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.08,
                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
              }}
              className="cg-display mt-8 text-[54px] text-white sm:text-[66px] lg:text-[80px]"
            >
              Turn source
              <br />
              code into
              <br />

              <span className="cg-gradient-text">
                evidence.
              </span>
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
                y: 24,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.75,
                delay: 0.18,
              }}
              className="mt-8 max-w-[630px] text-[15px] leading-8 text-white/50"
            >
              ComplyGuard reads real TypeScript and JavaScript, finds engineering risk signals, collapses duplicate framework noise and shows the exact path from source to control impact.
            </motion.p>

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.7,
                delay: 0.28,
              }}
              className="mt-9 flex flex-wrap items-center gap-7"
            >
              <Link
                href="/scan"
                className="cg-primary"
              >
                Scan repository
                <Arrow />
              </Link>

              <a
                href="https://github.com/Adeel91/complyguard"
                target="_blank"
                rel="noreferrer"
                className="cg-link"
              >
                View source
                <Arrow />
              </a>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.7,
            duration: 1,
          }}
          className="cg-float-one absolute right-[10%] top-[24%] hidden lg:block"
        >
          <div className="text-[10px] text-[#77acff]">
            source/auth.ts
          </div>

          <div className="mt-1 text-[11px] text-white/32">
            credential path
          </div>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.9,
            duration: 1,
          }}
          className="cg-float-two absolute right-[31%] top-[49%] hidden lg:block"
        >
          <div className="text-[10px] text-[#f27484]">
            root risk
          </div>

          <div className="mt-1 text-[11px] text-white/32">
            weak authentication
          </div>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 1.1,
            duration: 1,
          }}
          className="cg-float-three absolute bottom-[22%] right-[9%] hidden lg:block"
        >
          <div className="text-[10px] text-[#a98cff]">
            control impact
          </div>

          <div className="mt-1 text-[11px] text-white/32">
            GDPR · SOC2 · ISO
          </div>
        </motion.div>
      </section>

      <EvidenceMarquee />

      <section
        id="engine"
        className="relative py-32 md:py-40"
      >
        <div className="pointer-events-none absolute left-[-200px] top-[20%] h-[500px] w-[500px] rounded-full bg-[#5b8dcb]/[0.035] blur-[100px]" />

        <div className="cg-container">
          <div className="grid gap-16 lg:grid-cols-[0.4fr_0.6fr] lg:gap-24">
            <Reveal>
              <div className="lg:sticky lg:top-32">
                <div className="cg-eyebrow">
                  Engine
                </div>

                <h2 className="cg-heading mt-7 max-w-[520px] text-[42px] text-white md:text-[54px]">
                  Facts first.
                  <br />

                  <span className="text-white/27">
                    Context after.
                  </span>
                </h2>

                <p className="mt-7 max-w-[480px] text-[14px] leading-7 text-white/40">
                  The scanner establishes inspectable facts before any deeper reasoning layer is allowed to interpret them.
                </p>
              </div>
            </Reveal>

            <div className="space-y-20">
              {engineSteps.map(
                (
                  step,
                  index,
                ) => (
                  <Reveal
                    key={
                      step.number
                    }
                    delay={
                      index *
                      0.04
                    }
                  >
                    <div className="group relative pl-14">
                      <div className="absolute left-0 top-[7px] text-[11px] text-white/22">
                        {
                          step.number
                        }
                      </div>

                      <div className="text-[11px] font-semibold uppercase tracking-[0.09em] text-[#a98cff]">
                        {
                          step.name
                        }
                      </div>

                      <h3 className="mt-4 max-w-[720px] text-[26px] font-bold leading-[1.22] tracking-[-0.045em] text-white/90 md:text-[32px]">
                        {
                          step.title
                        }
                      </h3>

                      <p className="mt-5 max-w-[680px] text-[14px] leading-7 text-white/40">
                        {
                          step.text
                        }
                      </p>

                      <code className="mt-6 block text-[12px] text-[#7fe1cf]/68">
                        →{" "}
                        {
                          step.code
                        }
                      </code>

                      <div className="mt-10 h-px origin-left scale-x-[0.35] bg-gradient-to-r from-white/18 to-transparent transition-transform duration-500 group-hover:scale-x-100" />
                    </div>
                  </Reveal>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <ControlMapping />

      <Pipeline />

      <section className="relative overflow-hidden py-36 text-center md:py-48">
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8e6bea]/[0.07] blur-[120px]"
          animate={{
            scale: [
              0.9,
              1.1,
              0.9,
            ],
            opacity: [
              0.45,
              0.85,
              0.45,
            ],
          }}
          transition={{
            duration: 7,
            repeat:
              Infinity,
            ease:
              "easeInOut",
          }}
        />

        <Reveal className="cg-container relative">
          <div className="cg-eyebrow justify-center">
            Inspect real source
          </div>

          <h2 className="cg-display mx-auto mt-8 max-w-[920px] text-[43px] text-white md:text-[60px]">
            Put the repository
            <br />

            <span className="text-white/27">
              under evidence.
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-[660px] text-[14px] leading-7 text-white/39">
            No generated findings. No fake certification status. Every deterministic result begins at an actual source location.
          </p>

          <Link
            href="/scan"
            className="cg-primary mt-10"
          >
            Open scanner
            <Arrow />
          </Link>
        </Reveal>
      </section>
    </>
  );
}

function EvidenceMarquee() {
  const values = [
    "AST EVIDENCE",
    "GDPR",
    "ROOT RISK CORRELATION",
    "SOC 2",
    "SOURCE LOCATIONS",
    "ISO 27001",
    "REPOSITORY INTELLIGENCE",
    "CONTROL MAPPING",
  ];

  const repeated = [
    ...values,
    ...values,
  ];

  return (
    <div className="cg-marquee border-y border-white/[0.06] py-5">
      <div className="cg-marquee-track">
        {repeated.map(
          (
            value,
            index,
          ) => (
            <div
              key={`${value}-${index}`}
              className="flex items-center"
            >
              <span className="px-8 text-[10px] uppercase tracking-[0.11em] text-white/26">
                {value}
              </span>

              <span className="h-1 w-1 rounded-full bg-[#a98cff]/55" />
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function ControlMapping() {
  return (
    <section
      id="mapping"
      className="relative overflow-hidden py-32 md:py-44"
    >
      <div className="pointer-events-none absolute right-[-180px] top-[10%] h-[560px] w-[560px] rounded-full bg-[#8e67df]/[0.045] blur-[120px]" />

      <div className="cg-container">
        <div className="grid items-center gap-16 lg:grid-cols-[0.43fr_0.57fr]">
          <Reveal>
            <div>
              <div className="cg-eyebrow">
                Cross framework mapping
              </div>

              <h2 className="cg-heading mt-7 max-w-[570px] text-[42px] text-white md:text-[54px]">
                One risk.
                <br />

                <span className="text-white/27">
                  Three perspectives.
                </span>
              </h2>

              <p className="mt-7 max-w-[510px] text-[14px] leading-7 text-white/40">
                Framework mappings stay attached to the root engineering problem instead of inflating one source issue into unrelated findings.
              </p>
            </div>
          </Reveal>

          <Reveal
            delay={0.1}
          >
            <div className="relative mx-auto h-[520px] w-full max-w-[760px]">
              <svg
                viewBox="0 0 760 520"
                className="absolute inset-0 h-full w-full overflow-visible"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="cgPathA"
                    x1="0"
                    x2="1"
                  >
                    <stop
                      offset="0"
                      stopColor="#F27484"
                      stopOpacity=".15"
                    />

                    <stop
                      offset=".55"
                      stopColor="#A98CFF"
                      stopOpacity=".55"
                    />

                    <stop
                      offset="1"
                      stopColor="#7FE1CF"
                      stopOpacity=".2"
                    />
                  </linearGradient>
                </defs>

                <motion.path
                  d="M375 260 C470 160 515 115 655 92"
                  fill="none"
                  stroke="url(#cgPathA)"
                  strokeWidth="1.3"
                  initial={{
                    pathLength: 0,
                    opacity: 0,
                  }}
                  whileInView={{
                    pathLength: 1,
                    opacity: 1,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 1.4,
                  }}
                />

                <motion.path
                  d="M375 260 C515 260 575 260 700 260"
                  fill="none"
                  stroke="url(#cgPathA)"
                  strokeWidth="1.3"
                  initial={{
                    pathLength: 0,
                    opacity: 0,
                  }}
                  whileInView={{
                    pathLength: 1,
                    opacity: 1,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 1.4,
                    delay: 0.15,
                  }}
                />

                <motion.path
                  d="M375 260 C475 355 545 405 650 433"
                  fill="none"
                  stroke="url(#cgPathA)"
                  strokeWidth="1.3"
                  initial={{
                    pathLength: 0,
                    opacity: 0,
                  }}
                  whileInView={{
                    pathLength: 1,
                    opacity: 1,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 1.4,
                    delay: 0.3,
                  }}
                />

                <motion.circle
                  r="5"
                  fill="#A98CFF"
                  animate={{
                    cx: [
                      375,
                      465,
                      555,
                      655,
                    ],
                    cy: [
                      260,
                      170,
                      118,
                      92,
                    ],
                  }}
                  transition={{
                    duration: 3.2,
                    repeat:
                      Infinity,
                    ease:
                      "linear",
                  }}
                />

                <motion.circle
                  r="4"
                  fill="#7FE1CF"
                  animate={{
                    cx: [
                      375,
                      495,
                      600,
                      700,
                    ],
                    cy: [
                      260,
                      260,
                      260,
                      260,
                    ],
                  }}
                  transition={{
                    duration: 3.7,
                    repeat:
                      Infinity,
                    ease:
                      "linear",
                    delay: 0.8,
                  }}
                />

                <motion.circle
                  r="4"
                  fill="#77ACFF"
                  animate={{
                    cx: [
                      375,
                      470,
                      555,
                      650,
                    ],
                    cy: [
                      260,
                      345,
                      402,
                      433,
                    ],
                  }}
                  transition={{
                    duration: 4,
                    repeat:
                      Infinity,
                    ease:
                      "linear",
                    delay: 1.4,
                  }}
                />
              </svg>

              <motion.div
                className="absolute left-[39%] top-[42%] -translate-x-1/2 -translate-y-1/2"
                animate={{
                  scale: [
                    0.96,
                    1.04,
                    0.96,
                  ],
                }}
                transition={{
                  duration: 3.2,
                  repeat:
                    Infinity,
                }}
              >
                <div className="relative flex h-[150px] w-[150px] items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#f27484]/[0.055] blur-xl" />

                  <div className="absolute inset-[28px] rotate-45 border border-[#f27484]/35" />

                  <div className="relative text-center">
                    <div className="text-[10px] uppercase tracking-[0.1em] text-[#f27484]">
                      root risk
                    </div>

                    <div className="mt-2 text-[13px] font-bold text-white/80">
                      insecure
                      <br />
                      transport
                    </div>
                  </div>
                </div>
              </motion.div>

              <FrameworkLabel
                className="right-[2%] top-[11%]"
                number="01"
                name="GDPR"
                detail="Article 32"
                color="#7FE1CF"
              />

              <FrameworkLabel
                className="right-0 top-[45%]"
                number="02"
                name="SOC 2"
                detail="CC6 / CC7"
                color="#77ACFF"
              />

              <FrameworkLabel
                className="bottom-[7%] right-[3%]"
                number="03"
                name="ISO 27001"
                detail="A.8"
                color="#A98CFF"
              />

              <div className="absolute left-[3%] top-[47%] text-right">
                <div className="text-[10px] text-[#77acff]">
                  users.ts:41
                </div>

                <code className="mt-2 block max-w-[160px] text-[11px] leading-5 text-white/25">
                  {'fetch("http://...")'}
                </code>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FrameworkLabel({
  className,
  number,
  name,
  detail,
  color,
}: {
  className: string;
  number: string;
  name: string;
  detail: string;
  color: string;
}) {
  return (
    <motion.div
      className={`absolute ${className}`}
      animate={{
        y: [
          0,
          -7,
          0,
        ],
      }}
      transition={{
        duration:
          5 +
          Number(
            number,
          ) *
            0.65,
        repeat:
          Infinity,
        ease:
          "easeInOut",
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="h-2 w-2 rounded-full"
          style={{
            background:
              color,
            boxShadow:
              `0 0 12px ${color}`,
          }}
        />

        <span className="text-[10px] text-white/25">
          {number}
        </span>
      </div>

      <div className="mt-3 text-[22px] font-bold tracking-[-0.045em] text-white">
        {name}
      </div>

      <div
        className="mt-2 text-[11px]"
        style={{
          color,
        }}
      >
        {detail}
      </div>
    </motion.div>
  );
}

function Pipeline() {
  return (
    <section
      id="pipeline"
      className="relative py-32 md:py-44"
    >
      <div className="cg-container">
        <div className="grid gap-20 lg:grid-cols-[0.44fr_0.56fr]">
          <Reveal>
            <div className="lg:sticky lg:top-32">
              <div className="cg-eyebrow">
                Execution pipeline
              </div>

              <h2 className="cg-heading mt-7 max-w-[560px] text-[42px] text-white md:text-[54px]">
                Nothing gets
                <br />

                <span className="text-white/27">
                  lost in between.
                </span>
              </h2>

              <p className="mt-7 max-w-[490px] text-[14px] leading-7 text-white/40">
                Every stage produces inspectable output that feeds the next stage.
              </p>
            </div>
          </Reveal>

          <div className="relative pl-12">
            <div className="cg-flow-rail" />

            {pipelineSteps.map(
              (
                [
                  title,
                  value,
                ],
                index,
              ) => (
                <Reveal
                  key={title}
                  delay={
                    index *
                    0.05
                  }
                >
                  <div className="relative min-h-[108px] pb-14">
                    <div className="absolute -left-[48px] top-[8px] h-[15px] w-[15px] rounded-full border border-[#a98cff]/45 bg-[#08070a]">
                      <div className="absolute inset-[4px] rounded-full bg-[#a98cff]" />
                    </div>

                    <div className="text-[10px] text-white/20">
                      0
                      {index + 1}
                    </div>

                    <div className="mt-2 grid gap-3 md:grid-cols-[180px_1fr] md:items-baseline">
                      <h3 className="text-[19px] font-bold tracking-[-0.04em] text-white/85">
                        {title}
                      </h3>

                      <code className="text-[12px] text-white/36">
                        {value}
                      </code>
                    </div>
                  </div>
                </Reveal>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
