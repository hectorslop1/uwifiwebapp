"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { CreditCard, Plus, X } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { addPaymentMethodAction } from "./actions";

const fieldClassName =
  "theme-input w-full rounded-[1rem] border border-white/80 bg-white/78 px-4 py-3 text-[0.92rem] text-ink outline-none shadow-[0_12px_28px_rgba(198,201,211,0.08),inset_0_1px_0_rgba(255,255,255,0.92)] transition-colors duration-200 placeholder:text-ink-faint focus:border-[#81c784] focus:bg-white";

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  const groups = digits.match(/.{1,4}/g);
  return groups?.join(" ") ?? "";
}

function formatMaskedCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);

  if (!digits) {
    return "";
  }

  if (digits.length <= 4) {
    return formatCardNumber(digits);
  }

  const visibleDigits = digits.slice(-4);
  const maskedDigits = `${"*".repeat(digits.length - 4)}${visibleDigits}`;
  const groups = maskedDigits.match(/.{1,4}/g);

  return groups?.join(" ") ?? "";
}

function detectBrand(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("4")) return "VISA";
  if (/^5[1-5]/.test(digits)) return "MASTERCARD";
  if (/^3[47]/.test(digits)) return "AMEX";
  if (digits.startsWith("6011") || /^65/.test(digits)) return "DISCOVER";

  return "UWiFi Pay";
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="theme-cta inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3 text-body-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
    >
      {pending ? "Saving payment method..." : "Save payment method"}
    </button>
  );
}

