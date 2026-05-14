"use client";

import { useSearchParams } from "next/navigation";
import { useActionState, useMemo, useState } from "react";
import { Eye, EyeOff, Radio, Receipt, Router, ShieldCheck } from "lucide-react";

import DotGrid from "@/src/components/login/dot-grid";
import Grainient from "@/src/components/login/grainient";
import { UwifiBrandTile } from "@/src/components/layout/uwifi-brand";
import { AuroraText } from "@/src/components/ui/aurora-text";
import { InteractiveHoverButton } from "@/src/components/ui/interactive-hover-button";
import { ShineBorder } from "@/src/components/ui/shine-border";

import { loginAction, type LoginActionState } from "./actions";

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
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [passwordResetMessage, setPasswordResetMessage] = useState("");
  const initialActionState = useMemo<LoginActionState>(() => null, []);
  const [actionState, formAction, isSubmitting] = useActionState(
    loginAction,
    initialActionState,
  );
  const activeFormError = actionState?.message || formError;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    setFormError("");
    setPasswordResetMessage("");

    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault();
      return;
    }
  };

  const handlePasswordReset = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrors((current) => ({
        ...current,
        email: "Enter your email first so we know where to send the reset link.",
      }));
      setPasswordResetMessage("");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrors((current) => ({
        ...current,
        email: "Enter a valid email address before requesting a reset.",
      }));
      setPasswordResetMessage("");
      return;
    }

    setErrors((current) => ({ ...current, email: undefined }));
    setFormError("");
    setPasswordResetMessage("");
    setIsResettingPassword(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(
          payload.message ||
            "We couldn't send the reset instructions right now.",
        );
      }

      setPasswordResetMessage(
        payload.message ||
          "If the account exists, we'll email password reset instructions.",
      );
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "We couldn't send the reset instructions right now.",
      );
    } finally {
      setIsResettingPassword(false);
    }
  };

  const fieldClassName =
    "theme-input w-full rounded-[1.15rem] border border-white/80 bg-white/78 px-4 py-3.5 text-[0.95rem] text-ink outline-none shadow-[0_12px_28px_rgba(198,201,211,0.08),inset_0_1px_0_rgba(255,255,255,0.92)] transition-colors duration-200 placeholder:text-ink-faint";

  return (
    <div className="theme-shell relative min-h-dvh w-full overflow-x-hidden overflow-y-auto bg-[linear-gradient(180deg,#fbfaf7_0%,#f3f3ee_100%)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10rem] top-[-8rem] h-[26rem] w-[26rem] rounded-full bg-white/92 blur-3xl" />
        <div className="absolute left-[36%] top-[18%] h-[22rem] w-[22rem] rounded-full bg-[#edf7ef] blur-3xl" />
        <div className="absolute bottom-[-12rem] left-[10%] h-[26rem] w-[30rem] rounded-full bg-[#ede8ff] blur-3xl" />
      </div>

      <div className="grid min-h-dvh w-full lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        <section className="relative flex min-h-0 items-stretch bg-[linear-gradient(180deg,rgba(255,255,255,0.48),rgba(249,248,245,0.78))]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-[10%] top-[8%] h-32 w-32 rounded-full bg-white/90 blur-3xl" />
            <div className="absolute right-[8%] top-[18%] h-[18rem] w-[18rem] rounded-full bg-[#edf7ef] blur-3xl" />
            <div className="absolute bottom-[-3rem] left-[28%] h-[14rem] w-[20rem] rounded-full bg-[#ece7ff] blur-3xl" />
          </div>

          <div className="absolute left-6 top-5 z-30 inline-flex items-center gap-3 sm:left-8 lg:left-10 xl:left-14">
            <UwifiBrandTile className="h-[3.3rem] w-[3.3rem] rounded-[1.2rem]" imageClassName="h-[2.35rem] w-auto" />
            <div className="hidden sm:block">
              <div className="text-[0.78rem] uppercase tracking-[0.18em] text-ink-faint">
                Connected service
              </div>
              <div className="text-[0.95rem] font-medium tracking-[-0.03em] text-ink-soft">
                U-wifi customer portal
              </div>
            </div>
          </div>

          <div className="relative flex w-full items-start px-6 pt-20 pb-[clamp(28px,6vh,72px)] sm:px-8 sm:pt-24 lg:items-center lg:px-10 lg:pt-28 xl:px-14 xl:pt-32">
            <div className="grid w-full gap-8 lg:gap-10">
              <div className="grid gap-4">
                
                <h1 className="text-[clamp(2.35rem,5.2vw,3.85rem)] font-medium leading-[1.08] tracking-[-0.075em] text-ink xl:text-[4.1rem]">
                  Manage your <AuroraText>U-wifi service</AuroraText> with clarity.
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

                <form action={formAction} onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <input type="hidden" name="next" value={searchParams.get("next") ?? ""} />
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-[0.8rem] font-medium text-ink-soft">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
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
                      <button
                        type="button"
                        onClick={handlePasswordReset}
                        disabled={isResettingPassword}
                        className="text-[0.8rem] text-ink-muted transition-colors duration-200 hover:text-ink"
                      >
                        {isResettingPassword ? "Sending link..." : "Forgot password?"}
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        id="password"
                        name="password"
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

                  <div className="flex items-center justify-between gap-4 pt-2">
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
                      <input
                        type="hidden"
                        name="rememberMe"
                        value={rememberMe ? "true" : "false"}
                      />
                      Remember this device
                    </label>

                    <div className="hidden items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 text-[0.76rem] text-ink-muted sm:flex">
                      <ShieldCheck size={14} strokeWidth={1.8} className="text-success" />
                      Encrypted session
                    </div>
                  </div>

                  {activeFormError ? (
                    <div className="rounded-[1rem] border border-[#f2d8d4] bg-[#fff7f5] px-4 py-3 text-[0.84rem] text-[#b05749]">
                      {activeFormError}
                    </div>
                  ) : null}

                  {passwordResetMessage ? (
                    <div className="rounded-[1rem] border border-[#d7ebd8] bg-[#f5fff5] px-4 py-3 text-[0.84rem] text-[#2f7c39]">
                      {passwordResetMessage}
                    </div>
                  ) : null}

                  <InteractiveHoverButton type="submit" disabled={isSubmitting} className="mt-4">
                    {isSubmitting ? "Signing in..." : "Sign in to portal"}
                  </InteractiveHoverButton>
                </form>
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

          <div className="relative z-10 flex flex-col justify-end px-6 pt-20 pb-[clamp(28px,6vh,80px)] [@media(max-height:760px)]:justify-start sm:px-8 sm:pt-24 lg:px-10 lg:pt-28 xl:px-14 xl:pt-32">
            

            <div className="mt-auto grid gap-6">
              <div className="grid gap-4">
                
                <h2 className="text-[clamp(2.15rem,4.8vw,3.3rem)] font-medium leading-[0.98] tracking-[-0.08em] text-white">
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
