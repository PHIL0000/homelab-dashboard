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
import { useLanguage } from "@/context/LanguageContext";

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
  const { t } = useLanguage();
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
      if (!res.ok) throw new Error(data.error || t("auth.forgot.errorSendCode"));
      showSuccess(t("auth.forgot.sentToastIfExists"));
      setStep("verify");
    } catch (err: any) {
      showError(err.message);
    } finally {
      setSending(false);
    }
  };

  const submitReset = async () => {
    if (code.length !== 6) {
      showError(t("auth.forgot.errorEnterCode"));
      return;
    }
    if (newPassword.length < 8) {
      showError(t("auth.forgot.errorMinLength"));
      return;
    }
    if (newPassword !== confirmPassword) {
      showError(t("auth.forgot.errorMismatch"));
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
      if (!res.ok) throw new Error(data.error || t("auth.forgot.errorReset"));
      showSuccess(t("auth.forgot.successToast"));
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
              <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-4">
                {t("auth.forgot.title")}
              </h2>
              {step === "request" && (
                <p className="text-sm text-[var(--color-textSecondary)] mb-5 -mt-2">
                  {t("auth.forgot.subtitle")}
                </p>
              )}

              {step === "request" ? (
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder={t("auth.forgot.identifierPlaceholder")}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                  <Button
                    fullWidth
                    onPress={requestReset}
                    isDisabled={sending || !identifier.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold"
                  >
                    {sending ? t("auth.email.sending") : t("auth.forgot.sendCode")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex w-[280px] flex-col gap-2 mx-auto">
                    <div className="flex flex-col gap-1">
                      <Label>{t("auth.email.verifyTitle")}</Label>
                      <p className="text-sm text-muted">
                        {t("auth.forgot.sentToVerified")}
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
                      <p className="text-sm text-muted">{t("auth.email.didntReceive")}</p>
                      <Link
                        className="text-foreground underline"
                        onPress={() => {
                          if (!sending) requestReset();
                        }}
                      >
                        {sending ? t("auth.email.sending") : t("auth.email.resend")}
                      </Link>
                    </div>
                  </div>
                  <Input
                    type="password"
                    placeholder={t("auth.forgot.newPassword")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder={t("auth.forgot.confirmPassword")}
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
                      {t("common.back")}
                    </Button>
                    <Button
                      onPress={submitReset}
                      isDisabled={submitting}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold"
                    >
                      {submitting ? t("auth.forgot.saving") : t("auth.forgot.setPassword")}
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
