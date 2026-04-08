import { useState, useEffect } from 'react';
import { Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';

export default function MarkdownDocs() {
  const { token } = useAuth();
  const [docs, setDocs] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

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

  const handleEdit = (doc: any) => {
    setEditId(doc.id);
    setTitle(doc.title || '');
    setContent(doc.content || '');
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditId(null);
    setTitle(''); setContent('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const url = editId ? `http://localhost:3001/api/infrastructure/docs/${editId}` : 'http://localhost:3001/api/infrastructure/docs';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
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
      } else {
        const errorData = await res.json();
        alert('Error: ' + errorData.error);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to save document');
    }
  };

  return (
    <div className="p-6 max-w-6xl h-full overflow-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text">Markdown Documents</h2>
        <button onClick={handleAdd} className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg text-white transition-colors">+ Add Document</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.length === 0 && <p className="text-text-secondary">No documents found.</p>}
        {docs.map(doc => (
          <Card key={doc.id} className="border border-border bg-content p-6 flex flex-col relative group">
             <button onClick={() => handleEdit(doc)} className="absolute top-4 right-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
             </button>
             <h3 className="text-xl font-bold text-text mb-2 break-words pr-6">{doc.title}</h3>
             <div className="text-sm text-text-secondary whitespace-pre-wrap break-words flex-1 overflow-y-auto max-h-48">{doc.content}</div>
          </Card>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text">{editId ? 'Edit Document' : 'New Document'}</h3>
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
