import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { HomeExperience } from "@/components/marketing/home-experience";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <HomeExperience />
      <SiteFooter />
    </main>
  );
}
