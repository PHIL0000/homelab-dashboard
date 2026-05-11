import { useEffect, useState, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import {
  Button,
  Input,
  ListBox,
  Modal,
  Select,
  TextArea,
  useOverlayState,
} from "@heroui/react";
import { ChevronDown } from "lucide-react";
import type { MarkdownFormValues } from "./AddMarkdown";

type OptionItem = {
  id: string;
  name?: string;
  title?: string;
};

type EditMarkdownProps = {
  isOpen: boolean;
  doc: any | null;
  hardwareOptions: OptionItem[];
  serviceOptions: OptionItem[];
  parentDocOptions: OptionItem[];
  markdownComponents?: any;
  onClose: () => void;
  onSave: (values: MarkdownFormValues) => void | Promise<void>;
  onDelete?: () => void;
};

export default function EditMarkdown({
  isOpen,
  doc,
  hardwareOptions,
  serviceOptions,
  parentDocOptions,
  markdownComponents,
  onClose,
  onSave,
  onDelete,
}: EditMarkdownProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hardwareAssetId, setHardwareAssetId] = useState("");
  const [softwareUnitId, setSoftwareUnitId] = useState("");
  const [parentDocId, setParentDocId] = useState("");

  const state = useOverlayState({
    isOpen: isOpen && !!doc,
    onOpenChange: (open) => !open && onClose(),
  });

  useEffect(() => {
    if (!isOpen || !doc) return;
    setTitle(doc.title || "");
    setContent(doc.content || "");
    setHardwareAssetId(doc.hardwareAssetId ? String(doc.hardwareAssetId) : "");
    setSoftwareUnitId(doc.softwareUnitId ? String(doc.softwareUnitId) : "");
    setParentDocId(doc.parentDocId ? String(doc.parentDocId) : "");
  }, [isOpen, doc]);

  if (!doc) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSave({
      title: title.trim(),
      content,
      hardwareAssetId,
      softwareUnitId,
      parentDocId,
    });
  };

  return (
    <Modal state={state}>
      <Modal.Backdrop className="doc-theme-form bg-black/60 backdrop-blur-sm">
        <Modal.Container size="lg" placement="center">
          <Modal.Dialog className="rounded-xl border border-slate-700/50 bg-slate-900/50 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <Modal.Header className="px-5 py-4 border-b border-slate-700/50 bg-slate-800 flex items-center justify-between">
              <Modal.Heading className="text-lg font-semibold text-slate-100">
                Edit Markdown
              </Modal.Heading>
              <Modal.CloseTrigger
                aria-label="Close"
                className="text-slate-400 hover:text-text"
              />
            </Modal.Header>

            <form onSubmit={handleSubmit} className="p-5 overflow-auto space-y-4">
              <label className="space-y-1 block">
                <span className="text-xs text-slate-400">Filename *</span>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="example-doc.md"
                  className="w-full"
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="space-y-1">
                  <span className="text-xs text-slate-400">Hardware (optional)</span>
                  <Select
                    selectedKey={hardwareAssetId || "none"}
                    onChange={(key) => {
                      if (key != null)
                        setHardwareAssetId(String(key) === "none" ? "" : String(key));
                    }}
                    className="w-full"
                  >
                    <Select.Trigger className="w-full px-3 flex items-center justify-between">
                      <Select.Value />
                      <ChevronDown size={16} className="text-slate-400" />
                    </Select.Trigger>
                    <Select.Popover className="w-[var(--trigger-width)]">
                      <ListBox>
                        <ListBox.Item id="none" className="pl-2">
                          None
                        </ListBox.Item>
                        {hardwareOptions.map((option) => (
                          <ListBox.Item key={option.id} id={option.id} className="pl-2">
                            {option.name || option.title || option.id}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-slate-400">Service (optional)</span>
                  <Select
                    selectedKey={softwareUnitId || "none"}
                    onChange={(key) => {
                      if (key != null)
                        setSoftwareUnitId(String(key) === "none" ? "" : String(key));
                    }}
                    className="w-full"
                  >
                    <Select.Trigger className="w-full px-3 flex items-center justify-between">
                      <Select.Value />
                      <ChevronDown size={16} className="text-slate-400" />
                    </Select.Trigger>
                    <Select.Popover className="w-[var(--trigger-width)]">
                      <ListBox>
                        <ListBox.Item id="none" className="pl-2">
                          None
                        </ListBox.Item>
                        {serviceOptions.map((option) => (
                          <ListBox.Item key={option.id} id={option.id} className="pl-2">
                            {option.name || option.title || option.id}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-slate-400">Parent Doc (optional)</span>
                  <Select
                    selectedKey={parentDocId || "none"}
                    onChange={(key) => {
                      if (key != null)
                        setParentDocId(String(key) === "none" ? "" : String(key));
                    }}
                    className="w-full"
                  >
                    <Select.Trigger className="w-full px-3 flex items-center justify-between">
                      <Select.Value />
                      <ChevronDown size={16} className="text-slate-400" />
                    </Select.Trigger>
                    <Select.Popover className="w-[var(--trigger-width)]">
                      <ListBox>
                        <ListBox.Item id="none" className="pl-2">
                          None
                        </ListBox.Item>
                        {parentDocOptions.map((option) => (
                          <ListBox.Item key={option.id} id={option.id} className="pl-2">
                            {option.title || option.name || option.id}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </label>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <label className="space-y-1 block">
                  <span className="text-xs text-slate-400">Content</span>
                  <TextArea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full min-h-[300px]"
                  />
                </label>
                <div className="space-y-1">
                  <span className="text-xs text-slate-400">Preview</span>
                  <div className="w-full min-h-[300px] max-h-[50vh] overflow-auto bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-100">
                    <ReactMarkdown components={markdownComponents}>
                      {content || "*No content*"}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              <Modal.Footer className="pt-4 border-t border-slate-700/50 flex items-center justify-between gap-2">
                <div>
                  {onDelete && (
                    <Button
                      type="button"
                      onClick={onDelete}
                      variant="danger"
                      className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/20"
                    >
                      Delete
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={onClose}
                    variant="ghost"
                    className="px-3 py-1.5 text-sm text-slate-400 hover:text-text"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="text-sm px-3 py-2 rounded-lg bg-purple-600 text-white font-medium hover:shadow-[0_0_15px_rgba(168,_85,_247,_0.5)] transition-all"
                  >
                    Save Changes
                  </Button>
                </div>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
