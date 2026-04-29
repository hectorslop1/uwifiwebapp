"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Radio, Receipt, Router, ShieldCheck } from "lucide-react";

import { AnimatedThemeToggler } from "@/src/components/magic/animated-theme-toggler";
import { InteractiveHoverButton } from "@/src/components/magic/interactive-hover-button";
import { TextReveal } from "@/src/components/magic/text-reveal";
import { UwifiBrandTile } from "@/src/components/layout/uwifi-brand";

type FieldErrors = {
  email?: string;
  password?: string;
};

const featureCards = [
  {
    icon: Radio,
    title: "Service visibility",
    copy: "Connection health, gateway activity and account status in one calm interface.",
  },
  {
    icon: Router,
    title: "Gateway control",
    copy: "Review radios, Wi-Fi settings and devices without the clutter of legacy dashboards.",
  },
  {
    icon: Receipt,
    title: "Billing clarity",
    copy: "Payments, invoices and wallet balance presented like a modern SaaS product.",
  },
];

function validate(email: string, password: string) {
  const nextErrors: FieldErrors = {};

  if (!email.trim()) {
    nextErrors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    nextErrors.email = "Enter a valid email address.";
  }

  if (!password) {
    nextErrors.password = "Password is required.";
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
      setFormError("We could not sign you in right now. Please try again.");
      setIsSubmitting(false);
    }
  };

  const fieldClassName =
    "w-full rounded-[1.1rem] border border-white/80 bg-white/78 px-4 py-3 text-[0.95rem] text-ink outline-none shadow-[0_12px_28px_rgba(198,201,211,0.08),inset_0_1px_0_rgba(255,255,255,0.92)] transition-colors duration-200 placeholder:text-ink-faint focus:border-[#dcefdc] focus:bg-white";

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[linear-gradient(180deg,#fbfaf7_0%,#f5f4ef_100%)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-6rem] h-[24rem] w-[24rem] rounded-full bg-white/92 blur-3xl" />
        <div className="absolute right-[-9rem] top-[12%] h-[28rem] w-[28rem] rounded-full bg-[#ecf8ef] blur-3xl" />
        <div className="absolute bottom-[-12rem] left-[26%] h-[26rem] w-[32rem] rounded-full bg-[#f2eff9] blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[100dvh] max-w-[1560px] flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-3">
            <UwifiBrandTile className="h-[3.45rem] w-[3.45rem]" imageClassName="w-[2.45rem]" />
            <div className="hidden sm:block">
              <div className="text-[0.78rem] uppercase tracking-[0.18em] text-ink-faint">
                Connected service
              </div>
              <div className="text-[0.95rem] font-medium tracking-[-0.03em] text-ink-soft">
                Customer portal
              </div>
            </div>
          </div>

          <AnimatedThemeToggler />
        </div>

        <div className="flex flex-1 items-center py-6 lg:py-8">
          <div className="grid w-full items-center gap-6 lg:grid-cols-[minmax(0,1.08fr)_26rem] xl:grid-cols-[minmax(0,1.12fr)_27rem] xl:gap-8">
            <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.8),rgba(249,249,251,0.44))] px-6 py-7 shadow-[0_24px_54px_rgba(201,204,214,0.12),inset_0_1px_0_rgba(255,255,255,0.94)] backdrop-blur-xl sm:px-7 sm:py-8 lg:min-h-[35rem] lg:px-8 lg:py-9">
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-[8%] top-[10%] h-28 w-28 rounded-full bg-white/92 blur-3xl" />
                <div className="absolute right-[6%] top-[18%] h-[16rem] w-[16rem] rounded-full bg-[#eef8f0] blur-3xl" />
                <div className="absolute bottom-[-2rem] right-[16%] h-[12rem] w-[20rem] rounded-full bg-[#f0edf8] blur-3xl" />
              </div>

              <div className="relative flex h-full flex-col justify-between">
                <div className="max-w-[36rem]">
                  <div className="text-[0.72rem] uppercase tracking-[0.18em] text-ink-faint">
                    <TextReveal text="Welcome back" />
                  </div>
                  <h1 className="mt-3 max-w-[28rem] text-[2.45rem] font-medium tracking-[-0.075em] text-ink sm:text-[3rem] lg:text-[3.5rem]">
                    The calmer way to manage your U-WiFi account.
                  </h1>
                  <p className="mt-4 max-w-[30rem] text-[1rem] leading-7 text-ink-muted">
                    Access gateway controls, billing, wallet value and account settings in a cleaner experience built around clarity instead of dashboard noise.
                  </p>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {featureCards.map((card) => (
                    <div
                      key={card.title}
                      className="rounded-[1.35rem] border border-white/80 bg-white/58 px-4 py-4 shadow-[0_16px_34px_rgba(198,201,211,0.08),inset_0_1px_0_rgba(255,255,255,0.94)] backdrop-blur-xl"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-[#eef8ef] text-success shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                        <card.icon size={18} strokeWidth={1.8} />
                      </span>
                      <div className="mt-4 text-[1rem] font-medium tracking-[-0.04em] text-ink">
                        {card.title}
                      </div>
                      <p className="mt-2 text-[0.85rem] leading-6 text-ink-muted">
                        {card.copy}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,248,250,0.9))] px-5 py-6 shadow-[0_24px_56px_rgba(193,196,206,0.12),inset_0_1px_0_rgba(255,255,255,0.96)] backdrop-blur-xl sm:px-6 sm:py-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[0.72rem] uppercase tracking-[0.18em] text-ink-faint">
                    Account access
                  </div>
                  <div className="mt-2 text-[1.8rem] font-medium tracking-[-0.06em] text-ink">
                    Sign in
                  </div>
                  <p className="mt-2 max-w-[20rem] text-[0.92rem] leading-6 text-ink-muted">
                    Use your portal credentials to continue.
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
                  {errors.email ? (
                    <p className="text-[0.8rem] text-[#c45c4a]">{errors.email}</p>
                  ) : null}
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
                      className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
                        rememberMe ? "bg-success/85" : "bg-line-strong/65"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-[0_4px_10px_rgba(169,174,184,0.2)] transition-all duration-200 ${
                          rememberMe ? "left-[1.35rem]" : "left-0.5"
                        }`}
                      />
                    </button>
                    Keep me signed in
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

                <InteractiveHoverButton
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,247,244,0.9))] px-4 py-3 text-[0.95rem] font-medium text-ink shadow-[0_16px_34px_rgba(201,204,214,0.16)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Signing in..." : "Sign in to portal"}
                  <ArrowRight size={16} strokeWidth={1.9} />
                </InteractiveHoverButton>
              </form>

              <div className="mt-6 rounded-[1.3rem] border border-white/80 bg-white/55 px-4 py-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={16} strokeWidth={1.9} className="mt-0.5 shrink-0 text-success" />
                  <div>
                    <div className="text-[0.9rem] font-medium text-ink">Demo credentials loaded</div>
                    <p className="mt-1 text-[0.82rem] leading-6 text-ink-muted">
                      This preview signs into the redesigned portal flow and sends you to the new overview experience.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
