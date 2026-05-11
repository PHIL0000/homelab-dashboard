import { useEffect, useState } from "react";
import {
  Button,
  Input,
  ListBox,
  Modal,
  Select,
  useOverlayState,
} from "@heroui/react";
import { ChevronDown } from "lucide-react";

export const STORAGE_TYPE_OPTIONS = [
  "SSD",
  "HDD",
  "SD",
  "EMMC",
  "USB_FLASH",
  "OPTICAL",
  "TAPE",
  "OTHER",
] as const;
export const STORAGE_INTERFACE_OPTIONS = [
  "SATA",
  "SAS",
  "NVME M.2",
  "SATA NVME",
  "U.2/U.3 NVME",
  "PCIE",
  "USB",
  "THUNDERBOLT",
  "SDIO",
  "EMMC",
  "ISCSI",
  "FIBRE_CHANNEL",
  "OTHER",
] as const;

export const STORAGE_TYPE_LABELS: Record<(typeof STORAGE_TYPE_OPTIONS)[number], string> = {
  SSD: "SSD",
  HDD: "HDD",
  SD: "SD Card",
  EMMC: "eMMC",
  USB_FLASH: "USB Flash",
  OPTICAL: "Optical Disc",
  TAPE: "Tape",
  OTHER: "Other",
};

export const STORAGE_INTERFACE_LABELS: Record<
  (typeof STORAGE_INTERFACE_OPTIONS)[number],
  string
> = {
  SATA: "SATA",
  SAS: "SAS",
  "NVME M.2": "NVMe M.2",
  "SATA NVME": "SATA NVMe",
  "U.2/U.3 NVME": "U.2/U.3 NVMe",
  PCIE: "PCIe",
  USB: "USB",
  THUNDERBOLT: "Thunderbolt",
  SDIO: "SDIO",
  EMMC: "eMMC",
  ISCSI: "iSCSI",
  FIBRE_CHANNEL: "Fibre Channel",
  OTHER: "Other",
};

export const getStorageTypeLabel = (value: string | null | undefined) => {
  if (!value) return "-";
  return STORAGE_TYPE_LABELS[value as StorageTypeOption] || value;
};

export const getStorageInterfaceLabel = (value: string | null | undefined) => {
  if (!value) return "-";
  return STORAGE_INTERFACE_LABELS[value as StorageInterfaceOption] || value;
};

export type StorageTypeOption = (typeof STORAGE_TYPE_OPTIONS)[number];
export type StorageInterfaceOption = (typeof STORAGE_INTERFACE_OPTIONS)[number];

type SelectOption = {
  id: string;
  name: string;
};

export type StorageFormValues = {
  name: string;
  type: StorageTypeOption;
  make: string;
  model: string;
  serialNumber: string;
  interfaceType: StorageInterfaceOption;
  usableSpace: number | "";
  spaceUnit: "GB" | "TB";
  hardwareAssetId: string;
  softwareUnitIds: string[];
};

type AddStorageProps = {
  isOpen: boolean;
  hardwareOptions?: SelectOption[];
  serviceOptions?: SelectOption[];
  initialValues?: Partial<StorageFormValues>;
  onClose: () => void;
  onSave: (values: StorageFormValues) => void | Promise<void>;
};

