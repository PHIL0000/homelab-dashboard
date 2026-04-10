type SelectOption = {
	id: string;
	name: string;
};

type AddStorageProps = {
	isOpen: boolean;
	isEdit?: boolean;
	name: string;
	type: string;
	make: string;
	model: string;
	serialNumber: string;
	interfaceType: string;
	usableSpace: number | '';
	spaceUnit: 'GB' | 'TB';
	hardwareAssetId?: string;
	hardwareOptions?: SelectOption[];
	onClose: () => void;
	onSubmit: (e: React.FormEvent) => void;
	onDelete?: () => void;
	onNameChange: (value: string) => void;
	onTypeChange: (value: string) => void;
	onMakeChange: (value: string) => void;
	onModelChange: (value: string) => void;
	onSerialNumberChange: (value: string) => void;
	onInterfaceChange: (value: string) => void;
	onUsableSpaceChange: (value: number | '') => void;
	onSpaceUnitChange: (value: 'GB' | 'TB') => void;
	onHardwareAssetIdChange?: (value: string) => void;
};

export default function AddStorage({
	isOpen,
	isEdit,
	name,
	type,
	make,
	model,
	serialNumber,
	interfaceType,
	usableSpace,
	spaceUnit,
	hardwareAssetId,
	hardwareOptions,
	onClose,
	onSubmit,
	onDelete,
	onNameChange,
	onTypeChange,
	onMakeChange,
	onModelChange,
	onSerialNumberChange,
	onInterfaceChange,
	onUsableSpaceChange,
	onSpaceUnitChange,
	onHardwareAssetIdChange
}: AddStorageProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div className="w-full max-w-xl rounded-xl border border-border bg-content shadow-2xl">
				<div className="px-5 py-4 border-b border-border bg-background flex items-center justify-between">
					<h3 className="text-lg font-semibold text-text">{isEdit ? 'Edit Storage' : 'Add Storage'}</h3>
					<button type="button" onClick={onClose} className="text-text-secondary hover:text-text">✕</button>
				</div>

				<form onSubmit={onSubmit} className="p-5 space-y-4">
					{onHardwareAssetIdChange && (
						<label className="space-y-1 block">
							<span className="text-xs text-text-secondary">Hardware</span>
							<select
								value={hardwareAssetId || ''}
								onChange={(e) => onHardwareAssetIdChange(e.target.value)}
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
								<option value="SSD">SSD</option>
								<option value="HDD">HDD</option>
								<option value="NVME">NVME</option>
								<option value="USB">USB</option>
								<option value="ARRAY">ARRAY</option>
								<option value="OTHER">OTHER</option>
							</select>
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">Interface</span>
							<input value={interfaceType} onChange={(e) => onInterfaceChange(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">Make</span>
							<input value={make} onChange={(e) => onMakeChange(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">Model</span>
							<input value={model} onChange={(e) => onModelChange(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">Serial Number</span>
							<input value={serialNumber} onChange={(e) => onSerialNumberChange(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<div className="grid grid-cols-2 gap-2">
							<label className="space-y-1">
								<span className="text-xs text-text-secondary">Usable Space</span>
								<input
									type="number"
									min={0}
									step="0.01"
									value={usableSpace}
									onChange={(e) => onUsableSpaceChange(e.target.value === '' ? '' : Number(e.target.value))}
									className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text"
								/>
							</label>
							<label className="space-y-1">
								<span className="text-xs text-text-secondary">Unit</span>
								<select value={spaceUnit} onChange={(e) => onSpaceUnitChange(e.target.value as 'GB' | 'TB')} className="h-10 w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-text">
									<option value="GB">GB</option>
									<option value="TB">TB</option>
								</select>
							</label>
						</div>
					</div>

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
							<button type="submit" className="px-3 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary/90">Save Storage</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
