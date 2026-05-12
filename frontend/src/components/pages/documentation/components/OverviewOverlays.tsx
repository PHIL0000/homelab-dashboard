import DeleteWarning from "./DeleteWarning";
import DocPreviewModal from "./DocPreviewModal";

type OverviewOverlaysProps = {
  pendingHardwareDelete: {
    id: string;
    name: string;
    deployments: number;
    services: number;
    storage: number;
    docs: number;
    servicePreview: string[];
    docPreview: string[];
    externalImpact: number;
  } | null;
  pendingServiceDelete: {
    id: string;
    name: string;
    deployments: number;
    storage: number;
    docs: number;
    deploymentPreview: string[];
    docPreview: string[];
    hardwareImpact: number;
  } | null;
  pendingStorageDelete: {
    id: string;
    name: string;
    hardwareName?: string;
    serviceName?: string;
  } | null;
  pendingDocDelete: {
    id: string;
    title: string;
    childCount: number;
    childPreview: string[];
  } | null;
  previewDoc: any | null;
  markdownComponents: any;
  onCancelHardwareDelete: () => void;
  onConfirmHardwareDelete: () => void;
  onCancelServiceDelete: () => void;
  onConfirmServiceDelete: () => void;
  onCancelStorageDelete: () => void;
  onConfirmStorageDelete: () => void;
  onCancelDocDelete: () => void;
  onConfirmDocDelete: () => void;
  onCloseDocPreview: () => void;
};

export default function OverviewOverlays({
  pendingHardwareDelete,
  pendingServiceDelete,
  pendingStorageDelete,
  pendingDocDelete,
  previewDoc,
  markdownComponents,
  onCancelHardwareDelete,
  onConfirmHardwareDelete,
  onCancelServiceDelete,
  onConfirmServiceDelete,
  onCancelStorageDelete,
  onConfirmStorageDelete,
  onCancelDocDelete,
  onConfirmDocDelete,
  onCloseDocPreview
}: OverviewOverlaysProps) {
  return (
    <>
      <DeleteWarning
        isOpen={Boolean(pendingHardwareDelete)}
        title={`Delete ${pendingHardwareDelete?.name || 'hardware'}?`}
        description="Related child entries will be removed too."
        impacts={pendingHardwareDelete ? [
          { label: 'deployment(s)', count: pendingHardwareDelete.deployments },
          { label: 'service(s)', count: pendingHardwareDelete.services },
          { label: 'storage item(s)', count: pendingHardwareDelete.storage },
          { label: 'markdown doc(s)', count: pendingHardwareDelete.docs }
        ] : []}
        previewSections={pendingHardwareDelete ? [
          {
            label: 'Services',
            items: pendingHardwareDelete.servicePreview,
            hasMore: pendingHardwareDelete.services > pendingHardwareDelete.servicePreview.length
          },
          {
            label: 'Docs',
            items: pendingHardwareDelete.docPreview,
            hasMore: pendingHardwareDelete.docs > pendingHardwareDelete.docPreview.length
          }
        ] : []}
        warningText={pendingHardwareDelete && pendingHardwareDelete.externalImpact > 0
          ? `${pendingHardwareDelete.externalImpact} deployment(s) on other hardware are also affected.`
          : undefined}
        onCancel={onCancelHardwareDelete}
        onConfirm={onConfirmHardwareDelete}
      />

      <DeleteWarning
        isOpen={Boolean(pendingServiceDelete)}
        title={`Delete ${pendingServiceDelete?.name || 'service'}?`}
        description="The service and all dependent child entries will be removed."
        impacts={pendingServiceDelete ? [
          { label: 'service', count: 1 },
          { label: 'deployment(s)', count: pendingServiceDelete.deployments },
          { label: 'storage item(s)', count: pendingServiceDelete.storage },
          { label: 'markdown doc(s)', count: pendingServiceDelete.docs }
        ] : []}
        previewSections={pendingServiceDelete ? [
          {
            label: 'Deployments on hardware',
            items: pendingServiceDelete.deploymentPreview,
            hasMore: pendingServiceDelete.deployments > pendingServiceDelete.deploymentPreview.length
          },
          {
            label: 'Docs',
            items: pendingServiceDelete.docPreview,
            hasMore: pendingServiceDelete.docs > pendingServiceDelete.docPreview.length
          }
        ] : []}
        warningText={pendingServiceDelete && pendingServiceDelete.hardwareImpact > 1
          ? `This service is deployed on ${pendingServiceDelete.hardwareImpact} hardware nodes.`
          : undefined}
        onCancel={onCancelServiceDelete}
        onConfirm={onConfirmServiceDelete}
      />

      <DeleteWarning
        isOpen={Boolean(pendingStorageDelete)}
        title={`Delete ${pendingStorageDelete?.name || 'storage item'}?`}
        description="Only this storage entry will be removed."
        impacts={[{ label: 'storage item', count: pendingStorageDelete ? 1 : 0 }]}
        previewSections={pendingStorageDelete ? [
          {
            label: 'Linked hardware',
            items: pendingStorageDelete.hardwareName ? [pendingStorageDelete.hardwareName] : []
          },
          {
            label: 'Linked service',
            items: pendingStorageDelete.serviceName ? [pendingStorageDelete.serviceName] : []
          }
        ] : []}
        onCancel={onCancelStorageDelete}
        onConfirm={onConfirmStorageDelete}
      />

      <DeleteWarning
        isOpen={Boolean(pendingDocDelete)}
        title={`Delete ${pendingDocDelete?.title || 'document'}?`}
        description="Child markdown files are removed too."
        impacts={pendingDocDelete ? [
          { label: 'selected document', count: 1 },
          { label: 'child document(s)', count: pendingDocDelete.childCount }
        ] : []}
        previewSections={pendingDocDelete ? [
          {
            label: 'Child docs',
            items: pendingDocDelete.childPreview,
            hasMore: pendingDocDelete.childCount > pendingDocDelete.childPreview.length
          }
        ] : []}
        onCancel={onCancelDocDelete}
        onConfirm={onConfirmDocDelete}
      />

      <DocPreviewModal
        isOpen={Boolean(previewDoc)}
        doc={previewDoc}
        markdownComponents={markdownComponents}
        onClose={onCloseDocPreview}
      />
    </>
  );
}
