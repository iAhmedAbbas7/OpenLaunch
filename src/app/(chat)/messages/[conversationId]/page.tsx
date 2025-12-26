// <== IMPORTS ==>
import type { Metadata } from "next";
import { MessagesClient } from "../messages-client";

// <== PAGE PROPS ==>
interface ConversationPageProps {
  // <== PARAMS ==>
  params: Promise<{
    // <== CONVERSATION ID ==>
    conversationId: string;
  }>;
}

// <== METADATA ==>
export const metadata: Metadata = {
  // <== TITLE ==>
  title: "Conversation",
  // <== DESCRIPTION ==>
  description: "View your conversation",
};

// <== CONVERSATION PAGE COMPONENT ==>
export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  // AWAIT PARAMS
  const { conversationId } = await params;
  // RETURN CONVERSATION PAGE
  return <MessagesClient conversationId={conversationId} />;
}
