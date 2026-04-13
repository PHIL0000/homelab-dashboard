import { useEffect, useState, type FormEvent } from 'react';
import { Button, Input, Select, ListBox } from '@heroui/react';
import { ChevronDown } from 'lucide-react';

type EditServiceValues = {
	serviceId: string;
	name: string;
	type: string;
	port: string;
	url: string;
	image: string;
	deploymentId?: string;
	hardwareAssetId: string;
	internalIp: string;
};

type EditServiceProps = {
	isOpen: boolean;
	service: {
		id: string;
		name?: string | null;
		type?: string | null;
		port?: number | null;
		url?: string | null;
		image?: string | null;
	} | null;
	deployment?: {
		id?: string | null;
		hardwareAssetId?: string | null;
		internalIp?: string | null;
	} | null;
	hardwareOptions?: Array<{ id: string; name: string }>;
	deploymentContextHint?: string;
	onClose: () => void;
	onSave: (values: EditServiceValues) => void | Promise<void>;
	onDelete?: () => void;
};

const SOFTWARE_TYPE_OPTIONS = [
	{ value: 'DOCKER_CONTAINER', label: 'Docker Container' },
	{ value: 'VM', label: 'VM' },
	{ value: 'POD', label: 'Pod' },
	{ value: 'BARE_METAL_SERVICE', label: 'Bare Metal' },
	{ value: 'OTHER', label: 'Other' }
] as const;

export default function EditService({
	isOpen,
	service,
	deployment,
	hardwareOptions,
	deploymentContextHint,
	onClose,
	onSave,
	onDelete,
}: EditServiceProps) {
	const [name, setName] = useState('');
	const [type, setType] = useState('DOCKER_CONTAINER');
	const [port, setPort] = useState('');
	const [url, setUrl] = useState('');
	const [image, setImage] = useState('');
	const [hardwareAssetId, setHardwareAssetId] = useState('');
	const [internalIp, setInternalIp] = useState('');

	useEffect(() => {
		if (!isOpen || !service) return;

		setName(service.name || '');
		setType(service.type || 'DOCKER_CONTAINER');
		setPort(service.port ? String(service.port) : '');
		setUrl(service.url || '');
		setImage(service.image || '');
		setHardwareAssetId(deployment?.hardwareAssetId ? String(deployment.hardwareAssetId) : '');
		setInternalIp(deployment?.internalIp || '');
	}, [
		isOpen,
		service?.id,
		service?.name,
		service?.type,
		service?.port,
		service?.url,
		service?.image,
		deployment?.id,
		deployment?.hardwareAssetId,
		deployment?.internalIp
	]);

	if (!isOpen || !service) return null;

	const hasDeploymentBinding = Boolean(deployment?.id);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		await onSave({
			serviceId: String(service.id),
			name: name.trim(),
			type,
			port,
			url: url.trim(),
			image: image.trim(),
			deploymentId: deployment?.id ? String(deployment.id) : undefined,
			hardwareAssetId,
			internalIp
		});
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div className="w-full max-w-xl rounded-xl border border-slate-700/50 bg-slate-900/50 shadow-2xl">
				<div className="px-5 py-4 border-b border-slate-700/50 bg-slate-800 flex items-center justify-between">
					<h3 className="text-lg font-semibold text-slate-100">Edit Service & Deployment</h3>
					<Button type="button" onClick={onClose} className="text-slate-400 hover:text-text !border-0 !border-transparent !ring-0 !shadow-none" variant="ghost" isIconOnly aria-label="Close">✕</Button>
				</div>

				<form onSubmit={handleSubmit} className="p-5 space-y-4">
					{deploymentContextHint && (
						<p className="text-xs rounded-lg border border-slate-700/50 bg-slate-800 px-3 py-2 text-slate-400">
							{deploymentContextHint}
						</p>
					)}

					<label className="space-y-1 block">
						<span className="text-xs text-slate-400">Hardware</span>
						<Select
								selectedKey={hardwareAssetId || 'none'}
								isDisabled={!hasDeploymentBinding}
								onChange={(key) => { if (key != null) setHardwareAssetId(String(key) === 'none' ? '' : String(key)); }}
							className="w-full"
						>
							<Select.Trigger className="w-full px-3 flex items-center justify-between">
								<Select.Value />
								<ChevronDown size={16} className="text-slate-400" />
							</Select.Trigger>
							<Select.Popover className="w-[var(--trigger-width)]">
								<ListBox>
									<ListBox.Item id="none" className="pl-2">Select Hardware</ListBox.Item>
									{(hardwareOptions || []).map((option) => (
											<ListBox.Item key={option.id} id={option.id} className="pl-2">{option.name}</ListBox.Item>
									))}
								</ListBox>
							</Select.Popover>
						</Select>
					</label>

					<label className="space-y-1 block">
						<span className="text-xs text-slate-400">Name *</span>
						<Input value={name} onChange={(e) => setName(e.target.value)} required className="w-full" />
					</label>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<label className="space-y-1">
							<span className="text-xs text-slate-400">Type</span>
							<Select selectedKey={type} onChange={(key) => { if (key != null) setType(String(key)); }} className="w-full">
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
							<Input type="number" min={1} value={port} onChange={(e) => setPort(e.target.value)} className="w-full" />
						</label>
					</div>

					<label className="space-y-1 block">
						<span className="text-xs text-slate-400">URL</span>
						<Input value={url} onChange={(e) => setUrl(e.target.value)} className="w-full" />
					</label>

					<label className="space-y-1 block">
						<span className="text-xs text-slate-400">Image</span>
						<Input value={image} onChange={(e) => setImage(e.target.value)} className="w-full" />
					</label>

					<label className="space-y-1 block">
						<span className="text-xs text-slate-400">Internal IP</span>
						<Input
							value={internalIp}
							disabled={!hasDeploymentBinding}
							onChange={(e) => setInternalIp(e.target.value)}
							className="w-full"
						/>
					</label>

					<div className="pt-4 border-t border-slate-700/50 flex items-center justify-between gap-2">
						<div>
							{onDelete && (
								<Button type="button" onClick={onDelete} className="rounded-lg px-3 py-1.5 text-sm" variant="danger">
									Delete
								</Button>
							)}
						</div>
						<div className="flex items-center gap-2">
							<Button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-slate-400 hover:text-text !border-0 !border-transparent !ring-0 !shadow-none" variant="ghost">Cancel</Button>
							<Button type="submit" className="px-3 py-1.5 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-600/90" variant="primary">Save Changes</Button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
