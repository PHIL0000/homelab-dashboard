import { useEffect, useState } from 'react';

type SelectOption = {
	id: string;
	name: string;
};

export type StorageFormValues = {
	name: string;
	type: string;
	make: string;
	model: string;
	serialNumber: string;
	interfaceType: string;
	usableSpace: number | '';
	spaceUnit: 'GB' | 'TB';
	hardwareAssetId: string;
};

type AddStorageProps = {
	isOpen: boolean;
	hardwareOptions?: SelectOption[];
	initialValues?: Partial<StorageFormValues>;
	onClose: () => void;
	onSave: (values: StorageFormValues) => void | Promise<void>;
};

export default function AddStorage({
	isOpen,
	hardwareOptions,
	initialValues,
	onClose,
	onSave
}: AddStorageProps) {
	if (!isOpen) return null;

	const [name, setName] = useState('');
	const [type, setType] = useState('SSD');
	const [make, setMake] = useState('');
	const [model, setModel] = useState('');
	const [serialNumber, setSerialNumber] = useState('');
	const [interfaceType, setInterfaceType] = useState('');
	const [usableSpace, setUsableSpace] = useState<number | ''>('');
	const [spaceUnit, setSpaceUnit] = useState<'GB' | 'TB'>('GB');
	const [hardwareAssetId, setHardwareAssetId] = useState('');

	useEffect(() => {
		if (!isOpen) return;
		setName(initialValues?.name || '');
		setType(initialValues?.type || 'SSD');
		setMake(initialValues?.make || '');
		setModel(initialValues?.model || '');
		setSerialNumber(initialValues?.serialNumber || '');
		setInterfaceType(initialValues?.interfaceType || '');
		setUsableSpace(initialValues?.usableSpace ?? '');
		setSpaceUnit(initialValues?.spaceUnit || 'GB');
		setHardwareAssetId(initialValues?.hardwareAssetId || '');
	}, [isOpen, initialValues]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		await onSave({
			name: name.trim(),
			type,
			make: make.trim(),
			model: model.trim(),
			serialNumber: serialNumber.trim(),
			interfaceType: interfaceType.trim(),
			usableSpace,
			spaceUnit,
			hardwareAssetId
		});
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div className="w-full max-w-xl rounded-xl border border-border bg-content shadow-2xl">
				<div className="px-5 py-4 border-b border-border bg-background flex items-center justify-between">
					<h3 className="text-lg font-semibold text-text">Add Storage</h3>
					<button type="button" onClick={onClose} className="text-text-secondary hover:text-text">✕</button>
				</div>

				<form onSubmit={handleSubmit} className="p-5 space-y-4">
					{!!hardwareOptions?.length && (
						<label className="space-y-1 block">
							<span className="text-xs text-text-secondary">Hardware</span>
							<select
								value={hardwareAssetId}
								onChange={(e) => setHardwareAssetId(e.target.value)}
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
						<input value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
					</label>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">Type</span>
							<select value={type} onChange={(e) => setType(e.target.value)} className="h-10 w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-text">
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
							<input value={interfaceType} onChange={(e) => setInterfaceType(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
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
						<div className="grid grid-cols-2 gap-2">
							<label className="space-y-1">
								<span className="text-xs text-text-secondary">Usable Space</span>
								<input
									type="number"
									min={0}
									step="0.01"
									value={usableSpace}
									onChange={(e) => setUsableSpace(e.target.value === '' ? '' : Number(e.target.value))}
									className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text"
								/>
							</label>
							<label className="space-y-1">
								<span className="text-xs text-text-secondary">Unit</span>
								<select value={spaceUnit} onChange={(e) => setSpaceUnit(e.target.value as 'GB' | 'TB')} className="h-10 w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-text">
									<option value="GB">GB</option>
									<option value="TB">TB</option>
								</select>
							</label>
						</div>
					</div>

					<div className="pt-4 border-t border-border flex items-center justify-end gap-2">
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
