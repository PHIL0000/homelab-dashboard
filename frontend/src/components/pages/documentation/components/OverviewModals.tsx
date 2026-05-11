import AddHardware, { type HardwareFormValues } from "./AddHardware";
import AddService from "./AddService";
import AddStorage, { type StorageFormValues } from "./AddStorage";
import AddMarkdown, { type MarkdownFormValues } from "./AddMarkdown";
import EditHardware from "./EditHardware";
import EditService from "./EditService";
import EditStorage from "./EditStorage";
import EditMarkdown from "./EditMarkdown";

type OverviewModalsProps = {
  hardwareEditId: string | null;
  isHardwareModalOpen: boolean;
  editingHardware: any | null;
  onCloseHardwareModal: () => void;
  onSaveHardware: (values: HardwareFormValues) => void | Promise<void>;
  onDeleteHardware: () => void;
  defaultHardwareType: string;

  editingService: any | null;
  editingDeployment: any | null;
  isDeploymentModalOpen: boolean;
  hardware: any[];
  onCloseDeploymentModal: () => void;
  onSaveEditedService: (values: {
    serviceId: string;
    name: string;
    type: string;
    port: string;
    url: string;
    image: string;
    storageIds: string[];
    deploymentId?: string;
    hardwareAssetId: string;
    internalIp: string;
  }) => void | Promise<void>;
  onDeleteDeployment: () => void;
  newServiceName: string;
  newServiceType: string;
  newServicePort: string;
  newServiceUrl: string;
  newServiceImage: string;
  newServiceStorageIds: string[];
  newDeploymentInternalIp: string;
  onSaveNewDeployment: (e: React.FormEvent) => void | Promise<void>;
  onNewServiceNameChange: (value: string) => void;
  onNewServiceTypeChange: (value: string) => void;
  onNewServicePortChange: (value: string) => void;
  onNewServiceUrlChange: (value: string) => void;
  onNewServiceImageChange: (value: string) => void;
  onNewServiceStorageIdsChange: (value: string[]) => void;
  onNewDeploymentInternalIpChange: (value: string) => void;
  editingServiceStorageIds: string[];

  services: any[];
  storageItems: any[];

  storageEditId: string | null;
  isStorageModalOpen: boolean;
  editingStorage: any | null;
  selectedHardwareId: string;
  onCloseStorageModal: () => void;
  onSaveStorage: (values: StorageFormValues) => void | Promise<void>;
  onDeleteStorage: () => void;

  docEditId: string | null;
  isDocModalOpen: boolean;
  editingDoc: any | null;
  selectedServices: any[];
  docs: any[];
  markdownComponents: any;
  onCloseDocModal: () => void;
  onSaveDoc: (values: MarkdownFormValues) => void | Promise<void>;
  onDeleteDoc: () => void;
};

