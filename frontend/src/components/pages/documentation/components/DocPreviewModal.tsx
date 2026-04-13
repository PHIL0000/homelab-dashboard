import ReactMarkdown from 'react-markdown';
import { Button } from '@heroui/react';

type DocPreviewModalProps = {
  isOpen: boolean;
  doc: any | null;
  markdownComponents?: any;
  onClose: () => void;
};

export default function DocPreviewModal({ isOpen, doc, markdownComponents, onClose }: DocPreviewModalProps) {
  if (!isOpen || !doc) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-700/50 px-4 py-3 bg-slate-800">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-text truncate">{doc.title}</h3>
            <div className="flex gap-2 mt-1 flex-wrap">
              {doc.hardwareAsset?.name && <span className="text-xs bg-purple-600/15 text-purple-400 px-2 py-0.5 rounded-full">HW: {doc.hardwareAsset.name}</span>}
              {doc.softwareUnit?.name && <span className="text-xs bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded-full">Service: {doc.softwareUnit.name}</span>}
            </div>
          </div>
          <Button onClick={onClose} className="text-slate-400 hover:text-text !border-0 !border-transparent !ring-0 !shadow-none" variant="ghost" isIconOnly>✕</Button>
        </div>

        <div className="p-4 overflow-auto flex-1">
          <ReactMarkdown components={markdownComponents}>{doc.content || '*No content available*'}</ReactMarkdown>
        </div>

        <div className="border-t border-slate-700/50 p-3 bg-slate-800 flex items-center justify-end gap-2">
          <Button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-slate-400 hover:text-text !border-0 !border-transparent !ring-0 !shadow-none"
            variant="ghost"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}