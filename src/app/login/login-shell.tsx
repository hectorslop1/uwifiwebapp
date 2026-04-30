"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, Radio, Receipt, Router, ShieldCheck } from "lucide-react";

import DotGrid from "@/src/components/login/dot-grid";
import Grainient from "@/src/components/login/grainient";
import { UwifiBrandTile } from "@/src/components/layout/uwifi-brand";
import { AnimatedThemeToggler } from "@/src/components/magic/animated-theme-toggler";
import { TextReveal } from "@/src/components/magic/text-reveal";
import { AuroraText } from "@/src/components/ui/aurora-text";
import { InteractiveHoverButton } from "@/src/components/ui/interactive-hover-button";
import { ShineBorder } from "@/src/components/ui/shine-border";

type FieldErrors = {
  email?: string;
  password?: string;
};

const featureCards = [
  {
    icon: Radio,
    title: "Check your connection",
    copy: "See service status and spot issues before they interrupt your day.",
  },
  {
    icon: Router,
    title: "Manage your Wi-Fi",
    copy: "Update your network, review connected devices and keep your home online.",
  },
  {
    icon: Receipt,
    title: "Review bills and payments",
    copy: "Check invoices, recent payments and account details in one simple place.",
  },
];

function validate(email: string, password: string) {
  const nextErrors: FieldErrors = {};

  if (!email.trim()) {
    nextErrors.email = "Please enter your email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    nextErrors.email = "Enter a valid email address.";
  }

  if (!password) {
    nextErrors.password = "Please enter your password.";
  } else if (password.length < 6) {
    nextErrors.password = "Use at least 6 characters.";
  }

  return nextErrors;
}

