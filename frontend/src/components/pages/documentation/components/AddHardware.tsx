type AddHardwareProps = {
	isOpen: boolean;
	isEdit?: boolean;
	name: string;
	hostname: string;
	type: string;
	ip: string;
	mac: string;
	cpu: string;
	cpuCores: string;
	make: string;
	model: string;
	ram: string;
	serialNumber: string;
	location: string;
	icon: string;
	os: string;
	notes: string;
	onClose: () => void;
	onSubmit: (e: React.FormEvent) => void;
	onDelete?: () => void;
	onNameChange: (value: string) => void;
	onHostnameChange: (value: string) => void;
	onTypeChange: (value: string) => void;
	onIpChange: (value: string) => void;
	onMacChange: (value: string) => void;
	onCpuChange: (value: string) => void;
	onCpuCoresChange: (value: string) => void;
	onMakeChange: (value: string) => void;
	onModelChange: (value: string) => void;
	onRamChange: (value: string) => void;
	onSerialNumberChange: (value: string) => void;
	onLocationChange: (value: string) => void;
	onIconChange: (value: string) => void;
	onOsChange: (value: string) => void;
	onNotesChange: (value: string) => void;
};

const HARDWARE_TYPE_OPTIONS = [
	{ value: 'Raspberry Pi', label: 'Raspberry Pi' },
	{ value: 'Server', label: 'Server' },
	{ value: 'NAS', label: 'NAS' },
	{ value: 'Other', label: 'Other' }
] as const;

export default function AddHardware({
	isOpen,
	isEdit,
	name,
	hostname,
	type,
	ip,
	mac,
	cpu,
	cpuCores,
	make,
	model,
	ram,
	serialNumber,
	location,
	icon,
	os,
	notes,
	onClose,
	onSubmit,
	onDelete,
	onNameChange,
	onHostnameChange,
	onTypeChange,
	onIpChange,
	onMacChange,
	onCpuChange,
	onCpuCoresChange,
	onMakeChange,
	onModelChange,
	onRamChange,
	onSerialNumberChange,
	onLocationChange,
	onIconChange,
	onOsChange,
	onNotesChange
}: AddHardwareProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div className="w-full max-w-3xl rounded-xl border border-border bg-content shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
				<div className="px-5 py-4 border-b border-border bg-background flex items-center justify-between">
					<h3 className="text-lg font-semibold text-text">{isEdit ? 'Edit Hardware' : 'Add Hardware'}</h3>
					<button type="button" onClick={onClose} className="text-text-secondary hover:text-text">✕</button>
				</div>

				<form onSubmit={onSubmit} className="p-5 overflow-auto space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">Name *</span>
							<input value={name} onChange={(e) => onNameChange(e.target.value)} required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">Hostname</span>
							<input value={hostname} onChange={(e) => onHostnameChange(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">Type</span>
							<select value={type} onChange={(e) => onTypeChange(e.target.value)} className="h-10 w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-text">
								{HARDWARE_TYPE_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>{option.label}</option>
								))}
							</select>
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">OS</span>
							<input value={os} onChange={(e) => onOsChange(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">IP</span>
							<input value={ip} onChange={(e) => onIpChange(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">MAC</span>
							<input value={mac} onChange={(e) => onMacChange(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">CPU</span>
							<input value={cpu} onChange={(e) => onCpuChange(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">CPU Cores</span>
							<input type="number" min={1} value={cpuCores} onChange={(e) => onCpuCoresChange(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">RAM (GB)</span>
							<input type="number" min={1} value={ram} onChange={(e) => onRamChange(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
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
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">Location</span>
							<input value={location} onChange={(e) => onLocationChange(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<label className="space-y-1 md:col-span-2">
							<span className="text-xs text-text-secondary">Icon</span>
							<input value={icon} onChange={(e) => onIconChange(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
					</div>

					<label className="space-y-1 block">
						<span className="text-xs text-text-secondary">Notes</span>
						<textarea value={notes} onChange={(e) => onNotesChange(e.target.value)} className="w-full min-h-[120px] bg-background border border-border rounded-lg px-3 py-2 text-text" />
					</label>

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
							<button type="submit" className="px-3 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary/90">Save</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
