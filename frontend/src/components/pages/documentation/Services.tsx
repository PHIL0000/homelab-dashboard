import { useState, useEffect } from 'react';
import { Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';

export default function Services() {
  const { token } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('DOCKER_CONTAINER');
  const [image, setImage] = useState('');
  const [port, setPort] = useState('');
  const [url, setUrl] = useState('');

  const fetchServices = () => {
    if (!token) return;
    fetch('http://localhost:3001/api/infrastructure/services', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setServices(data));
  };

  useEffect(() => {
    fetchServices();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3001/api/infrastructure/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          type,
          image,
          port: port ? parseInt(port, 10) : null,
          url
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchServices();
        // Reset form
        setName(''); setType('DOCKER_CONTAINER'); setImage(''); setPort(''); setUrl('');
      } else {
        const errorData = await res.json();
        alert('Error: ' + errorData.error);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to add service');
    }
  };

  return (
    <div className="p-6 max-w-4xl h-full overflow-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text">Software Services</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg text-white transition-colors">+ Add Service</button>
      </div>
      <Card className="border border-border bg-content p-0 overflow-hidden">
         <table className="w-full text-left">
           <thead>
             <tr className="bg-background border-b border-border">
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Name</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Type</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Image</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">Port</th>
               <th className="px-4 py-3 text-sm font-medium text-text-secondary">URL</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-border">
             {services.map(sw => (
               <tr key={sw.id} className="hover:bg-background/50 transition-colors">
                 <td className="px-4 py-3 font-medium text-text">{sw.name}</td>
                 <td className="px-4 py-3 text-text-secondary text-sm">
                   <span className="px-2 py-1 text-xs rounded-full bg-content border border-border text-text-secondary">
                     {sw.type.replace('_', ' ')}
                   </span>
                 </td>
                 <td className="px-4 py-3 text-text-secondary text-sm font-mono">{sw.image || '-'}</td>
                 <td className="px-4 py-3 text-text-secondary text-sm">{sw.port || '-'}</td>
                 <td className="px-4 py-3 text-primary text-sm flex items-center">
                    {sw.url ? <a href={sw.url} target="_blank" rel="noreferrer" className="hover:underline">{sw.url}</a> : '-'}
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
              <h3 className="text-xl font-bold text-text">Add New Service</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Service Name *</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Architecture Type</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary appearance-none">
                    <option value="DOCKER_CONTAINER">Docker Container</option>
                    <option value="VM">Virtual Machine</option>
                    <option value="POD">Kubernetes Pod</option>
                    <option value="BARE_METAL_SERVICE">Bare Metal Service</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Docker Image / OS Image</label>
                  <input type="text" value={image} onChange={e => setImage(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary font-mono text-sm" placeholder="e.g. linuxserver/nextcloud" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Default Port</label>
                    <input type="number" value={port} onChange={e => setPort(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" placeholder="8080" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Dashboard URL</label>
                    <input type="url" value={url} onChange={e => setUrl(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" placeholder="https://..." />
                  </div>
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
