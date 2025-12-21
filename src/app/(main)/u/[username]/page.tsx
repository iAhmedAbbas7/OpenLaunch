// <== IMPORTS ==>
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfilePageClient } from "./profile-page-client";
import { getProfileWithStats } from "@/server/actions/profiles";

// <== PAGE PROPS ==>
interface ProfilePageProps {
  // <== USERNAME ==>
  params: Promise<{ username: string }>;
  // <== SEARCH PARAMS ==>
  searchParams: Promise<{ tab?: string }>;
}

// <== GENERATE METADATA ==>
export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  // GET USERNAME
  const { username } = await params;
  // FETCH PROFILE
  const result = await getProfileWithStats(username);
  // CHECK IF PROFILE EXISTS
  if (!result.success) {
    // RETURN METADATA
    return {
      title: "Profile Not Found",
    };
  }
  // GET PROFILE DATA
  const profile = result.data;
  // RETURN METADATA
  return {
    title: profile.displayName ?? profile.username,
    description:
      profile.bio ??
      `Check out ${
        profile.displayName ?? profile.username
      }'s profile on OpenLaunch`,
    openGraph: {
      title: profile.displayName ?? profile.username,
      description:
        profile.bio ??
        `Check out ${
          profile.displayName ?? profile.username
        }'s profile on OpenLaunch`,
      images: profile.avatarUrl ? [profile.avatarUrl] : undefined,
      type: "profile",
      username: profile.username,
    },
    twitter: {
      card: "summary",
      title: profile.displayName ?? profile.username,
      description:
        profile.bio ??
        `Check out ${
          profile.displayName ?? profile.username
        }'s profile on OpenLaunch`,
      images: profile.avatarUrl ? [profile.avatarUrl] : undefined,
    },
  };
}

// <== PROFILE PAGE ==>
const ProfilePage = async ({ params, searchParams }: ProfilePageProps) => {
  // GET USERNAME AND TAB
  const { username } = await params;
  // GET TAB
  const { tab } = await searchParams;
  // FETCH PROFILE
  const result = await getProfileWithStats(username);
  // CHECK IF PROFILE EXISTS
  if (!result.success) {
    notFound();
  }
  // RETURN PAGE
  return <ProfilePageClient profile={result.data} initialTab={tab} />;
};

export default ProfilePage;
