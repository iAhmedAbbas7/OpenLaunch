// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Undo,
  Redo,
  ExternalLink,
  ImagePlus,
  Type,
  X,
  Check,
  Globe,
  Unlink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";
import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import { Separator } from "@/components/ui/separator";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";

// <== RICH TEXT EDITOR PROPS ==>
interface RichTextEditorProps {
  // <== CONTENT ==>
  content: string;
  // <== ON CHANGE ==>
  onChange: (html: string, json: Record<string, unknown>) => void;
  // <== PLACEHOLDER ==>
  placeholder?: string;
  // <== DISABLED ==>
  disabled?: boolean;
  // <== CLASS NAME ==>
  className?: string;
}

// <== EDITOR TOOLBAR BUTTON ==>
interface ToolbarButtonProps {
  // <== ON CLICK ==>
  onClick: () => void;
  // <== IS ACTIVE ==>
  isActive?: boolean;
  // <== DISABLED ==>
  disabled?: boolean;
  // <== TOOLTIP ==>
  tooltip: string;
  // <== CHILDREN ==>
  children: React.ReactNode;
}

const ToolbarButton = ({
  onClick,
  isActive,
  disabled,
  tooltip,
  children,
}: ToolbarButtonProps) => (
  // RETURNING TOOLBAR BUTTON
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={isActive ? "secondary" : "ghost"}
          size="icon"
          onClick={onClick}
          disabled={disabled}
          className="size-7 sm:size-8"
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// <== ADD LINK MODAL PROPS ==>
interface AddLinkModalProps {
  // <== IS OPEN ==>
  isOpen: boolean;
  // <== ON CLOSE ==>
  onClose: () => void;
  // <== ON SUBMIT ==>
  onSubmit: (url: string, text?: string) => void;
  // <== INITIAL URL ==>
  initialUrl?: string;
  // <== INITIAL TEXT ==>
  initialText?: string;
  // <== HAS SELECTION ==>
  hasSelection?: boolean;
}

// <== ADD LINK MODAL ==>
const AddLinkModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialUrl = "",
  initialText = "",
  hasSelection = false,
}: AddLinkModalProps) => {
  // URL STATE
  const [url, setUrl] = useState(initialUrl);
  // TEXT STATE
  const [text, setText] = useState(initialText);
  // HANDLE OPEN CHANGE
  const handleOpenChange = (open: boolean) => {
    // CHECK IF MODAL IS CLOSED
    if (!open) {
      // CLOSE MODAL
      onClose();
    }
  };
  // HANDLE SUBMIT
  const handleSubmit = (e: React.FormEvent) => {
    // PREVENT DEFAULT FORM SUBMISSION
    e.preventDefault();
    // CHECK IF URL IS NOT EMPTY
    if (url.trim()) {
      // SUBMIT URL AND TEXT
      onSubmit(url.trim(), text.trim() || undefined);
      // RESET URL AND TEXT
      setUrl("");
      // RESET TEXT
      setText("");
      // CLOSE MODAL
      onClose();
    }
  };
  // HANDLE REMOVE LINK
  const handleRemoveLink = () => {
    // SUBMIT EMPTY URL AND TEXT
    onSubmit("", undefined);
    // RESET URL AND TEXT
    setUrl("");
    // RESET TEXT
    setText("");
    // CLOSE MODAL
    onClose();
  };
  // RETURN ADD LINK MODAL COMPONENT
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <LinkIcon className="size-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                {initialUrl ? "Edit Link" : "Add Link"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {initialUrl
                  ? "Update the URL or remove the link"
                  : "Enter the URL to create a hyperlink"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* URL INPUT */}
          <div className="space-y-2">
            <Label
              htmlFor="link-url"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Globe className="size-3.5 text-muted-foreground" />
              URL
              <Badge variant="secondary" className="text-[10px] ml-auto">
                Required
              </Badge>
            </Label>
            <Input
              id="link-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="h-10"
              autoFocus
            />
          </div>
          {/* TEXT INPUT (ONLY IF NO SELECTION) */}
          {!hasSelection && (
            <div className="space-y-2">
              <Label
                htmlFor="link-text"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Type className="size-3.5 text-muted-foreground" />
                Display Text
                <Badge variant="outline" className="text-[10px] ml-auto">
                  Optional
                </Badge>
              </Label>
              <Input
                id="link-text"
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Link text (optional)"
                className="h-10"
              />
            </div>
          )}
          {/* PREVIEW */}
          {url && (
            <div className="rounded-lg border bg-secondary/30 p-3">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                <ExternalLink className="size-3" />
                Preview
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline truncate block"
              >
                {text || url}
              </a>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            {initialUrl && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemoveLink}
                className="gap-2"
              >
                <Unlink className="size-4" />
                Remove Link
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="size-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={!url.trim()}>
              <Check className="size-4 mr-2" />
              {initialUrl ? "Update" : "Add Link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// <== ADD IMAGE MODAL PROPS ==>
interface AddImageModalProps {
  // <== IS OPEN ==>
  isOpen: boolean;
  // <== ON CLOSE ==>
  onClose: () => void;
  // <== ON SUBMIT ==>
  onSubmit: (url: string, alt?: string) => void;
}

// <== ADD IMAGE MODAL ==>
const AddImageModal = ({ isOpen, onClose, onSubmit }: AddImageModalProps) => {
  // URL STATE
  const [url, setUrl] = useState("");
  // ALT TEXT STATE
  const [alt, setAlt] = useState("");
  // HANDLE OPEN CHANGE
  const handleOpenChange = (open: boolean) => {
    // CHECK IF MODAL IS CLOSED
    if (!open) {
      // CLOSE MODAL
      onClose();
    }
  };
  // HANDLE SUBMIT
  const handleSubmit = (e: React.FormEvent) => {
    // PREVENT DEFAULT FORM SUBMISSION
    e.preventDefault();
    // CHECK IF URL IS NOT EMPTY
    if (url.trim()) {
      onSubmit(url.trim(), alt.trim() || undefined);
      // RESET URL
      setUrl("");
      // RESET ALT TEXT
      setAlt("");
      // CLOSE MODAL
      onClose();
    }
  };
  // RETURN ADD IMAGE MODAL COMPONENT
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <ImagePlus className="size-5 text-emerald-500" />
            </div>
            <div>
              <DialogTitle className="text-lg">Add Image</DialogTitle>
              <DialogDescription className="text-sm">
                Insert an image from a URL into your article
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        {/* ADD IMAGE MODAL FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* IMAGE URL INPUT */}
          <div className="space-y-2">
            <Label
              htmlFor="image-url"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Globe className="size-3.5 text-muted-foreground" />
              Image URL
              <Badge variant="secondary" className="text-[10px] ml-auto">
                Required
              </Badge>
            </Label>
            <Input
              id="image-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="h-10"
              autoFocus
            />
          </div>
          {/* ALT TEXT INPUT */}
          <div className="space-y-2">
            <Label
              htmlFor="image-alt"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Type className="size-3.5 text-muted-foreground" />
              Alt Text
              <Badge variant="outline" className="text-[10px] ml-auto">
                Recommended
              </Badge>
            </Label>
            <Input
              id="image-alt"
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Describe the image for accessibility"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Alt text helps screen readers and improves SEO
            </p>
          </div>
          {/* PREVIEW */}
          {url && (
            <div className="rounded-lg border bg-secondary/30 p-3 space-y-2">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <ImageIcon className="size-3" />
                Preview
              </p>
              <div className="relative aspect-video rounded-md overflow-hidden bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={alt || "Preview"}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23374151' width='100' height='100'/%3E%3Ctext fill='%239ca3af' font-size='12' font-family='sans-serif' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3EImage not found%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            </div>
          )}
          {/* ADD IMAGE MODAL FOOTER */}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="size-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={!url.trim()}>
              <Check className="size-4 mr-2" />
              Add Image
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// <== EDITOR TOOLBAR ==>
const EditorToolbar = ({
  editor,
  disabled,
}: {
  editor: Editor | null;
  disabled?: boolean;
}) => {
  // MODAL OPEN STATE
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  // IMAGE MODAL OPEN STATE
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  // LINK INITIAL URL STATE
  const [linkInitialUrl, setLinkInitialUrl] = useState("");
  // LINK INITIAL TEXT STATE
  const [linkInitialText, setLinkInitialText] = useState("");
  // HAS SELECTION STATE
  const [hasSelection, setHasSelection] = useState(false);
  // OPEN LINK MODAL
  const openLinkModal = useCallback(() => {
    // CHECK IF EDITOR IS NOT NULL
    if (!editor) return;
    // GET PREVIOUS URL
    const previousUrl = editor.getAttributes("link").href || "";
    // GET SELECTION
    const { from, to } = editor.state.selection;
    // GET SELECTED TEXT
    const selectedText = editor.state.doc.textBetween(from, to, "");
    // SET LINK INITIAL URL
    setLinkInitialUrl(previousUrl);
    // SET LINK INITIAL TEXT
    setLinkInitialText(selectedText);
    // SET HAS SELECTION
    setHasSelection(selectedText.length > 0);
    // OPEN LINK MODAL
    setIsLinkModalOpen(true);
  }, [editor]);
  // HANDLE LINK SUBMIT
  const handleLinkSubmit = useCallback(
    (url: string, text?: string) => {
      // CHECK IF EDITOR IS NOT NULL
      if (!editor) return;
      // CHECK IF URL IS EMPTY
      if (url === "") {
        // UNSET LINK
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        // RETURN
        return;
      }
      // CHECK IF TEXT IS NOT EMPTY AND HAS NO SELECTION
      if (text && !hasSelection) {
        // INSERT CONTENT
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${url}">${text}</a>`)
          .run();
      } else {
        // SET LINK
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .run();
      }
    },
    [editor, hasSelection]
  );
  // OPEN IMAGE MODAL
  const openImageModal = useCallback(() => {
    // OPEN IMAGE MODAL
    setIsImageModalOpen(true);
  }, []);
  // HANDLE IMAGE SUBMIT
  const handleImageSubmit = useCallback(
    (url: string, alt?: string) => {
      // CHECK IF EDITOR IS NOT NULL
      if (!editor) return;
      // INSERT IMAGE
      editor
        .chain()
        .focus()
        .setImage({ src: url, alt: alt || "" })
        .run();
    },
    [editor]
  );
  // RETURN NULL IF NO EDITOR
  if (!editor) return null;
  // RETURN EDITOR TOOLBAR COMPONENT
  return (
    <>
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 sm:p-2 border-b bg-secondary/30 rounded-t-lg">
        {/* UNDO/REDO */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().undo()}
          tooltip="Undo"
        >
          <Undo className="size-3.5 sm:size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().redo()}
          tooltip="Redo"
        >
          <Redo className="size-3.5 sm:size-4" />
        </ToolbarButton>
        {/* SEPARATOR */}
        <Separator orientation="vertical" className="h-6 mx-1" />
        {/* HEADING 1 */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
          disabled={disabled}
          tooltip="Heading 1"
        >
          <Heading1 className="size-3.5 sm:size-4" />
        </ToolbarButton>
        {/* HEADING 2 */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          disabled={disabled}
          tooltip="Heading 2"
        >
          <Heading2 className="size-3.5 sm:size-4" />
        </ToolbarButton>
        {/* HEADING 3 */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          disabled={disabled}
          tooltip="Heading 3"
        >
          <Heading3 className="size-3.5 sm:size-4" />
        </ToolbarButton>
        {/* SEPARATOR */}
        <Separator orientation="vertical" className="h-6 mx-1" />
        {/* BOLD */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          disabled={disabled}
          tooltip="Bold"
        >
          <Bold className="size-3.5 sm:size-4" />
        </ToolbarButton>
        {/* ITALIC */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          disabled={disabled}
          tooltip="Italic"
        >
          <Italic className="size-3.5 sm:size-4" />
        </ToolbarButton>
        {/* UNDERLINE */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          disabled={disabled}
          tooltip="Underline"
        >
          <UnderlineIcon className="size-3.5 sm:size-4" />
        </ToolbarButton>
        {/* STRIKETHROUGH */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          disabled={disabled}
          tooltip="Strikethrough"
        >
          <Strikethrough className="size-3.5 sm:size-4" />
        </ToolbarButton>
        {/* HIGHLIGHT */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive("highlight")}
          disabled={disabled}
          tooltip="Highlight"
        >
          <Highlighter className="size-3.5 sm:size-4" />
        </ToolbarButton>
        {/* INLINE CODE */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          disabled={disabled}
          tooltip="Inline Code"
        >
          <Code className="size-3.5 sm:size-4" />
        </ToolbarButton>
        {/* SEPARATOR */}
        <Separator
          orientation="vertical"
          className="h-6 mx-1 hidden sm:block"
        />
        {/* ALIGN LEFT */}
        <div className="hidden sm:flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            disabled={disabled}
            tooltip="Align Left"
          >
            <AlignLeft className="size-3.5 sm:size-4" />
          </ToolbarButton>
          {/* ALIGN CENTER */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            disabled={disabled}
            tooltip="Align Center"
          >
            <AlignCenter className="size-3.5 sm:size-4" />
          </ToolbarButton>
          {/* ALIGN RIGHT */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            disabled={disabled}
            tooltip="Align Right"
          >
            <AlignRight className="size-3.5 sm:size-4" />
          </ToolbarButton>
        </div>
        {/* SEPARATOR */}
        <Separator orientation="vertical" className="h-6 mx-1" />
        {/* LISTS */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          disabled={disabled}
          tooltip="Bullet List"
        >
          <List className="size-3.5 sm:size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          disabled={disabled}
          tooltip="Numbered List"
        >
          <ListOrdered className="size-3.5 sm:size-4" />
        </ToolbarButton>
        {/* SEPARATOR */}
        <Separator orientation="vertical" className="h-6 mx-1" />
        {/* BLOCKQUOTE */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          disabled={disabled}
          tooltip="Quote"
        >
          <Quote className="size-3.5 sm:size-4" />
        </ToolbarButton>
        {/* CODE BLOCK */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          disabled={disabled}
          tooltip="Code Block"
        >
          <Code className="size-3.5 sm:size-4" />
        </ToolbarButton>
        {/* HORIZONTAL RULE */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          disabled={disabled}
          tooltip="Horizontal Rule"
        >
          <Minus className="size-3.5 sm:size-4" />
        </ToolbarButton>
        {/* SEPARATOR */}
        <Separator orientation="vertical" className="h-6 mx-1" />
        {/* ADD LINK */}
        <ToolbarButton
          onClick={openLinkModal}
          isActive={editor.isActive("link")}
          disabled={disabled}
          tooltip="Add Link"
        >
          <LinkIcon className="size-3.5 sm:size-4" />
        </ToolbarButton>
        {/* ADD IMAGE */}
        <ToolbarButton
          onClick={openImageModal}
          disabled={disabled}
          tooltip="Add Image"
        >
          <ImageIcon className="size-3.5 sm:size-4" />
        </ToolbarButton>
      </div>
      {/* LINK MODAL */}
      <AddLinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onSubmit={handleLinkSubmit}
        initialUrl={linkInitialUrl}
        initialText={linkInitialText}
        hasSelection={hasSelection}
      />
      {/* IMAGE MODAL */}
      <AddImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSubmit={handleImageSubmit}
      />
    </>
  );
};

// <== RICH TEXT EDITOR COMPONENT ==>
export const RichTextEditor = ({
  content,
  onChange,
  placeholder = "Start writing your article...",
  disabled = false,
  className,
}: RichTextEditorProps) => {
  // INITIALIZE EDITOR
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full mx-auto",
        },
      }),
      Underline,
      Highlight,
      Typography,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const json = editor.getJSON();
      onChange(html, json as Record<string, unknown>);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none",
          "min-h-[300px] sm:min-h-[400px] p-3 sm:p-4",
          "focus:outline-none",
          "prose-headings:scroll-mt-20",
          "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
          "prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded",
          "prose-pre:bg-secondary prose-pre:border prose-pre:rounded-lg",
          "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-secondary/50"
        ),
      },
    },
  });
  // RETURN RICH TEXT EDITOR COMPONENT
  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* TOOLBAR */}
      <EditorToolbar editor={editor} disabled={disabled} />
      {/* EDITOR CONTENT */}
      <EditorContent editor={editor} />
    </div>
  );
};

// <== EXPORTING RICH TEXT EDITOR ==>
export default RichTextEditor;
