// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
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
import { Loader2, ArrowLeft, Mail } from "lucide-react";

// <== FORGOT PASSWORD FORM COMPONENT ==>
export const ForgotPasswordForm = () => {
  // STATE FOR ERROR
  const [error, setError] = useState<string | null>(null);
  // STATE FOR SUCCESS
  const [success, setSuccess] = useState(false);
  // GET AUTH HOOK
  const { requestPasswordReset, isLoading } = useAuth();
  // FORM HOOK
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  // FORM ERRORS
  const { errors, isSubmitting } = form.formState;
  // IS FORM DISABLED
  const isDisabled = isLoading || isSubmitting;
  // <== HANDLE FORM SUBMIT ==>
  const onSubmit = async (data: ForgotPasswordInput) => {
    // RESET STATES
    setError(null);
    // RESET SUCCESS
    setSuccess(false);
    // REQUEST PASSWORD RESET
    const result = await requestPasswordReset(data);
    // CHECK IF ERROR
    if (!result.success) {
      // SET ERROR
      setError(result.error ?? "Failed to send reset email");
    } else {
      // SET SUCCESS (ALWAYS SHOW SUCCESS FOR SECURITY)
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
            <Mail className="size-8 text-primary" />
          </div>
        </motion.div>
        {/* SUCCESS TITLE */}
        <AuthFormSection>
          <h2 className="text-xl font-bold font-heading mb-2">
            Check your email
          </h2>
        </AuthFormSection>
        {/* SUCCESS MESSAGE */}
        <AuthFormSection>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            If an account exists with that email, we sent you a password reset
            link.
          </p>
        </AuthFormSection>
        {/* BACK TO SIGN IN */}
        <AuthFormSection>
          <Button
            asChild
            variant="outline"
            className="w-full h-11 transition-all duration-200 hover:bg-foreground/5"
          >
            <Link href="/sign-in">Back to Sign In</Link>
          </Button>
        </AuthFormSection>
      </AuthCard>
    );
  }
  // RETURNING FORGOT PASSWORD FORM COMPONENT
  return (
    // AUTH CARD
    <AuthCard>
      {/* BACK TO SIGN IN LINK */}
      <AuthFormSection>
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-200 mb-6"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>
      </AuthFormSection>
      {/* AUTH CARD HEADER */}
      <AuthCardHeader
        title="Forgot password?"
        description="Enter your email and we'll send you a reset link"
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
          {/* EMAIL FIELD */}
          <div className="space-y-2">
            {/* LABEL */}
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            {/* INPUT */}
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isDisabled}
              className="h-11 transition-colors focus:border-primary"
              {...form.register("email")}
            />
            {/* ERROR */}
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
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
            Send Reset Link
          </Button>
        </form>
      </AuthFormSection>
    </AuthCard>
  );
};
