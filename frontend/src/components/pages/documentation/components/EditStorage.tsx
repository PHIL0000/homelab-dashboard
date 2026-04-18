import { useEffect, useState, type FormEvent } from 'react';
import { Button, Input, Select, ListBox } from '@heroui/react';
import { ChevronDown } from 'lucide-react';
import {
	STORAGE_INTERFACE_OPTIONS,
	STORAGE_INTERFACE_LABELS,
	STORAGE_TYPE_OPTIONS,
	STORAGE_TYPE_LABELS,
	type StorageFormValues,
	type StorageInterfaceOption,
	type StorageTypeOption
} from './AddStorage';

type EditStorageProps = {
	isOpen: boolean;
	storage: any | null;
	hardwareOptions?: Array<{ id: string; name: string }>;
	serviceOptions?: Array<{ id: string; name: string }>;
	onClose: () => void;
	onSave: (values: StorageFormValues) => void | Promise<void>;
	onDelete?: () => void;
};

export default function EditStorage({ isOpen, storage, hardwareOptions, serviceOptions, onClose, onSave, onDelete }: EditStorageProps) {
	const [name, setName] = useState('');
	const [type, setType] = useState<StorageTypeOption>('SSD');
	const [make, setMake] = useState('');
	const [model, setModel] = useState('');
	const [serialNumber, setSerialNumber] = useState('');
	const [interfaceType, setInterfaceType] = useState<StorageInterfaceOption>('SATA');
	const [usableSpace, setUsableSpace] = useState<number | ''>('');
	const [spaceUnit, setSpaceUnit] = useState<'GB' | 'TB'>('GB');
	const [hardwareAssetId, setHardwareAssetId] = useState('');
	const [softwareUnitIds, setSoftwareUnitIds] = useState<string[]>([]);
	const [servicePickerKey, setServicePickerKey] = useState('picker-none');

	useEffect(() => {
		if (!isOpen || !storage) return;

		const normalizedType = STORAGE_TYPE_OPTIONS.includes(storage.storageType)
			? storage.storageType
			: storage.storageType === 'NVME'
				? 'SSD'
				: 'OTHER';

		const interfaceRaw = String(storage.interface || '').toUpperCase();
		const legacyInterfaceMap: Record<string, StorageInterfaceOption> = {
			'SATA': 'SATA',
			'SAS': 'SAS',
			'NVME': 'NVME M.2',
			'NVME M.2': 'NVME M.2',
			'NVME_M2': 'NVME M.2',
			'SATA NVME': 'SATA NVME',
			'SATA_NVME': 'SATA NVME',
			'U.2/U.3 NVME': 'U.2/U.3 NVME',
			'U2/U3 NVME': 'U.2/U.3 NVME',
			'PCIE': 'PCIE',
			'PCI-E': 'PCIE',
			'USB': 'USB',
			'THUNDERBOLT': 'THUNDERBOLT',
			'SDIO': 'SDIO',
			'EMMC': 'EMMC',
			'ISCSI': 'ISCSI',
			'I-SCSI': 'ISCSI',
			'FIBRE CHANNEL': 'FIBRE_CHANNEL',
			'FIBRE_CHANNEL': 'FIBRE_CHANNEL',
			'OTHER': 'OTHER'
		};
		const mappedInterface = legacyInterfaceMap[interfaceRaw] || 'OTHER';

		setName(storage.name || '');
		setType(normalizedType);
		setMake(storage.make || '');
		setModel(storage.model || '');
		setSerialNumber(storage.serialNumber || '');
		setInterfaceType(mappedInterface);
		setHardwareAssetId(storage.hardwareAssetId ? String(storage.hardwareAssetId) : '');
		const assignmentIds = Array.isArray(storage.serviceAssignments)
			? storage.serviceAssignments
				.map((assignment: any) => String(assignment.softwareUnitId || assignment.softwareUnit?.id || ''))
				.filter(Boolean)
			: [];
		setSoftwareUnitIds(assignmentIds);
		setServicePickerKey('picker-none');
		if (storage.usableSpaceGB && storage.usableSpaceGB >= 1000 && storage.usableSpaceGB % 1000 === 0) {
			setUsableSpace(storage.usableSpaceGB / 1000);
			setSpaceUnit('TB');
		} else {
			setUsableSpace(storage.usableSpaceGB || '');
			setSpaceUnit('GB');
		}
	}, [isOpen, storage]);

	if (!isOpen || !storage) return null;

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		await onSave({
			name: name.trim(),
			type,
			make: make.trim(),
			model: model.trim(),
			serialNumber: serialNumber.trim(),
			interfaceType,
			usableSpace,
			spaceUnit,
			hardwareAssetId,
			softwareUnitIds
		});
	};

	const addServiceId = (serviceId: string) => {
		setSoftwareUnitIds((prev) =>
			prev.includes(serviceId) ? prev : [...prev, serviceId]
		);
		setServicePickerKey('picker-none');
	};

	const removeServiceId = (serviceId: string) => {
		setSoftwareUnitIds((prev) => prev.filter((id) => id !== serviceId));
	};

	return (
		<div className="doc-theme-form fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div className="w-full max-w-xl rounded-xl border border-slate-700/50 bg-slate-900/50 shadow-2xl">
				<div className="px-5 py-4 border-b border-slate-700/50 bg-slate-800 flex items-center justify-between">
					<h3 className="text-lg font-semibold text-slate-100">Edit Storage</h3>
					<Button type="button" onClick={onClose} className="text-slate-400 hover:text-text !border-0 !border-transparent !ring-0 !shadow-none" variant="ghost" isIconOnly aria-label="Close">✕</Button>
				</div>

				<form onSubmit={handleSubmit} className="p-5 space-y-4">
					{!!hardwareOptions?.length && (
						<label className="space-y-1 block">
							<span className="text-xs text-slate-400">Hardware</span>
							<Select selectedKey={hardwareAssetId || 'none'} onChange={(key) => { if (key != null) setHardwareAssetId(String(key) === 'none' ? '' : String(key)); }} className="w-full">
								<Select.Trigger className="w-full px-3 flex items-center justify-between">
									<Select.Value />
									<ChevronDown size={16} className="text-slate-400" />
								</Select.Trigger>
								<Select.Popover className="w-[var(--trigger-width)]">
									<ListBox>
										<ListBox.Item id="none" className="pl-2">Select Hardware</ListBox.Item>
										{hardwareOptions.map((option) => (<ListBox.Item key={option.id} id={option.id} className="pl-2">{option.name}</ListBox.Item>))}
									</ListBox>
								</Select.Popover>
							</Select>
						</label>
					)}

					{!!serviceOptions?.length && (
						<div className="space-y-1 block">
							<span className="text-xs text-slate-400">Services (optional, 0..N)</span>
							<Select
								selectedKey={servicePickerKey}
								onChange={(key) => {
									if (key == null) return;
									const value = String(key);
									if (value === 'picker-none') return;
									addServiceId(value);
								}}
								className="w-full"
							>
								<Select.Trigger className="w-full px-3 flex items-center justify-between">
									<Select.Value />
									<ChevronDown size={16} className="text-slate-400" />
								</Select.Trigger>
								<Select.Popover className="w-[var(--trigger-width)]">
									<ListBox>
										<ListBox.Item id="picker-none" className="pl-2">Select service to add</ListBox.Item>
										{serviceOptions.map((option) => (
											<ListBox.Item key={option.id} id={option.id} className="pl-2">{option.name}</ListBox.Item>
										))}
									</ListBox>
								</Select.Popover>
							</Select>
							<div className="w-full rounded-lg border border-slate-700/50 bg-slate-900/60 p-2 min-h-11">
								{softwareUnitIds.length === 0 ? (
									<p className="text-xs text-slate-400">No services selected.</p>
								) : (
									<div className="flex flex-wrap gap-2">
										{softwareUnitIds.map((serviceId) => {
											const label = serviceOptions.find((option) => option.id === serviceId)?.name || serviceId;
											return (
												<span key={serviceId} className="group inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-800/70 px-2.5 py-1 text-xs text-slate-100">
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
															removeServiceId(serviceId);
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

					<label className="space-y-1 block"><span className="text-xs text-slate-400">Name *</span><Input value={name} onChange={(e) => setName(e.target.value)} required className="w-full" /></label>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
												<label className="space-y-1">
							<span className="text-xs text-slate-400">Type</span>
													<Select selectedKey={type} onChange={(key) => { if (key != null) setType(String(key) as StorageTypeOption); }} className="w-full">
								<Select.Trigger className="w-full px-3 flex items-center justify-between">
									<Select.Value />
									<ChevronDown size={16} className="text-slate-400" />
								</Select.Trigger>
								<Select.Popover className="w-[var(--trigger-width)]">
									<ListBox>
																{STORAGE_TYPE_OPTIONS.map((option) => (
											<ListBox.Item key={option} id={option} className="pl-2">{STORAGE_TYPE_LABELS[option]}</ListBox.Item>
																))}
									</ListBox>
								</Select.Popover>
							</Select>
						</label>
												<label className="space-y-1">
													<span className="text-xs text-slate-400">Interface</span>
													<Select selectedKey={interfaceType} onChange={(key) => { if (key != null) setInterfaceType(String(key) as StorageInterfaceOption); }} className="w-full">
														<Select.Trigger className="w-full px-3 flex items-center justify-between">
															<Select.Value />
															<ChevronDown size={16} className="text-slate-400" />
														</Select.Trigger>
														<Select.Popover className="w-[var(--trigger-width)]">
															<ListBox>
																{STORAGE_INTERFACE_OPTIONS.map((option) => (
																	<ListBox.Item key={option} id={option} className="pl-2">{STORAGE_INTERFACE_LABELS[option]}</ListBox.Item>
																))}
															</ListBox>
														</Select.Popover>
													</Select>
												</label>
						<label className="space-y-1"><span className="text-xs text-slate-400">Make</span><Input value={make} onChange={(e) => setMake(e.target.value)} className="w-full" /></label>
						<label className="space-y-1"><span className="text-xs text-slate-400">Model</span><Input value={model} onChange={(e) => setModel(e.target.value)} className="w-full" /></label>
						<label className="space-y-1"><span className="text-xs text-slate-400">Serial Number</span><Input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="w-full" /></label>
						<div className="grid grid-cols-2 gap-2">
							<label className="space-y-1"><span className="text-xs text-slate-400">Usable Space</span><Input type="number" min={0} step="0.01" value={usableSpace === '' ? '' : String(usableSpace)} onChange={(e) => setUsableSpace(e.target.value === '' ? '' : Number(e.target.value))} className="w-full" /></label>
														<label className="space-y-1">
								<span className="text-xs text-slate-400">Unit</span>
								<Select selectedKey={spaceUnit} onChange={(key) => { if (key != null && (String(key) === 'GB' || String(key) === 'TB')) setSpaceUnit(String(key) as 'GB' | 'TB'); }} className="w-full">
									<Select.Trigger className="w-full px-3 flex items-center justify-between">
										<Select.Value />
										<ChevronDown size={16} className="text-slate-400" />
									</Select.Trigger>
									<Select.Popover className="w-[var(--trigger-width)]">
										<ListBox>
											<ListBox.Item id="GB" className="pl-2">GB</ListBox.Item>
											<ListBox.Item id="TB" className="pl-2">TB</ListBox.Item>
										</ListBox>
									</Select.Popover>
								</Select>
							</label>
						</div>
					</div>

					<div className="pt-4 border-t border-slate-700/50 flex items-center justify-between gap-2">
						<div>{onDelete && <Button type="button" onClick={onDelete} className="rounded-lg px-3 py-1.5 text-sm" variant="danger">Delete</Button>}</div>
						<div className="flex items-center gap-2"><Button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-slate-400 hover:text-text !border-0 !border-transparent !ring-0 !shadow-none" variant="ghost">Cancel</Button><Button type="submit" className="px-3 py-1.5 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-600/90" variant="primary">Save Changes</Button></div>
					</div>
				</form>
			</div>
		</div>
	);
}
