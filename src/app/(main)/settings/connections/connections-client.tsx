// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  Github,
  Twitter,
  Check,
  Plus,
  Loader2,
  ExternalLink,
  Unlink,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useGitHubConnectionStatus, useDisconnectGitHub } from "@/hooks";

// <== SKELETON COMPONENT ==>
const Skeleton = ({ className }: { className?: string }) => {
  // RETURNING SKELETON COMPONENT
  return <div className={`bg-secondary rounded animate-pulse ${className}`} />;
};

// <== CONNECTIONS CLIENT COMPONENT ==>
export const ConnectionsClient = () => {
  // STATE FOR DISCONNECT DIALOG
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  // STATE FOR CONNECTING
  const [isConnecting, setIsConnecting] = useState(false);
  // GITHUB CONNECTION STATUS
  const { data: githubStatus, isLoading: isLoadingGitHub } =
    useGitHubConnectionStatus();
  // DISCONNECT MUTATION
  const disconnectGitHub = useDisconnectGitHub();
  // <== HANDLE GITHUB CONNECT ==>
  const handleGitHubConnect = async () => {
    // SET CONNECTING
    setIsConnecting(true);
    // TRY TO CONNECT GITHUB
    try {
      // CREATE SUPABASE CLIENT
      const supabase = createClient();
      // GET CURRENT URL FOR REDIRECT
      const redirectTo = `${window.location.origin}/auth/callback?next=/settings/connections`;
      // SIGN IN WITH GITHUB
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo,
          scopes: "read:user user:email repo read:org",
        },
      });
      // CHECK FOR ERROR
      if (error) {
        // LOG ERROR
        console.error("GitHub OAuth error:", error);
      }
    } catch (error) {
      // LOG ERROR
      console.error("GitHub connect error:", error);
    } finally {
      // SET CONNECTING TO FALSE
      setIsConnecting(false);
    }
  };
  // <== HANDLE GITHUB DISCONNECT ==>
  const handleGitHubDisconnect = async () => {
    // DISCONNECT
    await disconnectGitHub.mutateAsync();
    // CLOSE DIALOG
    setShowDisconnectDialog(false);
  };
  // RETURNING COMPONENT
  return (
    <>
      <div className="space-y-3 sm:space-y-4">
        {/* GITHUB CONNECTION */}
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* ICON / AVATAR */}
              <div className="size-10 sm:size-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                {isLoadingGitHub ? (
                  <Skeleton className="size-10 sm:size-12 rounded-lg" />
                ) : githubStatus?.isConnected && githubStatus?.avatarUrl ? (
                  <Image
                    src={githubStatus.avatarUrl}
                    alt={githubStatus.username || "GitHub"}
                    width={48}
                    height={48}
                    className="size-10 sm:size-12 object-cover"
                  />
                ) : (
                  <Github className="size-5 sm:size-6" />
                )}
              </div>
              {/* INFO */}
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base">GitHub</h3>
                {isLoadingGitHub ? (
                  <Skeleton className="h-3 sm:h-4 w-36 sm:w-48 mt-1" />
                ) : githubStatus?.isConnected ? (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                    <span>Connected as</span>
                    <a
                      href={`https://github.com/${githubStatus.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1 truncate"
                    >
                      @{githubStatus.username}
                      <ExternalLink className="size-2.5 sm:size-3 shrink-0" />
                    </a>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Import repositories and sync your projects
                  </p>
                )}
              </div>
            </div>
            {/* ACTIONS */}
            {isLoadingGitHub ? (
              <Skeleton className="h-8 sm:h-9 w-24 sm:w-28 shrink-0" />
            ) : githubStatus?.isConnected ? (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 sm:gap-2 h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm"
                  disabled
                >
                  <Check className="size-3.5 sm:size-4 text-green-500" />
                  Connected
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive size-8 sm:size-9"
                  onClick={() => setShowDisconnectDialog(true)}
                >
                  <Unlink className="size-3.5 sm:size-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 sm:gap-2 h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm w-fit shrink-0"
                onClick={handleGitHubConnect}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <Loader2 className="size-3.5 sm:size-4 animate-spin" />
                ) : (
                  <Plus className="size-3.5 sm:size-4" />
                )}
                Connect
              </Button>
            )}
          </div>
          {/* CONNECTED FEATURES */}
          {githubStatus?.isConnected && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
              <h4 className="text-xs sm:text-sm font-medium mb-2">
                Available Features
              </h4>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 sm:space-y-1.5">
                <li className="flex items-center gap-1.5 sm:gap-2">
                  <Check className="size-2.5 sm:size-3 text-green-500 shrink-0" />
                  Import repositories as projects
                </li>
                <li className="flex items-center gap-1.5 sm:gap-2">
                  <Check className="size-2.5 sm:size-3 text-green-500 shrink-0" />
                  Display repository stats (stars, forks)
                </li>
                <li className="flex items-center gap-1.5 sm:gap-2">
                  <Check className="size-2.5 sm:size-3 text-green-500 shrink-0" />
                  Browse source code in projects
                </li>
                <li className="flex items-center gap-1.5 sm:gap-2">
                  <Check className="size-2.5 sm:size-3 text-green-500 shrink-0" />
                  Auto-detect tech stack from languages
                </li>
              </ul>
            </div>
          )}
        </Card>

        {/* TWITTER CONNECTION (COMING SOON) */}
        <Card className="p-4 sm:p-6 opacity-60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="size-10 sm:size-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Twitter className="size-5 sm:size-6" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">
                  Twitter / X
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Share updates and connect with followers
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 sm:gap-2 h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm w-fit shrink-0"
              disabled
            >
              <Plus className="size-3.5 sm:size-4" />
              Coming Soon
            </Button>
          </div>
        </Card>
      </div>

      {/* DISCONNECT CONFIRMATION DIALOG */}
      <AlertDialog
        open={showDisconnectDialog}
        onOpenChange={setShowDisconnectDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect GitHub?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your GitHub connection. You won&apos;t be able to
              import repositories or view code until you reconnect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGitHubDisconnect}
              disabled={disconnectGitHub.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {disconnectGitHub.isPending ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : null}
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
