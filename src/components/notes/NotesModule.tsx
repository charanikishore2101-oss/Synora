import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Pin,
  Trash2,
  Folder,
  Search,
  Download,
  FolderPlus,
} from 'lucide-react';
import { useNotesStore } from '../../store/useNotesStore';
import { TipTapEditor } from './TipTapEditor';

export function NotesModule() {
  const {
    notes,
    folders,
    activeNoteId,
    searchQuery,
    selectedFolderId,
    loadNotes,
    setActiveNoteId,
    setSearchQuery,
    setSelectedFolderId,
    createNote,
    updateNote,
    deleteNote,
    togglePinNote,
    createFolder,
  } = useNotesStore();

  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderInput, setShowFolderInput] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const activeNote = notes.find((n) => n.id === activeNoteId);

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolderId ? note.folderId === selectedFolderId : true;
    return matchesSearch && matchesFolder;
  });

  const handleAddFolder = async () => {
    if (newFolderName.trim()) {
      await createFolder(newFolderName.trim(), '#8b5cf6');
      setNewFolderName('');
      setShowFolderInput(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!activeNote) return;
    const textContent = activeNote.content.replace(/<[^>]*>?/gm, '');
    const blob = new Blob([`# ${activeNote.title}\n\n${textContent}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel p-5 w-full flex flex-col h-[560px] overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Quick Notes</h3>
            <p className="text-xs text-gray-400">Rich Markdown & Checklist Editor</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeNote && (
            <button
              onClick={handleExportMarkdown}
              data-magnetic
              className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-all text-xs flex items-center gap-1.5 border border-white/10"
              title="Export Markdown"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          )}

          <button
            onClick={() => createNote()}
            data-magnetic
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white font-medium text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> New Note
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        <div className="w-64 flex flex-col gap-3 shrink-0 border-r border-white/10 pr-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-2 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] text-gray-400 font-semibold px-1">
              <span>FOLDERS</span>
              <button
                onClick={() => setShowFolderInput(!showFolderInput)}
                className="hover:text-white"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            {showFolderInput && (
              <div className="flex gap-1 my-1">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name..."
                  className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white"
                />
                <button
                  onClick={handleAddFolder}
                  className="px-2 py-1 bg-violet-600 text-white text-xs rounded"
                >
                  Add
                </button>
              </div>
            )}

            <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
              <button
                onClick={() => setSelectedFolderId(null)}
                className={`px-2 py-1 rounded text-[11px] shrink-0 ${
                  selectedFolderId === null ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                All
              </button>

              {folders.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFolderId(f.id)}
                  className={`px-2 py-1 rounded text-[11px] shrink-0 flex items-center gap-1 ${
                    selectedFolderId === f.id ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <Folder className="w-3 h-3" style={{ color: f.color }} /> {f.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredNotes.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No notes found.</p>
            ) : (
              filteredNotes.map((note) => {
                const isActive = note.id === activeNoteId;
                return (
                  <div
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-violet-500/20 border-violet-500/50 text-white'
                        : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="font-medium text-xs truncate flex-1">{note.title || 'Untitled Note'}</h4>
                      {note.pinned && <Pin className="w-3 h-3 text-amber-400 shrink-0 fill-amber-400" />}
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-1">
                      {note.content.replace(/<[^>]*>?/gm, '') || 'Empty note'}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {activeNote ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeNote.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col h-full gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                    placeholder="Note title..."
                    className="bg-transparent text-base font-semibold text-white focus:outline-none w-full border-b border-transparent focus:border-violet-500 py-1"
                  />

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => togglePinNote(activeNote.id)}
                      className={`p-1.5 rounded hover:bg-white/10 ${
                        activeNote.pinned ? 'text-amber-400' : 'text-gray-400'
                      }`}
                      title="Pin Note"
                    >
                      <Pin className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteNote(activeNote.id)}
                      className="p-1.5 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                      title="Delete Note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <TipTapEditor
                    content={activeNote.content}
                    onChange={(html) => updateNote(activeNote.id, { content: html })}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <FileText className="w-12 h-12 mb-2 opacity-30 text-violet-400" />
              <p className="text-sm">Select or create a note to begin writing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
