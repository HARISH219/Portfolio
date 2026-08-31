// -----------------------------------------------------------------------------
// SITE CONFIG
// Edit this file to update identity, availability, and social links.
// Only social links with a non-empty `href` are rendered anywhere on the site.
// -----------------------------------------------------------------------------

export type SocialLink = {
  label: string;
  href: string; // leave empty ("") to hide this link everywhere
  handle?: string;
};

export const site = {
  name: "Harish Bag",
  monogram: "HB.", // short logo mark shown in the navbar
  role: "DEVELOPER / BUILDER / EXPERIMENTER",
  availability: {
    label: "Currently building",
    active: true,
  },
  // Primary contact address used by the "Start a conversation" button.
  email: "hello@harishbag.dev", // placeholder — replace with a real address
  githubUsername: "HARISH219",
  githubUrl: "https://github.com/HARISH219",
};

// Only entries with a real `href` are shown. Leave href empty to hide.
export const socials: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/HARISH219", handle: "@HARISH219" },
  { label: "LinkedIn", href: "", handle: "" },
  { label: "Discord", href: "", handle: "" },
  { label: "Instagram", href: "", handle: "" },
];

export const visibleSocials = () => socials.filter((s) => s.href.trim() !== "");
