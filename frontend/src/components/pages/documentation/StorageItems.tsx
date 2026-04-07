import { useState, useEffect } from 'react';
import { Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';

export default function StorageItems() {
  const { token } = useAuth();
  const [storageItems, setStorageItems] = useState<any[]>([]);
  const [hardware, setHardware] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [storageType, setStorageType] = useState('SSD');
  const [usableSpaceTB, setUsableSpaceTB] = useState<number | ''>('');
  const [hardwareAssetId, setHardwareAssetId] = useState('');

  const fetchData = async () => {
    if (!token) return;
    try {
      const [storageRes, hwRes] = await Promise.all([
        fetch('http://localhost:3001/api/infrastructure/storage', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3001/api/infrastructure/hardware', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStorageItems(await storageRes.json());
      setHardware(await hwRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3001/api/infrastructure/storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          storageType,
          usableSpaceTB: Number(usableSpaceTB),
          hardwareAssetId: hardwareAssetId || undefined
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
        setName(''); setStorageType('SSD'); setUsableSpaceTB(''); setHardwareAssetId('');
      } else {
        const errorData = await res.json();
        alert('Error: ' + errorData.error);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to add storage');
    }
  };

  return (
    <div className="p-6 max-w-4xl h-full overflow-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text">Storage</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg text-white transition-colors">+ Add Storage</button>
      </div>
      <Card className="border border-border bg-content p-0 overflow-hidden">
         <table className="w-full text-left">
           <thead>
             <tr className="bg-background border-b border-border">
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Name</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Type</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Size (TB)</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Hardware Node</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-border">
             {storageItems.length === 0 && (
               <tr><td colSpan={4} className="p-4 text-center text-text-secondary">No storage items found.</td></tr>
             )}
             {storageItems.map(item => (
               <tr key={item.id} className="hover:bg-background/50 transition-colors">
                 <td className="px-4 py-3 font-medium text-text">{item.name}</td>
                 <td className="px-4 py-3 text-text-secondary">{item.storageType}</td>
                 <td className="px-4 py-3 text-text-secondary">{item.usableSpaceTB} TB</td>
                 <td className="px-4 py-3 text-text-secondary">{item.hardwareAsset?.name || 'Unassigned'}</td>
               </tr>
             ))}
           </tbody>
         </table>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text">New Storage</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-text">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Name *</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Type *</label>
                <select required value={storageType} onChange={e => setStorageType(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary appearance-none">
                  <option value="SSD">SSD</option>
                  <option value="HDD">HDD</option>
                  <option value="NVME">NVMe</option>
                  <option value="NAS">NAS / Network</option>
                  <option value="USB">USB Drive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Usable Space (TB) *</label>
                <input required type="number" step="0.1" value={usableSpaceTB} onChange={e => setUsableSpaceTB(e.target.value ? Number(e.target.value) : '')} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Assigned Hardware</label>
                <select value={hardwareAssetId} onChange={e => setHardwareAssetId(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary appearance-none">
                  <option value="">None / Unassigned</option>
                  {hardware.map(hw => <option key={hw.id} value={hw.id}>{hw.name}</option>)}
                </select>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-text-secondary hover:text-text transition-colors">Cancel</button>
                <button type="submit" className="bg-primary flex-1 hover:bg-primary/90 px-6 py-2 rounded-lg text-white transition-colors">Add Storage</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
