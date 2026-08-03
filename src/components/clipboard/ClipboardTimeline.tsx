import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clipboard,
  Search,
  Pin,
  Trash2,
  Copy,
  Check,
  Link,
  Mail,
  Phone,
  Code,
  FileText,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useClipboardStore } from '../../store/useClipboardStore';
import type { ClipboardCategory } from '../../types';
import { formatDistanceToNow } from 'date-fns';

export function ClipboardTimeline() {
  const {
    items,
    searchQuery,
    selectedCategory,
    loadClipboard,
    setSearchQuery,
    setSelectedCategory,
    addItem,
    deleteItem,
    togglePinItem,
    clearAll,
  } = useClipboardStore();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    loadClipboard();
  }, [loadClipboard]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleManualAdd = async () => {
    if (manualInput.trim()) {
      await addItem(manualInput);
      setManualInput('');
      setShowInput(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' ? true : item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (category: ClipboardCategory) => {
    switch (category) {
      case 'link':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300"><Link className="w-3 h-3" /> Link</span>;
      case 'email':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300"><Mail className="w-3 h-3" /> Email</span>;
      case 'phone':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-green-500/20 text-green-300"><Phone className="w-3 h-3" /> Phone</span>;
      case 'code':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300"><Code className="w-3 h-3" /> Code</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-gray-500/20 text-gray-300"><FileText className="w-3 h-3" /> Text</span>;
    }
  };

  return (
    <div className="glass-panel p-5 w-full flex flex-col h-[560px] overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
            <Clipboard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Clipboard Timeline</h3>
            <p className="text-xs text-gray-400">Auto-Categorized Copy History</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInput(!showInput)}
            data-magnetic
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Quick Add
          </button>

          <button
            onClick={clearAll}
            className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all text-xs border border-white/10"
            title="Clear Unpinned Items"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showInput && (
        <div className="mb-3 p-2.5 rounded-xl bg-white/5 border border-white/15 flex gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Paste text, link, code snippet..."
            className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
          />
          <button
            onClick={handleManualAdd}
            className="px-3 py-1 bg-cyan-600 text-white text-xs rounded-lg font-medium"
          >
            Save
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {(['all', 'text', 'link', 'code', 'email', 'phone'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium uppercase shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-48 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clipboard..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
            <Sparkles className="w-10 h-10 mb-2 opacity-30 text-cyan-400" />
            <p className="text-sm">No items in clipboard history</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isCopied = copiedId === item.id;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-3 rounded-xl border transition-all ${
                  item.pinned
                    ? 'bg-cyan-500/10 border-cyan-500/30'
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {getCategoryBadge(item.category)}
                    <span className="text-[10px] text-gray-500">
                      {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(item.id, item.content)}
                      className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
                        isCopied ? 'text-green-400' : 'text-gray-400 hover:text-white'
                      }`}
                      title="Copy to Clipboard"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => togglePinItem(item.id)}
                      className={`p-1.5 rounded hover:bg-white/10 ${
                        item.pinned ? 'text-amber-400' : 'text-gray-400'
                      }`}
                      title="Pin Item"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1.5 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-200 font-mono bg-black/20 p-2 rounded-lg break-all max-h-24 overflow-y-auto">
                  {item.content}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
