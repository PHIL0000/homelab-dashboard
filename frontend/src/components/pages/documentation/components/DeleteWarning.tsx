import { Button } from '@heroui/react';

type DeleteImpact = {
	label: string;
	count: number;
};

type DeletePreviewSection = {
	label: string;
	items: string[];
	hasMore?: boolean;
};

type DeleteWarningProps = {
	isOpen: boolean;
	title: string;
	description?: string;
	impacts?: DeleteImpact[];
	previewSections?: DeletePreviewSection[];
	warningText?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	onCancel: () => void;
	onConfirm: () => void;
};

export default function DeleteWarning({
	isOpen,
	title,
	description,
	impacts = [],
	previewSections = [],
	warningText,
	confirmLabel = 'Delete',
	cancelLabel = 'Cancel',
	onCancel,
	onConfirm
}: DeleteWarningProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div className="w-full max-w-md rounded-xl border border-border bg-content p-5 shadow-2xl">
				<h3 className="text-lg font-semibold text-text">{title}</h3>
				{description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}

				{impacts.length > 0 && (
					<ul className="mt-4 space-y-1.5 text-sm text-text-secondary">
						{impacts.map((impact) => (
							<li key={impact.label}>• {impact.count} {impact.label}</li>
						))}
					</ul>
				)}

				{previewSections.map((section) => (
					section.items.length > 0 ? (
						<p key={section.label} className="mt-3 text-xs text-text-secondary/90">
							{section.label}: {section.items.join(', ')}{section.hasMore ? ' …' : ''}
						</p>
					) : null
				))}

				{warningText && <p className="mt-2 text-xs text-amber-300">{warningText}</p>}

				<div className="mt-5 flex items-center justify-end gap-2 border-t border-border pt-4">
					<Button
						type="button"
						onClick={onCancel}
						className="px-3 py-1.5 text-sm text-text-secondary hover:text-text !border-0 !border-transparent !ring-0 !shadow-none"
						variant="ghost"
					>
						{cancelLabel}
					</Button>
					<Button
						type="button"
						onClick={onConfirm}
						className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/20"
						variant="danger"
					>
						{confirmLabel}
					</Button>
				</div>
			</div>
		</div>
	);
}
