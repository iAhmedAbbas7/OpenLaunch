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
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold font-heading">Account</h2>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and security
        </p>
      </div>
      {/* EMAIL SECTION */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Email Address</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Update your email address
              </p>
            </div>
          </div>
          <Button variant="outline" disabled>
            Coming Soon
          </Button>
        </div>
      </Card>
      {/* PASSWORD SECTION */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Key className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Password</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Change your password
              </p>
            </div>
          </div>
          <Button variant="outline" disabled>
            Coming Soon
          </Button>
        </div>
      </Card>
      {/* DANGER ZONE */}
      <Card className="p-6 border-destructive/50">
        <h3 className="font-semibold text-destructive mb-4">Danger Zone</h3>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <Trash2 className="size-5 text-destructive" />
            </div>
            <div>
              <h4 className="font-medium">Delete Account</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete your account and all data
              </p>
            </div>
          </div>
          <Button variant="destructive" disabled>
            Coming Soon
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AccountSettingsPage;
