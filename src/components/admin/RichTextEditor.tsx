'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState } from 'react';
import styles from './admin.module.scss';

type Props = {
  name: string;
  defaultValue?: string;
};

export default function RichTextEditor({ name, defaultValue = '' }: Props) {
  const [html, setHtml] = useState(defaultValue);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          autolink: false,
          linkOnPaste: false,
          openOnClick: false,
          shouldAutoLink: () => false,
        },
      }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: styles.richEditorContent,
      },
    },
    onUpdate: ({ editor }) => {
      const value = editor.getHTML();
      setHtml(value === '<p></p>' ? '' : value);
    },
  });

  if (!editor) {
    return null;
  }

  const btn = (active: boolean) =>
    `${styles.rteButton} ${active ? styles.rteButtonActive : ''}`;

  return (
    <div className={styles.richEditor}>
      <div className={styles.rteToolbar}>
        <button
          type="button"
          className={btn(editor.isActive('bold'))}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Pogrubienie"
          title="Pogrubienie"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={btn(editor.isActive('italic'))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Kursywa"
          title="Kursywa"
        >
          <em>I</em>
        </button>
        <span className={styles.rteDivider} aria-hidden="true" />
        <button
          type="button"
          className={btn(editor.isActive('heading', { level: 2 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-label="Nagłówek"
          title="Nagłówek"
        >
          H2
        </button>
        <button
          type="button"
          className={btn(editor.isActive('heading', { level: 3 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          aria-label="Podnagłówek"
          title="Podnagłówek"
        >
          H3
        </button>
        <span className={styles.rteDivider} aria-hidden="true" />
        <button
          type="button"
          className={btn(editor.isActive('bulletList'))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Lista punktowana"
          title="Lista punktowana"
        >
          • Lista
        </button>
        <button
          type="button"
          className={btn(editor.isActive('orderedList'))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Lista numerowana"
          title="Lista numerowana"
        >
          1. Lista
        </button>
        <span className={styles.rteDivider} aria-hidden="true" />
        <button
          type="button"
          className={btn(editor.isActive('blockquote'))}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Cytat"
          title="Cytat"
        >
          &ldquo; &rdquo;
        </button>
      </div>

      <EditorContent editor={editor} />

      <input type="hidden" name={name} value={html} />
    </div>
  );
}
