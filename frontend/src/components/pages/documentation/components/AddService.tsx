import { useEffect, useState } from 'react';
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
	storageOptions?: Array<{ id: string; name: string }>;
	selectedStorageIds?: string[];
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
	onSelectedStorageIdsChange?: (value: string[]) => void;
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
const STORAGE_PICKER_NONE_KEY = 'picker-none';

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
	storageOptions,
	selectedStorageIds,
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
	onSelectedStorageIdsChange,
	onInternalIpChange,
	onHardwareAssetIdChange
}: AddServiceProps) {
	const selectedIds = selectedStorageIds || [];
	const [storagePickerKey, setStoragePickerKey] = useState(STORAGE_PICKER_NONE_KEY);

	useEffect(() => {
		if (isOpen) {
			setStoragePickerKey(STORAGE_PICKER_NONE_KEY);
		}
	}, [isOpen]);

	if (!isOpen) return null;

	const addStorageId = (storageId: string) => {
		if (!onSelectedStorageIdsChange) return;
		onSelectedStorageIdsChange(
			selectedIds.includes(storageId)
				? selectedIds
				: [...selectedIds, storageId]
		);
		setStoragePickerKey('picker-none');
	};

	const removeStorageId = (storageId: string) => {
		if (!onSelectedStorageIdsChange) return;
		onSelectedStorageIdsChange(selectedIds.filter((id) => id !== storageId));
	};

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

					{showInternalIp && (
						<label className="space-y-1 block">
							<span className="text-xs text-slate-400">Internal IP</span>
							<Input value={internalIp || ''} onChange={(e) => onInternalIpChange?.(e.target.value)} className="w-full" />
							<p className="text-[11px] text-slate-400">IP address where this service is reachable. Usually the hardware IP, but it can be different.</p>
						</label>
					)}

					<label className="space-y-1 block">
						<span className="text-xs text-slate-400">URL</span>
						<Input value={url} onChange={(e) => onUrlChange(e.target.value)} className="w-full" />
					</label>

					<label className="space-y-1 block">
						<span className="text-xs text-slate-400">Image</span>
						<Input value={image} onChange={(e) => onImageChange(e.target.value)} className="w-full" />
					</label>

					{!!storageOptions?.length && (
						<div className="space-y-1 block">
							<span className="text-xs text-slate-400">Storage (optional, 0..N)</span>
							<Select
								selectedKey={storagePickerKey}
								onChange={(key) => {
									if (key == null) return;
									const value = String(key);
									if (value === STORAGE_PICKER_NONE_KEY) return;
									addStorageId(value);
								}}
								className="w-full"
							>
								<Select.Trigger className="w-full px-3 flex items-center justify-between">
									<Select.Value />
									<ChevronDown size={16} className="text-slate-400" />
								</Select.Trigger>
								<Select.Popover className="w-[var(--trigger-width)]">
									<ListBox>
										<ListBox.Item id={STORAGE_PICKER_NONE_KEY} className="pl-2">Select storage to add</ListBox.Item>
										{storageOptions.map((option) => (
											<ListBox.Item key={option.id} id={option.id} className="pl-2">{option.name}</ListBox.Item>
										))}
									</ListBox>
								</Select.Popover>
							</Select>
							<div className="w-full rounded-lg border border-slate-700/50 bg-slate-900/60 p-2 min-h-11">
								{selectedIds.length === 0 ? (
									<p className="text-xs text-slate-400">No storage selected.</p>
								) : (
									<div className="flex flex-wrap gap-2">
										{selectedIds.map((storageId) => {
											const label = storageOptions.find((option) => option.id === storageId)?.name || storageId;
											return (
												<span key={storageId} className="group inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-800/70 px-2.5 py-1 text-xs text-slate-100">
													{label}
													<button
														type="button"
														onMouseDown={(event) => {
															event.preventDefault();
															event.stopPropagation();
														}}
														onClick={(event) => {
															event.preventDefault();
															event.stopPropagation();
															removeStorageId(storageId);
														}}
														className="ml-1 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
														aria-label={`Remove ${label}`}
													>
														×
													</button>
												</span>
											);
										})}
									</div>
								)}
							</div>
							<p className="text-[11px] text-slate-400">Add one by one via dropdown. Remove via x on tag hover.</p>
						</div>
					)}

					<div className="pt-4 border-t border-slate-700/50 flex items-center justify-between gap-2">
						<div>
							{isEdit && onDelete && (
								<Button type="button" onClick={onDelete} className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/20" variant="danger">
									Delete
								</Button>
							)}
						</div>
						<div className="flex items-center gap-2">
							<Button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-slate-400 hover:text-text !border-0 !border-transparent !ring-0 !shadow-none" variant="ghost">Cancel</Button>
							<Button type="submit" className="text-sm px-3 py-2 rounded-lg bg-purple-600 text-white font-medium hover:shadow-[0_0_15px_rgba(168,_85,_247,_0.5)] transition-all" variant="primary">{submitLabel || 'Save Service'}</Button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
