import { useState, useEffect } from 'react';
import { Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';

export default function Deployments() {
  const { token } = useAuth();
  const [deployments, setDeployments] = useState<any[]>([]);
  const [hardware, setHardware] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [hardwareAssetId, setHardwareAssetId] = useState('');
  const [softwareUnitId, setSoftwareUnitId] = useState('');
  const [internalIp, setInternalIp] = useState('');
  const [status, setStatus] = useState('RUNNING');

  const fetchData = async () => {
    if (!token) return;
    try {
      const [depsRes, hwRes, swRes] = await Promise.all([
        fetch('http://localhost:3001/api/infrastructure/deployments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3001/api/infrastructure/hardware', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3001/api/infrastructure/services', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setDeployments(await depsRes.json());
      setHardware(await hwRes.json());
      setServices(await swRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleEdit = (dep: any) => {
    setEditId(dep.id);
    setHardwareAssetId(dep.hardwareAssetId || '');
    setSoftwareUnitId(dep.softwareUnitId || '');
    setInternalIp(dep.internalIp || '');
    setStatus(dep.status || 'RUNNING');
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditId(null);
    setHardwareAssetId(''); setSoftwareUnitId(''); setInternalIp(''); setStatus('RUNNING');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const url = editId ? `http://localhost:3001/api/infrastructure/deployments/${editId}` : 'http://localhost:3001/api/infrastructure/deployments';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          hardwareAssetId,
          softwareUnitId,
          internalIp,
          status
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const errorData = await res.json();
        alert('Error: ' + errorData.error);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to save deployment');
    }
  };

  const handleDelete = async () => {
    if (!token || !editId) return;
    if (!window.confirm('Delete this deployment?')) return;

    try {
      const res = await fetch(`http://localhost:3001/api/infrastructure/deployments/${editId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditId(null);
        fetchData();
      } else {
        const errorData = await res.json();
        alert('Error: ' + (errorData.error || 'Failed to delete deployment'));
      }
    } catch (error) {
      console.error(error);
      alert('Failed to delete deployment');
    }
  };

  return (
  <div className="documentation-area p-6 max-w-4xl h-full overflow-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text">Deployments</h2>
        <button onClick={handleAdd} className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg text-white transition-colors">+ Add Deployment</button>
      </div>
  <Card className="rounded-xl border border-border bg-content p-0 overflow-hidden">
         <table className="w-full text-left">
           <thead>
             <tr className="bg-background border-b border-border">
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Service</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Hardware</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Internal IP</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Status</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary text-right">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-border">
             {deployments.length === 0 && (
               <tr><td colSpan={5} className="p-4 text-center text-text-secondary">No deployments found.</td></tr>
             )}
             {deployments.map(dep => (
               <tr key={dep.id} className="hover:bg-background/50 transition-colors">
                 <td className="px-4 py-3 font-medium text-text">{dep.softwareUnit?.name}</td>
                 <td className="px-4 py-3 text-text-secondary">{dep.hardwareAsset?.name}</td>
                 <td className="px-4 py-3 text-text-secondary text-sm font-mono">{dep.internalIp || '-'}</td>
                 <td className="px-4 py-3">
                   <span className={`px-2 py-1 text-xs rounded-full ${dep.status === 'RUNNING' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                     {dep.status || 'UNKNOWN'}
                   </span>
                 </td>
                 <td className="px-4 py-3 text-right">
                   <button onClick={() => handleEdit(dep)} className="text-primary hover:text-primary/80 text-sm font-medium">Edit</button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text">{editId ? 'Edit Deployment' : 'New Deployment'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Service *</label>
                <select required value={softwareUnitId} onChange={e => setSoftwareUnitId(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary appearance-none">
                  <option value="" disabled>Select a service</option>
                  {services.map(sw => <option key={sw.id} value={sw.id}>{sw.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Hardware Asset *</label>
                <select required value={hardwareAssetId} onChange={e => setHardwareAssetId(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary appearance-none">
                  <option value="" disabled>Select hardware</option>
                  {hardware.map(hw => <option key={hw.id} value={hw.id}>{hw.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Internal IP / Address</label>
                <input type="text" value={internalIp} onChange={e => setInternalIp(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary appearance-none">
                  <option value="RUNNING">Running</option>
                  <option value="STOPPED">Stopped</option>
                  <option value="ERROR">Error</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                {editId && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="mr-auto px-4 py-2 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-text-secondary hover:text-text transition-colors">Cancel</button>
                <button type="submit" className="bg-primary flex-1 hover:bg-primary/90 px-6 py-2 rounded-lg text-white transition-colors">Save Deployment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
