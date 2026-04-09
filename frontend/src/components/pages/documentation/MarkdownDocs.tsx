import { useState, useEffect } from 'react';
import { Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';
import ReactMarkdown from 'react-markdown';

export default function MarkdownDocs() {
  const { token } = useAuth();
  const [docs, setDocs] = useState<any[]>([]);

  const fetchData = async () => {
    if (!token) return;
    try {
      const docsRes = await fetch('http://localhost:3001/api/infrastructure/docs', { headers: { Authorization: `Bearer ${token}` } });
      setDocs(await docsRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  return (
    <div className="p-6 max-w-6xl h-full overflow-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text">Markdown Documents (Overview)</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.length === 0 && <p className="text-text-secondary">No documents found.</p>}
        {docs.map(doc => (
          <Card key={doc.id} className="border border-border bg-content p-6 flex flex-col relative group">
             <h3 className="text-xl font-bold text-text mb-2 break-words pr-6">{doc.title}</h3>
             <div className="flex gap-2 mb-3 flex-wrap">
               {doc.hardwareAsset?.name && <span className="text-xs bg-primary/15 text-primary px-2 py-1 rounded-full">HW: {doc.hardwareAsset.name}</span>}
               {doc.softwareUnit?.name && <span className="text-xs bg-blue-500/15 text-blue-300 px-2 py-1 rounded-full">Service: {doc.softwareUnit.name}</span>}
             </div>
             <div className="text-sm text-text-secondary break-words flex-1 overflow-y-auto max-h-56 prose prose-invert prose-sm max-w-none">
               <ReactMarkdown>{doc.content || ''}</ReactMarkdown>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
