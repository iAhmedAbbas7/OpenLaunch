// <== IMPORTS ==>
import { Suspense } from "react";
import type { Metadata } from "next";
import { MessagesClient } from "./messages-client";

// <== METADATA ==>
export const metadata: Metadata = {
  // <== TITLE ==>
  title: "Messages",
  // <== DESCRIPTION ==>
  description: "Your private messages and conversations",
};

// <== MESSAGES PAGE COMPONENT ==>
export default function MessagesPage() {
  // RETURN MESSAGES PAGE
  return (
    <Suspense fallback={<div />}>
      <MessagesClient />
    </Suspense>
  );
}
