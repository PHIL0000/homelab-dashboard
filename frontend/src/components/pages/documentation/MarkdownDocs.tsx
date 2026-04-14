import { useState, useEffect, useMemo } from 'react';
import { Button, Card, Input } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';
import ReactMarkdown from 'react-markdown';
import AddMarkdown, { type MarkdownFormValues } from './components/AddMarkdown';
import EditMarkdown from './components/EditMarkdown';

const API_BASE = 'http://localhost:3001/api/infrastructure';

type DocItem = {
  id: string;
  title: string;
  content?: string;
  hardwareAssetId?: string | null;
  softwareUnitId?: string | null;
  parentDocId?: string | null;
  hardwareAsset?: { id: string; name: string } | null;
  softwareUnit?: { id: string; name: string } | null;
  parentDoc?: { id: string; title: string; parentDocId?: string | null } | null;
  children?: Array<{ id: string; title: string; parentDocId?: string | null }>;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const ensureMarkdownFilename = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return '';
  return normalized.toLowerCase().endsWith('.md') ? normalized : `${normalized}.md`;
};

export default function MarkdownDocs() {
  const { token } = useAuth();
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [hardware, setHardware] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docEditId, setDocEditId] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<DocItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [relationFilter, setRelationFilter] = useState<'ALL' | 'HARDWARE' | 'SERVICE' | 'UNASSIGNED'>('ALL');

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }), [token]);

  const docsById = useMemo(() => {
    return new Map(docs.map((doc) => [doc.id, doc]));
  }, [docs]);

  const topLevelDocs = useMemo(() => {
    return docs
      .filter((doc) => !doc.parentDocId)
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [docs]);

  const filteredTopLevelDocs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return topLevelDocs.filter((doc) => {
      const matchesSearch =
        query.length === 0 ||
        String(doc.title || '').toLowerCase().includes(query) ||
        String(doc.hardwareAsset?.name || '').toLowerCase().includes(query) ||
        String(doc.softwareUnit?.name || '').toLowerCase().includes(query);

      const matchesRelation =
        relationFilter === 'ALL' ||
        (relationFilter === 'HARDWARE' && Boolean(doc.hardwareAssetId)) ||
        (relationFilter === 'SERVICE' && Boolean(doc.softwareUnitId)) ||
        (relationFilter === 'UNASSIGNED' && !doc.hardwareAssetId && !doc.softwareUnitId);

      return matchesSearch && matchesRelation;
    });
  }, [topLevelDocs, searchTerm, relationFilter]);

  const selectedDoc = useMemo(() => docs.find((doc) => doc.id === selectedDocId) || null, [docs, selectedDocId]);

  const selectedDocChildren = useMemo(() => {
    if (!selectedDoc) return [];
    return docs
      .filter((doc) => doc.parentDocId === selectedDoc.id)
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [docs, selectedDoc]);

  const resolveInternalDoc = (rawHref?: string) => {
    if (!rawHref) return null;

    const href = decodeURIComponent(rawHref.trim());
    const cleanedHref = href.replace(/^\.?\//, '').replace(/^#/, '').replace(/\/$/, '');

    if (!cleanedHref) return null;

    if (cleanedHref.startsWith('doc:')) {
      const id = cleanedHref.replace(/^doc:\/?\/?/, '');
      return docsById.get(id) || null;
    }

    const direct = docsById.get(cleanedHref);
    if (direct) return direct;

    const normalized = slugify(cleanedHref);
    const normalizedWithExtension = `${normalized}.md`;
    const hrefLower = cleanedHref.toLowerCase();

    return (
      docs.find((doc) => {
        const titleSlug = slugify(doc.title);
        const titleSlugWithExtension = `${titleSlug}.md`;
        const titleLower = doc.title.toLowerCase();
        const titleWithExtensionLower = `${titleLower}.md`;
        const hrefSlug = slugify(cleanedHref);
        const hrefSlugWithExtension = `${hrefSlug}.md`;

        return (
          titleSlug === normalized ||
          titleSlug === hrefSlug ||
          titleSlugWithExtension === normalizedWithExtension ||
          titleSlugWithExtension === hrefSlugWithExtension ||
          titleSlugWithExtension === hrefLower ||
          titleLower === hrefLower ||
          titleWithExtensionLower === hrefLower
        );
      }) || null
    );
  };

  const markdownComponents = {
  h1: ({ children }: any) => <h1 className="text-lg font-bold text-text mt-3 mb-2">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-base font-bold text-text mt-3 mb-2">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-sm font-semibold text-text mt-2 mb-1">{children}</h3>,
  p: ({ children }: any) => <p className="text-sm text-slate-400 leading-relaxed mb-2">{children}</p>,
  ul: ({ children }: any) => <ul className="list-disc list-inside pl-2 space-y-1 text-sm text-slate-400">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal list-inside pl-2 space-y-1 text-sm text-slate-400">{children}</ol>,
  li: ({ children }: any) => <li>{children}</li>,
  strong: ({ children }: any) => <strong className="font-semibold text-slate-100">{children}</strong>,
  em: ({ children }: any) => <em className="italic text-slate-100">{children}</em>,
  code: ({ children }: any) => <code className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700/50 text-xs text-purple-400">{children}</code>,
  a: ({ href, children }: any) => {
    const internalDoc = resolveInternalDoc(href);
    if (internalDoc) {
      return (
        <Button
          type="button"
          onClick={() => setSelectedDocId(internalDoc.id)}
          className="text-purple-400 hover:text-purple-400/80 underline underline-offset-2 !border-0 !border-transparent !ring-0 !shadow-none"
          variant="ghost"
        >
          {children}
        </Button>
      );
    }

    return (
      <a href={href} target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-400/80 underline underline-offset-2">
        {children}
      </a>
    );
  }
};

  const fetchData = async () => {
    if (!token) return;
    try {
      const [docsRes, hardwareRes, servicesRes] = await Promise.all([
        fetch(`${API_BASE}/docs`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/hardware`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/services`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const docsData: DocItem[] = await docsRes.json();
      setHardware(await hardwareRes.json());
      setServices(await servicesRes.json());
      setDocs(docsData);

      if (docsData.length === 0) {
        setSelectedDocId('');
        return;
      }

      setSelectedDocId((current) => {
        if (current && docsData.some((doc) => doc.id === current)) {
          return current;
        }

        const firstTopLevel = docsData
          .filter((doc) => !doc.parentDocId)
          .sort((a, b) => a.title.localeCompare(b.title))[0];

        return firstTopLevel?.id || docsData[0].id;
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleAddDoc = () => {
    setDocEditId(null);
    setEditingDoc(null);
    setIsDocModalOpen(true);
  };

  const handleEditDoc = (doc: DocItem) => {
    setDocEditId(doc.id);
    setEditingDoc(doc);
    setIsDocModalOpen(true);
  };

  const saveDoc = async (values: MarkdownFormValues) => {
    if (!token) return;

    const normalizedTitle = ensureMarkdownFilename(values.title);
    if (!normalizedTitle) {
      alert('Title is required');
      return;
    }

    const url = docEditId
      ? `${API_BASE}/docs/${docEditId}`
      : `${API_BASE}/docs`;
    const method = docEditId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: authHeaders,
      body: JSON.stringify({
        title: normalizedTitle,
        content: values.content,
        hardwareAssetId: values.hardwareAssetId || undefined,
        softwareUnitId: values.softwareUnitId || undefined,
        parentDocId: values.parentDocId || undefined
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      alert(`Error: ${errorData.error || 'Failed to save markdown'}`);
      return;
    }

    setIsDocModalOpen(false);
    setDocEditId(null);
    setEditingDoc(null);
    await fetchData();
  };

  const deleteDoc = async () => {
    if (!token || !docEditId) return;
    if (!window.confirm('Delete this markdown document and all child docs?')) return;

    const response = await fetch(`${API_BASE}/docs/${docEditId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      alert(`Error: ${errorData.error || 'Failed to delete markdown'}`);
      return;
    }

    setIsDocModalOpen(false);
    setDocEditId(null);
    setEditingDoc(null);
    if (selectedDocId === docEditId) {
      setSelectedDocId('');
    }
    await fetchData();
  };

  return (
  <div className="documentation-area page-shell relative">
      <div className="h-full flex flex-col min-h-0">
        <div className="page-header">
          <h2 className="page-title">Markdown Documents</h2>
          <Button onClick={handleAddDoc} className="text-sm px-3 py-2 rounded-lg bg-purple-600 text-white font-medium hover:shadow-[0_0_15px_rgba(168, 85, 247, 0.5)] transition-all" variant="primary">+ Add markdown</Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 page-content-scroll">
  <Card className="xl:col-span-4 rounded-xl border border-slate-700/50 bg-slate-900/50 p-0 overflow-hidden h-fit">
          <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800 text-sm font-semibold text-slate-400">Top-Level Markdown Files</div>
          <div className="p-3 border-b border-slate-700/50 bg-slate-900/70 space-y-2">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, hardware, service"
              className="w-full"
            />
            <select
              value={relationFilter}
              onChange={(e) => setRelationFilter(e.target.value as 'ALL' | 'HARDWARE' | 'SERVICE' | 'UNASSIGNED')}
              className="w-full rounded-lg border border-slate-700/50 bg-slate-900 px-3 py-2 text-sm text-slate-200"
            >
              <option value="ALL">All relations</option>
              <option value="HARDWARE">Hardware-linked</option>
              <option value="SERVICE">Service-linked</option>
              <option value="UNASSIGNED">Unassigned</option>
            </select>
          </div>
          <div className="divide-y divide-border">
            {filteredTopLevelDocs.length === 0 && <p className="p-4 text-slate-400">No top-level markdown files found.</p>}
            {filteredTopLevelDocs.map((doc) => (
              <Button
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`w-full text-left px-4 py-3 transition-all border-l-4 !ring-0 !shadow-none ${selectedDocId === doc.id
                  ? 'bg-[color-mix(in_srgb,var(--color-primary)_24%,var(--color-content))] border-primary shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-primary)_46%,transparent)]'
                  : 'hover:bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] border-transparent'}`}
                variant="ghost"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`font-medium truncate ${selectedDocId === doc.id ? 'text-text' : 'text-text'}`}>{doc.title}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {doc.hardwareAsset?.name && <span className={`text-xs px-2 py-0.5 rounded-full ${selectedDocId === doc.id ? 'bg-[color-mix(in_srgb,var(--color-primary)_22%,transparent)] text-text' : 'bg-purple-600/15 text-purple-400'}`}>HW: {doc.hardwareAsset.name}</span>}
                      {doc.softwareUnit?.name && <span className={`text-xs px-2 py-0.5 rounded-full ${selectedDocId === doc.id ? 'bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] text-text' : 'bg-blue-500/15 text-blue-300'}`}>Service: {doc.softwareUnit.name}</span>}
                      {!doc.hardwareAssetId && !doc.softwareUnitId && <span className="text-xs bg-slate-800 border border-slate-700/50 text-slate-400 px-2 py-0.5 rounded-full">Unassigned</span>}
                    </div>
                  </div>
                  {doc.children && doc.children.length > 0 && (
                    <span className="text-xs bg-slate-800 border border-slate-700/50 text-slate-400 px-2 py-0.5 rounded-full shrink-0">
                      {doc.children.length}
                    </span>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </Card>

  <Card className="xl:col-span-8 rounded-xl border border-slate-700/50 bg-slate-900/50 p-6">
          {!selectedDoc && <p className="text-slate-400">Select a top-level markdown file on the left.</p>}

          {selectedDoc && (
            <div className="space-y-4">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-bold text-text break-words">{selectedDoc.title}</h3>
                  <Button type="button" onClick={() => handleEditDoc(selectedDoc)} className="text-xs text-purple-400 hover:text-purple-400/80 !border-0 !border-transparent !ring-0 !shadow-none" variant="ghost">Edit</Button>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {selectedDoc.hardwareAsset?.name && <span className="text-xs bg-purple-600/15 text-purple-400 px-2 py-1 rounded-full">HW: {selectedDoc.hardwareAsset.name}</span>}
                  {selectedDoc.softwareUnit?.name && <span className="text-xs bg-blue-500/15 text-blue-300 px-2 py-1 rounded-full">Service: {selectedDoc.softwareUnit.name}</span>}
                  {selectedDoc.parentDoc?.title && <span className="text-xs bg-purple-500/15 text-purple-300 px-2 py-1 rounded-full">Parent: {selectedDoc.parentDoc.title}</span>}
                  {!selectedDoc.hardwareAssetId && !selectedDoc.softwareUnitId && !selectedDoc.parentDocId && (
                    <span className="text-xs bg-slate-800 border border-slate-700/50 text-slate-400 px-2 py-1 rounded-full">Top-Level / Unassigned</span>
                  )}
                </div>
              </div>

              <div className="border border-slate-700/50 rounded-lg p-4 bg-slate-800/40 max-h-[460px] overflow-auto break-words">
                <ReactMarkdown components={markdownComponents}>{selectedDoc.content || ''}</ReactMarkdown>
              </div>

              {selectedDocChildren.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-text mb-2">Sub-Level Files</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocChildren.map((child) => (
                      <Button
                        key={child.id}
                        type="button"
                        onClick={() => setSelectedDocId(child.id)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors !ring-0 !shadow-none ${selectedDocId === child.id
                          ? 'border-primary bg-[color-mix(in_srgb,var(--color-primary)_24%,var(--color-content))] text-text'
                          : 'border-slate-700/50 bg-slate-800 hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] hover:text-text'}`}
                        variant="ghost"
                      >
                        {child.title}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
      </div>

      {docEditId ? (
        <EditMarkdown
          isOpen={isDocModalOpen}
          doc={editingDoc}
          hardwareOptions={hardware}
          serviceOptions={services}
          parentDocOptions={docs.filter((doc) => doc.id !== docEditId)}
          markdownComponents={markdownComponents}
          onClose={() => setIsDocModalOpen(false)}
          onSave={saveDoc}
          onDelete={deleteDoc}
        />
      ) : (
        <AddMarkdown
          isOpen={isDocModalOpen}
          hardwareOptions={hardware}
          serviceOptions={services}
          parentDocOptions={docs}
          markdownComponents={markdownComponents}
          onClose={() => setIsDocModalOpen(false)}
          onSave={saveDoc}
        />
      )}
    </div>
  );
}
