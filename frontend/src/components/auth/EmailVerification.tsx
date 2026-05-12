import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button, InputOTP, Label, Link, REGEXP_ONLY_DIGITS } from "@heroui/react";
import { Check } from "lucide-react";
import { showError, showSuccess } from "@/toast";
import { API_BASE } from "@/lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmailFormatValid = (value: string) => EMAIL_RE.test(value.trim());

const maskEmail = (email: string) => {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const head = local.slice(0, 1);
  return `${head}${"*".repeat(Math.max(local.length - 1, 1))}@${domain}`;
};

export interface EmailVerificationHandles {
  sendButton: ReactNode;
  otpBlock: ReactNode;
}

export function useEmailVerification(
  email: string,
  onTokenChange: (token: string | null) => void
): EmailVerificationHandles {
  const [code, setCode] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const verifiedFor = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  onTokenChangeRef.current = onTokenChange;

  const normalized = email.trim().toLowerCase();
  const validFormat = isEmailFormatValid(normalized);
  const verified = token !== null && verifiedFor.current === normalized;
  const codeWasSent = sentTo === normalized;

  useEffect(() => {
    if (verifiedFor.current && verifiedFor.current !== normalized) {
      verifiedFor.current = null;
      setToken(null);
      setCode("");
      onTokenChangeRef.current(null);
    }
    if (sentTo && sentTo !== normalized) {
      setSentTo(null);
      setCode("");
    }
  }, [normalized, sentTo]);

  const requestCode = async () => {
    if (!validFormat || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/auth/email/request-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      setSentTo(normalized);
      setCode("");
      showSuccess(`Code sent to ${normalized}`);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async (value: string) => {
    if (value.length !== 6 || !validFormat) return;
    setVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/auth/email/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized, code: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      verifiedFor.current = normalized;
      setToken(data.token);
      onTokenChangeRef.current(data.token);
      showSuccess("Email verified");
    } catch (err: any) {
      showError(err.message);
      setCode("");
    } finally {
      setVerifying(false);
    }
  };

  const sendButton =
    !validFormat || codeWasSent || verified ? null : (
      <Button
        type="button"
        onPress={requestCode}
        isDisabled={sending}
        className="shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium px-4"
      >
        {sending ? "Sending…" : "Send code"}
      </Button>
    );

  let otpBlock: ReactNode = null;
  if (validFormat && verified) {
    otpBlock = (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
        <Check className="h-4 w-4" />
        <span>Email verified</span>
      </div>
    );
  } else if (validFormat && codeWasSent) {
    otpBlock = (
      <div className="flex w-[280px] flex-col gap-2">
        <div className="flex flex-col gap-1">
          <Label>Verify account</Label>
          <p className="text-sm text-muted">
            We've sent a code to {maskEmail(normalized)}
          </p>
        </div>
        <InputOTP
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
          value={code}
          onChange={(value: string) => {
            setCode(value);
            if (value.length === 6) verifyCode(value);
          }}
          isDisabled={verifying}
        >
          <InputOTP.Group>
            <InputOTP.Slot index={0} />
            <InputOTP.Slot index={1} />
            <InputOTP.Slot index={2} />
          </InputOTP.Group>
          <InputOTP.Separator />
          <InputOTP.Group>
            <InputOTP.Slot index={3} />
            <InputOTP.Slot index={4} />
            <InputOTP.Slot index={5} />
          </InputOTP.Group>
        </InputOTP>
        <div className="flex items-center gap-[5px] px-1 pt-1">
          <p className="text-sm text-muted">Didn't receive a code?</p>
          <Link
            className="text-foreground underline"
            onPress={() => {
              if (!sending) requestCode();
            }}
          >
            {sending ? "Sending…" : "Resend"}
          </Link>
        </div>
      </div>
    );
  }

  return { sendButton, otpBlock };
}
