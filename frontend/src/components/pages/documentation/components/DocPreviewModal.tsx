import ReactMarkdown from "react-markdown";
import { Button, Chip, Modal, useOverlayState } from "@heroui/react";

type DocPreviewModalProps = {
  isOpen: boolean;
  doc: any | null;
  markdownComponents?: any;
  onClose: () => void;
};

export default function DocPreviewModal({
  isOpen,
  doc,
  markdownComponents,
  onClose,
}: DocPreviewModalProps) {
  const state = useOverlayState({
    isOpen: isOpen && !!doc,
    onOpenChange: (open) => !open && onClose(),
  });

  if (!doc) return null;

  return (
    <Modal state={state}>
      <Modal.Backdrop className="bg-black/60 backdrop-blur-sm z-[60]">
        <Modal.Container size="lg" placement="center">
          <Modal.Dialog className="max-h-[85vh] overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 shadow-2xl flex flex-col">
            <Modal.Header className="flex items-center justify-between border-b border-slate-700/50 px-4 py-3 bg-slate-800">
              <div className="min-w-0">
                <Modal.Heading className="text-lg font-semibold text-text truncate">
                  {doc.title}
                </Modal.Heading>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {doc.hardwareAsset?.name && (
                    <Chip size="sm" className="bg-purple-600/15 text-purple-400">
                      HW: {doc.hardwareAsset.name}
                    </Chip>
                  )}
                  {doc.softwareUnit?.name && (
                    <Chip size="sm" className="bg-blue-500/15 text-blue-300">
                      Service: {doc.softwareUnit.name}
                    </Chip>
                  )}
                </div>
              </div>
              <Modal.CloseTrigger className="text-slate-400 hover:text-text" />
            </Modal.Header>

            <Modal.Body className="p-4 overflow-auto flex-1">
              <ReactMarkdown components={markdownComponents}>
                {doc.content || "*No content available*"}
              </ReactMarkdown>
            </Modal.Body>

            <Modal.Footer className="border-t border-slate-700/50 p-3 bg-slate-800 flex items-center justify-end gap-2">
              <Button
                type="button"
                onClick={onClose}
                variant="ghost"
                className="px-3 py-1.5 text-sm text-slate-400 hover:text-text"
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
