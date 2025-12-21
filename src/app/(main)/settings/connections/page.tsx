// <== IMPORTS ==>
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Twitter, Link as LinkIcon, Check, Plus } from "lucide-react";

// <== METADATA ==>
export const metadata: Metadata = {
  // <== TITLE ==>
  title: "Connections",
  // <== DESCRIPTION ==>
  description: "Manage your connected accounts",
};

// <== CONNECTION OPTIONS ==>
const connections = [
  // <== GITHUB CONNECTION ==>
  {
    id: "github",
    name: "GitHub",
    icon: Github,
    description: "Import repositories and sync your projects",
    connected: false,
  },
  // <== TWITTER CONNECTION ==>
  {
    id: "twitter",
    name: "Twitter / X",
    icon: Twitter,
    description: "Share updates and connect with followers",
    connected: false,
  },
];

// <== CONNECTIONS SETTINGS PAGE ==>
const ConnectionsSettingsPage = () => {
  // RETURNING PAGE
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold font-heading">Connections</h2>
        <p className="text-muted-foreground mt-1">
          Connect external accounts to enhance your OpenLaunch experience
        </p>
      </div>
      {/* INFO CARD */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <LinkIcon className="size-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-primary">Coming Soon</h3>
            <p className="text-sm text-muted-foreground mt-1">
              GitHub integration will allow you to import repositories, sync
              project data, and display your open source contributions.
            </p>
          </div>
        </div>
      </Card>
      {/* CONNECTIONS LIST */}
      <div className="space-y-4">
        {/* CONNECTIONS */}
        {connections.map((connection) => {
          // GET ICON
          const Icon = connection.icon;
          // RETURN CONNECTION CARD
          return (
            <Card key={connection.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-lg bg-secondary flex items-center justify-center">
                    <Icon className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{connection.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {connection.description}
                    </p>
                  </div>
                </div>
                {connection.connected ? (
                  <Button variant="outline" className="gap-2">
                    <Check className="size-4 text-green-500" />
                    Connected
                  </Button>
                ) : (
                  <Button variant="outline" className="gap-2" disabled>
                    <Plus className="size-4" />
                    Connect
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ConnectionsSettingsPage;
