// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Loader2,
  Check,
  Rocket,
  Globe,
  Github,
  ExternalLink,
  Tags,
  Calendar,
  ArrowLeft,
  ArrowRight,
  X,
  Plus,
  Terminal,
  Smartphone,
  Gamepad2,
  Cpu,
  Bot,
  Palette,
  GraduationCap,
  Briefcase,
  ShoppingCart,
  Music,
  Video,
  Camera,
  Headphones,
  Heart,
  Shield,
  Cloud,
  Database,
  Server,
  Code,
  type LucideIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createProjectSchema,
  type CreateProjectInput,
} from "@/lib/validations/projects";
import type { z } from "zod";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Project, Category } from "@/lib/db/schema";
import { useCreateProject, useUpdateProject } from "@/hooks/use-projects";

// <== ICON MAP FOR CATEGORIES ==>
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Globe,
  Terminal,
  Smartphone,
  Gamepad2,
  Cpu,
  Bot,
  Palette,
  GraduationCap,
  Briefcase,
  ShoppingCart,
  Music,
  Video,
  Camera,
  Headphones,
  Heart,
  Shield,
  Cloud,
  Database,
  Server,
  Code,
  Tags,
};

// <== FORM VALUES TYPE ==>
type FormValues = z.input<typeof createProjectSchema>;

// <== STEPS ==>
const STEPS = [
  // <== STEP 1 ==>
  { id: 1, title: "Basic Info", description: "Name and description" },
  // <== STEP 2 ==>
  { id: 2, title: "Links", description: "Website and GitHub" },
  // <== STEP 3 ==>
  { id: 3, title: "Details", description: "Tech stack and category" },
  // <== STEP 4 ==>
  { id: 4, title: "Launch", description: "Schedule and publish" },
];

// <== PROJECT FORM PROPS ==>
interface ProjectFormProps {
  // <== PROJECT (FOR EDITING) ==>
  project?: Project;
  // <== CATEGORIES ==>
  categories?: Category[];
  // <== CLASS NAME ==>
  className?: string;
}

