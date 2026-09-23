import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProjectDetail } from "@/components/projects/ProjectDetail";
import { getFeaturedProject, routableProjects } from "@/data/projects";

// Pre-render every routable project at build time.
export function generateStaticParams() {
  return routableProjects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const project = getFeaturedProject(params.slug);
  if (!project) return { title: "Project not found — Harish Bag" };
  return {
    title: `${project.name} — Harish Bag`,
    description: project.longDescription ?? project.description,
  };
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getFeaturedProject(params.slug);
  if (!project || project.external) notFound();

  return (
    <>
      <Navbar />
      <ProjectDetail project={project} />
      <Footer />
    </>
  );
}
