"use client";

import React, { useState, useRef } from "react";
import { Heading, Bold, Italic, List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon, Code, Minus } from "lucide-react";
import { uploadImage } from "../config/cloudinary";
import { parseMarkdown } from "../utils/markdown";

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
  minHeight?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your content here in Markdown...",
  label = "Content Editor",
  minHeight = "300px",
}: MarkdownEditorProps) {
  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");
  const [isUploadingInline, setIsUploadingInline] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);

  // Helper to insert formatting tags at cursor
  const insertTextAtCursor = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);

    const replacement = before + selection + after;
    const newBody = text.substring(0, start) + replacement + text.substring(end);

    onChange(newBody);

    // Refocus and place cursor in middle of tags
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selection.length
      );
    }, 0);
  };

  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadSelectedFile(file);
  };

  const uploadSelectedFile = async (file: File) => {
    setIsUploadingInline(true);
    try {
      const url = await uploadImage(file);
      insertTextAtCursor(`\n![${file.name.replace(/\.[^/.]+$/, "")}](${url})\n`);
    } catch (err) {
      console.error(err);
      alert("Failed to upload inline image.");
    } finally {
      setIsUploadingInline(false);
      if (inlineImageInputRef.current) {
        inlineImageInputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await uploadSelectedFile(file);
    }
  };

  const previewHtml = parseMarkdown(value);

  return (
    <div className="space-y-4 border border-white/10 rounded-3xl p-6 bg-white/5">
      <div className="flex justify-between items-center pb-4 border-b border-white/10">
        <label className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</label>

        <div className="flex bg-zinc-950 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setEditorTab("write")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              editorTab === "write" ? "bg-primary text-white" : "text-white/40 hover:text-white"
            }`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setEditorTab("preview")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              editorTab === "preview" ? "bg-primary text-white" : "text-white/40 hover:text-white"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {editorTab === "write" ? (
        <div className="space-y-4">
          {/* Editor Toolbar */}
          <div className="flex flex-wrap gap-2 p-2 bg-zinc-950 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => insertTextAtCursor("## ", "")}
              className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold"
              title="Heading 2"
            >
              <Heading size={16} /><span className="text-[10px]">H2</span>
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor("### ", "")}
              className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold"
              title="Heading 3"
            >
              <Heading size={14} /><span className="text-[10px]">H3</span>
            </button>
            <div className="w-px bg-white/10 self-stretch my-1" />
            <button
              type="button"
              onClick={() => insertTextAtCursor("**", "**")}
              className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor("*", "*")}
              className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
              title="Italic"
            >
              <Italic size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor("~~", "~~")}
              className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors text-xs font-bold font-mono"
              title="Strikethrough"
            >
              ~~
            </button>
            <div className="w-px bg-white/10 self-stretch my-1" />
            <button
              type="button"
              onClick={() => insertTextAtCursor("- ", "")}
              className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
              title="Bullet List"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor("1. ", "")}
              className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
              title="Numbered List"
            >
              <ListOrdered size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor("- [ ] ", "")}
              className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors text-[10px] font-bold"
              title="Checklist"
            >
              [ ]
            </button>
            <div className="w-px bg-white/10 self-stretch my-1" />
            <button
              type="button"
              onClick={() => insertTextAtCursor("> ", "")}
              className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
              title="Blockquote"
            >
              <Quote size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor("`", "`")}
              className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
              title="Inline Code"
            >
              <Code size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor("\n```\n", "\n```\n")}
              className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors text-xs font-mono font-bold"
              title="Code Block"
            >
              C_B
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor("\n---\n", "")}
              className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
              title="Horizontal Rule"
            >
              <Minus size={16} />
            </button>
            <div className="w-px bg-white/10 self-stretch my-1" />
            <button
              type="button"
              onClick={() => {
                const url = prompt("Enter website link URL:");
                if (url) insertTextAtCursor(`[`, `](${url})`);
              }}
              className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
              title="Insert Link"
            >
              <LinkIcon size={16} />
            </button>

            <button
              type="button"
              disabled={isUploadingInline}
              onClick={() => inlineImageInputRef.current?.click()}
              className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold disabled:opacity-50"
              title="Upload inline image"
            >
              {isUploadingInline ? (
                <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ImageIcon size={16} />
              )}
              <span>Upload Image</span>
              <input
                type="file"
                accept="image/*"
                ref={inlineImageInputRef}
                onChange={handleInlineImageUpload}
                className="hidden"
              />
            </button>
          </div>

          {/* Code Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-2xl transition-all ${
              isDragging ? "ring-2 ring-primary bg-primary/5" : ""
            }`}
          >
            <textarea
              required
              ref={textareaRef}
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-6 py-4 bg-zinc-950 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors text-white font-mono text-sm resize-y"
              style={{ minHeight }}
            />
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl pointer-events-none border-2 border-dashed border-primary">
                <span className="text-sm font-bold text-white uppercase tracking-widest">
                  Drop image to upload and insert
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div 
          className="p-8 bg-zinc-950 border border-white/10 rounded-2xl overflow-y-auto rich-text-content"
          style={{ minHeight, maxHeight: "450px" }}
        >
          {previewHtml ? (
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          ) : (
            <div className="text-white/20 text-center py-20 uppercase tracking-widest text-xs font-bold">
              Nothing to preview. Go to the "Write" tab and add content.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
