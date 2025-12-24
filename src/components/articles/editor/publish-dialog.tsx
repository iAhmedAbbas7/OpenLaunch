// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Send,
  Settings2,
  Globe,
  EyeOff,
  FileText,
  Search,
  Link2,
  Image as ImageIcon,
  Type,
  AlignLeft,
  Sparkles,
  CheckCircle,
  Clock,
  Eye,
  FileEdit,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// <== SEO SETTINGS TYPE ==>
export interface SeoSettings {
  // <== META TITLE ==>
  metaTitle: string;
  // <== META DESCRIPTION ==>
  metaDescription: string;
  // <== CANONICAL URL ==>
  canonicalUrl: string;
  // <== OG IMAGE URL ==>
  ogImageUrl: string;
}

// <== PUBLISH DIALOG PROPS ==>
interface PublishDialogProps {
  // <== TITLE ==>
  title: string;
  // <== IS PUBLISHED ==>
  isPublished: boolean;
  // <== SEO SETTINGS ==>
  seoSettings: SeoSettings;
  // <== ON SEO CHANGE ==>
  onSeoChange: (settings: SeoSettings) => void;
  // <== ON PUBLISH ==>
  onPublish: () => void;
  // <== ON SAVE DRAFT ==>
  onSaveDraft: () => void;
  // <== IS SAVING ==>
  isSaving?: boolean;
  // <== IS NEW ==>
  isNew?: boolean;
  // <== DISABLED ==>
  disabled?: boolean;
}