export function PaymentMethodAddCardPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [isBackVisible, setIsBackVisible] = useState(false);

  const previewCardNumber = useMemo(() => {
    const formatted = formatMaskedCardNumber(cardNumber);
    return formatted || "0000 0000 0000 0000";
  }, [cardNumber]);
  const previewHolder = cardHolder.trim() || "CARD HOLDER";
  const previewExpiry = `${expMonth || "MM"}/${expYear || "YY"}`;
  const previewBrand = useMemo(() => detectBrand(cardNumber), [cardNumber]);

  return (
    <SurfaceWrapper>
      <AnimatePresence mode="wait" initial={false}>
        {isOpen ? (
          <motion.div
            key="open-panel"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-full"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-title-md text-ink">
                <Plus size={17} strokeWidth={1.8} />
                Add a payment method
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="theme-secondary-action inline-flex items-center rounded-full border px-3.5 py-2 text-[0.78rem] font-medium transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01]"
              >
                <span className="inline-flex items-center gap-2">
                  <X size={14} strokeWidth={1.8} />
                  Close
                </span>
              </button>
            </div>

            <p className="mt-3 max-w-[34rem] text-body-sm text-ink-muted">
              Add a new card with masked entry, instant preview, and a cleaner billing setup.
            </p>

            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(17rem,23rem)_minmax(0,1fr)] xl:items-start">
              <div className="space-y-4 xl:sticky xl:top-4">
                <motion.div
                  animate={{ rotateY: isBackVisible ? 180 : 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="relative mx-auto aspect-[1.6/1] w-full max-w-[24rem]"
                >
                  <CardFace
                    front
                    brand={previewBrand}
                    cardHolder={previewHolder}
                    cardNumber={previewCardNumber}
                    expiry={previewExpiry}
                  />
                  <CardFaceBack cvv={cvv || "•••"} />
                </motion.div>
              </div>

              <form
                action={addPaymentMethodAction}
                className="theme-inline-surface rounded-[1.4rem] border border-white/85 bg-white/68 p-4 shadow-[0_18px_38px_rgba(202,206,217,0.1),inset_0_1px_0_rgba(255,255,255,0.92)] sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-body-md font-medium text-ink">Card details</div>
                    <div className="mt-1 text-body-sm text-ink-muted">
                      Enter the information exactly as it appears on the card.
                    </div>
                  </div>
                  <span className="rounded-full border border-white/85 bg-white/72 px-3 py-1.5 text-[0.76rem] font-semibold tracking-[0.14em] text-ink-soft shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    {previewBrand}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5 md:col-span-2">
                    <label htmlFor="cardHolder" className="text-[0.78rem] font-medium text-ink-soft">
                      Cardholder
                    </label>
                    <input
                      id="cardHolder"
                      name="cardHolder"
                      type="text"
                      placeholder="Name on card"
                      className={fieldClassName}
                      value={cardHolder}
                      onChange={(event) => {
                        setCardHolder(event.target.value);
                        setIsBackVisible(false);
                      }}
                      onFocus={() => setIsBackVisible(false)}
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label htmlFor="cardNumber" className="text-[0.78rem] font-medium text-ink-soft">
                      Card number
                    </label>
                    <div className="relative">
                      <input
                        id="cardNumber"
                        name="cardNumber"
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        className={`${fieldClassName} text-transparent caret-ink placeholder:text-transparent`}
                        value={formatCardNumber(cardNumber)}
                        onChange={(event) => {
                          setCardNumber(event.target.value.replace(/\D/g, "").slice(0, 16));
                          setIsBackVisible(false);
                        }}
                        onFocus={() => setIsBackVisible(false)}
                      />
                      <div
                        aria-hidden="true"
                        className={`pointer-events-none absolute inset-0 flex items-center px-4 text-[0.92rem] ${
                          cardNumber ? "text-ink" : "text-ink-faint"
                        }`}
                      >
                        {cardNumber
                          ? formatMaskedCardNumber(cardNumber)
                          : "4111 1111 1111 1111"}
                      </div>
                    </div>
                    <div className="text-[0.76rem] text-ink-faint">
                      Only the last 4 digits stay visible while you type.
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="expMonth" className="text-[0.78rem] font-medium text-ink-soft">
                      Month
                    </label>
                    <input
                      id="expMonth"
                      name="expMonth"
                      type="text"
                      inputMode="numeric"
                      placeholder="04"
                      className={fieldClassName}
                      value={expMonth}
                      onChange={(event) => {
                        setExpMonth(event.target.value.replace(/\D/g, "").slice(0, 2));
                        setIsBackVisible(false);
                      }}
                      onFocus={() => setIsBackVisible(false)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="expYear" className="text-[0.78rem] font-medium text-ink-soft">
                      Year
                    </label>
                    <input
                      id="expYear"
                      name="expYear"
                      type="text"
                      inputMode="numeric"
                      placeholder="28"
                      className={fieldClassName}
                      value={expYear}
                      onChange={(event) => {
                        setExpYear(event.target.value.replace(/\D/g, "").slice(0, 2));
                        setIsBackVisible(false);
                      }}
                      onFocus={() => setIsBackVisible(false)}
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label htmlFor="cvv" className="text-[0.78rem] font-medium text-ink-soft">
                      Security code
                    </label>
                    <input
                      id="cvv"
                      name="cvv"
                      type="password"
                      inputMode="numeric"
                      placeholder="123"
                      className={fieldClassName}
                      value={cvv}
                      onChange={(event) => {
                        setCvv(event.target.value.replace(/\D/g, "").slice(0, 4));
                        setIsBackVisible(true);
                      }}
                      onFocus={() => setIsBackVisible(true)}
                    />
                  </div>
                </div>

                <div className="theme-soft-well mt-4 grid gap-2.5 rounded-[1.15rem] border px-4 py-3 sm:grid-cols-3">
                  <div>
                    <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">
                      Holder
                    </div>
                    <div className="mt-1 text-body-sm font-medium text-ink-soft">
                      {previewHolder}
                    </div>
                  </div>
                  <div>
                    <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">
                      Expires
                    </div>
                    <div className="mt-1 text-body-sm font-medium text-ink-soft">
                      {previewExpiry}
                    </div>
                  </div>
                  <div>
                    <div className="text-[0.74rem] uppercase tracking-[0.14em] text-ink-faint">
                      Brand
                    </div>
                    <div className="mt-1 text-body-sm font-medium text-ink-soft">
                      {previewBrand}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col-reverse gap-3 border-t border-line/25 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-[22rem] text-[0.8rem] leading-5 text-ink-muted">
                    Your card stays available for future billing cycles and faster checkout.
                  </div>
                  <SubmitButton />
                </div>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="closed-panel"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3 text-title-md text-ink">
              <CreditCard size={17} strokeWidth={1.8} />
              Add payment method
            </div>
            <p className="mt-3 max-w-[36rem] text-body-sm text-ink-muted">
              Save another card for billing and future purchases with a cleaner entry flow.
            </p>

            <div className="mt-5">
              <div className="theme-soft-well rounded-[1.35rem] border px-4 py-4">
                <div className="text-body-md font-medium text-ink">Add a new card</div>
                <div className="mt-2 text-body-sm text-ink-muted">
                  Add a payment method you can use for upcoming billing.
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="theme-cta mt-4 inline-flex w-full items-center justify-center rounded-full border px-4 py-3 text-body-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01]"
                >
                  Add payment method
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SurfaceWrapper>
  );
}

function SurfaceWrapper({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="theme-panel-subtle w-full rounded-[1.5rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,248,250,0.84))] p-4 shadow-[0_20px_42px_rgba(203,207,216,0.1),inset_0_1px_0_rgba(255,255,255,0.94)] sm:p-5">
      {children}
    </div>
  );
}

function CardFace({
  brand,
  cardHolder,
  cardNumber,
  expiry,
  front,
}: Readonly<{
  brand: string;
  cardHolder: string;
  cardNumber: string;
  expiry: string;
  front: boolean;
}>) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[1.7rem] border border-white/20 shadow-[0_28px_62px_rgba(22,24,31,0.28)]"
      style={{
        backfaceVisibility: "hidden",
        transform: front ? "rotateY(0deg)" : "rotateY(180deg)",
      }}
    >
      <Image
        src="/images/billing/credit-card-ui.png"
        alt="UWiFi card background"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,16,28,0.18),rgba(11,14,44,0.28),rgba(41,12,80,0.2))]" />
      <div className="relative flex h-full flex-col justify-between p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[0.72rem] uppercase tracking-[0.22em] text-white/72">
              UWiFi billing
            </div>
            <div className="mt-2 text-[1rem] font-medium tracking-[-0.04em]">
              Payment card
            </div>
          </div>
          <div className="rounded-full border border-white/18 bg-white/12 px-3 py-1.5 text-[0.72rem] font-medium tracking-[0.16em] text-white/88 backdrop-blur-md">
            {brand}
          </div>
        </div>

        <div>
          <div className="text-[1.45rem] font-medium tracking-[0.24em] text-white drop-shadow-[0_10px_18px_rgba(0,0,0,0.16)] sm:text-[1.65rem]">
            {cardNumber}
          </div>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <div className="text-[0.62rem] uppercase tracking-[0.2em] text-white/72">
                Card holder
              </div>
              <div className="mt-1.5 text-[0.92rem] font-medium tracking-[0.08em] text-white/96">
                {cardHolder.toUpperCase()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[0.62rem] uppercase tracking-[0.2em] text-white/72">
                Expires
              </div>
              <div className="mt-1.5 text-[0.92rem] font-medium tracking-[0.08em] text-white/96">
                {expiry}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardFaceBack({ cvv }: Readonly<{ cvv: string }>) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[1.7rem] border border-white/20 shadow-[0_28px_62px_rgba(22,24,31,0.28)]"
      style={{
        backfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
      }}
    >
      <Image
        src="/images/billing/credit-card-ui.png"
        alt="UWiFi card background back"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,16,28,0.3),rgba(11,14,44,0.42),rgba(41,12,80,0.24))]" />
      <div className="relative flex h-full flex-col p-5 text-white">
        <div className="mt-5 h-11 rounded-full bg-[linear-gradient(180deg,rgba(9,12,20,0.78),rgba(27,30,41,0.9))]" />
        <div className="mt-7 ml-auto w-[72%] rounded-[1rem] border border-white/28 bg-white/88 px-4 py-3 text-right text-[1rem] font-medium tracking-[0.22em] text-[#1a2130] shadow-[inset_0_1px_0_rgba(255,255,255,0.96)]">
          {cvv}
        </div>
        <div className="mt-auto max-w-[78%] text-[0.72rem] leading-5 text-white/70">
          Your security code appears here only while you are entering it.
        </div>
      </div>
    </div>
  );
}
