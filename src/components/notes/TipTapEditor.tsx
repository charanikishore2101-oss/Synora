import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Heading1,
  Heading2,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: 'Start typing your note...' }),
    ],
    content: content || '<p></p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[220px] p-3 text-sm text-gray-200 leading-relaxed',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '<p></p>');
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="w-full flex flex-col h-full bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-1 p-2 bg-white/5 border-b border-white/10 text-gray-400">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('bold') ? 'text-violet-400 bg-white/10' : ''}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('italic') ? 'text-violet-400 bg-white/10' : ''}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-white/10 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('heading', { level: 1 }) ? 'text-violet-400 bg-white/10' : ''}`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('heading', { level: 2 }) ? 'text-violet-400 bg-white/10' : ''}`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-white/10 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('bulletList') ? 'text-violet-400 bg-white/10' : ''}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('orderedList') ? 'text-violet-400 bg-white/10' : ''}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('taskList') ? 'text-violet-400 bg-white/10' : ''}`}
          title="Task List"
        >
          <CheckSquare className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-white/10 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('codeBlock') ? 'text-violet-400 bg-white/10' : ''}`}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('blockquote') ? 'text-violet-400 bg-white/10' : ''}`}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Editor */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
