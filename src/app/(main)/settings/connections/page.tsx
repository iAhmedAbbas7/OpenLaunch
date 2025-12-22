// <== IMPORTS ==>
import { Info } from "lucide-react";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { ConnectionsClient } from "./connections-client";

// <== METADATA ==>
export const metadata: Metadata = {
  // <== TITLE ==>
  title: "Connections",
  // <== DESCRIPTION ==>
  description: "Manage your connected accounts",
};

// <== CONNECTIONS SETTINGS PAGE ==>
const ConnectionsSettingsPage = () => {
  // RETURNING PAGE
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-heading">
          Connections
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Connect external accounts to enhance your OpenLaunch experience
        </p>
      </div>

      {/* INFO CARD */}
      <Card className="p-3 sm:p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="size-7 sm:size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Info className="size-3.5 sm:size-4 text-primary" />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Connecting your GitHub account allows you to import repositories,
            sync project data, and display your open source contributions on
            your profile.
          </p>
        </div>
      </Card>
      {/* CONNECTIONS LIST */}
      <ConnectionsClient />
    </div>
  );
};

export default ConnectionsSettingsPage;
