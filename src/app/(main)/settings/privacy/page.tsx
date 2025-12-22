// <== IMPORTS ==>
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Eye, Download, FileText } from "lucide-react";

// <== METADATA ==>
export const metadata: Metadata = {
  // <== TITLE ==>
  title: "Privacy Settings",
  // <== DESCRIPTION ==>
  description: "Manage your privacy settings",
};

// <== PRIVACY SETTINGS PAGE ==>
const PrivacySettingsPage = () => {
  // RETURNING PAGE
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-heading">Privacy</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Control your privacy and data settings
        </p>
      </div>
      {/* INFO CARD */}
      <Card className="p-3 sm:p-4 md:p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-2.5 sm:gap-3 md:gap-4">
          <div className="size-8 sm:size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="size-4 sm:size-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-primary">
              Your Privacy Matters
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
              We take your privacy seriously. You have full control over your
              data and how it&apos;s used on OpenLaunch.
            </p>
          </div>
        </div>
      </Card>
      {/* PROFILE VISIBILITY */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="size-9 sm:size-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Eye className="size-4 sm:size-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base">
                Profile Visibility
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                Control who can see your profile and activity
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            disabled
            size="sm"
            className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm w-fit"
          >
            Coming Soon
          </Button>
        </div>
      </Card>
      {/* DATA EXPORT */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="size-9 sm:size-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Download className="size-4 sm:size-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base">
                Export Data
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                Download a copy of all your data
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            disabled
            size="sm"
            className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm w-fit"
          >
            Coming Soon
          </Button>
        </div>
      </Card>
      {/* PRIVACY POLICY */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="size-9 sm:size-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <FileText className="size-4 sm:size-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base">
                Privacy Policy
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                Read our privacy policy
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            asChild
            size="sm"
            className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm w-fit"
          >
            <a href="/privacy" target="_blank">
              View Policy
            </a>
          </Button>
        </div>
      </Card>
    </div>
  );
};

// <== EXPORTING PRIVACY SETTINGS PAGE ==>
export default PrivacySettingsPage;