export function LoginShell() {
  const router = useRouter();
  const [email, setEmail] = useState("luc.nguyen@uwifi.com");
  const [password, setPassword] = useState("password");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    setFormError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 700));

      if (!rememberMe) {
        window.localStorage.removeItem("uwifi-theme");
      }

      router.push("/overview");
    } catch {
      setFormError("We couldn't sign you in right now. Please try again in a moment.");
      setIsSubmitting(false);
    }
  };

  const fieldClassName =
    "theme-input w-full rounded-[1.15rem] border border-white/80 bg-white/78 px-4 py-3.5 text-[0.95rem] text-ink outline-none shadow-[0_12px_28px_rgba(198,201,211,0.08),inset_0_1px_0_rgba(255,255,255,0.92)] transition-colors duration-200 placeholder:text-ink-faint focus:border-[#81c784] focus:bg-white";

  return (
    <div className="theme-shell relative h-[100dvh] w-screen overflow-hidden bg-[linear-gradient(180deg,#fbfaf7_0%,#f3f3ee_100%)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10rem] top-[-8rem] h-[26rem] w-[26rem] rounded-full bg-white/92 blur-3xl" />
        <div className="absolute left-[36%] top-[18%] h-[22rem] w-[22rem] rounded-full bg-[#edf7ef] blur-3xl" />
        <div className="absolute bottom-[-12rem] left-[10%] h-[26rem] w-[30rem] rounded-full bg-[#ede8ff] blur-3xl" />
      </div>

      <div className="absolute right-6 top-5 z-40 sm:right-8 lg:right-10">
        <AnimatedThemeToggler />
      </div>

      <div className="grid h-full w-full lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        <section className="relative flex min-h-0 items-stretch bg-[linear-gradient(180deg,rgba(255,255,255,0.48),rgba(249,248,245,0.78))]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-[10%] top-[8%] h-32 w-32 rounded-full bg-white/90 blur-3xl" />
            <div className="absolute right-[8%] top-[18%] h-[18rem] w-[18rem] rounded-full bg-[#edf7ef] blur-3xl" />
            <div className="absolute bottom-[-3rem] left-[28%] h-[14rem] w-[20rem] rounded-full bg-[#ece7ff] blur-3xl" />
          </div>

          <div className="absolute left-6 top-5 z-30 inline-flex items-center gap-3 sm:left-8 lg:left-10 xl:left-14">
            <UwifiBrandTile className="h-[3.3rem] w-[3.3rem] rounded-[1.2rem]" imageClassName="w-[2.35rem]" />
            <div className="hidden sm:block">
              <div className="text-[0.78rem] uppercase tracking-[0.18em] text-ink-faint">
                Connected service
              </div>
              <div className="text-[0.95rem] font-medium tracking-[-0.03em] text-ink-soft">
                U-WiFi customer portal
              </div>
            </div>
          </div>

          <div className="relative flex w-full items-center px-6 pb-6 pt-24 sm:px-8 sm:pb-8 sm:pt-28 lg:px-10 lg:pb-10 lg:pt-32 xl:px-14">
            <div className="grid w-full gap-8 lg:gap-10">
              <div className="grid gap-4">
                <div className="text-[0.72rem] uppercase tracking-[0.18em] text-ink-faint">
                  <TextReveal text="Your internet account, in one place" />
                </div>
                <h1 className="text-[2.8rem] font-medium leading-[1.04] tracking-[-0.095em] text-ink sm:text-[3.4rem] lg:text-[4.05rem] xl:text-[4.4rem]">
                  Manage your <AuroraText>U-WiFi service</AuroraText> with clarity.
                </h1>
                <p className="w-full text-[1rem] leading-7 text-ink-muted sm:text-[1.02rem] lg:w-[88%] xl:w-[76%]">
                  Review your Wi-Fi, connected devices, bills and account details, all from here!
                </p>
              </div>

              <section className="theme-panel-subtle relative w-full overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,248,250,0.84))] px-5 py-5 shadow-[0_24px_52px_rgba(193,196,206,0.12),inset_0_1px_0_rgba(255,255,255,0.96)] backdrop-blur-xl sm:px-6 sm:py-6 lg:w-[92%] xl:w-[84%]">
                <ShineBorder
                  borderWidth={1.35}
                  duration={7.4}
                  shineColor={["#f5f8f5", "#81c784", "#b39ddb"]}
                />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[0.72rem] uppercase tracking-[0.18em] text-ink-faint">
                      Customer access
                    </div>
                    <div className="mt-2 text-[1.85rem] font-medium tracking-[-0.07em] text-ink">Sign in</div>
                    <p className="mt-2 text-[0.92rem] leading-6 text-ink-muted">
                      Enter your details to manage your internet service.
                    </p>
                  </div>

                  <div className="rounded-full bg-success-soft px-3 py-1.5 text-[0.74rem] font-medium tracking-[-0.02em] text-success">
                    Secure
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-[0.8rem] font-medium text-ink-soft">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@company.com"
                      className={fieldClassName}
                      autoComplete="email"
                    />
                    {errors.email ? <p className="text-[0.8rem] text-[#c45c4a]">{errors.email}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <label htmlFor="password" className="text-[0.8rem] font-medium text-ink-soft">
                        Password
                      </label>
                      <Link
                        href="#"
                        className="text-[0.8rem] text-ink-muted transition-colors duration-200 hover:text-ink"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your password"
                        className={`${fieldClassName} pr-12`}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted transition-colors duration-200 hover:bg-white/80 hover:text-ink"
                      >
                        {showPassword ? (
                          <EyeOff size={17} strokeWidth={1.8} />
                        ) : (
                          <Eye size={17} strokeWidth={1.8} />
                        )}
                      </button>
                    </div>
                    {errors.password ? (
                      <p className="text-[0.8rem] text-[#c45c4a]">{errors.password}</p>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-1">
                    <label className="inline-flex items-center gap-3 text-[0.88rem] text-ink-muted">
                      <button
                        type="button"
                        onClick={() => setRememberMe((current) => !current)}
                        aria-pressed={rememberMe}
                        className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
                          rememberMe ? "bg-[#4caf50]" : "bg-line-strong/65"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-[0_4px_10px_rgba(169,174,184,0.2)] transition-all duration-200 ${
                            rememberMe ? "left-[1.35rem]" : "left-0.5"
                          }`}
                        />
                      </button>
                      Remember this device
                    </label>

                    <div className="hidden items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 text-[0.76rem] text-ink-muted sm:flex">
                      <ShieldCheck size={14} strokeWidth={1.8} className="text-success" />
                      Encrypted session
                    </div>
                  </div>

                  {formError ? (
                    <div className="rounded-[1rem] border border-[#f2d8d4] bg-[#fff7f5] px-4 py-3 text-[0.84rem] text-[#b05749]">
                      {formError}
                    </div>
                  ) : null}

                  <InteractiveHoverButton type="submit" disabled={isSubmitting} className="mt-2">
                    {isSubmitting ? "Signing in..." : "Sign in to portal"}
                  </InteractiveHoverButton>
                </form>

                <div className="theme-inline-surface mt-6 rounded-[1.3rem] border border-white/80 bg-white/55 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} strokeWidth={1.9} className="mt-0.5 shrink-0 text-success" />
                    <div>
                      <div className="text-[0.9rem] font-medium text-ink">Demo access ready</div>
                      <p className="mt-1 text-[0.82rem] leading-6 text-ink-muted">
                        This preview takes you into the customer portal so you can review the updated
                        experience.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>

        <section className="relative min-h-0 overflow-hidden border-t border-white/10 lg:border-l lg:border-t-0">
          <div className="absolute inset-0 bg-[#08110d]" />
          <Grainient
            className="absolute inset-0"
            color1="#81c784"
            color2="#7e57c2"
            color3="#08110d"
            timeSpeed={0.38}
            colorBalance={-0.12}
            warpStrength={1.14}
            warpFrequency={3.1}
            warpSpeed={1.78}
            warpAmplitude={44}
            blendAngle={-18}
            blendSoftness={0.14}
            rotationAmount={280}
            noiseScale={1.55}
            grainAmount={0.07}
            grainScale={1.3}
            saturation={1.02}
            contrast={1.24}
            centerX={0.03}
            centerY={0}
            zoom={0.96}
          />
          <DotGrid
            className="absolute inset-0 opacity-85"
            dotSize={8}
            gap={18}
            baseColor="#7e57c2"
            activeColor="#81c784"
            proximity={168}
            shockRadius={190}
            shockStrength={7.5}
            resistance={0.84}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,17,13,0.06)_0%,rgba(20,15,37,0.22)_40%,rgba(11,10,24,0.72)_100%)]" />
          <div className="absolute inset-y-0 left-0 w-24 bg-[linear-gradient(90deg,rgba(11,10,24,0.26),transparent)] lg:w-32" />

          <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-6 pt-24 sm:px-8 sm:pb-8 sm:pt-28 lg:px-10 lg:pb-10 lg:pt-32 xl:px-14">
            

            <div className="mt-auto grid gap-6">
              <div className="grid gap-4">
                
                <h2 className="text-[2.6rem] font-medium leading-[0.98] tracking-[-0.08em] text-white sm:text-[3rem] lg:text-[3.6rem]">
                  Operate smarter. Stay connected.
                </h2>
              
              </div>

              <div className="grid gap-3 lg:w-[85%]">
                {featureCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-[1.4rem] border border-white/12 bg-white/10 px-4 py-4 shadow-[0_18px_36px_rgba(0,0,0,0.18)] backdrop-blur-md"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                        <card.icon size={18} strokeWidth={1.8} />
                      </span>
                      <div>
                        <div className="text-[0.96rem] font-medium tracking-[-0.04em] text-white">
                          {card.title}
                        </div>
                        <p className="mt-1 text-[0.82rem] leading-6 text-white/66">{card.copy}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
