import { useState, useEffect } from 'react';
import { Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';

export default function MarkdownDocs() {
  const { token } = useAuth();
  const [docs, setDocs] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fetchData = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3001/api/infrastructure/docs', { headers: { Authorization: `Bearer ${token}` } });
      setDocs(await res.json());
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
      const res = await fetch('http://localhost:3001/api/infrastructure/docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
        setTitle(''); setContent('');
      } else {
        const errorData = await res.json();
        alert('Error: ' + errorData.error);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to add document');
    }
  };

  return (
    <div className="p-6 max-w-6xl h-full overflow-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text">Markdown Documents</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg text-white transition-colors">+ Add Document</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.length === 0 && <p className="text-text-secondary">No documents found.</p>}
        {docs.map(doc => (
          <Card key={doc.id} className="border border-border bg-content p-6">
             <h3 className="text-xl font-bold text-text mb-2 break-words">{doc.title}</h3>
             <div className="text-sm text-text-secondary whitespace-pre-wrap break-words">{doc.content}</div>
          </Card>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text">New Document</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-text">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 flex flex-col flex-1 overflow-hidden">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Title *</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary" />
              </div>
              <div className="flex-1 flex flex-col mb-4">
                <label className="block text-sm font-medium text-text-secondary mb-1">Markdown Content *</label>
                <textarea required value={content} onChange={e => setContent(e.target.value)} className="w-full flex-1 bg-content border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary font-mono text-sm resize-none"></textarea>
              </div>
              
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-text-secondary hover:text-text transition-colors">Cancel</button>
                <button type="submit" className="bg-primary flex-1 hover:bg-primary/90 px-6 py-2 rounded-lg text-white transition-colors">Save Document</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