// <== PROJECT FORM COMPONENT ==>
export const ProjectForm = ({
  project,
  categories = [],
  className,
}: ProjectFormProps) => {
  // ROUTER
  const router = useRouter();
  // STATE FOR CURRENT STEP
  const [currentStep, setCurrentStep] = useState(1);
  // STATE FOR TECH INPUT
  const [techInput, setTechInput] = useState("");
  // CREATE MUTATION
  const { mutate: createProject, isPending: isCreating } = useCreateProject();
  // UPDATE MUTATION
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();
  // IS SUBMITTING
  const isSubmitting = isCreating || isUpdating;
  // IS EDITING
  const isEditing = !!project;
  // FORM
  const form = useForm<FormValues>({
    // RESOLVER
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: project?.name ?? "",
      tagline: project?.tagline ?? "",
      description: project?.description ?? "",
      logoUrl: project?.logoUrl ?? "",
      bannerUrl: project?.bannerUrl ?? "",
      websiteUrl: project?.websiteUrl ?? "",
      githubUrl: project?.githubUrl ?? "",
      demoUrl: project?.demoUrl ?? "",
      isOpenSource: project?.isOpenSource ?? false,
      license: project?.license ?? "",
      techStack: project?.techStack ?? [],
      categoryIds: project?.categoryIds ?? [],
      launchDate: project?.launchDate ?? null,
      status: project?.status ?? "draft",
    },
  });
  // FORM ERRORS
  const { errors } = form.formState;
  // WATCH VALUES FOR FORM
  const watchedValues = useWatch({ control: form.control });
  // TECH STACK WATCHED VALUE
  const techStack = watchedValues.techStack ?? [];
  // CATEGORY IDS WATCHED VALUE
  const categoryIds = watchedValues.categoryIds ?? [];
  // <== HANDLE ADD TECH ==>
  const handleAddTech = () => {
    // ADD TECH
    const tech = techInput.trim();
    // CHECK IF TECH IS VALID
    if (tech && !techStack.includes(tech) && techStack.length < 20) {
      // ADD TECH TO FORM
      form.setValue("techStack", [...techStack, tech]);
      // CLEAR TECH INPUT
      setTechInput("");
    }
  };
  // <== HANDLE REMOVE TECH ==>
  const handleRemoveTech = (tech: string) => {
    // REMOVE TECH FROM FORM
    form.setValue(
      "techStack",
      techStack.filter((t: string) => t !== tech)
    );
  };
  // <== HANDLE KEY DOWN ==>
  const handleTechKeyDown = (e: React.KeyboardEvent) => {
    // CHECK IF ENTER KEY IS PRESSED
    if (e.key === "Enter") {
      // PREVENT DEFAULT FORM SUBMISSION
      e.preventDefault();
      // ADD TECH
      handleAddTech();
    }
  };
  // <== HANDLE TOGGLE CATEGORY ==>
  const handleToggleCategory = (categoryId: string) => {
    // CHECK IF CATEGORY IS ALREADY SELECTED
    if (categoryIds.includes(categoryId)) {
      // REMOVE CATEGORY FROM FORM
      form.setValue(
        "categoryIds",
        categoryIds.filter((id: string) => id !== categoryId)
      );
    } else if (categoryIds.length < 3) {
      // ADD CATEGORY TO FORM
      form.setValue("categoryIds", [...categoryIds, categoryId]);
    }
  };
  // <== HANDLE NEXT ==>
  const handleNext = async () => {
    // VALIDATE CURRENT STEP
    let fieldsToValidate: (keyof CreateProjectInput)[] = [];
    // SWITCH CASE FOR CURRENT STEP
    switch (currentStep) {
      // STEP 1: BASIC INFO
      case 1:
        fieldsToValidate = ["name", "tagline", "description"];
        break;
      // STEP 2: LINKS
      case 2:
        fieldsToValidate = ["websiteUrl", "githubUrl", "demoUrl"];
        break;
      // STEP 3: DETAILS
      case 3:
        fieldsToValidate = ["techStack", "categoryIds"];
        break;
    }
    // TRIGGER VALIDATION
    const isValid = await form.trigger(fieldsToValidate);
    // CHECK IF FORM IS VALID AND CURRENT STEP IS LESS THAN 4
    if (isValid && currentStep < 4) {
      // SET CURRENT STEP TO NEXT STEP
      setCurrentStep(currentStep + 1);
    }
  };
  // <== HANDLE PREVIOUS ==>
  const handlePrevious = () => {
    // CHECK IF CURRENT STEP IS GREATER THAN 1
    if (currentStep > 1) {
      // SET CURRENT STEP TO PREVIOUS STEP
      setCurrentStep(currentStep - 1);
    }
  };
  // <== HANDLE SUBMIT ==>
  const onSubmit = (data: FormValues) => {
    // PARSE DATA THROUGH SCHEMA SAFELY
    const parseResult = createProjectSchema.safeParse(data);
    // CHECK IF PARSING FAILED
    if (!parseResult.success) {
      // GET FIRST ERROR MESSAGE
      const firstError = parseResult.error.issues[0];
      // SHOW ERROR TOAST WITH FIELD INFO
      toast.error(`${firstError.path.join(".")}: ${firstError.message}`);
      // LOG ALL ERRORS FOR DEBUGGING
      console.error("Validation errors:", parseResult.error.issues);
      return;
    }
    // GET PARSED DATA
    const parsedData = parseResult.data;
    // CHECK IF PROJECT IS EDITING AND PROJECT EXISTS
    if (isEditing && project) {
      // UPDATE PROJECT WITH NEW DATA
      updateProject(
        { projectId: project.id, data: parsedData },
        {
          // ON SUCCESS
          onSuccess: (updatedProject) => {
            // REDIRECT TO PROJECT PAGE
            router.push(`/projects/${updatedProject.slug}`);
          },
        }
      );
    } else {
      // CREATE PROJECT WITH NEW DATA
      createProject(parsedData, {
        // ON SUCCESS
        onSuccess: (newProject) => {
          // REDIRECT TO PROJECT PAGE
          router.push(`/projects/${newProject.slug}`);
        },
      });
    }
  };
  // RETURN PROJECT FORM COMPONENT
  return (
    <div className={cn("max-w-3xl mx-auto", className)}>
      {/* PROGRESS INDICATOR */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {/* STEP INDICATOR */}
              <button
                type="button"
                onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                disabled={currentStep < step.id}
                className={cn(
                  "flex items-center justify-center size-8 sm:size-10 rounded-full font-semibold text-sm sm:text-base transition-colors",
                  currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : currentStep > step.id
                    ? "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {currentStep > step.id ? (
                  <Check className="size-4 sm:size-5" />
                ) : (
                  step.id
                )}
              </button>
              {/* CONNECTOR */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-8 sm:w-12 md:w-24 h-0.5 sm:h-1 mx-1.5 sm:mx-2 rounded",
                    currentStep > step.id ? "bg-primary/50" : "bg-secondary"
                  )}
                />
              )}
            </div>
          ))}
        </div>
        {/* STEP INFO */}
        <div className="text-center">
          <h2 className="text-base sm:text-lg font-semibold">
            {STEPS[currentStep - 1].title}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {STEPS[currentStep - 1].description}
          </p>
        </div>
      </div>
      {/* FORM */}
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          // LOG FORM VALIDATION ERRORS
          console.error("Form validation errors:", errors);
          // GET FIRST ERROR
          const firstError = Object.entries(errors)[0];
          if (firstError) {
            const [field, error] = firstError;
            toast.error(`${field}: ${error?.message || "Invalid value"}`);
          }
        })}
      >
        {/* STEP 1: BASIC INFO */}
        {currentStep === 1 && (
          <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* NAME */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="name" className="text-xs sm:text-sm">
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="My Awesome Project"
                className="h-9 sm:h-10 text-sm sm:text-base"
                {...form.register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            {/* TAGLINE */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="tagline" className="text-xs sm:text-sm">
                Tagline <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tagline"
                placeholder="A short description of your project"
                maxLength={140}
                className="h-9 sm:h-10 text-sm sm:text-base"
                {...form.register("tagline")}
              />
              <p className="text-xs text-muted-foreground">
                {watchedValues.tagline?.length ?? 0}/140 characters
              </p>
              {errors.tagline && (
                <p className="text-xs text-destructive">
                  {errors.tagline.message}
                </p>
              )}
            </div>
            {/* DESCRIPTION */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="description" className="text-xs sm:text-sm">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Tell us more about your project. What problem does it solve? What makes it unique?"
                rows={6}
                className="text-sm sm:text-base sm:min-h-[160px]"
                {...form.register("description")}
              />
              <p className="text-xs text-muted-foreground">
                {watchedValues.description?.length ?? 0}/10000 characters
              </p>
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>
          </Card>
        )}
        {/* STEP 2: LINKS */}
        {currentStep === 2 && (
          <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* WEBSITE URL */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label
                htmlFor="websiteUrl"
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                <Globe className="size-3.5 sm:size-4" />
                Website URL
              </Label>
              <Input
                id="websiteUrl"
                type="url"
                placeholder="https://myproject.com"
                className="h-9 sm:h-10 text-sm sm:text-base"
                {...form.register("websiteUrl")}
              />
              {errors.websiteUrl && (
                <p className="text-xs text-destructive">
                  {errors.websiteUrl.message}
                </p>
              )}
            </div>
            {/* GITHUB URL */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label
                htmlFor="githubUrl"
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                <Github className="size-3.5 sm:size-4" />
                GitHub URL
              </Label>
              <Input
                id="githubUrl"
                type="url"
                placeholder="https://github.com/username/repo"
                className="h-9 sm:h-10 text-sm sm:text-base"
                {...form.register("githubUrl")}
              />
              {errors.githubUrl && (
                <p className="text-xs text-destructive">
                  {errors.githubUrl.message}
                </p>
              )}
            </div>
            {/* DEMO URL */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label
                htmlFor="demoUrl"
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                <ExternalLink className="size-3.5 sm:size-4" />
                Demo URL
              </Label>
              <Input
                id="demoUrl"
                type="url"
                placeholder="https://demo.myproject.com"
                className="h-9 sm:h-10 text-sm sm:text-base"
                {...form.register("demoUrl")}
              />
              {errors.demoUrl && (
                <p className="text-xs text-destructive">
                  {errors.demoUrl.message}
                </p>
              )}
            </div>
            {/* IS OPEN SOURCE */}
            <div className="flex items-center justify-between py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg bg-secondary/50">
              <div>
                <Label
                  htmlFor="isOpenSource"
                  className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                >
                  <Github className="size-3.5 sm:size-4" />
                  Open Source
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                  Is your project open source?
                </p>
              </div>
              <Switch
                id="isOpenSource"
                checked={watchedValues.isOpenSource ?? false}
                onCheckedChange={(checked) =>
                  form.setValue("isOpenSource", checked)
                }
              />
            </div>
            {/* LICENSE (CONDITIONAL) */}
            {watchedValues.isOpenSource && (
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="license" className="text-xs sm:text-sm">
                  License
                </Label>
                <Select
                  value={watchedValues.license ?? ""}
                  onValueChange={(value) => form.setValue("license", value)}
                >
                  <SelectTrigger className="h-9 sm:h-10 text-sm sm:text-base">
                    <SelectValue placeholder="Select a license" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MIT">MIT</SelectItem>
                    <SelectItem value="Apache-2.0">Apache 2.0</SelectItem>
                    <SelectItem value="GPL-3.0">GPL 3.0</SelectItem>
                    <SelectItem value="BSD-3-Clause">BSD 3-Clause</SelectItem>
                    <SelectItem value="ISC">ISC</SelectItem>
                    <SelectItem value="MPL-2.0">MPL 2.0</SelectItem>
                    <SelectItem value="AGPL-3.0">AGPL 3.0</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </Card>
        )}
        {/* STEP 3: DETAILS */}
        {currentStep === 3 && (
          <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* TECH STACK */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                <Tags className="size-3.5 sm:size-4" />
                Tech Stack
              </Label>
              <div className="flex gap-1.5 sm:gap-2">
                <Input
                  placeholder="Add technology (e.g., React)"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleTechKeyDown}
                  maxLength={50}
                  className="h-9 sm:h-10 text-sm sm:text-base"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTech}
                  disabled={!techInput.trim() || techStack.length >= 20}
                  className="h-9 sm:h-10 px-2.5 sm:px-3"
                >
                  <Plus className="size-3.5 sm:size-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {techStack.length}/20 technologies
              </p>
              {/* TECH TAGS */}
              {techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                  {techStack.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="gap-0.5 sm:gap-1 pr-0.5 sm:pr-1 text-xs sm:text-sm"
                    >
                      {tech}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-3.5 sm:size-4 hover:bg-transparent"
                        onClick={() => handleRemoveTech(tech)}
                      >
                        <X className="size-2.5 sm:size-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            {/* CATEGORIES */}
            {categories.length > 0 && (
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">
                  Categories (Select up to 3)
                </Label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {categories.map((category) => {
                    const isSelected = categoryIds.includes(category.id);
                    return (
                      <Badge
                        key={category.id}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-colors text-xs sm:text-sm",
                          isSelected && "bg-primary text-primary-foreground",
                          !isSelected &&
                            categoryIds.length >= 3 &&
                            "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => handleToggleCategory(category.id)}
                      >
                        {category.icon &&
                          CATEGORY_ICONS[category.icon] &&
                          (() => {
                            const IconComponent = CATEGORY_ICONS[category.icon];
                            return (
                              <IconComponent className="size-2.5 sm:size-3 mr-0.5 sm:mr-1" />
                            );
                          })()}
                        {category.name}
                      </Badge>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {categoryIds.length}/3 categories selected
                </p>
              </div>
            )}
          </Card>
        )}
        {/* STEP 4: LAUNCH */}
        {currentStep === 4 && (
          <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* LAUNCH DATE */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label
                htmlFor="launchDate"
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                <Calendar className="size-3.5 sm:size-4" />
                Launch Date
              </Label>
              <Input
                id="launchDate"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className="h-9 sm:h-10 text-sm sm:text-base"
                value={
                  watchedValues.launchDate instanceof Date
                    ? watchedValues.launchDate.toISOString().split("T")[0]
                    : typeof watchedValues.launchDate === "string"
                    ? watchedValues.launchDate.split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  form.setValue(
                    "launchDate",
                    e.target.value ? new Date(e.target.value) : null
                  )
                }
              />
              <p className="text-xs text-muted-foreground">
                Schedule your project launch. Leave empty to save as draft.
              </p>
            </div>
            {/* STATUS */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Status</Label>
              <Select
                value={watchedValues.status ?? "draft"}
                onValueChange={(value) =>
                  form.setValue(
                    "status",
                    value as "draft" | "pending" | "launched"
                  )
                }
              >
                <SelectTrigger className="h-9 sm:h-10 text-sm sm:text-base">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="size-1.5 sm:size-2 rounded-full bg-secondary" />
                      Draft
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="size-1.5 sm:size-2 rounded-full bg-yellow-500" />
                      Pending Review
                    </div>
                  </SelectItem>
                  <SelectItem value="launched">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="size-1.5 sm:size-2 rounded-full bg-green-500" />
                      Launch Now
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* SUMMARY */}
            <div className="rounded-lg bg-secondary/50 p-3 sm:p-4 space-y-2 sm:space-y-3">
              <h4 className="font-medium text-sm sm:text-base">
                Project Summary
              </h4>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <p>
                  <span className="text-muted-foreground">Name:</span>{" "}
                  {watchedValues.name || "Not set"}
                </p>
                <p>
                  <span className="text-muted-foreground">Tagline:</span>{" "}
                  {watchedValues.tagline || "Not set"}
                </p>
                <p>
                  <span className="text-muted-foreground">Tech Stack:</span>{" "}
                  {techStack.length > 0 ? techStack.join(", ") : "None"}
                </p>
                <p>
                  <span className="text-muted-foreground">Categories:</span>{" "}
                  {categoryIds.length > 0
                    ? categories
                        .filter((c) => categoryIds.includes(c.id))
                        .map((c) => c.name)
                        .join(", ")
                    : "None"}
                </p>
              </div>
            </div>
          </Card>
        )}
        {/* NAVIGATION */}
        <div className="flex items-center justify-between mt-4 sm:mt-6">
          {/* BACK BUTTON */}
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
          >
            <ArrowLeft className="size-3.5 sm:size-4 mr-1.5 sm:mr-2" />
            Back
          </Button>
          {/* NEXT/SUBMIT BUTTON */}
          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
            >
              Next
              <ArrowRight className="size-3.5 sm:size-4 ml-1.5 sm:ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 sm:size-4 mr-1.5 sm:mr-2 animate-spin" />
                  <span className="hidden sm:inline">
                    {isEditing ? "Updating..." : "Creating..."}
                  </span>
                  <span className="sm:hidden">
                    {isEditing ? "Updating" : "Creating"}
                  </span>
                </>
              ) : (
                <>
                  <Rocket className="size-3.5 sm:size-4 mr-1.5 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {isEditing ? "Update Project" : "Create Project"}
                  </span>
                  <span className="sm:hidden">
                    {isEditing ? "Update" : "Create"}
                  </span>
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
