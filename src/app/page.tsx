import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/hero/Hero";
import { Work } from "@/components/work/Work";
import { CurrentlyBuilding } from "@/components/sections/CurrentlyBuilding";
import { About } from "@/components/sections/About";
import { Personality } from "@/components/sections/Personality";
import { TechStack } from "@/components/sections/TechStack";
import { Experiments } from "@/components/sections/Experiments";
import { GitHubActivity } from "@/components/sections/GitHubActivity";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Work />
        <CurrentlyBuilding />
        <About />
        <Personality />
        <TechStack />
        <Experiments />
        <GitHubActivity />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
