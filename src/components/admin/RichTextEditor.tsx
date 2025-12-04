"use client";

import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

export function RichTextEditor({
  value,
  onChange,
  label,
  placeholder,
  error,
}: RichTextEditorProps) {
  const editorRef = useRef<any>(null);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const { CKEditor, ClassicEditor } = editorRef.current || {};

  useEffect(() => {
    editorRef.current = {
      CKEditor: require("@ckeditor/ckeditor5-react").CKEditor,
      ClassicEditor: require("@ckeditor/ckeditor5-build-classic"),
    };
    setEditorLoaded(true);
  }, []);

  const editorConfiguration = {
    toolbar: [
      "heading",
      "|",
      "bold",
      "italic",
      "link",
      "bulletedList",
      "numberedList",
      "|",
      "blockQuote",
      "undo",
      "redo",
    ],
    placeholder: placeholder || "Enter content...",
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium text-foreground">{label}</Label>
      )}
      <div
        className={`border rounded-md ${error ? "border-destructive" : "border-input"}`}
        style={{
          minHeight: "200px",
        }}
      >
        {editorLoaded ? (
          <CKEditor
            editor={ClassicEditor}
            data={value}
            onChange={(_event: any, editor: any) => {
              const data = editor.getData();
              onChange(data);
            }}
            config={editorConfiguration}
          />
        ) : (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Loading editor...
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <style jsx global>{`
        .ck-editor__editable {
          min-height: 200px !important;
          background-color: transparent !important;
          color: inherit !important;
        }
        .ck.ck-toolbar {
          background-color: hsl(var(--muted)) !important;
          border-color: hsl(var(--border)) !important;
        }
        .ck.ck-button {
          color: hsl(var(--foreground)) !important;
        }
        .ck.ck-button:hover {
          background-color: hsl(var(--accent)) !important;
        }
        .ck.ck-button.ck-on {
          background-color: hsl(var(--accent)) !important;
        }
        .ck-content {
          color: hsl(var(--foreground)) !important;
        }
      `}</style>
    </div>
  );
}
