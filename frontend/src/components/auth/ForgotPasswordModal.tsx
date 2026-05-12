import { useEffect, useState } from "react";
import {
  Button,
  Input,
  InputOTP,
  Label,
  Link,
  Modal,
  REGEXP_ONLY_DIGITS,
  useOverlayState,
} from "@heroui/react";
import { showError, showSuccess } from "@/toast";
import { API_BASE } from "@/lib/api";

type Step = "request" | "verify";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialIdentifier?: string;
}

export default function ForgotPasswordModal({
  isOpen,
  onOpenChange,
  initialIdentifier = "",
}: ForgotPasswordModalProps) {
  const state = useOverlayState({ isOpen, onOpenChange });
  const [step, setStep] = useState<Step>("request");
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when closing so a re-open starts fresh.
      setStep("request");
      setCode("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setIdentifier(initialIdentifier);
    }
  }, [isOpen, initialIdentifier]);

  const requestReset = async () => {
    if (!identifier.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reset code");
      showSuccess("If an account with a verified email exists, a code has been sent.");
      setStep("verify");
    } catch (err: any) {
      showError(err.message);
    } finally {
      setSending(false);
    }
  };

  const submitReset = async () => {
    if (code.length !== 6) {
      showError("Enter the 6-digit code from the email.");
      return;
    }
    if (newPassword.length < 8) {
      showError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          code,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      showSuccess("Password updated. You can now sign in.");
      onOpenChange(false);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal state={state}>
      <Modal.Backdrop
        className="bg-black/60 backdrop-blur-sm"
        isDismissable={false}
      >
        <Modal.Container placement="center">
          <Modal.Dialog className="!max-w-md !w-[calc(100vw-2rem)] bg-background rounded-2xl border border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)] shadow-2xl">
            <Modal.CloseTrigger className="absolute top-4 right-4 z-10" />
            <Modal.Body className="p-6">
              <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-2">
                Reset your password
              </h2>
              <p className="text-sm text-[var(--color-textSecondary)] mb-5">
                {step === "request"
                  ? "Enter your username or email and we'll send a code to the verified email on file."
                  : "Enter the 6-digit code we sent to your email and choose a new password."}
              </p>

              {step === "request" ? (
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="username or email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                  <Button
                    fullWidth
                    onPress={requestReset}
                    isDisabled={sending || !identifier.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold"
                  >
                    {sending ? "Sending…" : "Send reset code"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex w-[280px] flex-col gap-2 mx-auto">
                    <div className="flex flex-col gap-1">
                      <Label>Verify account</Label>
                      <p className="text-sm text-muted">
                        We've sent a code to the verified email on file
                      </p>
                    </div>
                    <InputOTP
                      maxLength={6}
                      pattern={REGEXP_ONLY_DIGITS}
                      value={code}
                      onChange={(value: string) => setCode(value)}
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
                          if (!sending) requestReset();
                        }}
                      >
                        {sending ? "Sending…" : "Resend"}
                      </Link>
                    </div>
                  </div>
                  <Input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onPress={() => setStep("request")}
                      isDisabled={submitting}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onPress={submitReset}
                      isDisabled={submitting}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold"
                    >
                      {submitting ? "Saving…" : "Set new password"}
                    </Button>
                  </div>
                </div>
              )}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
