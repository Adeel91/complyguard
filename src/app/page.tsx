import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Capabilities } from "@/components/marketing/capabilities";
import { CTA } from "@/components/marketing/cta";
import { Frameworks } from "@/components/marketing/frameworks";
import { Hero } from "@/components/marketing/hero";
import { Workflow } from "@/components/marketing/workflow";

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main>
        <Hero />
        <Capabilities />
        <Frameworks />
        <Workflow />
        <CTA />
      </main>

      <SiteFooter />
    </>
  );
}
