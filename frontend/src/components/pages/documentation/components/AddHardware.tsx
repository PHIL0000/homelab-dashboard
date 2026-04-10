import { useEffect, useState, type FormEvent } from 'react';

export type HardwareFormValues = {
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
};

type AddHardwareProps = {
	isOpen: boolean;
	initialValues?: Partial<HardwareFormValues>;
	onClose: () => void;
	onSave: (values: HardwareFormValues) => void | Promise<void>;
};

const HARDWARE_TYPE_OPTIONS = [
	{ value: 'PI', label: 'Raspberry Pi' },
	{ value: 'SERVER', label: 'Server' },
	{ value: 'NAS', label: 'NAS' },
	{ value: 'OTHER', label: 'Other' }
] as const;

export default function AddHardware({ isOpen, initialValues, onClose, onSave }: AddHardwareProps) {
	if (!isOpen) return null;

	const [name, setName] = useState('');
	const [hostname, setHostname] = useState('');
	const [type, setType] = useState('SERVER');
	const [ip, setIp] = useState('');
	const [mac, setMac] = useState('');
	const [cpu, setCpu] = useState('');
	const [cpuCores, setCpuCores] = useState('');
	const [make, setMake] = useState('');
	const [model, setModel] = useState('');
	const [ram, setRam] = useState('');
	const [serialNumber, setSerialNumber] = useState('');
	const [location, setLocation] = useState('');
	const [icon, setIcon] = useState('');
	const [os, setOs] = useState('');
	const [notes, setNotes] = useState('');

	useEffect(() => {
		if (!isOpen) return;
		setName(initialValues?.name || '');
		setHostname(initialValues?.hostname || '');
		setType(initialValues?.type || 'SERVER');
		setIp(initialValues?.ip || '');
		setMac(initialValues?.mac || '');
		setCpu(initialValues?.cpu || '');
		setCpuCores(initialValues?.cpuCores || '');
		setMake(initialValues?.make || '');
		setModel(initialValues?.model || '');
		setRam(initialValues?.ram || '');
		setSerialNumber(initialValues?.serialNumber || '');
		setLocation(initialValues?.location || '');
		setIcon(initialValues?.icon || '');
		setOs(initialValues?.os || '');
		setNotes(initialValues?.notes || '');
	}, [isOpen, initialValues]);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		await onSave({
			name: name.trim(),
			hostname: hostname.trim(),
			type,
			ip: ip.trim(),
			mac: mac.trim(),
			cpu: cpu.trim(),
			cpuCores,
			make: make.trim(),
			model: model.trim(),
			ram,
			serialNumber: serialNumber.trim(),
			location: location.trim(),
			icon: icon.trim(),
			os: os.trim(),
			notes
		});
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div className="w-full max-w-3xl rounded-xl border border-border bg-content shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
				<div className="px-5 py-4 border-b border-border bg-background flex items-center justify-between">
					<h3 className="text-lg font-semibold text-text">Add Hardware</h3>
					<button type="button" onClick={onClose} className="text-text-secondary hover:text-text">✕</button>
				</div>

				<form onSubmit={handleSubmit} className="p-5 overflow-auto space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">Name *</span>
							<input value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">Hostname</span>
							<input value={hostname} onChange={(e) => setHostname(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">Type</span>
							<select value={type} onChange={(e) => setType(e.target.value)} className="h-10 w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-text">
								{HARDWARE_TYPE_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>{option.label}</option>
								))}
							</select>
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">OS</span>
							<input value={os} onChange={(e) => setOs(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">IP</span>
							<input value={ip} onChange={(e) => setIp(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">MAC</span>
							<input value={mac} onChange={(e) => setMac(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">CPU</span>
							<input value={cpu} onChange={(e) => setCpu(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">CPU Cores</span>
							<input type="number" min={1} value={cpuCores} onChange={(e) => setCpuCores(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">RAM (GB)</span>
							<input type="number" min={1} value={ram} onChange={(e) => setRam(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">Make</span>
							<input value={make} onChange={(e) => setMake(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">Model</span>
							<input value={model} onChange={(e) => setModel(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">Serial Number</span>
							<input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">Location</span>
							<input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
						<label className="space-y-1 md:col-span-2">
							<span className="text-xs text-text-secondary">Icon</span>
							<input value={icon} onChange={(e) => setIcon(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
					</div>

					<label className="space-y-1 block">
						<span className="text-xs text-text-secondary">Notes</span>
						<textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full min-h-[120px] bg-background border border-border rounded-lg px-3 py-2 text-text" />
					</label>

					<div className="pt-4 border-t border-border flex items-center justify-end gap-2">
						<div className="flex items-center gap-2">
							<button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-text-secondary hover:text-text">Cancel</button>
							<button type="submit" className="px-3 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary/90">Save Hardware</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
