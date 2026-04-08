import { useState, useEffect } from 'react';
import { Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';

export default function Services() {
  const { token } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('DOCKER');
  const [version, setVersion] = useState('');
  const [port, setPort] = useState('');
  const [domain, setDomain] = useState('');

  const fetchServices = () => {
    if (!token) return;
    fetch('http://localhost:3001/api/infrastructure/services', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setServices(data));
  };

  useEffect(() => {
    fetchServices();
  }, [token]);

  const handleEdit = (sv: any) => {
    setEditId(sv.id);
    setName(sv.name || '');
    setDescription(sv.description || '');
    setType(sv.type || 'DOCKER');
    setVersion(sv.version || '');
    setPort(sv.port ? sv.port.toString() : '');
    setDomain(sv.domain || '');
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditId(null);
    setName(''); setDescription(''); setType('DOCKER'); setVersion(''); setPort(''); setDomain('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const url = editId ? `http://localhost:3001/api/infrastructure/services/${editId}` : 'http://localhost:3001/api/infrastructure/services';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description,
          type,
          version,
          port: port ? parseInt(port, 10) : null,
          domain
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchServices();
      } else {
        const errorData = await res.json();
        alert('Error: ' + errorData.error);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to save service');
    }
  };

  return (
    <div className="p-6 max-w-4xl h-full overflow-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text">Software Services</h2>
        <button onClick={handleAdd} className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg text-white transition-colors">+ Add Service</button>
      </div>
      <Card className="border border-border bg-content p-0 overflow-hidden">
         <table className="w-full text-left">
           <thead>
             <tr className="bg-background border-b border-border">
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Name</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Type</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Port</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Domain</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary text-right">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-border">
             {services.map(sw => (
               <tr key={sw.id} className="hover:bg-background/50 transition-colors">
                 <td className="px-4 py-3 font-medium text-text">{sw.name}</td>
                 <td className="px-4 py-3 text-text-secondary text-sm">{sw.type}</td>
                 <td className="px-4 py-3 text-text-secondary font-mono text-sm">{sw.port || '-'}</td>
                 <td className="px-4 py-3 text-primary text-sm">{sw.domain ? <a href={`https://${sw.domain}`} target="_blank" rel="noreferrer" className="hover:underline">{sw.domain}</a> : '-'}</td>
                 <td className="px-4 py-3 text-right">
                   <button onClick={() => handleEdit(sw)} className="text-primary hover:text-primary/80 text-sm font-medium">Edit</button>
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
              <h3 className="text-xl font-bold text-text">{editId ? 'Edit Service' : 'Add New Service'}</h3>
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
                <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary min-h-[80px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Type</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary appearance-none">
                    <option value="DOCKER">Docker</option>
                    <option value="LXC">LXC</option>
                    <option value="BARE_METAL">Bare Metal</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Version</label>
                  <input type="text" value={version} onChange={e => setVersion(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Port</label>
                  <input type="number" value={port} onChange={e => setPort(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Domain</label>
                  <input type="text" value={domain} onChange={e => setDomain(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-text-secondary hover:text-text transition-colors">Cancel</button>
                <button type="submit" className="bg-primary hover:bg-primary/90 px-6 py-2 rounded-lg text-white transition-colors">Save Service</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
