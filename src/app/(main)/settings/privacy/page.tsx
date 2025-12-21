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
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold font-heading">Privacy</h2>
        <p className="text-muted-foreground mt-1">
          Control your privacy and data settings
        </p>
      </div>
      {/* INFO CARD */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <Shield className="size-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-primary">Your Privacy Matters</h3>
            <p className="text-sm text-muted-foreground mt-1">
              We take your privacy seriously. You have full control over your
              data and how it&apos;s used on OpenLaunch.
            </p>
          </div>
        </div>
      </Card>
      {/* PROFILE VISIBILITY */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Eye className="size-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Profile Visibility</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Control who can see your profile and activity
              </p>
            </div>
          </div>
          <Button variant="outline" disabled>
            Coming Soon
          </Button>
        </div>
      </Card>
      {/* DATA EXPORT */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Download className="size-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Export Data</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Download a copy of all your data
              </p>
            </div>
          </div>
          <Button variant="outline" disabled>
            Coming Soon
          </Button>
        </div>
      </Card>
      {/* PRIVACY POLICY */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <FileText className="size-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Privacy Policy</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Read our privacy policy
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <a href="/privacy" target="_blank">
              View Policy
            </a>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PrivacySettingsPage;
