// <== IMPORTS ==>
import { Suspense } from "react";
import { HomePageClient } from "./home-page-client";

// <== HOME PAGE ==>
const HomePage = () => {
  // RETURNING HOME PAGE
  return (
    <Suspense fallback={<div />}>
      <HomePageClient />
    </Suspense>
  );
};

// <== EXPORTING HOME PAGE ==>
export default HomePage;
