// <== IMPORTS ==>
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Key, Trash2 } from "lucide-react";

// <== METADATA ==>
export const metadata: Metadata = {
  // <== TITLE ==>
  title: "Account Settings",
  // <== DESCRIPTION ==>
  description: "Manage your account settings",
};

// <== ACCOUNT SETTINGS PAGE ==>
const AccountSettingsPage = () => {
  // RETURNING PAGE
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-heading">Account</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage your account settings and security
        </p>
      </div>
      {/* EMAIL SECTION */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="size-9 sm:size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="size-4 sm:size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base">
                Email Address
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                Update your email address
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
      {/* PASSWORD SECTION */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="size-9 sm:size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Key className="size-4 sm:size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base">Password</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                Change your password
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
      {/* DANGER ZONE */}
      <Card className="p-4 sm:p-6 border-destructive/50">
        <h3 className="font-semibold text-sm sm:text-base text-destructive mb-3 sm:mb-4">
          Danger Zone
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="size-9 sm:size-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <Trash2 className="size-4 sm:size-5 text-destructive" />
            </div>
            <div>
              <h4 className="font-medium text-sm sm:text-base">
                Delete Account
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                Permanently delete your account and all data
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            disabled
            size="sm"
            className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm w-fit"
          >
            Coming Soon
          </Button>
        </div>
      </Card>
    </div>
  );
};

// <== EXPORTING ACCOUNT SETTINGS PAGE ==>
export default AccountSettingsPage;
