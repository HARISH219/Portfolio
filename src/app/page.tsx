import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/hero/Hero";
import { NewestProjects } from "@/components/sections/NewestProjects";
import { CurrentlyBuilding } from "@/components/sections/CurrentlyBuilding";
import { BuildingBlocks } from "@/components/sections/BuildingBlocks";
import { Work } from "@/components/work/Work";
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
        <NewestProjects />
        <CurrentlyBuilding />
        <BuildingBlocks />
        <Work />
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
