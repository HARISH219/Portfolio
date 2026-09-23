"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { DemoType } from "@/data/projects";

// Loading placeholder shown while a demo chunk loads.
function DemoSkeleton() {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="border-b border-bone/[0.08] bg-white/[0.02] px-4 py-2.5">
        <div className="h-4 w-40 animate-pulse rounded bg-white/[0.06]" />
      </div>
      <div className="space-y-3 p-4">
        <div className="h-24 animate-pulse rounded-xl bg-white/[0.04]" />
        <div className="h-40 animate-pulse rounded-xl bg-white/[0.04]" />
      </div>
    </div>
  );
}

// Each demo is code-split: its chunk only loads when a project page that uses
// it is opened (never on the homepage). ssr:false keeps interactive-only demos
// out of the server bundle.
const registry: Partial<Record<DemoType, ComponentType>> = {
  "discord-dashboard": dynamic(
    () => import("./demos/DiscordDemo").then((m) => m.DiscordDemo),
    { ssr: false, loading: DemoSkeleton },
  ),
  "ai-scam-detection": dynamic(
    () => import("./demos/ScamDemo").then((m) => m.ScamDemo),
    { ssr: false, loading: DemoSkeleton },
  ),
  "minecraft-server": dynamic(
    () => import("./demos/MinecraftDemo").then((m) => m.MinecraftDemo),
    { ssr: false, loading: DemoSkeleton },
  ),
  "automation-tools": dynamic(
    () => import("./demos/AutomationDemo").then((m) => m.AutomationDemo),
    { ssr: false, loading: DemoSkeleton },
  ),
  "document-manager": dynamic(
    () => import("./demos/DocumentDemo").then((m) => m.DocumentDemo),
    { ssr: false, loading: DemoSkeleton },
  ),
};

export function ProjectDemo({ demoType }: { demoType: DemoType }) {
  const Demo = registry[demoType];

  // Graceful fallback: a project without a demo component still renders cleanly.
  if (!Demo) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <p className="text-[13px] text-bone-muted">
          An interactive demo for this project isn&apos;t available yet.
        </p>
      </div>
    );
  }

  return <Demo />;
}
