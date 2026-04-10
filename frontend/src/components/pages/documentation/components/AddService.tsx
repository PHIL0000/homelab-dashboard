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
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div className="w-full max-w-xl rounded-xl border border-border bg-content shadow-2xl">
				<div className="px-5 py-4 border-b border-border bg-background flex items-center justify-between">
					<h3 className="text-lg font-semibold text-text">{title || (isEdit ? 'Edit Service' : 'Add Service')}</h3>
					<button type="button" onClick={onClose} className="text-text-secondary hover:text-text">✕</button>
				</div>

				<form onSubmit={onSubmit} className="p-5 space-y-4">
					{createHint && <p className="text-xs rounded-lg border border-border bg-background px-3 py-2 text-text-secondary">{createHint}</p>}

					{showHardwareSelector && (
						<label className="space-y-1 block">
							<span className="text-xs text-text-secondary">Hardware</span>
							<select
								value={hardwareAssetId || ''}
								onChange={(e) => onHardwareAssetIdChange?.(e.target.value)}
								className="h-10 w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-text"
							>
								<option value="">Select hardware</option>
								{(hardwareOptions || []).map((option) => (
									<option key={option.id} value={option.id}>{option.name}</option>
								))}
							</select>
						</label>
					)}

					<label className="space-y-1 block">
						<span className="text-xs text-text-secondary">Name *</span>
						<input value={name} onChange={(e) => onNameChange(e.target.value)} required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
					</label>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">Type</span>
							<select value={type} onChange={(e) => onTypeChange(e.target.value)} className="h-10 w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-text">
								{SOFTWARE_TYPE_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>{option.label}</option>
								))}
							</select>
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">Port</span>
							<input type="number" min={1} value={port} onChange={(e) => onPortChange(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
					</div>

					<label className="space-y-1 block">
						<span className="text-xs text-text-secondary">URL</span>
						<input value={url} onChange={(e) => onUrlChange(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
					</label>

					<label className="space-y-1 block">
						<span className="text-xs text-text-secondary">Image</span>
						<input value={image} onChange={(e) => onImageChange(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
					</label>

					{showInternalIp && (
						<label className="space-y-1 block">
							<span className="text-xs text-text-secondary">Internal IP</span>
							<input value={internalIp || ''} onChange={(e) => onInternalIpChange?.(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
					)}

					<div className="pt-4 border-t border-border flex items-center justify-between gap-2">
						<div>
							{isEdit && onDelete && (
								<button type="button" onClick={onDelete} className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/20">
									Delete
								</button>
							)}
						</div>
						<div className="flex items-center gap-2">
							<button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-text-secondary hover:text-text">Cancel</button>
							<button type="submit" className="px-3 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary/90">{submitLabel || 'Save Service'}</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
