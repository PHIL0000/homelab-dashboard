import ReactMarkdown from 'react-markdown';
import { useEffect, useState, type FormEvent } from 'react';

type OptionItem = {
	id: string;
	name?: string;
	title?: string;
};

export type MarkdownFormValues = {
	title: string;
	content: string;
	hardwareAssetId: string;
	softwareUnitId: string;
	parentDocId: string;
};

type AddMarkdownProps = {
	isOpen: boolean;
	initialValues?: Partial<MarkdownFormValues>;
	hardwareOptions: OptionItem[];
	serviceOptions: OptionItem[];
	parentDocOptions: OptionItem[];
	markdownComponents?: any;
	onClose: () => void;
	onSave: (values: MarkdownFormValues) => void | Promise<void>;
};

export default function AddMarkdown({
	isOpen,
	initialValues,
	hardwareOptions,
	serviceOptions,
	parentDocOptions,
	markdownComponents,
	onClose,
	onSave
}: AddMarkdownProps) {
	if (!isOpen) return null;

	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [hardwareAssetId, setHardwareAssetId] = useState('');
	const [softwareUnitId, setSoftwareUnitId] = useState('');
	const [parentDocId, setParentDocId] = useState('');

	useEffect(() => {
		if (!isOpen) return;
		setTitle(initialValues?.title || '');
		setContent(initialValues?.content || '');
		setHardwareAssetId(initialValues?.hardwareAssetId || '');
		setSoftwareUnitId(initialValues?.softwareUnitId || '');
		setParentDocId(initialValues?.parentDocId || '');
	}, [isOpen, initialValues]);

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
					<h3 className="text-lg font-semibold text-text">Add Markdown</h3>
					<button type="button" onClick={onClose} className="text-text-secondary hover:text-text">✕</button>
				</div>

				<form onSubmit={handleSubmit} className="p-5 overflow-auto space-y-4">
					<label className="space-y-1 block">
						<span className="text-xs text-text-secondary">Filename *</span>
						<input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
							placeholder="example-doc.md"
							className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text"
						/>
					</label>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">Hardware (optional)</span>
							<select value={hardwareAssetId} onChange={(e) => setHardwareAssetId(e.target.value)} className="h-10 w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-text">
								<option value="">None</option>
								{hardwareOptions.map((option) => (
									<option key={option.id} value={option.id}>{option.name || option.title || option.id}</option>
								))}
							</select>
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">Service (optional)</span>
							<select value={softwareUnitId} onChange={(e) => setSoftwareUnitId(e.target.value)} className="h-10 w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-text">
								<option value="">None</option>
								{serviceOptions.map((option) => (
									<option key={option.id} value={option.id}>{option.name || option.title || option.id}</option>
								))}
							</select>
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">Parent Doc (optional)</span>
							<select value={parentDocId} onChange={(e) => setParentDocId(e.target.value)} className="h-10 w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-text">
								<option value="">None</option>
								{parentDocOptions.map((option) => (
									<option key={option.id} value={option.id}>{option.title || option.name || option.id}</option>
								))}
							</select>
						</label>
					</div>

					<div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
						<label className="space-y-1 block">
							<span className="text-xs text-text-secondary">Content</span>
							<textarea
								value={content}
								onChange={(e) => setContent(e.target.value)}
								className="w-full min-h-[300px] bg-background border border-border rounded-lg px-3 py-2 text-text font-mono text-sm"
							/>
						</label>

						<div className="space-y-1">
							<span className="text-xs text-text-secondary">Preview</span>
							<div className="w-full min-h-[300px] max-h-[50vh] overflow-auto bg-background border border-border rounded-lg px-3 py-2 text-text">
								<ReactMarkdown components={markdownComponents}>{content || '*No content*'}</ReactMarkdown>
							</div>
						</div>
					</div>

					<div className="pt-4 border-t border-border flex items-center justify-end gap-2">
						<div className="flex items-center gap-2">
							<button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-text-secondary hover:text-text">Cancel</button>
							<button type="submit" className="px-3 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary/90">Save Markdown</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
