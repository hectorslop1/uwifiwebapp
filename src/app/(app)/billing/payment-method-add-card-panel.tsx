"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
      className="theme-primary-action mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3 text-body-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
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
    const formatted = formatCardNumber(cardNumber);
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
                className="theme-control-button inline-flex items-center rounded-full border px-3.5 py-2 text-[0.78rem] font-medium text-ink-soft transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01]"
              >
                <span className="inline-flex items-center gap-2">
                  <X size={14} strokeWidth={1.8} />
                  Close
                </span>
              </button>
            </div>

            <p className="mt-3 max-w-[34rem] text-body-sm text-ink-muted">
              Add a new card with a live preview before saving it to your account.
            </p>

            <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(21rem,25rem)] lg:items-start">
              <div className="space-y-4">
                <motion.div
                  animate={{ rotateY: isBackVisible ? 180 : 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="relative mx-auto aspect-[1.6/1] w-full max-w-[32rem]"
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

                <div className="theme-inline-surface rounded-[1.2rem] border border-white/80 bg-white/55 px-4 py-4 text-body-sm text-ink-muted">
                  The preview updates as you type and flips automatically when you enter the security code.
                </div>
              </div>

              <form
                action={addPaymentMethodAction}
                className="theme-inline-surface space-y-4 rounded-[1.45rem] border border-white/85 bg-white/62 p-4 shadow-[0_20px_42px_rgba(202,206,217,0.12),inset_0_1px_0_rgba(255,255,255,0.92)]"
              >
                <div>
                  <div className="text-body-md font-medium text-ink">Card details</div>
                  <div className="mt-1 text-body-sm text-ink-muted">
                    Enter the information exactly as it appears on the card.
                  </div>
                </div>

                <div className="space-y-1.5">
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

                <div className="space-y-1.5">
                  <label htmlFor="cardNumber" className="text-[0.78rem] font-medium text-ink-soft">
                    Card number
                  </label>
                  <input
                    id="cardNumber"
                    name="cardNumber"
                    type="text"
                    inputMode="numeric"
                    placeholder="4111 1111 1111 1111"
                    className={fieldClassName}
                    value={formatCardNumber(cardNumber)}
                    onChange={(event) => {
                      setCardNumber(event.target.value.replace(/\D/g, "").slice(0, 16));
                      setIsBackVisible(false);
                    }}
                    onFocus={() => setIsBackVisible(false)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="expMonth" className="text-[0.78rem] font-medium text-ink-soft">
                      MM
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
                      YY
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

                  <div className="space-y-1.5">
                    <label htmlFor="cvv" className="text-[0.78rem] font-medium text-ink-soft">
                      CVV
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

                <SubmitButton />

                <div className="rounded-[1.1rem] border border-dashed border-[#d6dfd8] bg-[#f8fbf8] px-4 py-3 text-body-sm text-ink-muted">
                  Your card is saved for future billing and checkout payments.
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
              Save another card for billing and future purchases whenever you need one.
            </p>
            <div className="theme-inline-surface mt-5 rounded-[1.25rem] border border-white/80 bg-white/55 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
              <div className="text-body-md font-medium text-ink">Card preview</div>
              <div className="mt-2 text-body-sm text-ink-muted">
                Open the form to preview the card details while you type before saving them.
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="theme-control-button mt-4 inline-flex rounded-full border px-4 py-2.5 text-body-sm font-medium text-ink-soft transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01]"
              >
                Add payment method
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SurfaceWrapper>
  );
}

function SurfaceWrapper({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="theme-panel-subtle w-full rounded-[1.6rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,248,250,0.82))] p-4 shadow-[0_22px_48px_rgba(203,207,216,0.12),inset_0_1px_0_rgba(255,255,255,0.94)] sm:p-5">
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
