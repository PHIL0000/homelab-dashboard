import { useMemo, useState, useEffect } from 'react';
import { Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';

type DocItem = {
  id: string;
  title: string;
  parentDocId?: string | null;
  softwareUnitId?: string | null;
};

export default function Services() {
  const { token } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [storageItems, setStorageItems] = useState<any[]>([]);
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
    deployments: number;
    storage: number;
    markdownCount: number;
    markdownPreview: string[];
  } | null>(null);

  const fetchServices = () => {
    if (!token) return;
    Promise.all([
      fetch('http://localhost:3001/api/infrastructure/services', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('http://localhost:3001/api/infrastructure/deployments', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('http://localhost:3001/api/infrastructure/storage', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('http://localhost:3001/api/infrastructure/docs', { headers: { Authorization: `Bearer ${token}` } })
    ])
      .then(async ([servicesRes, deploymentsRes, storageRes, docsRes]) => {
        setServices(await servicesRes.json());
        setDeployments(await deploymentsRes.json());
        setStorageItems(await storageRes.json());
        setDocs(await docsRes.json());
      });
  };

  useEffect(() => {
    fetchServices();
  }, [token]);

  const deploymentCountByService = useMemo(() => {
    const counts = new Map<string, number>();
    for (const dep of deployments) {
      const key = dep.softwareUnitId;
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts;
  }, [deployments]);

  const collectDocSubtreeIds = (rootIds: string[]) => {
    const childrenByParent = new Map<string, string[]>();
    for (const doc of docs) {
      if (!doc.parentDocId) continue;
      const existing = childrenByParent.get(doc.parentDocId) || [];
      existing.push(doc.id);
      childrenByParent.set(doc.parentDocId, existing);
    }

    const seen = new Set<string>();
    const stack = [...rootIds];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (seen.has(current)) continue;
      seen.add(current);

      const children = childrenByParent.get(current) || [];
      for (const childId of children) {
        if (!seen.has(childId)) stack.push(childId);
      }
    }

    return Array.from(seen);
  };

  const requestDeleteService = (service: any) => {
    if (!token) return;

    const relatedDeployments = deployments.filter((dep) => String(dep.softwareUnitId) === String(service.id));
    const relatedStorage = storageItems.filter((item) => String(item.softwareUnitId) === String(service.id));
    const serviceRootDocs = docs.filter((doc) => String(doc.softwareUnitId) === String(service.id));
    const docsToDeleteIds = collectDocSubtreeIds(serviceRootDocs.map((doc) => doc.id));
    const docsToDelete = docs.filter((doc) => docsToDeleteIds.includes(doc.id));

    setPendingDelete({
      id: String(service.id),
      name: service.name || 'Service',
      deployments: relatedDeployments.length,
      storage: relatedStorage.length,
      markdownCount: docsToDelete.length,
      markdownPreview: docsToDelete.map((doc) => doc.title).slice(0, 4)
    });
  };

  const confirmDeleteService = async () => {
    if (!token || !pendingDelete) return;

    const response = await fetch(`http://localhost:3001/api/infrastructure/services/${pendingDelete.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      alert(`Error: ${errorData.error || 'Failed to delete service'}`);
      return;
    }

    setPendingDelete(null);
    fetchServices();
  };

  return (
  <div className="documentation-area p-6 max-w-5xl h-full overflow-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text">Software/Services</h2>
      </div>
  <Card className="rounded-xl border border-border bg-content p-0 overflow-hidden">
         <table className="w-full text-left">
           <thead>
             <tr className="bg-background border-b border-border">
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Name</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Type</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Port</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Domain</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Deployments</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary text-right">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-border">
             {services.length === 0 && (
               <tr>
                 <td colSpan={6} className="px-4 py-6 text-center text-text-secondary">No services available.</td>
               </tr>
             )}
             {services.map(sw => (
               <tr key={sw.id} className="hover:bg-background/50 transition-colors">
                 <td className="px-4 py-3 font-medium text-text">{sw.name}</td>
                 <td className="px-4 py-3 text-text-secondary text-sm">{sw.type}</td>
                 <td className="px-4 py-3 text-text-secondary font-mono text-sm">{sw.port || '-'}</td>
                 <td className="px-4 py-3 text-primary text-sm">{sw.domain ? <a href={`https://${sw.domain}`} target="_blank" rel="noreferrer" className="hover:underline">{sw.domain}</a> : '-'}</td>
                 <td className="px-4 py-3 text-text-secondary text-sm">{deploymentCountByService.get(sw.id) || 0}</td>
                 <td className="px-4 py-3 text-right">
                   <button
                     onClick={() => requestDeleteService(sw)}
                     className="text-red-300 hover:text-red-200 text-sm font-medium"
                   >
                     Delete
                   </button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
      </Card>

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-content p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-text">Delete {pendingDelete.name}?</h3>
            <p className="mt-1 text-sm text-text-secondary">This will also remove related entries.</p>

            <ul className="mt-4 space-y-1.5 text-sm text-text-secondary">
              <li>• {pendingDelete.deployments} deployment(s)</li>
              <li>• {pendingDelete.storage} storage entry/entries</li>
              <li>• {pendingDelete.markdownCount} markdown doc(s) incl. childs</li>
            </ul>

            {pendingDelete.markdownPreview.length > 0 && (
              <p className="mt-3 text-xs text-text-secondary/90">
                Docs: {pendingDelete.markdownPreview.join(', ')}{pendingDelete.markdownCount > pendingDelete.markdownPreview.length ? ' …' : ''}
              </p>
            )}

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="px-3 py-1.5 text-sm text-text-secondary hover:text-text"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteService}
                className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