export default function OverviewModals({
  hardwareEditId,
  isHardwareModalOpen,
  editingHardware,
  onCloseHardwareModal,
  onSaveHardware,
  onDeleteHardware,
  defaultHardwareType,
  editingService,
  editingDeployment,
  isDeploymentModalOpen,
  hardware,
  onCloseDeploymentModal,
  onSaveEditedService,
  onDeleteDeployment,
  newServiceName,
  newServiceType,
  newServicePort,
  newServiceUrl,
  newServiceImage,
  newServiceStorageIds,
  newDeploymentInternalIp,
  onSaveNewDeployment,
  onNewServiceNameChange,
  onNewServiceTypeChange,
  onNewServicePortChange,
  onNewServiceUrlChange,
  onNewServiceImageChange,
  onNewServiceStorageIdsChange,
  onNewDeploymentInternalIpChange,
  editingServiceStorageIds,
  services,
  storageItems,
  storageEditId,
  isStorageModalOpen,
  editingStorage,
  selectedHardwareId,
  onCloseStorageModal,
  onSaveStorage,
  onDeleteStorage,
  docEditId,
  isDocModalOpen,
  editingDoc,
  selectedServices,
  docs,
  markdownComponents,
  onCloseDocModal,
  onSaveDoc,
  onDeleteDoc
}: OverviewModalsProps) {
  return (
    <>
      {hardwareEditId ? (
        <EditHardware
          isOpen={isHardwareModalOpen}
          hardware={editingHardware}
          onClose={onCloseHardwareModal}
          onSave={onSaveHardware}
          onDelete={onDeleteHardware}
        />
      ) : (
        <AddHardware
          isOpen={isHardwareModalOpen}
          onClose={onCloseHardwareModal}
          initialValues={{ type: defaultHardwareType }}
          onSave={onSaveHardware}
        />
      )}

      {editingService ? (
        <EditService
          isOpen={isDeploymentModalOpen}
          service={editingService}
          deployment={editingDeployment}
          hardwareOptions={hardware.map((hw) => ({ id: String(hw.id), name: hw.name }))}
          storageOptions={storageItems.map((item) => ({ id: String(item.id), name: item.name }))}
          initialStorageIds={editingServiceStorageIds}
          onClose={onCloseDeploymentModal}
          onSave={onSaveEditedService}
          onDelete={onDeleteDeployment}
        />
      ) : (
        <AddService
          isOpen={isDeploymentModalOpen}
          title="Add service to hardware"
          submitLabel="Save Deployment"
          name={newServiceName}
          type={newServiceType}
          port={newServicePort}
          url={newServiceUrl}
          image={newServiceImage}
          storageOptions={storageItems.map((item) => ({ id: String(item.id), name: item.name }))}
          selectedStorageIds={newServiceStorageIds}
          onSelectedStorageIdsChange={onNewServiceStorageIdsChange}
          internalIp={newDeploymentInternalIp}
          showInternalIp
          createHint="The new service will be created and directly linked to this hardware."
          onClose={onCloseDeploymentModal}
          onSubmit={onSaveNewDeployment}
          onNameChange={onNewServiceNameChange}
          onTypeChange={onNewServiceTypeChange}
          onPortChange={onNewServicePortChange}
          onUrlChange={onNewServiceUrlChange}
          onImageChange={onNewServiceImageChange}
          onInternalIpChange={onNewDeploymentInternalIpChange}
        />
      )}

      {storageEditId ? (
        <EditStorage
          isOpen={isStorageModalOpen}
          storage={editingStorage}
          hardwareOptions={hardware.map((hw) => ({ id: String(hw.id), name: hw.name }))}
          serviceOptions={services.map((service) => ({ id: String(service.id), name: service.name }))}
          onClose={onCloseStorageModal}
          onSave={onSaveStorage}
          onDelete={onDeleteStorage}
        />
      ) : (
        <AddStorage
          isOpen={isStorageModalOpen}
          initialValues={{ type: 'SSD', hardwareAssetId: selectedHardwareId }}
          hardwareOptions={hardware.map((hw) => ({ id: String(hw.id), name: hw.name }))}
          serviceOptions={services.map((service) => ({ id: String(service.id), name: service.name }))}
          onClose={onCloseStorageModal}
          onSave={onSaveStorage}
        />
      )}

      {docEditId ? (
        <EditMarkdown
          isOpen={isDocModalOpen}
          doc={editingDoc}
          hardwareOptions={hardware}
          serviceOptions={selectedServices}
          parentDocOptions={docs.filter((doc) => doc.id !== docEditId)}
          markdownComponents={markdownComponents}
          onClose={onCloseDocModal}
          onSave={onSaveDoc}
          onDelete={onDeleteDoc}
        />
      ) : (
        <AddMarkdown
          isOpen={isDocModalOpen}
          initialValues={{ hardwareAssetId: selectedHardwareId }}
          hardwareOptions={hardware}
          serviceOptions={selectedServices}
          parentDocOptions={docs.filter((doc) => doc.id !== docEditId)}
          markdownComponents={markdownComponents}
          onClose={onCloseDocModal}
          onSave={onSaveDoc}
        />
      )}
    </>
  );
}
