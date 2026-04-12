import { useEffect, useState, type FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button, Input, Select, ListBox, TextArea } from '@heroui/react';
import { ChevronDown } from 'lucide-react';
import type { MarkdownFormValues } from './AddMarkdown';

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
	onDelete
}: EditMarkdownProps) {
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [hardwareAssetId, setHardwareAssetId] = useState('');
	const [softwareUnitId, setSoftwareUnitId] = useState('');
	const [parentDocId, setParentDocId] = useState('');

	useEffect(() => {
		if (!isOpen || !doc) return;
		setTitle(doc.title || '');
		setContent(doc.content || '');
		setHardwareAssetId(doc.hardwareAssetId ? String(doc.hardwareAssetId) : '');
		setSoftwareUnitId(doc.softwareUnitId ? String(doc.softwareUnitId) : '');
		setParentDocId(doc.parentDocId ? String(doc.parentDocId) : '');
	}, [isOpen, doc]);

	if (!isOpen || !doc) return null;

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		await onSave({
			title: title.trim(),
			content,
			hardwareAssetId,
			softwareUnitId,
			parentDocId
		});
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div className="w-full max-w-5xl rounded-xl border border-border bg-content shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
				<div className="px-5 py-4 border-b border-border bg-background flex items-center justify-between">
					<h3 className="text-lg font-semibold text-text">Edit Markdown</h3>
					<Button type="button" onClick={onClose} className="text-text-secondary hover:text-text !border-0 !border-transparent !ring-0 !shadow-none" variant="ghost" isIconOnly aria-label="Close">✕</Button>
				</div>

				<form onSubmit={handleSubmit} className="p-5 overflow-auto space-y-4">
					<label className="space-y-1 block">
						<span className="text-xs text-text-secondary">Filename *</span>
						<Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="example-doc.md" className="w-full" />
					</label>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
												<label className="space-y-1">
							<span className="text-xs text-text-secondary">Hardware (optional)</span>
							<Select selectedKey={hardwareAssetId || 'none'} onChange={(key) => { if (key != null) setHardwareAssetId(String(key) === 'none' ? '' : String(key)); }} className="w-full">
								<Select.Trigger className="w-full px-3 flex items-center justify-between">
									<Select.Value />
									<ChevronDown size={16} className="text-text-secondary" />
								</Select.Trigger>
								<Select.Popover className="w-[var(--trigger-width)]">
									<ListBox>
										<ListBox.Item id="none" className="pl-2">None</ListBox.Item>
										{hardwareOptions.map((option) => (
											<ListBox.Item key={option.id} id={option.id} className="pl-2">{option.name || option.title || option.id}</ListBox.Item>
										))}
									</ListBox>
								</Select.Popover>
							</Select>
						</label>
												<label className="space-y-1">
							<span className="text-xs text-text-secondary">Service (optional)</span>
							<Select selectedKey={softwareUnitId || 'none'} onChange={(key) => { if (key != null) setSoftwareUnitId(String(key) === 'none' ? '' : String(key)); }} className="w-full">
								<Select.Trigger className="w-full px-3 flex items-center justify-between">
									<Select.Value />
									<ChevronDown size={16} className="text-text-secondary" />
								</Select.Trigger>
								<Select.Popover className="w-[var(--trigger-width)]">
									<ListBox>
										<ListBox.Item id="none" className="pl-2">None</ListBox.Item>
										{serviceOptions.map((option) => (
											<ListBox.Item key={option.id} id={option.id} className="pl-2">{option.name || option.title || option.id}</ListBox.Item>
										))}
									</ListBox>
								</Select.Popover>
							</Select>
						</label>
												<label className="space-y-1">
							<span className="text-xs text-text-secondary">Parent Doc (optional)</span>
							<Select selectedKey={parentDocId || 'none'} onChange={(key) => { if (key != null) setParentDocId(String(key) === 'none' ? '' : String(key)); }} className="w-full">
								<Select.Trigger className="w-full px-3 flex items-center justify-between">
									<Select.Value />
									<ChevronDown size={16} className="text-text-secondary" />
								</Select.Trigger>
								<Select.Popover className="w-[var(--trigger-width)]">
									<ListBox>
										<ListBox.Item id="none" className="pl-2">None</ListBox.Item>
										{parentDocOptions.map((option) => (
											<ListBox.Item key={option.id} id={option.id} className="pl-2">{option.title || option.name || option.id}</ListBox.Item>
										))}
									</ListBox>
								</Select.Popover>
							</Select>
						</label>
					</div>

					<div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
						<label className="space-y-1 block"><span className="text-xs text-text-secondary">Content</span><TextArea value={content} onChange={(e) => setContent(e.target.value)} className="w-full min-h-[300px]" /></label>
						<div className="space-y-1"><span className="text-xs text-text-secondary">Preview</span><div className="w-full min-h-[300px] max-h-[50vh] overflow-auto bg-background border border-border rounded-lg px-3 py-2 text-text"><ReactMarkdown components={markdownComponents}>{content || '*No content*'}</ReactMarkdown></div></div>
					</div>

					<div className="pt-4 border-t border-border flex items-center justify-between gap-2">
						<div>{onDelete && <Button type="button" onClick={onDelete} className="rounded-lg px-3 py-1.5 text-sm" variant="danger">Delete</Button>}</div>
						<div className="flex items-center gap-2"><Button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-text-secondary hover:text-text !border-0 !border-transparent !ring-0 !shadow-none" variant="ghost">Cancel</Button><Button type="submit" className="px-3 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary/90" variant="primary">Save Changes</Button></div>
					</div>
				</form>
			</div>
		</div>
	);
}
