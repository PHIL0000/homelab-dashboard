import { useEffect, useRef, useState } from "react";
import { InputOTP, Label, Link, REGEXP_ONLY_DIGITS } from "@heroui/react";
import { Check } from "lucide-react";
import { showError, showSuccess } from "@/toast";
import { API_BASE } from "@/lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmailFormatValid = (value: string) => EMAIL_RE.test(value.trim());

interface EmailVerificationProps {
  email: string;
  onTokenChange: (token: string | null) => void;
}

const maskEmail = (email: string) => {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const head = local.slice(0, 1);
  return `${head}${"*".repeat(Math.max(local.length - 1, 1))}@${domain}`;
};

export default function EmailVerification({
  email,
  onTokenChange,
}: EmailVerificationProps) {
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
  const requestedFor = useRef<string | null>(null);

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
    if (!validFormat) return;
    requestedFor.current = normalized;
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
      requestedFor.current = null;
      showError(err.message);
    } finally {
      setSending(false);
    }
  };

  // Auto-send the code once the email looks valid and stable for a moment.
  // Debounced so we don't spam the backend while the user is still typing.
  useEffect(() => {
    if (!validFormat) return;
    if (verified) return;
    if (sending) return;
    if (requestedFor.current === normalized) return;
    const timer = setTimeout(() => {
      requestCode();
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalized, validFormat, verified]);

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
      onTokenChange(data.token);
      showSuccess("Email verified");
    } catch (err: any) {
      showError(err.message);
      setCode("");
    } finally {
      setVerifying(false);
    }
  };

  if (!validFormat) return null;

  if (verified) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
        <Check className="h-4 w-4" />
        <span>Email verified</span>
      </div>
    );
  }

  const codeWasSent = sentTo === normalized;
  const masked = maskEmail(normalized);

  return (
    <div className="flex w-[280px] flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Label>Verify account</Label>
        <p className="text-sm text-muted">
          {sending && !codeWasSent
            ? `Sending a code to ${masked}…`
            : `We've sent a code to ${masked}`}
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
        isDisabled={verifying || !codeWasSent}
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
