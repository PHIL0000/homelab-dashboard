import { useEffect, useState, type FormEvent } from 'react';
import { Button, Input, Select, ListBox, TextArea } from '@heroui/react';
import { ChevronDown } from 'lucide-react';
import type { HardwareFormValues } from './AddHardware';

type EditHardwareProps = {
	isOpen: boolean;
	hardware: any | null;
	onClose: () => void;
	onSave: (values: HardwareFormValues) => void | Promise<void>;
	onDelete?: () => void;
};

const HARDWARE_TYPE_OPTIONS = [
	{ value: 'PI', label: 'Raspberry Pi' },
	{ value: 'SERVER', label: 'Server' },
	{ value: 'NAS', label: 'NAS' },
	{ value: 'OTHER', label: 'Other' }
] as const;

export default function EditHardware({ isOpen, hardware, onClose, onSave, onDelete }: EditHardwareProps) {
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
		if (!isOpen || !hardware) return;
		setName(hardware.name || '');
		setHostname(hardware.hostname || '');
		setType(hardware.type || 'SERVER');
		setIp(hardware.ip || '');
		setMac(hardware.mac || '');
		setCpu(hardware.cpu || '');
		setCpuCores(hardware.cpuCores ? String(hardware.cpuCores) : '');
		setMake(hardware.make || '');
		setModel(hardware.model || '');
		setRam(hardware.ram ? String(hardware.ram) : '');
		setSerialNumber(hardware.serialNumber || '');
		setLocation(hardware.location || '');
		setIcon(hardware.icon || '');
		setOs(hardware.os || '');
		setNotes(hardware.notes || '');
	}, [isOpen, hardware]);

	if (!isOpen || !hardware) return null;

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
		<div className="doc-theme-form fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div className="w-full max-w-3xl rounded-xl border border-slate-700/50 bg-slate-900/50 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
				<div className="px-5 py-4 border-b border-slate-700/50 bg-slate-800 flex items-center justify-between">
					<h3 className="text-lg font-semibold text-slate-100">Edit Hardware</h3>
					<Button type="button" onClick={onClose} className="text-slate-400 hover:text-text !border-0 !border-transparent !ring-0 !shadow-none" variant="ghost" isIconOnly aria-label="Close">✕</Button>
				</div>

				<form onSubmit={handleSubmit} className="p-5 overflow-auto space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<label className="space-y-1"><span className="text-xs text-slate-400">Name *</span><Input value={name} onChange={(e) => setName(e.target.value)} required className="w-full" /></label>
						<label className="space-y-1"><span className="text-xs text-slate-400">Hostname</span><Input value={hostname} onChange={(e) => setHostname(e.target.value)} className="w-full" /></label>
												<label className="space-y-1">
							<span className="text-xs text-slate-400">Type</span>
							<Select selectedKey={type} onChange={(key) => { if (key != null) setType(String(key)); }} className="w-full">
								<Select.Trigger className="w-full px-3 flex items-center justify-between">
									<Select.Value />
									<ChevronDown size={16} className="text-slate-400" />
								</Select.Trigger>
								<Select.Popover className="w-[var(--trigger-width)]">
									<ListBox>
										{HARDWARE_TYPE_OPTIONS.map((option) => (
											<ListBox.Item key={option.value} id={option.value} className="pl-2">
												{option.label}
											</ListBox.Item>
										))}
									</ListBox>
								</Select.Popover>
							</Select>
						</label>
						<label className="space-y-1"><span className="text-xs text-slate-400">OS</span><Input value={os} onChange={(e) => setOs(e.target.value)} className="w-full" /></label>
						<label className="space-y-1"><span className="text-xs text-slate-400">IP</span><Input value={ip} onChange={(e) => setIp(e.target.value)} className="w-full" /></label>
						<label className="space-y-1"><span className="text-xs text-slate-400">MAC</span><Input value={mac} onChange={(e) => setMac(e.target.value)} className="w-full" /></label>
						<label className="space-y-1"><span className="text-xs text-slate-400">CPU</span><Input value={cpu} onChange={(e) => setCpu(e.target.value)} className="w-full" /></label>
						<label className="space-y-1"><span className="text-xs text-slate-400">CPU Cores</span><Input type="number" min={1} value={cpuCores} onChange={(e) => setCpuCores(e.target.value)} className="w-full" /></label>
						<label className="space-y-1"><span className="text-xs text-slate-400">RAM (GB)</span><Input type="number" min={1} value={ram} onChange={(e) => setRam(e.target.value)} className="w-full" /></label>
						<label className="space-y-1"><span className="text-xs text-slate-400">Make</span><Input value={make} onChange={(e) => setMake(e.target.value)} className="w-full" /></label>
						<label className="space-y-1"><span className="text-xs text-slate-400">Model</span><Input value={model} onChange={(e) => setModel(e.target.value)} className="w-full" /></label>
						<label className="space-y-1"><span className="text-xs text-slate-400">Serial Number</span><Input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="w-full" /></label>
						<label className="space-y-1"><span className="text-xs text-slate-400">Location</span><Input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full" /></label>
						<label className="space-y-1 md:col-span-2"><span className="text-xs text-slate-400">Icon</span><Input value={icon} onChange={(e) => setIcon(e.target.value)} className="w-full" /></label>
					</div>

					<label className="space-y-1 block"><span className="text-xs text-slate-400">Notes</span><TextArea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full min-h-[120px]" /></label>

					<div className="pt-4 border-t border-slate-700/50 flex items-center justify-between gap-2">
						<div>{onDelete && <Button type="button" onClick={onDelete} className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/20" variant="danger">Delete</Button>}</div>
						<div className="flex items-center gap-2">
							<Button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-slate-400 hover:text-text !border-0 !border-transparent !ring-0 !shadow-none" variant="ghost">Cancel</Button>
							<Button type="submit" className="text-sm px-3 py-2 rounded-lg bg-purple-600 text-white font-medium hover:shadow-[0_0_15px_rgba(168,_85,_247,_0.5)] transition-all" variant="primary">Save Changes</Button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
