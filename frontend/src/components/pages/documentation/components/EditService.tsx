import { useEffect, useState, type FormEvent } from 'react';

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
			<div className="w-full max-w-xl rounded-xl border border-border bg-content shadow-2xl">
				<div className="px-5 py-4 border-b border-border bg-background flex items-center justify-between">
					<h3 className="text-lg font-semibold text-text">Edit Service & Deployment</h3>
					<button type="button" onClick={onClose} className="text-text-secondary hover:text-text">✕</button>
				</div>

				<form onSubmit={handleSubmit} className="p-5 space-y-4">
					{deploymentContextHint && (
						<p className="text-xs rounded-lg border border-border bg-background px-3 py-2 text-text-secondary">
							{deploymentContextHint}
						</p>
					)}

					<label className="space-y-1 block">
						<span className="text-xs text-text-secondary">Hardware</span>
						<select
							value={hardwareAssetId}
							disabled={!hasDeploymentBinding}
							onChange={(e) => setHardwareAssetId(e.target.value)}
							className="h-10 w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-text disabled:opacity-50"
						>
							<option value="">Select hardware</option>
							{(hardwareOptions || []).map((option) => (
								<option key={option.id} value={option.id}>{option.name}</option>
							))}
						</select>
					</label>

					<label className="space-y-1 block">
						<span className="text-xs text-text-secondary">Name *</span>
						<input value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
					</label>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">Type</span>
							<select value={type} onChange={(e) => setType(e.target.value)} className="h-10 w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-text">
								{SOFTWARE_TYPE_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>{option.label}</option>
								))}
							</select>
						</label>
						<label className="space-y-1">
							<span className="text-xs text-text-secondary">Port</span>
							<input type="number" min={1} value={port} onChange={(e) => setPort(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
						</label>
					</div>

					<label className="space-y-1 block">
						<span className="text-xs text-text-secondary">URL</span>
						<input value={url} onChange={(e) => setUrl(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
					</label>

					<label className="space-y-1 block">
						<span className="text-xs text-text-secondary">Image</span>
						<input value={image} onChange={(e) => setImage(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text" />
					</label>

					<label className="space-y-1 block">
						<span className="text-xs text-text-secondary">Internal IP</span>
						<input
							value={internalIp}
							disabled={!hasDeploymentBinding}
							onChange={(e) => setInternalIp(e.target.value)}
							className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text disabled:opacity-50"
						/>
					</label>

					<div className="pt-4 border-t border-border flex items-center justify-between gap-2">
						<div>
							{onDelete && (
								<button type="button" onClick={onDelete} className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/20">
									Delete
								</button>
							)}
						</div>
						<div className="flex items-center gap-2">
							<button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-text-secondary hover:text-text">Cancel</button>
							<button type="submit" className="px-3 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary/90">Save Changes</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
