import { useState, useEffect, useMemo } from 'react';
import { Card } from '@heroui/react';
import { useAuth } from '@/context/AuthContext';
import ReactMarkdown from 'react-markdown';

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
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const docsById = useMemo(() => {
    return new Map(docs.map((doc) => [doc.id, doc]));
  }, [docs]);

  const topLevelDocs = useMemo(() => {
    return docs
      .filter((doc) => !doc.parentDocId)
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [docs]);

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
  p: ({ children }: any) => <p className="text-sm text-text-secondary leading-relaxed mb-2">{children}</p>,
  ul: ({ children }: any) => <ul className="list-disc list-inside pl-2 space-y-1 text-sm text-text-secondary">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal list-inside pl-2 space-y-1 text-sm text-text-secondary">{children}</ol>,
  li: ({ children }: any) => <li>{children}</li>,
  strong: ({ children }: any) => <strong className="font-semibold text-text">{children}</strong>,
  em: ({ children }: any) => <em className="italic text-text">{children}</em>,
  code: ({ children }: any) => <code className="px-1.5 py-0.5 rounded bg-background border border-border text-xs text-primary">{children}</code>,
  a: ({ href, children }: any) => {
    const internalDoc = resolveInternalDoc(href);
    if (internalDoc) {
      return (
        <button
          type="button"
          onClick={() => setSelectedDocId(internalDoc.id)}
          className="text-primary hover:text-primary/80 underline underline-offset-2"
        >
          {children}
        </button>
      );
    }

    return (
      <a href={href} target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80 underline underline-offset-2">
        {children}
      </a>
    );
  }
};

  const fetchData = async () => {
    if (!token) return;
    try {
      const docsRes = await fetch('http://localhost:3001/api/infrastructure/docs', { headers: { Authorization: `Bearer ${token}` } });
      const docsData: DocItem[] = await docsRes.json();
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

  useEffect(() => {
    if (!selectedDoc) {
      setEditTitle('');
      setEditContent('');
      setIsEditing(false);
      return;
    }

    setEditTitle(selectedDoc.title || '');
    setEditContent(selectedDoc.content || '');
  }, [selectedDoc?.id]);

  useEffect(() => {
    if (message?.type !== 'success') return;

    const timeoutId = window.setTimeout(() => {
      setMessage(null);
    }, 2500);

    return () => window.clearTimeout(timeoutId);
  }, [message]);

  const handleSaveEdit = async () => {
    if (!token || !selectedDoc) return;

    const normalizedTitle = ensureMarkdownFilename(editTitle);
    if (!normalizedTitle) {
      setMessage({ type: 'error', text: 'Filename cannot be empty.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`http://localhost:3001/api/infrastructure/docs/${selectedDoc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: normalizedTitle,
          content: editContent,
          hardwareAssetId: selectedDoc.hardwareAssetId || undefined,
          softwareUnitId: selectedDoc.softwareUnitId || undefined,
          parentDocId: selectedDoc.parentDocId || undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save markdown file');
      }

      setMessage({ type: 'success', text: 'Markdown file saved.' });
      setIsEditing(false);
      await fetchData();
      setSelectedDocId(data.id || selectedDoc.id);
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Failed to save markdown file' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 h-full overflow-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text">Markdown Documents (Top Level)</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <Card className="xl:col-span-4 border border-border bg-content p-0 overflow-hidden h-fit">
          <div className="px-4 py-3 border-b border-border bg-background text-sm font-semibold text-text-secondary">Top-Level Markdown Files</div>
          <div className="divide-y divide-border">
            {topLevelDocs.length === 0 && <p className="p-4 text-text-secondary">No top-level markdown files found.</p>}
            {topLevelDocs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`w-full text-left px-4 py-3 transition-all border-l-4 ${selectedDocId === doc.id ? 'bg-primary/20 border-primary shadow-md' : 'hover:bg-background/60 border-transparent'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`font-medium truncate ${selectedDocId === doc.id ? 'text-primary' : 'text-text'}`}>{doc.title}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {doc.hardwareAsset?.name && <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full">HW: {doc.hardwareAsset.name}</span>}
                      {doc.softwareUnit?.name && <span className="text-xs bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded-full">Service: {doc.softwareUnit.name}</span>}
                      {!doc.hardwareAssetId && !doc.softwareUnitId && <span className="text-xs bg-background border border-border text-text-secondary px-2 py-0.5 rounded-full">Unassigned</span>}
                    </div>
                  </div>
                  {doc.children && doc.children.length > 0 && (
                    <span className="text-xs bg-background border border-border text-text-secondary px-2 py-0.5 rounded-full shrink-0">
                      {doc.children.length}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="xl:col-span-8 border border-border bg-content p-6">
          {!selectedDoc && <p className="text-text-secondary">Select a top-level markdown file on the left.</p>}

          {selectedDoc && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-text break-words">{selectedDoc.title}</h3>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {selectedDoc.hardwareAsset?.name && <span className="text-xs bg-primary/15 text-primary px-2 py-1 rounded-full">HW: {selectedDoc.hardwareAsset.name}</span>}
                  {selectedDoc.softwareUnit?.name && <span className="text-xs bg-blue-500/15 text-blue-300 px-2 py-1 rounded-full">Service: {selectedDoc.softwareUnit.name}</span>}
                  {selectedDoc.parentDoc?.title && <span className="text-xs bg-purple-500/15 text-purple-300 px-2 py-1 rounded-full">Parent: {selectedDoc.parentDoc.title}</span>}
                  {!selectedDoc.hardwareAssetId && !selectedDoc.softwareUnitId && !selectedDoc.parentDocId && (
                    <span className="text-xs bg-background border border-border text-text-secondary px-2 py-1 rounded-full">Top-Level / Unassigned</span>
                  )}
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                  {message.text}
                </div>
              )}

              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(true);
                      setMessage(null);
                    }}
                    className="px-3 py-1.5 text-sm rounded-lg border border-border bg-background hover:bg-primary/15 hover:text-primary transition-colors"
                  >
                    Edit File
                  </button>
                )}
              </div>

              {isEditing && (
                <div className="border border-border rounded-lg p-4 bg-background/40 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Filename</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-content border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary"
                      placeholder="z. B. hardware-overview.md"
                    />
                    <p className="text-[11px] text-text-secondary mt-1">`.md` is added automatically when missing.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Content</label>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full min-h-[200px] bg-content border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:border-primary font-mono text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditTitle(selectedDoc.title || '');
                        setEditContent(selectedDoc.content || '');
                        setMessage(null);
                      }}
                      className="px-3 py-1.5 text-sm rounded-lg text-text-secondary hover:text-text"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="px-3 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              )}

              <div className="border border-border rounded-lg p-4 bg-background/40 max-h-[460px] overflow-auto break-words">
                <ReactMarkdown components={markdownComponents}>{isEditing ? editContent : selectedDoc.content || ''}</ReactMarkdown>
              </div>

              {selectedDocChildren.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-text mb-2">Sub-Level Files</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocChildren.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => setSelectedDocId(child.id)}
                        className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-primary/15 hover:text-primary transition-colors"
                      >
                        {child.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
