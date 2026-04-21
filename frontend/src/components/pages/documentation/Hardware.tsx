import { useMemo, useState, useEffect } from "react";
import { Button, Card, Input, Select, ListBox } from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ChevronDown } from "lucide-react";
import AddHardware, { type HardwareFormValues } from "./components/AddHardware";
import EditHardware from "./components/EditHardware";

const API_BASE = "http://localhost:3001/api/infrastructure";

export default function Hardware() {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [hardware, setHardware] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [storageItems, setStorageItems] = useState<any[]>([]);

  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState(false);
  const [hardwareEditId, setHardwareEditId] = useState<string | null>(null);
  const [editingHardware, setEditingHardware] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token],
  );

  const fetchData = async () => {
    if (!token) return;

    const [hwRes, depRes, storageRes] = await Promise.all([
      fetch(`${API_BASE}/hardware`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_BASE}/deployments`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_BASE}/storage`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    setHardware(await hwRes.json());
    setDeployments(await depRes.json());
    setStorageItems(await storageRes.json());
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const saveHardware = async (values: HardwareFormValues) => {
    if (!token) return;

    const isEdit = Boolean(hardwareEditId);
    const url = isEdit
      ? `${API_BASE}/hardware/${hardwareEditId}`
      : `${API_BASE}/hardware`;
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: authHeaders,
      body: JSON.stringify({
        name: values.name,
        hostname: values.hostname || null,
        type: values.type,
        cpu: values.cpu,
        cpuCores: values.cpuCores ? parseInt(values.cpuCores, 10) : null,
        ram: values.ram ? parseInt(values.ram, 10) : null,
        os: values.os,
        ip: values.ip,
        mac: values.mac,
        make: values.make || null,
        model: values.model || null,
        serialNumber: values.serialNumber || null,
        location: values.location || null,
        icon: values.icon || null,
        notes: values.notes,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      alert(`Error: ${errorData.error || "Failed to save hardware"}`);
      return;
    }

    setIsHardwareModalOpen(false);
    setHardwareEditId(null);
    setEditingHardware(null);
    await fetchData();
  };

  const handleAddHardware = () => {
    setHardwareEditId(null);
    setEditingHardware(null);
    setIsHardwareModalOpen(true);
  };

  const handleEditHardware = (hw: any) => {
    setHardwareEditId(String(hw.id));
    setEditingHardware(hw);
    setIsHardwareModalOpen(true);
  };

  const deleteHardware = async () => {
    if (!token || !hardwareEditId) return;
    if (!window.confirm("Delete this hardware including its child entries?"))
      return;

    const response = await fetch(`${API_BASE}/hardware/${hardwareEditId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      alert(`Error: ${errorData.error || "Failed to delete hardware"}`);
      return;
    }

    setIsHardwareModalOpen(false);
    setHardwareEditId(null);
    setEditingHardware(null);
    await fetchData();
  };

  const deploymentCountByHardware = useMemo(() => {
    const counts = new Map<string, number>();
    for (const dep of deployments) {
      const key = dep.hardwareAssetId;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts;
  }, [deployments]);

  const storageCountByHardware = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of storageItems) {
      const key = item.hardwareAssetId;
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts;
  }, [storageItems]);

  const hardwareTypes = useMemo(
    () =>
      Array.from(
        new Set(hardware.map((hw) => String(hw.type || "OTHER"))),
      ).sort(),
    [hardware],
  );

  const hardwareStatuses = useMemo(
    () =>
      Array.from(
        new Set(hardware.map((hw) => String(hw.status || "UNKNOWN"))),
      ).sort(),
    [hardware],
  );

  const filteredHardware = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return hardware.filter((hw) => {
      const matchesSearch =
        query.length === 0 ||
        String(hw.name || "")
          .toLowerCase()
          .includes(query) ||
        String(hw.hostname || "")
          .toLowerCase()
          .includes(query) ||
        String(hw.ip || "")
          .toLowerCase()
          .includes(query) ||
        String(hw.os || "")
          .toLowerCase()
          .includes(query);
      const matchesType =
        typeFilter === "ALL" || String(hw.type || "OTHER") === typeFilter;
      const matchesStatus =
        statusFilter === "ALL" ||
        String(hw.status || "UNKNOWN") === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [hardware, searchTerm, typeFilter, statusFilter]);

  return (
    <div className="documentation-area page-shell">
      <div className="h-full flex flex-col min-h-0">
        <div className="page-header">
          <h2 className="page-title">{t("nav.docs.hardware")}</h2>
          <Button
            onClick={handleAddHardware}
            className="text-sm px-3 py-2 rounded-lg bg-purple-600 text-white font-medium hover:shadow-[0_0_15px_rgba(168, 85, 247, 0.5)] transition-all"
            variant="primary"
          >
            + Add hardware
          </Button>
        </div>

        <div className="space-y-6 page-content-scroll">
          <Card className="doc-theme-form rounded-xl p-4 bg-slate-900/50 border border-slate-700/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="space-y-1 block">
                <span className="text-xs text-slate-400">Search</span>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search name, host, IP, OS"
                  className="w-full"
                />
              </label>
              <label className="space-y-1 block">
                <span className="text-xs text-slate-400">Type</span>
                <Select
                  selectedKey={typeFilter}
                  onChange={(key) => {
                    if (key != null) setTypeFilter(String(key));
                  }}
                  className="w-full"
                >
                  <Select.Trigger className="w-full px-3 flex items-center justify-between">
                    <Select.Value />
                    <ChevronDown size={16} className="text-slate-400" />
                  </Select.Trigger>
                  <Select.Popover className="w-[var(--trigger-width)]">
                    <ListBox>
                      <ListBox.Item id="ALL" className="pl-2">
                        All types
                      </ListBox.Item>
                      {hardwareTypes.map((type) => (
                        <ListBox.Item key={type} id={type} className="pl-2">
                          {type}
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </label>
              <label className="space-y-1 block">
                <span className="text-xs text-slate-400">Status</span>
                <Select
                  selectedKey={statusFilter}
                  onChange={(key) => {
                    if (key != null) setStatusFilter(String(key));
                  }}
                  className="w-full"
                >
                  <Select.Trigger className="w-full px-3 flex items-center justify-between">
                    <Select.Value />
                    <ChevronDown size={16} className="text-slate-400" />
                  </Select.Trigger>
                  <Select.Popover className="w-[var(--trigger-width)]">
                    <ListBox>
                      <ListBox.Item id="ALL" className="pl-2">
                        All status
                      </ListBox.Item>
                      {hardwareStatuses.map((status) => (
                        <ListBox.Item key={status} id={status} className="pl-2">
                          {status}
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </label>
            </div>
          </Card>

          {filteredHardware.length === 0 && (
            <Card className="rounded-xl p-4 bg-slate-900/50 border border-slate-700/50 text-slate-400">
              No hardware entries available.
            </Card>
          )}

          {filteredHardware.map((hw) => (
            <Card
              key={hw.id}
              className="rounded-xl p-4 bg-slate-900/50 border border-slate-700/50 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-bold text-purple-400">
                  {hw.name}{" "}
                  <span className="text-sm text-slate-400">({hw.type})</span>
                </h3>
                <Button
                  type="button"
                  onClick={() => handleEditHardware(hw)}
                  className="text-xs text-purple-400 hover:text-purple-400/80 !border-0 !border-transparent !ring-0 !shadow-none"
                  variant="ghost"
                >
                  Edit
                </Button>
              </div>
              <p className="text-sm text-slate-400">
                {hw.ip || "-"} • {hw.os || "-"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div className="p-3 border border-slate-700/50 rounded-lg bg-slate-800">
                  <p className="text-xs text-slate-400">RAM</p>
                  <p className="font-semibold text-slate-100">
                    {hw.ram ? `${hw.ram} GB` : "-"}
                  </p>
                </div>
                <div className="p-3 border border-slate-700/50 rounded-lg bg-slate-800">
                  <p className="text-xs text-slate-400">Services (deployed)</p>
                  <p className="font-semibold text-slate-100">
                    {deploymentCountByHardware.get(hw.id) || 0}
                  </p>
                </div>
                <div className="p-3 border border-slate-700/50 rounded-lg bg-slate-800">
                  <p className="text-xs text-slate-400">Storage Items</p>
                  <p className="font-semibold text-slate-100">
                    {storageCountByHardware.get(hw.id) || 0}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {hardwareEditId ? (
        <EditHardware
          isOpen={isHardwareModalOpen}
          hardware={editingHardware}
          onClose={() => setIsHardwareModalOpen(false)}
          onSave={saveHardware}
          onDelete={deleteHardware}
        />
      ) : (
        <AddHardware
          isOpen={isHardwareModalOpen}
          onClose={() => setIsHardwareModalOpen(false)}
          onSave={saveHardware}
        />
      )}
    </div>
  );
}
