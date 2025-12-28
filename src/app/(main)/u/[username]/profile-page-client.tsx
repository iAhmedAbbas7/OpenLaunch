// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import {
  ProfileHeader,
  ProfileTabs,
  ProfileTabContent,
  ProfileProjects,
  ProfileArticles,
  ProfileFollowers,
  ProfileFollowing,
} from "@/components/profile";
import { useCallback } from "react";
import { Activity, Trophy } from "lucide-react";
import type { ProfileWithStats } from "@/types/database";
import { useRouter, useSearchParams } from "next/navigation";

// <== PROFILE PAGE CLIENT PROPS ==>
interface ProfilePageClientProps {
  // <== PROFILE DATA ==>
  profile: ProfileWithStats;
  // <== INITIAL TAB ==>
  initialTab?: string;
}

// <== PROFILE PAGE CLIENT COMPONENT ==>
export const ProfilePageClient = ({
  profile,
  initialTab = "projects",
}: ProfilePageClientProps) => {
  // GET ROUTER
  const router = useRouter();
  // GET SEARCH PARAMS
  const searchParams = useSearchParams();
  // GET ACTIVE TAB
  const activeTab = searchParams.get("tab") ?? initialTab;
  // <== HANDLE TAB CHANGE ==>
  const handleTabChange = useCallback(
    (tab: string) => {
      // UPDATE URL WITH NEW TAB
      const params = new URLSearchParams(searchParams.toString());
      // CHECK IF TAB IS PROJECTS
      if (tab === "projects") {
        // DELETE TAB FROM SEARCH PARAMS
        params.delete("tab");
      } else {
        // SET TAB IN SEARCH PARAMS
        params.set("tab", tab);
      }
      // BUILD QUERY STRING
      const queryString = params.toString();
      // PUSH NEW URL
      router.push(
        `/u/${profile.username}${queryString ? `?${queryString}` : ""}`,
        {
          scroll: false,
        }
      );
    },
    [profile.username, router, searchParams]
  );
  // RETURNING PROFILE PAGE CLIENT
  return (
    <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* PROFILE HEADER */}
      <ProfileHeader profile={profile} />
      {/* PROFILE TABS */}
      <ProfileTabs
        profile={profile}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        className="mt-6 sm:mt-8"
      >
        {/* PROJECTS TAB */}
        <ProfileTabContent value="projects">
          <ProfileProjects profileId={profile.id} />
        </ProfileTabContent>
        {/* ARTICLES TAB */}
        <ProfileTabContent value="articles">
          <ProfileArticles profileId={profile.id} />
        </ProfileTabContent>
        {/* ACTIVITY TAB */}
        <ProfileTabContent value="activity">
          <div className="text-center py-8 sm:py-12">
            <Activity className="size-10 sm:size-12 text-muted-foreground/50 mx-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-muted-foreground">
              No recent activity
            </p>
          </div>
        </ProfileTabContent>
        {/* ACHIEVEMENTS TAB */}
        <ProfileTabContent value="achievements">
          <div className="text-center py-8 sm:py-12">
            <Trophy className="size-10 sm:size-12 text-muted-foreground/50 mx-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-muted-foreground">
              No achievements yet
            </p>
          </div>
        </ProfileTabContent>
        {/* FOLLOWERS TAB */}
        <ProfileTabContent value="followers">
          <ProfileFollowers profileId={profile.id} />
        </ProfileTabContent>
        {/* FOLLOWING TAB */}
        <ProfileTabContent value="following">
          <ProfileFollowing profileId={profile.id} />
        </ProfileTabContent>
      </ProfileTabs>
    </div>
  );
};
