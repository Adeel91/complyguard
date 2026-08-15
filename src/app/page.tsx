import { Frameworks } from "@/components/marketing/frameworks";
import { Hero } from "@/components/marketing/hero";
import { Workflow } from "@/components/marketing/workflow";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main>
        <Hero />
        <Frameworks />
        <Workflow />
      </main>

      <SiteFooter />
    </>
  );
}
