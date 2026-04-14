import { Button, Input, Select, ListBox } from '@heroui/react';
import { ChevronDown } from 'lucide-react';

type AddServiceProps = {
	isOpen: boolean;
	isEdit?: boolean;
	title?: string;
	submitLabel?: string;
	hardwareAssetId?: string;
	hardwareOptions?: Array<{ id: string; name: string }>;
	showHardwareSelector?: boolean;
	name: string;
	type: string;
	port: string;
	url: string;
	image: string;
	internalIp?: string;
	showInternalIp?: boolean;
	createHint?: string;
	onClose: () => void;
	onSubmit: (e: React.FormEvent) => void;
	onDelete?: () => void;
	onNameChange: (value: string) => void;
	onTypeChange: (value: string) => void;
	onPortChange: (value: string) => void;
	onUrlChange: (value: string) => void;
	onImageChange: (value: string) => void;
	onInternalIpChange?: (value: string) => void;
	onHardwareAssetIdChange?: (value: string) => void;
};

const SOFTWARE_TYPE_OPTIONS = [
	{ value: 'DOCKER_CONTAINER', label: 'Docker Container' },
	{ value: 'VM', label: 'VM' },
	{ value: 'POD', label: 'Pod' },
	{ value: 'BARE_METAL_SERVICE', label: 'Bare Metal' },
	{ value: 'OTHER', label: 'Other' }
] as const;

export default function AddService({
	isOpen,
	isEdit,
	title,
	submitLabel,
	hardwareAssetId,
	hardwareOptions,
	showHardwareSelector,
	name,
	type,
	port,
	url,
	image,
	internalIp,
	showInternalIp,
	createHint,
	onClose,
	onSubmit,
	onDelete,
	onNameChange,
	onTypeChange,
	onPortChange,
	onUrlChange,
	onImageChange,
	onInternalIpChange,
	onHardwareAssetIdChange
}: AddServiceProps) {
	if (!isOpen) return null;

	return (
		<div className="doc-theme-form fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div className="w-full max-w-xl rounded-xl border border-slate-700/50 bg-slate-900/50 shadow-2xl">
				<div className="px-5 py-4 border-b border-slate-700/50 bg-slate-800 flex items-center justify-between">
					<h3 className="text-lg font-semibold text-slate-100">{title || (isEdit ? 'Edit Service' : 'Add Service')}</h3>
					<Button type="button" onClick={onClose} className="text-slate-400 hover:text-text !border-0 !border-transparent !ring-0 !shadow-none" variant="ghost" isIconOnly aria-label="Close">✕</Button>
				</div>

				<form onSubmit={onSubmit} className="p-5 space-y-4">
					{createHint && <p className="text-xs rounded-lg border border-slate-700/50 bg-slate-800 px-3 py-2 text-slate-400">{createHint}</p>}

					{showHardwareSelector && (
						<label className="space-y-1 block">
							<span className="text-xs text-slate-400">Hardware</span>
							<Select
								selectedKey={hardwareAssetId || 'unassigned'}
								onChange={(key) => { if (key != null) onHardwareAssetIdChange?.(String(key) === 'unassigned' ? '' : String(key)); }}
								className="w-full"
							>
								<Select.Trigger className="w-full px-3 flex items-center justify-between">
									<Select.Value />
									<ChevronDown size={16} className="text-slate-400" />
								</Select.Trigger>
								<Select.Popover className="w-[var(--trigger-width)]">
									<ListBox>
										<ListBox.Item id="unassigned" className="pl-2">Select hardware</ListBox.Item>
										{(hardwareOptions || []).map((option) => (
											<ListBox.Item key={option.id} id={option.id} className="pl-2">{option.name}</ListBox.Item>
										))}
									</ListBox>
								</Select.Popover>
							</Select>
						</label>
					)}

					<label className="space-y-1 block">
						<span className="text-xs text-slate-400">Name *</span>
						<Input value={name} onChange={(e) => onNameChange(e.target.value)} required className="w-full" />
					</label>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<label className="space-y-1">
							<span className="text-xs text-slate-400">Type</span>
							<Select
								selectedKey={type}
								onChange={(key) => { if (key != null) onTypeChange(String(key)); }}
								className="w-full"
							>
								<Select.Trigger className="w-full px-3 flex items-center justify-between">
									<Select.Value />
									<ChevronDown size={16} className="text-slate-400" />
								</Select.Trigger>
								<Select.Popover className="w-[var(--trigger-width)]">
									<ListBox>
										{SOFTWARE_TYPE_OPTIONS.map((option) => (
											<ListBox.Item key={option.value} id={option.value} className="pl-2">{option.label}</ListBox.Item>
										))}
									</ListBox>
								</Select.Popover>
							</Select>
						</label>
						<label className="space-y-1">
							<span className="text-xs text-slate-400">Port</span>
							<Input type="number" min={1} value={port} onChange={(e) => onPortChange(e.target.value)} className="w-full" />
						</label>
					</div>

					<label className="space-y-1 block">
						<span className="text-xs text-slate-400">URL</span>
						<Input value={url} onChange={(e) => onUrlChange(e.target.value)} className="w-full" />
					</label>

					<label className="space-y-1 block">
						<span className="text-xs text-slate-400">Image</span>
						<Input value={image} onChange={(e) => onImageChange(e.target.value)} className="w-full" />
					</label>

					{showInternalIp && (
						<label className="space-y-1 block">
							<span className="text-xs text-slate-400">Internal IP</span>
							<Input value={internalIp || ''} onChange={(e) => onInternalIpChange?.(e.target.value)} className="w-full" />
						</label>
					)}

					<div className="pt-4 border-t border-slate-700/50 flex items-center justify-between gap-2">
						<div>
							{isEdit && onDelete && (
								<Button type="button" onClick={onDelete} className="rounded-lg px-3 py-1.5 text-sm" variant="danger">
									Delete
								</Button>
							)}
						</div>
						<div className="flex items-center gap-2">
							<Button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-slate-400 hover:text-text !border-0 !border-transparent !ring-0 !shadow-none" variant="ghost">Cancel</Button>
							<Button type="submit" className="px-3 py-1.5 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-600/90" variant="primary">{submitLabel || 'Save Service'}</Button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
