import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bookmark,
  Plus,
  Search,
  ExternalLink,
  Pin,
  Trash2,
  Tag,
  Folder,
  Clock,
  LayoutGrid,
  List,
  Sparkles,
} from 'lucide-react';
import { useVaultStore } from '../../store/useVaultStore';

export function LinkVault() {
  const {
    links,
    collections,
    selectedCollectionId,
    searchQuery,
    loadVault,
    setSelectedCollectionId,
    setSearchQuery,
    addLink,
    deleteLink,
    togglePinLink,
  } = useVaultStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [inputTitle, setInputTitle] = useState('');
  const [inputTags, setInputTags] = useState('');

  useEffect(() => {
    loadVault();
  }, [loadVault]);

  const handleAddLink = async () => {
    if (inputUrl.trim()) {
      const tagArray = inputTags.split(',').map((t) => t.trim()).filter(Boolean);
      await addLink(inputUrl.trim(), inputTitle.trim() || undefined, undefined, tagArray);
      setInputUrl('');
      setInputTitle('');
      setInputTags('');
      setShowAddModal(false);
    }
  };

  const filteredLinks = links.filter((link) => {
    const matchesSearch =
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCollection = selectedCollectionId ? link.collectionId === selectedCollectionId : true;
    return matchesSearch && matchesCollection;
  });

  return (
    <div className="glass-panel p-5 w-full flex flex-col h-[560px] overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Link Vault</h3>
            <p className="text-xs text-gray-400">Intelligent Bookmark & Reading List</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-lg bg-white/5 border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            data-magnetic
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-medium text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Save Link
          </button>
        </div>
      </div>

      {showAddModal && (
        <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/15 space-y-2">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Paste URL (e.g. https://example.com)..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              placeholder="Title (optional)..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            <input
              type="text"
              value={inputTags}
              onChange={(e) => setInputTags(e.target.value)}
              placeholder="Tags (comma separated)..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-3 py-1 text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleAddLink}
              className="px-3 py-1 bg-emerald-600 text-white text-xs rounded-lg font-medium"
            >
              Add Bookmark
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCollectionId(null)}
            className={`px-2 py-1 rounded text-[11px] shrink-0 ${
              selectedCollectionId === null ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            All Vault
          </button>
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => setSelectedCollectionId(col.id)}
              className={`px-2 py-1 rounded text-[11px] shrink-0 flex items-center gap-1 ${
                selectedCollectionId === col.id ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Folder className="w-3 h-3" style={{ color: col.color }} /> {col.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-48 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vault..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {filteredLinks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
            <Sparkles className="w-10 h-10 mb-2 opacity-30 text-emerald-400" />
            <p className="text-sm">No saved links in Vault</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-2'}>
            {filteredLinks.map((link) => (
              <motion.div
                key={link.id}
                data-tilt
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`p-3 rounded-xl border transition-all ${
                  link.pinned
                    ? 'bg-emerald-500/10 border-emerald-500/40'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={link.favicon}
                      alt={link.domain}
                      className="w-4 h-4 rounded"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <span className="text-[11px] font-mono text-emerald-400">{link.domain}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePinLink(link.id)}
                      className={`p-1 rounded hover:bg-white/10 ${link.pinned ? 'text-amber-400' : 'text-gray-400'}`}
                      title="Pin Bookmark"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
                      title="Open Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => deleteLink(link.id)}
                      className="p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-semibold text-xs text-white line-clamp-1 mb-1">{link.title}</h4>
                <p className="text-[11px] text-gray-400 line-clamp-2 mb-2">{link.description}</p>

                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {link.readingTimeMinutes} min read
                  </div>

                  {link.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-emerald-400" />
                      <span>{link.tags.join(', ')}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
