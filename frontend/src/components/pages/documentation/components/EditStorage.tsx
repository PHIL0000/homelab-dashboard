import { useEffect, useState, type FormEvent } from 'react';
import { Button, Input, Select, ListBox } from '@heroui/react';
import { ChevronDown } from 'lucide-react';
import type { StorageFormValues } from './AddStorage';

type EditStorageProps = {
	isOpen: boolean;
	storage: any | null;
	hardwareOptions?: Array<{ id: string; name: string }>;
	onClose: () => void;
	onSave: (values: StorageFormValues) => void | Promise<void>;
	onDelete?: () => void;
};

export default function EditStorage({ isOpen, storage, hardwareOptions, onClose, onSave, onDelete }: EditStorageProps) {
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
		if (!isOpen || !storage) return;
		setName(storage.name || '');
		setType(storage.storageType || 'SSD');
		setMake(storage.make || '');
		setModel(storage.model || '');
		setSerialNumber(storage.serialNumber || '');
		setInterfaceType(storage.interface || '');
		setHardwareAssetId(storage.hardwareAssetId ? String(storage.hardwareAssetId) : '');
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
					<h3 className="text-lg font-semibold text-text">Edit Storage</h3>
					<Button type="button" onClick={onClose} className="text-text-secondary hover:text-text !border-0 !border-transparent !ring-0 !shadow-none" variant="ghost" isIconOnly aria-label="Close">✕</Button>
				</div>

				<form onSubmit={handleSubmit} className="p-5 space-y-4">
					{!!hardwareOptions?.length && (
						<label className="space-y-1 block">
							<span className="text-xs text-text-secondary">Hardware</span>
							<Select selectedKey={hardwareAssetId || 'none'} onChange={(key) => { if (key != null) setHardwareAssetId(String(key) === 'none' ? '' : String(key)); }} className="w-full">
								<Select.Trigger className="w-full px-3 flex items-center justify-between">
									<Select.Value />
									<ChevronDown size={16} className="text-text-secondary" />
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

					<label className="space-y-1 block"><span className="text-xs text-text-secondary">Name *</span><Input value={name} onChange={(e) => setName(e.target.value)} required className="w-full" /></label>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
												<label className="space-y-1">
							<span className="text-xs text-text-secondary">Type</span>
							<Select selectedKey={type} onChange={(key) => { if (key != null) setType(String(key)); }} className="w-full">
								<Select.Trigger className="w-full px-3 flex items-center justify-between">
									<Select.Value />
									<ChevronDown size={16} className="text-text-secondary" />
								</Select.Trigger>
								<Select.Popover className="w-[var(--trigger-width)]">
									<ListBox>
										<ListBox.Item id="SSD" className="pl-2">SSD</ListBox.Item>
										<ListBox.Item id="HDD" className="pl-2">HDD</ListBox.Item>
										<ListBox.Item id="NVME" className="pl-2">NVME</ListBox.Item>
										<ListBox.Item id="USB" className="pl-2">USB</ListBox.Item>
										<ListBox.Item id="ARRAY" className="pl-2">ARRAY</ListBox.Item>
										<ListBox.Item id="OTHER" className="pl-2">OTHER</ListBox.Item>
									</ListBox>
								</Select.Popover>
							</Select>
						</label>
						<label className="space-y-1"><span className="text-xs text-text-secondary">Interface</span><Input value={interfaceType} onChange={(e) => setInterfaceType(e.target.value)} className="w-full" /></label>
						<label className="space-y-1"><span className="text-xs text-text-secondary">Make</span><Input value={make} onChange={(e) => setMake(e.target.value)} className="w-full" /></label>
						<label className="space-y-1"><span className="text-xs text-text-secondary">Model</span><Input value={model} onChange={(e) => setModel(e.target.value)} className="w-full" /></label>
						<label className="space-y-1"><span className="text-xs text-text-secondary">Serial Number</span><Input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="w-full" /></label>
						<div className="grid grid-cols-2 gap-2">
							<label className="space-y-1"><span className="text-xs text-text-secondary">Usable Space</span><Input type="number" min={0} step="0.01" value={usableSpace === '' ? '' : String(usableSpace)} onChange={(e) => setUsableSpace(e.target.value === '' ? '' : Number(e.target.value))} className="w-full" /></label>
														<label className="space-y-1">
								<span className="text-xs text-text-secondary">Unit</span>
								<Select selectedKey={spaceUnit} onChange={(key) => { if (key != null && (String(key) === 'GB' || String(key) === 'TB')) setSpaceUnit(String(key) as 'GB' | 'TB'); }} className="w-full">
									<Select.Trigger className="w-full px-3 flex items-center justify-between">
										<Select.Value />
										<ChevronDown size={16} className="text-text-secondary" />
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

					<div className="pt-4 border-t border-border flex items-center justify-between gap-2">
						<div>{onDelete && <Button type="button" onClick={onDelete} className="rounded-lg px-3 py-1.5 text-sm" variant="danger">Delete</Button>}</div>
						<div className="flex items-center gap-2"><Button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-text-secondary hover:text-text !border-0 !border-transparent !ring-0 !shadow-none" variant="ghost">Cancel</Button><Button type="submit" className="px-3 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary/90" variant="primary">Save Changes</Button></div>
					</div>
				</form>
			</div>
		</div>
	);
}