// <== PUBLISH DIALOG COMPONENT ==>
export const PublishDialog = ({
  title,
  isPublished,
  seoSettings,
  onSeoChange,
  onPublish,
  onSaveDraft,
  isSaving = false,
  isNew = true,
  disabled = false,
}: PublishDialogProps) => {
  // DIALOG OPEN STATE
  const [isOpen, setIsOpen] = useState(false);
  // LOCAL SEO SETTINGS
  const [localSeoSettings, setLocalSeoSettings] =
    useState<SeoSettings>(seoSettings);
  // HANDLE SEO CHANGE
  const handleSeoChange = (key: keyof SeoSettings, value: string) => {
    // UPDATE LOCAL SEO SETTINGS
    const newSettings = { ...localSeoSettings, [key]: value };
    // UPDATE LOCAL SEO SETTINGS
    setLocalSeoSettings(newSettings);
    // UPDATE SEO SETTINGS
    onSeoChange(newSettings);
  };
  // HANDLE PUBLISH
  const handlePublish = () => {
    // PUBLISH ARTICLE
    onPublish();
    // CLOSE DIALOG
    setIsOpen(false);
  };
  // HANDLE SAVE DRAFT
  const handleSaveDraft = () => {
    // SAVE DRAFT
    onSaveDraft();
    // CLOSE DIALOG
    setIsOpen(false);
  };
  // CALCULATE SEO SCORE (FUNCTIONAL EXPRESSION)
  const seoScore = (() => {
    // INITIALIZE SCORE TO 0
    let score = 0;
    // CHECK META TITLE LENGTH
    if (
      localSeoSettings.metaTitle.length >= 30 &&
      localSeoSettings.metaTitle.length <= 60
    )
      // ADD 25 POINTS
      score += 25;
    // CHECK META TITLE LENGTH
    else if (localSeoSettings.metaTitle.length > 0) score += 10;
    // CHECK META DESCRIPTION LENGTH
    if (
      localSeoSettings.metaDescription.length >= 100 &&
      localSeoSettings.metaDescription.length <= 160
    )
      // ADD 25 POINTS
      score += 25;
    // CHECK META DESCRIPTION LENGTH
    else if (localSeoSettings.metaDescription.length > 0) score += 10;
    // CHECK OG IMAGE URL
    if (localSeoSettings.ogImageUrl) score += 25;
    // CHECK TITLE LENGTH
    if (title.length > 10) score += 25;
    // RETURN SCORE
    return score;
  })();
  // GET SEO SCORE COLOR
  const getSeoScoreColor = () => {
    // CHECK SEO SCORE
    if (seoScore >= 75) return "text-green-500";
    // CHECK SEO SCORE
    if (seoScore >= 50) return "text-yellow-500";
    // RETURN RED COLOR
    return "text-red-500";
  };
  // RETURN PUBLISH DIALOG COMPONENT
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isPublished ? "outline" : "default"}
          size="sm"
          disabled={disabled}
          className="gap-2"
        >
          {isPublished ? (
            <>
              <Settings2 className="size-4" />
              <span className="hidden sm:inline">Settings</span>
            </>
          ) : (
            <>
              <Send className="size-4" />
              <span className="hidden sm:inline">Publish</span>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              {isPublished ? (
                <Settings2 className="size-5 text-primary" />
              ) : (
                <Send className="size-5 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg">
                {isPublished ? "Article Settings" : "Publish Article"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {isPublished
                  ? "Update your article settings and SEO."
                  : "Configure your article before publishing."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <Tabs defaultValue="publish" className="flex-1 flex flex-col min-h-0">
          <TabsList
            className="grid w-full grid-cols-2 mx-6 shrink-0"
            style={{ width: "calc(100% - 48px)" }}
          >
            <TabsTrigger value="publish" className="gap-2">
              <FileText className="size-4" />
              Publish
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-2">
              <Search className="size-4" />
              SEO
            </TabsTrigger>
          </TabsList>
          {/* PUBLISH TAB */}
          <TabsContent value="publish" className="flex-1 mt-0 px-6 py-4">
            <div className="space-y-4">
              {/* ARTICLE PREVIEW */}
              <div className="rounded-lg border p-4 bg-secondary/30">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="size-4 text-muted-foreground" />
                  <h4 className="font-medium text-sm">Preview</h4>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {title || "Untitled Article"}
                </p>
              </div>
              {/* PUBLISH STATUS */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-10 rounded-full flex items-center justify-center ${
                      isPublished ? "bg-green-500/10" : "bg-secondary"
                    }`}
                  >
                    {isPublished ? (
                      <Globe className="size-5 text-green-500" />
                    ) : (
                      <EyeOff className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {isPublished ? "Published" : "Draft"}
                      </p>
                      <Badge
                        variant={isPublished ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {isPublished ? (
                          <CheckCircle className="size-3 mr-1" />
                        ) : (
                          <Clock className="size-3 mr-1" />
                        )}
                        {isPublished ? "Live" : "Pending"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isPublished
                        ? "Your article is visible to everyone"
                        : "Only you can see this article"}
                    </p>
                  </div>
                </div>
              </div>
              {/* QUICK SEO STATUS */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-muted-foreground" />
                    <h4 className="font-medium text-sm">SEO Score</h4>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${getSeoScoreColor()} border-current`}
                  >
                    {seoScore}%
                  </Badge>
                </div>
                <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      seoScore >= 75
                        ? "bg-green-500"
                        : seoScore >= 50
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${seoScore}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {seoScore >= 75
                    ? "Great! Your article is well optimized for search engines."
                    : seoScore >= 50
                    ? "Good start! Add more SEO details to improve visibility."
                    : "Add meta title, description, and social image to improve SEO."}
                </p>
              </div>
            </div>
          </TabsContent>
          {/* SEO TAB */}
          <TabsContent value="seo" className="flex-1 mt-0 min-h-0">
            <ScrollArea className="h-[350px] px-6">
              <div className="space-y-5 py-4">
                {/* META TITLE */}
                <div className="space-y-2">
                  <Label
                    htmlFor="metaTitle"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Type className="size-3.5 text-muted-foreground" />
                    Meta Title
                    <Badge variant="secondary" className="text-[10px] ml-auto">
                      {localSeoSettings.metaTitle.length}/70
                    </Badge>
                  </Label>
                  <Input
                    id="metaTitle"
                    value={localSeoSettings.metaTitle}
                    onChange={(e) =>
                      handleSeoChange("metaTitle", e.target.value)
                    }
                    placeholder={title || "Article title"}
                    maxLength={70}
                    className="h-10"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optimal length: 30-60 characters for best display in search
                    results
                  </p>
                </div>

                {/* META DESCRIPTION */}
                <div className="space-y-2">
                  <Label
                    htmlFor="metaDescription"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <AlignLeft className="size-3.5 text-muted-foreground" />
                    Meta Description
                    <Badge variant="secondary" className="text-[10px] ml-auto">
                      {localSeoSettings.metaDescription.length}/160
                    </Badge>
                  </Label>
                  <Textarea
                    id="metaDescription"
                    value={localSeoSettings.metaDescription}
                    onChange={(e) =>
                      handleSeoChange("metaDescription", e.target.value)
                    }
                    placeholder="Brief description for search engines..."
                    maxLength={160}
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optimal length: 100-160 characters for full display
                  </p>
                </div>
                {/* CANONICAL URL */}
                <div className="space-y-2">
                  <Label
                    htmlFor="canonicalUrl"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Link2 className="size-3.5 text-muted-foreground" />
                    Canonical URL
                    <Badge variant="outline" className="text-[10px] ml-auto">
                      Optional
                    </Badge>
                  </Label>
                  <Input
                    id="canonicalUrl"
                    type="url"
                    value={localSeoSettings.canonicalUrl}
                    onChange={(e) =>
                      handleSeoChange("canonicalUrl", e.target.value)
                    }
                    placeholder="https://..."
                    className="h-10"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use this if the article was originally published elsewhere
                  </p>
                </div>
                {/* OG IMAGE URL */}
                <div className="space-y-2">
                  <Label
                    htmlFor="ogImageUrl"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <ImageIcon className="size-3.5 text-muted-foreground" />
                    Social Image URL
                    <Badge variant="outline" className="text-[10px] ml-auto">
                      Recommended
                    </Badge>
                  </Label>
                  <Input
                    id="ogImageUrl"
                    type="url"
                    value={localSeoSettings.ogImageUrl}
                    onChange={(e) =>
                      handleSeoChange("ogImageUrl", e.target.value)
                    }
                    placeholder="https://..."
                    className="h-10"
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: 1200×630 pixels for optimal social sharing
                  </p>
                  {/* IMAGE PREVIEW */}
                  {localSeoSettings.ogImageUrl && (
                    <div className="mt-2 rounded-lg border overflow-hidden bg-secondary/30">
                      <div className="aspect-video relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={localSeoSettings.ogImageUrl}
                          alt="Social preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='630' viewBox='0 0 1200 630'%3E%3Crect fill='%23374151' width='1200' height='630'/%3E%3Ctext fill='%239ca3af' font-size='24' font-family='sans-serif' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3EImage preview unavailable%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        {/* DIALOG FOOTER */}
        <DialogFooter className="px-6 py-4 border-t gap-2 sm:gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="gap-2"
          >
            <FileEdit className="size-4" />
            {isPublished ? "Unpublish" : "Save as Draft"}
          </Button>
          <Button onClick={handlePublish} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <>
                <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Send className="size-4" />
                {isNew ? "Publish Article" : "Update Article"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// <== EXPORTING PUBLISH DIALOG ==>
export default PublishDialog;
