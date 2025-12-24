// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import Link from "next/link";
import { toast } from "sonner";
import { TagInput } from "./tag-input";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "./rich-text-editor";
import { zodResolver } from "@hookform/resolvers/zod";
import { CoverImageUpload } from "./cover-image-upload";
import { ArrowLeft, Save, FileText } from "lucide-react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { createArticleSchema } from "@/lib/validations/articles";
import type { ArticleWithAuthor } from "@/server/actions/articles";
import { PublishDialog, type SeoSettings } from "./publish-dialog";
import { useCreateArticle, useUpdateArticle } from "@/hooks/use-articles";

// <== ARTICLE EDITOR FORM PROPS ==>
interface ArticleEditorFormProps {
  // <== EXISTING ARTICLE (FOR EDITING) ==>
  article?: ArticleWithAuthor;
}

// <== ARTICLE EDITOR FORM COMPONENT ==>
export const ArticleEditorForm = ({ article }: ArticleEditorFormProps) => {
  // ROUTER
  const router = useRouter();
  // IS NEW ARTICLE
  const isNew = !article;
  // CREATE ARTICLE MUTATION
  const createArticle = useCreateArticle();
  // UPDATE ARTICLE MUTATION
  const updateArticle = useUpdateArticle();
  // USE FORM
  const form = useForm({
    // RESOLVER
    resolver: zodResolver(createArticleSchema),
    defaultValues: {
      title: article?.title ?? "",
      subtitle: article?.subtitle ?? "",
      content: article?.content ?? "",
      contentJson: article?.contentJson ?? undefined,
      coverImageUrl: article?.coverImageUrl ?? null,
      tags: article?.tags ?? [],
      isPublished: article?.isPublished ?? false,
      metaTitle: article?.metaTitle ?? "",
      metaDescription: article?.metaDescription ?? "",
      canonicalUrl: article?.canonicalUrl ?? null,
      ogImageUrl: article?.ogImageUrl ?? null,
    },
  });
  // STATE FOR SEO SETTINGS
  const [seoSettings, setSeoSettings] = useState<SeoSettings>({
    metaTitle: article?.metaTitle ?? "",
    metaDescription: article?.metaDescription ?? "",
    canonicalUrl: article?.canonicalUrl ?? "",
    ogImageUrl: article?.ogImageUrl ?? "",
  });
  // WATCH VALUES FOR FORM
  const title = useWatch({ control: form.control, name: "title" });
  // WATCH VALUES FOR FORM
  const isPublished = useWatch({ control: form.control, name: "isPublished" });
  // HANDLE CONTENT CHANGE
  const handleContentChange = useCallback(
    (html: string, json: Record<string, unknown>) => {
      // SET VALUES FOR FORM
      form.setValue("content", html);
      // SET VALUES FOR FORM
      form.setValue("contentJson", json);
    },
    [form]
  );
  // HANDLE SEO CHANGE
  const handleSeoChange = useCallback(
    (settings: SeoSettings) => {
      // SET VALUES FOR SEO SETTINGS
      setSeoSettings(settings);
      // SET VALUES FOR FORM
      form.setValue("metaTitle", settings.metaTitle || undefined);
      // SET VALUES FOR FORM
      form.setValue("metaDescription", settings.metaDescription || undefined);
      // SET VALUES FOR FORM
      form.setValue("canonicalUrl", settings.canonicalUrl || null);
      // SET VALUES FOR FORM
      form.setValue("ogImageUrl", settings.ogImageUrl || null);
    },
    [form]
  );
  // HANDLE PUBLISH
  const handlePublish = useCallback(async () => {
    // SET VALUES FOR FORM
    form.setValue("isPublished", true);
    // GET VALUES FOR FORM
    const data = form.getValues();
    // ENSURE REQUIRED FIELDS HAVE DEFAULTS
    const submitData = {
      ...data,
      tags: data.tags ?? [],
      isPublished: true,
    };
    // TRY TO CREATE OR UPDATE ARTICLE
    try {
      // CHECK IF ARTICLE IS NEW
      if (isNew) {
        // CREATE ARTICLE
        const result = await createArticle.mutateAsync(submitData);
        // REDIRECT TO ARTICLE PAGE
        router.push(`/articles/${result.slug}`);
      } else {
        // UPDATE ARTICLE
        await updateArticle.mutateAsync({
          // ARTICLE ID
          articleId: article.id,
          data: submitData,
        });
        // REDIRECT TO ARTICLE PAGE
        router.push(`/articles/${article.slug}`);
      }
    } catch {
      // ERROR HANDLED BY MUTATION
    }
  }, [form, isNew, createArticle, updateArticle, article, router]);
  // HANDLE SAVE DRAFT
  const handleSaveDraft = useCallback(async () => {
    // SET VALUES FOR FORM
    form.setValue("isPublished", false);
    // GET VALUES FOR FORM
    const data = form.getValues();
    // ENSURE REQUIRED FIELDS HAVE DEFAULTS
    const submitData = {
      ...data,
      tags: data.tags ?? [],
      isPublished: false,
    };
    // TRY TO CREATE OR UPDATE ARTICLE
    try {
      // CHECK IF ARTICLE IS NEW
      if (isNew) {
        // CREATE ARTICLE
        const result = await createArticle.mutateAsync(submitData);
        // REDIRECT TO ARTICLE PAGE
        router.push(`/dashboard/articles/${result.slug}/edit`);
        // SHOW SUCCESS TOAST
        toast.success("Draft saved!");
      } else {
        // UPDATE ARTICLE
        await updateArticle.mutateAsync({
          articleId: article.id,
          data: submitData,
        });
        // SHOW SUCCESS TOAST
        toast.success("Draft saved!");
      }
    } catch {
      // ERROR HANDLED BY MUTATION
    }
  }, [form, isNew, createArticle, updateArticle, article, router]);

  // HANDLE MANUAL SAVE
  const handleSave = useCallback(async () => {
    // GET VALUES FOR FORM
    const data = form.getValues();
    // CHECK IF TITLE IS VALID
    if (!data.title || data.title.length < 5) {
      // SHOW ERROR TOAST
      toast.error("Title must be at least 5 characters");
      // RETURN
      return;
    }
    // ENSURE REQUIRED FIELDS HAVE DEFAULTS
    const submitData = {
      ...data,
      tags: data.tags ?? [],
      isPublished: data.isPublished ?? false,
    };
    // TRY TO CREATE OR UPDATE ARTICLE
    try {
      // CHECK IF ARTICLE IS NEW
      if (isNew) {
        // CREATE ARTICLE
        const result = await createArticle.mutateAsync(submitData);
        // REDIRECT TO ARTICLE PAGE
        router.push(`/dashboard/articles/${result.slug}/edit`);
      } else {
        // UPDATE ARTICLE
        await updateArticle.mutateAsync({
          // ARTICLE ID
          articleId: article.id,
          data: submitData,
        });
      }
    } catch {
      // ERROR HANDLED BY MUTATION
    }
  }, [form, isNew, createArticle, updateArticle, article, router]);
  // CHECK IF ARTICLE IS SAVING
  const isSaving = createArticle.isPending || updateArticle.isPending;
  // RETURN ARTICLE EDITOR FORM COMPONENT
  return (
    <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* HEADER */}
      <div className="mb-6 sm:mb-8">
        {/* BACK LINK */}
        <Link
          href="/dashboard/articles"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 sm:mb-6"
        >
          <ArrowLeft className="size-3.5 sm:size-4" />
          Back to My Articles
        </Link>

        {/* TITLE AND ACTIONS */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="size-10 sm:size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="size-5 sm:size-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
              {isNew ? "New Article" : "Edit Article"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isNew
                ? "Create a new article to share with the community"
                : "Make changes to your article"}
            </p>
          </div>
          {/* ACTIONS */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="gap-1.5 sm:gap-2 h-8 sm:h-9"
            >
              <Save className="size-3.5 sm:size-4" />
              <span className="hidden sm:inline">Save</span>
            </Button>
            <PublishDialog
              title={title}
              isPublished={isPublished ?? false}
              seoSettings={seoSettings}
              onSeoChange={handleSeoChange}
              onPublish={handlePublish}
              onSaveDraft={handleSaveDraft}
              isSaving={isSaving}
              isNew={isNew}
            />
          </div>
        </div>
      </div>
      {/* FORM */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4 sm:space-y-6"
      >
        {/* COVER IMAGE */}
        <Card className="p-3 sm:p-4">
          <Label className="text-sm font-medium mb-2 sm:mb-3 block">
            Cover Image
          </Label>
          <Controller
            name="coverImageUrl"
            control={form.control}
            render={({ field }) => (
              <CoverImageUpload
                value={field.value ?? null}
                onChange={field.onChange}
                disabled={isSaving}
              />
            )}
          />
        </Card>
        {/* TITLE */}
        <Card className="p-3 sm:p-4">
          <div className="space-y-3 sm:space-y-4">
            {/* TITLE INPUT */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="Enter your article title..."
                className="h-10 sm:h-12 text-base sm:text-lg font-medium"
                disabled={isSaving}
              />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
            {/* SUBTITLE INPUT */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="subtitle" className="text-sm font-medium">
                Subtitle
              </Label>
              <Input
                id="subtitle"
                {...form.register("subtitle")}
                placeholder="Add a subtitle (optional)..."
                className="h-9 sm:h-10 text-sm"
                disabled={isSaving}
              />
              {form.formState.errors.subtitle && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.subtitle.message}
                </p>
              )}
            </div>
          </div>
        </Card>
        {/* CONTENT EDITOR */}
        <Card className="p-3 sm:p-4">
          <Label className="text-sm font-medium mb-2 sm:mb-3 block">
            Content
          </Label>
          <Controller
            name="content"
            control={form.control}
            render={({ field }) => (
              <RichTextEditor
                content={field.value ?? ""}
                onChange={handleContentChange}
                placeholder="Start writing your article..."
                disabled={isSaving}
              />
            )}
          />
          {form.formState.errors.content && (
            <p className="text-xs text-destructive mt-2">
              {form.formState.errors.content.message}
            </p>
          )}
        </Card>
        {/* TAGS */}
        <Card className="p-3 sm:p-4">
          <Label className="text-sm font-medium mb-2 sm:mb-3 block">Tags</Label>
          <Controller
            name="tags"
            control={form.control}
            render={({ field }) => (
              <TagInput
                value={field.value ?? []}
                onChange={field.onChange}
                maxTags={10}
                placeholder="Add tags..."
                disabled={isSaving}
              />
            )}
          />
        </Card>
      </motion.div>
    </div>
  );
};

// <== EXPORTING ARTICLE EDITOR FORM ==>
export default ArticleEditorForm;
