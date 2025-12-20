// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";
import {
  AuthCard,
  AuthCardHeader,
  AuthFormSection,
} from "@/components/auth/auth-card";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";

// <== RESET PASSWORD FORM COMPONENT ==>
export const ResetPasswordForm = () => {
  // STATE FOR PASSWORD VISIBILITY
  const [showPassword, setShowPassword] = useState(false);
  // STATE FOR CONFIRM PASSWORD VISIBILITY
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // STATE FOR ERROR
  const [error, setError] = useState<string | null>(null);
  // STATE FOR SUCCESS
  const [success, setSuccess] = useState(false);
  // GET AUTH HOOK
  const { updatePassword, isLoading } = useAuth();
  // FORM HOOK
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  // FORM ERRORS
  const { errors, isSubmitting } = form.formState;
  // IS FORM DISABLED
  const isDisabled = isLoading || isSubmitting;
  // <== HANDLE FORM SUBMIT ==>
  const onSubmit = async (data: ResetPasswordInput) => {
    // RESET STATES
    setError(null);
    setSuccess(false);
    // UPDATE PASSWORD
    const result = await updatePassword(data);
    // CHECK IF ERROR
    if (!result.success) {
      // SET ERROR
      setError(result.error ?? "Failed to update password");
    } else {
      // SET SUCCESS
      setSuccess(true);
    }
  };
  // <== RENDER SUCCESS STATE ==>
  if (success) {
    // RETURNING SUCCESS STATE
    return (
      // AUTH CARD
      <AuthCard className="text-center">
        {/* SUCCESS ICON */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
          className="flex justify-center mb-6"
        >
          <div className="p-4 rounded-full bg-primary/10 ring-4 ring-primary/5">
            <CheckCircle2 className="size-8 text-primary" />
          </div>
        </motion.div>
        {/* SUCCESS TITLE */}
        <AuthFormSection>
          <h2 className="text-xl font-bold font-heading mb-2">
            Password updated
          </h2>
        </AuthFormSection>
        {/* SUCCESS MESSAGE */}
        <AuthFormSection>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            Your password has been successfully updated. You can now sign in
            with your new password.
          </p>
        </AuthFormSection>
        {/* SIGN IN BUTTON */}
        <AuthFormSection>
          <Button
            asChild
            className="w-full h-11 font-medium transition-all duration-200 hover:opacity-90"
          >
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </AuthFormSection>
      </AuthCard>
    );
  }
  // RETURNING RESET PASSWORD FORM COMPONENT
  return (
    // AUTH CARD
    <AuthCard>
      {/* AUTH CARD HEADER */}
      <AuthCardHeader
        title="Set new password"
        description="Create a strong password for your account"
      />
      {/* FORM */}
      <AuthFormSection>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* ERROR MESSAGE */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
              {error}
            </div>
          )}
          {/* PASSWORD FIELD */}
          <div className="space-y-2">
            {/* LABEL */}
            <Label htmlFor="password" className="text-sm font-medium">
              New Password
            </Label>
            {/* INPUT CONTAINER */}
            <div className="relative">
              {/* INPUT */}
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                autoComplete="new-password"
                disabled={isDisabled}
                className="h-11 pr-10 transition-colors focus:border-primary"
                {...form.register("password")}
              />
              {/* TOGGLE PASSWORD VISIBILITY */}
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-200"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {/* ERROR */}
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
            {/* PASSWORD HINT */}
            <p className="text-xs text-muted-foreground/70">
              Min 8 chars with uppercase, lowercase & number
            </p>
          </div>
          {/* CONFIRM PASSWORD FIELD */}
          <div className="space-y-2">
            {/* LABEL */}
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </Label>
            {/* INPUT CONTAINER */}
            <div className="relative">
              {/* INPUT */}
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                autoComplete="new-password"
                disabled={isDisabled}
                className="h-11 pr-10 transition-colors focus:border-primary"
                {...form.register("confirmPassword")}
              />
              {/* TOGGLE PASSWORD VISIBILITY */}
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-200"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {/* ERROR */}
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          {/* SUBMIT BUTTON */}
          <Button
            type="submit"
            className="w-full h-11 font-medium transition-all duration-200 hover:opacity-90"
            disabled={isDisabled}
          >
            {/* LOADING SPINNER */}
            {isDisabled && <Loader2 className="mr-2 size-4 animate-spin" />}
            {/* BUTTON TEXT */}
            Update Password
          </Button>
        </form>
      </AuthFormSection>
    </AuthCard>
  );
};
