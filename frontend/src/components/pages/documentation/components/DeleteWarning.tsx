import { AlertDialog, Button } from "@heroui/react";

type DeleteImpact = {
  label: string;
  count: number;
};

type DeletePreviewSection = {
  label: string;
  items: string[];
  hasMore?: boolean;
};

type DeleteWarningProps = {
  isOpen: boolean;
  title: string;
  description?: string;
  impacts?: DeleteImpact[];
  previewSections?: DeletePreviewSection[];
  warningText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteWarning({
  isOpen,
  title,
  description,
  impacts = [],
  previewSections = [],
  warningText,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onCancel,
  onConfirm,
}: DeleteWarningProps) {
  return (
    <AlertDialog isOpen={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialog.Backdrop className="bg-black/60 backdrop-blur-sm z-[70]">
        <AlertDialog.Container size="md" placement="center">
          <AlertDialog.Dialog className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 shadow-2xl">
            <AlertDialog.Header>
              <AlertDialog.Heading className="text-lg font-semibold text-slate-100">
                {title}
              </AlertDialog.Heading>
              {description && (
                <p className="mt-1 text-sm text-slate-400">{description}</p>
              )}
            </AlertDialog.Header>

            <AlertDialog.Body>
              {impacts.length > 0 && (
                <ul className="mt-4 space-y-1.5 text-sm text-slate-400">
                  {impacts.map((impact) => (
                    <li key={impact.label}>
                      • {impact.count} {impact.label}
                    </li>
                  ))}
                </ul>
              )}

              {previewSections.map((section) =>
                section.items.length > 0 ? (
                  <p
                    key={section.label}
                    className="mt-3 text-xs text-slate-400/90"
                  >
                    {section.label}: {section.items.join(", ")}
                    {section.hasMore ? " …" : ""}
                  </p>
                ) : null,
              )}

              {warningText && (
                <p className="mt-2 text-xs text-amber-300">{warningText}</p>
              )}
            </AlertDialog.Body>

            <AlertDialog.Footer className="mt-5 flex items-center justify-end gap-2 border-t border-slate-700/50 pt-4">
              <Button
                type="button"
                onClick={onCancel}
                variant="ghost"
                className="px-3 py-1.5 text-sm text-slate-400 hover:text-text"
              >
                {cancelLabel}
              </Button>
              <Button
                type="button"
                onClick={onConfirm}
                variant="danger"
                className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/20"
              >
                {confirmLabel}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}
