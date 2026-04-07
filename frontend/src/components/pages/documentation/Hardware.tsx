import { useState, useEffect } from 'react';
import { Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';

export default function Hardware() {
  const { token } = useAuth();
  const [hardware, setHardware] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('SERVER');
  const [status, setStatus] = useState('ONLINE');
  const [cpu, setCpu] = useState('');
  const [ram, setRam] = useState('');
  const [os, setOs] = useState('');
  const [ip, setIp] = useState('');
  const [mac, setMac] = useState('');
  const [notes, setNotes] = useState('');

  const fetchHardware = () => {
    if (!token) return;
    fetch('http://localhost:3001/api/infrastructure/hardware', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setHardware(data));
  };

  useEffect(() => {
    fetchHardware();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3001/api/infrastructure/hardware', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          type,
          status,
          cpu,
          ram: ram ? parseInt(ram, 10) : null,
          os,
          ip,
          mac,
          notes
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchHardware();
        // Reset form
        setName(''); setType('SERVER'); setStatus('ONLINE'); setCpu(''); setRam(''); setOs(''); setIp(''); setMac(''); setNotes('');
      } else {
        const errorData = await res.json();
        alert('Error: ' + errorData.error);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to add hardware');
    }
  };

  return (
    <div className="p-6 max-w-4xl h-full overflow-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text">Hardware Assets</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg text-white transition-colors">+ Add Hardware</button>
      </div>
      <Card className="border border-border bg-content p-0 overflow-hidden">
         <table className="w-full text-left">
           <thead>
             <tr className="bg-background border-b border-border">
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Name</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Type</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Status</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">IP</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">OS</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-border">
             {hardware.map(hw => (
               <tr key={hw.id} className="hover:bg-background/50 transition-colors">
                 <td className="px-4 py-3 font-medium text-text">{hw.name}</td>
                 <td className="px-4 py-3 text-text-secondary text-sm">{hw.type}</td>
                 <td className="px-4 py-3">
                   <span className={`px-2 py-1 text-xs rounded-full ${hw.status === 'ONLINE' ? 'bg-green-500/20 text-green-400' : hw.status === 'OFFLINE' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                     {hw.status}
                   </span>
                 </td>
                 <td className="px-4 py-3 text-text-secondary text-sm">{hw.ip || '-'}</td>
                 <td className="px-4 py-3 text-text-secondary text-sm">{hw.os || '-'}</td>
               </tr>
             ))}
           </tbody>
         </table>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text">Add New Hardware</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1">Name *</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Type</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary appearance-none">
                    <option value="SERVER">Server</option>
                    <option value="PI">Raspberry Pi</option>
                    <option value="NAS">NAS</option>
                    <option value="ROUTER">Router/Switch</option>
                    <option value="VM_HOST">VM Host</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary appearance-none">
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">IP Address</label>
                  <input type="text" value={ip} onChange={e => setIp(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">MAC Address</label>
                  <input type="text" value={mac} onChange={e => setMac(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">CPU</label>
                  <input type="text" value={cpu} onChange={e => setCpu(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">RAM (MB)</label>
                  <input type="number" value={ram} onChange={e => setRam(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1">Operating System</label>
                  <input type="text" value={os} onChange={e => setOs(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1">Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary min-h-[80px]" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-text-secondary hover:text-text transition-colors">Cancel</button>
                <button type="submit" className="bg-primary hover:bg-primary/90 px-6 py-2 rounded-lg text-white transition-colors">Save Hardware</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
