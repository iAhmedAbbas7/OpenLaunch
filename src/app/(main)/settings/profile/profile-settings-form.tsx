// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/validations/profiles";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm, useWatch } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Camera, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUserProfile, useUpdateProfile } from "@/hooks/use-profile";

// <== PROFILE SETTINGS FORM COMPONENT ==>
export const ProfileSettingsForm = () => {
  // GET CURRENT USER PROFILE
  const { data: profile, isLoading: isLoadingProfile } =
    useCurrentUserProfile();
  // GET UPDATE MUTATION
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  // LOCAL STATE FOR AVATAR PREVIEW (ONLY FOR UPLOAD PREVIEW)
  const [uploadedAvatarPreview, setUploadedAvatarPreview] = useState<
    string | null
  >(null);
  // DERIVE AVATAR PREVIEW FROM PROFILE OR UPLOAD
  const avatarPreview = uploadedAvatarPreview ?? profile?.avatarUrl ?? null;
  // FORM
  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      displayName: "",
      username: "",
      bio: "",
      website: "",
      location: "",
      twitterUsername: "",
      githubUsername: "",
    },
  });
  // FORM STATE
  const { errors, isDirty, isSubmitting } = form.formState;
  // WATCH BIO FIELD FOR CHARACTER COUNT
  const bioValue = useWatch({ control: form.control, name: "bio" });
  // IS FORM DISABLED
  const isDisabled = isUpdating || isSubmitting;
  // <== POPULATE FORM WITH PROFILE DATA ==>
  useEffect(() => {
    // CHECK IF PROFILE EXISTS
    if (profile) {
      // RESET FORM WITH PROFILE DATA
      form.reset({
        displayName: profile.displayName ?? "",
        username: profile.username,
        bio: profile.bio ?? "",
        website: profile.website ?? "",
        location: profile.location ?? "",
        twitterUsername: profile.twitterUsername ?? "",
        githubUsername: profile.githubUsername ?? "",
      });
    }
  }, [profile, form]);
  // <== HANDLE FORM SUBMIT ==>
  const onSubmit = (data: UpdateProfileInput) => {
    // CLEAN EMPTY STRINGS
    const cleanData: UpdateProfileInput = {
      ...data,
      website: data.website || undefined,
      twitterUsername: data.twitterUsername || undefined,
      githubUsername: data.githubUsername || undefined,
    };
    // UPDATE PROFILE
    updateProfile(cleanData);
  };
  // <== HANDLE AVATAR CHANGE ==>
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // GET FILE FROM INPUT
    const file = e.target.files?.[0];
    // CHECK IF FILE EXISTS
    if (!file) return;
    // CREATE FILE READER
    const reader = new FileReader();
    // SET UPLOADED AVATAR PREVIEW ON LOAD END
    reader.onloadend = () => {
      // SET UPLOADED AVATAR PREVIEW
      setUploadedAvatarPreview(reader.result as string);
    };
    // READ FILE AS DATA URL
    reader.readAsDataURL(file);
  };
  // HANDLE LOADING
  if (isLoadingProfile) {
    // RETURN PROFILE SETTINGS FORM SKELETON
    return <ProfileSettingsFormSkeleton />;
  }
  // RETURNING PROFILE SETTINGS FORM
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4 sm:space-y-6"
    >
      {/* AVATAR SECTION */}
      <Card className="p-4 sm:p-6">
        <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">
          Profile Picture
        </h3>
        <div className="flex items-center gap-4 sm:gap-6">
          {/* AVATAR */}
          <div className="relative group">
            <Avatar className="size-16 sm:size-20 md:size-24 ring-2 ring-border">
              <AvatarImage src={avatarPreview ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg sm:text-xl md:text-2xl font-bold">
                {profile?.displayName?.charAt(0) ??
                  profile?.username?.charAt(0) ??
                  "?"}
              </AvatarFallback>
            </Avatar>
            {/* UPLOAD OVERLAY */}
            <label
              htmlFor="avatar-upload"
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="size-5 sm:size-6 text-white" />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          {/* INFO */}
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Click to upload a new profile picture
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              Recommended: 400x400px, max 5MB
            </p>
          </div>
        </div>
      </Card>
      {/* BASIC INFO SECTION */}
      <Card className="p-4 sm:p-6">
        <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">
          Basic Information
        </h3>
        <div className="space-y-3 sm:space-y-4">
          {/* DISPLAY NAME */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="displayName" className="text-xs sm:text-sm">
              Display Name
            </Label>
            <Input
              id="displayName"
              placeholder="Your name"
              disabled={isDisabled}
              className="h-9 sm:h-10 text-sm sm:text-base"
              {...form.register("displayName")}
            />
            {errors.displayName && (
              <p className="text-[10px] sm:text-xs text-destructive">
                {errors.displayName.message}
              </p>
            )}
          </div>
          {/* USERNAME */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="username" className="text-xs sm:text-sm">
              Username
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm sm:text-base">
                @
              </span>
              <Input
                id="username"
                placeholder="username"
                className="pl-7 sm:pl-8 h-9 sm:h-10 text-sm sm:text-base"
                disabled={isDisabled}
                {...form.register("username")}
              />
            </div>
            {errors.username && (
              <p className="text-[10px] sm:text-xs text-destructive">
                {errors.username.message}
              </p>
            )}
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Your unique identifier on OpenLaunch
            </p>
          </div>
          {/* BIO */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="bio" className="text-xs sm:text-sm">
              Bio
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself"
              rows={3}
              disabled={isDisabled}
              className="text-sm sm:text-base resize-none sm:rows-4"
              {...form.register("bio")}
            />
            {errors.bio && (
              <p className="text-[10px] sm:text-xs text-destructive">
                {errors.bio.message}
              </p>
            )}
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {bioValue?.length ?? 0}/500 characters
            </p>
          </div>
          {/* LOCATION */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="location" className="text-xs sm:text-sm">
              Location
            </Label>
            <Input
              id="location"
              placeholder="San Francisco, CA"
              disabled={isDisabled}
              className="h-9 sm:h-10 text-sm sm:text-base"
              {...form.register("location")}
            />
            {errors.location && (
              <p className="text-[10px] sm:text-xs text-destructive">
                {errors.location.message}
              </p>
            )}
          </div>
          {/* WEBSITE */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="website" className="text-xs sm:text-sm">
              Website
            </Label>
            <Input
              id="website"
              type="url"
              placeholder="https://yourwebsite.com"
              disabled={isDisabled}
              className="h-9 sm:h-10 text-sm sm:text-base"
              {...form.register("website")}
            />
            {errors.website && (
              <p className="text-[10px] sm:text-xs text-destructive">
                {errors.website.message}
              </p>
            )}
          </div>
        </div>
      </Card>
      {/* SOCIAL LINKS SECTION */}
      <Card className="p-4 sm:p-6">
        <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">
          Social Links
        </h3>
        <div className="space-y-3 sm:space-y-4">
          {/* GITHUB */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="githubUsername" className="text-xs sm:text-sm">
              GitHub
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs sm:text-sm">
                github.com/
              </span>
              <Input
                id="githubUsername"
                placeholder="username"
                className="pl-20 sm:pl-22 h-9 sm:h-10 text-sm sm:text-base"
                disabled={isDisabled}
                {...form.register("githubUsername")}
              />
            </div>
            {errors.githubUsername && (
              <p className="text-[10px] sm:text-xs text-destructive">
                {errors.githubUsername.message}
              </p>
            )}
          </div>
          {/* TWITTER */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="twitterUsername" className="text-xs sm:text-sm">
              Twitter / X
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm sm:text-base">
                @
              </span>
              <Input
                id="twitterUsername"
                placeholder="username"
                className="pl-7 sm:pl-8 h-9 sm:h-10 text-sm sm:text-base"
                disabled={isDisabled}
                {...form.register("twitterUsername")}
              />
            </div>
            {errors.twitterUsername && (
              <p className="text-[10px] sm:text-xs text-destructive">
                {errors.twitterUsername.message}
              </p>
            )}
          </div>
        </div>
      </Card>
      {/* SUBMIT BUTTON */}
      <div className="flex items-center justify-end gap-2 sm:gap-4">
        {/* CANCEL BUTTON */}
        {isDirty && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => form.reset()}
            disabled={isDisabled}
            className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
          >
            Cancel
          </Button>
        )}
        {/* SAVE BUTTON */}
        <Button
          type="submit"
          disabled={isDisabled || !isDirty}
          size="sm"
          className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
        >
          {isUpdating ? (
            <>
              <Loader2 className="size-3.5 sm:size-4 mr-1.5 sm:mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="size-3.5 sm:size-4 mr-1.5 sm:mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

// <== PROFILE SETTINGS FORM SKELETON ==>
const ProfileSettingsFormSkeleton = () => {
  // RETURNING PROFILE SETTINGS FORM SKELETON
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* AVATAR SKELETON */}
      <Card className="p-4 sm:p-6">
        <div className="h-4 sm:h-5 w-28 sm:w-32 bg-secondary rounded animate-pulse mb-3 sm:mb-4" />
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="size-16 sm:size-20 md:size-24 rounded-full bg-secondary animate-pulse shrink-0" />
          <div className="space-y-1.5 sm:space-y-2 flex-1">
            <div className="h-3 sm:h-4 w-40 sm:w-48 max-w-full bg-secondary rounded animate-pulse" />
            <div className="h-2.5 sm:h-3 w-32 sm:w-36 max-w-full bg-secondary rounded animate-pulse" />
          </div>
        </div>
      </Card>
      {/* BASIC INFO SKELETON */}
      <Card className="p-4 sm:p-6">
        <div className="h-4 sm:h-5 w-32 sm:w-40 bg-secondary rounded animate-pulse mb-3 sm:mb-4" />
        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5 sm:space-y-2">
              <div className="h-3 sm:h-4 w-20 sm:w-24 bg-secondary rounded animate-pulse" />
              <div className="h-9 sm:h-10 w-full bg-secondary rounded animate-pulse" />
            </div>
          ))}
        </div>
      </Card>
      {/* SOCIAL LINKS SKELETON */}
      <Card className="p-4 sm:p-6">
        <div className="h-4 sm:h-5 w-24 sm:w-28 bg-secondary rounded animate-pulse mb-3 sm:mb-4" />
        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-1.5 sm:space-y-2">
              <div className="h-3 sm:h-4 w-16 sm:w-20 bg-secondary rounded animate-pulse" />
              <div className="h-9 sm:h-10 w-full bg-secondary rounded animate-pulse" />
            </div>
          ))}
        </div>
      </Card>
      {/* SUBMIT BUTTON SKELETON */}
      <div className="flex items-center justify-end">
        <div className="h-8 sm:h-9 w-28 sm:w-32 bg-secondary rounded animate-pulse" />
      </div>
    </div>
  );
};