export default function AddStorage({
  isOpen,
  hardwareOptions,
  serviceOptions,
  initialValues,
  onClose,
  onSave,
}: AddStorageProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<StorageTypeOption>("SSD");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [interfaceType, setInterfaceType] = useState<StorageInterfaceOption>("SATA");
  const [usableSpace, setUsableSpace] = useState<number | "">("");
  const [spaceUnit, setSpaceUnit] = useState<"GB" | "TB">("GB");
  const [hardwareAssetId, setHardwareAssetId] = useState("");
  const [softwareUnitIds, setSoftwareUnitIds] = useState<string[]>([]);
  const [servicePickerKey, setServicePickerKey] = useState("picker-none");

  const state = useOverlayState({
    isOpen,
    onOpenChange: (open) => !open && onClose(),
  });

  useEffect(() => {
    if (!isOpen) return;
    setName(initialValues?.name || "");
    setType((initialValues?.type as StorageTypeOption) || "SSD");
    setMake(initialValues?.make || "");
    setModel(initialValues?.model || "");
    setSerialNumber(initialValues?.serialNumber || "");
    setInterfaceType((initialValues?.interfaceType as StorageInterfaceOption) || "SATA");
    setUsableSpace(initialValues?.usableSpace ?? "");
    setSpaceUnit(initialValues?.spaceUnit || "GB");
    setHardwareAssetId(initialValues?.hardwareAssetId || "");
    setSoftwareUnitIds(
      Array.isArray(initialValues?.softwareUnitIds) ? initialValues.softwareUnitIds : [],
    );
    setServicePickerKey("picker-none");
  }, [isOpen, initialValues]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      softwareUnitIds,
    });
  };

  const addServiceId = (serviceId: string) => {
    setSoftwareUnitIds((prev) =>
      prev.includes(serviceId) ? prev : [...prev, serviceId],
    );
    setServicePickerKey("picker-none");
  };

  const removeServiceId = (serviceId: string) => {
    setSoftwareUnitIds((prev) => prev.filter((id) => id !== serviceId));
  };

  return (
    <Modal state={state}>
      <Modal.Backdrop className="doc-theme-form bg-black/60 backdrop-blur-sm">
        <Modal.Container size="md" placement="center">
          <Modal.Dialog className="rounded-xl border border-slate-700/50 bg-slate-900/50 shadow-2xl">
            <Modal.Header className="px-5 py-4 border-b border-slate-700/50 bg-slate-800 flex items-center justify-between">
              <Modal.Heading className="text-lg font-semibold text-slate-100">
                Add Storage
              </Modal.Heading>
              <Modal.CloseTrigger
                aria-label="Close"
                className="text-slate-400 hover:text-text"
              />
            </Modal.Header>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {!!hardwareOptions?.length && (
                <label className="space-y-1 block">
                  <span className="text-xs text-slate-400">Hardware</span>
                  <Select
                    selectedKey={hardwareAssetId || "unassigned"}
                    onChange={(key) => {
                      if (key != null)
                        setHardwareAssetId(
                          String(key) === "unassigned" ? "" : String(key),
                        );
                    }}
                    className="w-full"
                  >
                    <Select.Trigger className="w-full px-3 flex items-center justify-between">
                      <Select.Value />
                      <ChevronDown size={16} className="text-slate-400" />
                    </Select.Trigger>
                    <Select.Popover className="w-[var(--trigger-width)]">
                      <ListBox>
                        <ListBox.Item id="unassigned" className="pl-2">
                          Select hardware
                        </ListBox.Item>
                        {hardwareOptions.map((option) => (
                          <ListBox.Item key={option.id} id={option.id} className="pl-2">
                            {option.name}
                          </ListBox.Item>
                        ))}
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
                      if (value === "picker-none") return;
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
                        <ListBox.Item id="picker-none" className="pl-2">
                          Select service to add
                        </ListBox.Item>
                        {serviceOptions.map((option) => (
                          <ListBox.Item key={option.id} id={option.id} className="pl-2">
                            {option.name}
                          </ListBox.Item>
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
                          const label =
                            serviceOptions.find((option) => option.id === serviceId)
                              ?.name || serviceId;
                          return (
                            <span
                              key={serviceId}
                              className="group inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-800/70 px-2.5 py-1 text-xs text-slate-100"
                            >
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
                  <p className="text-[11px] text-slate-400">
                    Add one by one via dropdown. Remove via x on tag hover.
                  </p>
                </div>
              )}

              <label className="space-y-1 block">
                <span className="text-xs text-slate-400">Name *</span>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full"
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-xs text-slate-400">Type</span>
                  <Select
                    selectedKey={type}
                    onChange={(key) => {
                      if (key != null) setType(String(key) as StorageTypeOption);
                    }}
                    className="w-full"
                  >
                    <Select.Trigger className="w-full px-3 flex items-center justify-between">
                      <Select.Value />
                      <ChevronDown size={16} className="text-slate-400" />
                    </Select.Trigger>
                    <Select.Popover className="w-[var(--trigger-width)]">
                      <ListBox>
                        {STORAGE_TYPE_OPTIONS.map((option) => (
                          <ListBox.Item key={option} id={option} className="pl-2">
                            {STORAGE_TYPE_LABELS[option]}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-slate-400">Interface</span>
                  <Select
                    selectedKey={interfaceType}
                    onChange={(key) => {
                      if (key != null)
                        setInterfaceType(String(key) as StorageInterfaceOption);
                    }}
                    className="w-full"
                  >
                    <Select.Trigger className="w-full px-3 flex items-center justify-between">
                      <Select.Value />
                      <ChevronDown size={16} className="text-slate-400" />
                    </Select.Trigger>
                    <Select.Popover className="w-[var(--trigger-width)]">
                      <ListBox>
                        {STORAGE_INTERFACE_OPTIONS.map((option) => (
                          <ListBox.Item key={option} id={option} className="pl-2">
                            {STORAGE_INTERFACE_LABELS[option]}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-slate-400">Make</span>
                  <Input
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-slate-400">Model</span>
                  <Input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-slate-400">Serial Number</span>
                  <Input
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="space-y-1">
                    <span className="text-xs text-slate-400">Usable Space</span>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={usableSpace === "" ? "" : String(usableSpace)}
                      onChange={(e) =>
                        setUsableSpace(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      className="w-full"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-slate-400">Unit</span>
                    <Select
                      selectedKey={spaceUnit}
                      onChange={(key) => {
                        if (key != null) setSpaceUnit(String(key) as "GB" | "TB");
                      }}
                      className="w-full"
                    >
                      <Select.Trigger className="w-full px-3 flex items-center justify-between">
                        <Select.Value />
                        <ChevronDown size={16} className="text-slate-400" />
                      </Select.Trigger>
                      <Select.Popover className="w-[var(--trigger-width)]">
                        <ListBox>
                          <ListBox.Item id="GB" className="pl-2">
                            GB
                          </ListBox.Item>
                          <ListBox.Item id="TB" className="pl-2">
                            TB
                          </ListBox.Item>
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </label>
                </div>
              </div>

              <Modal.Footer className="pt-4 border-t border-slate-700/50 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="ghost"
                  className="px-3 py-1.5 text-sm text-slate-400 hover:text-text"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="text-sm px-3 py-2 rounded-lg bg-purple-600 text-white font-medium hover:shadow-[0_0_15px_rgba(168,_85,_247,_0.5)] transition-all"
                >
                  Save Storage
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
