/**
 * #48 The account manager agreement.
 *
 * Every manager signs this with their full legal name before they get clients.
 * The signed copy is downloadable (by the manager and the owner) and the signing
 * is written to the audit log. One source for the text and the version, so the
 * onboarding step, the profile card and the owner's record stay in step.
 */

export const AGREEMENT_VERSION = "1.0";

export type AgreementSection = { title: string; body: string };

/** Short, plain-language terms. Not legal advice; the real contract is signed off the platform in Phase 2. */
export const agreementSections: AgreementSection[] = [
  {
    title: "Your role",
    body: "You manage the LinkedIn presence of the clients assigned to you: strategy, drafts, scheduling guidance and engagement, to the standard set out in the Bluecut framework. You attend every call a client books with you.",
  },
  {
    title: "Client confidentiality",
    body: "Everything you see about a client, their business and their accounts is confidential. You use it only to do their work, never for yourself or anyone else, during the engagement and after it ends.",
  },
  {
    title: "Access to client accounts",
    body: "When a client delegates access, you reach their account only through Bluecut's secure vault, only for their approved work, and only for as long as they allow it. You never store, copy or share their credentials. Access attempts outside this are blocked and follow the two-strike policy: a first attempt is a warning, a second bars your access.",
  },
  {
    title: "Standards and conduct",
    body: "You follow the Bluecut framework, platform rules and the law. You post nothing a client has marked off-limits. You keep your two-step sign-in on at all times. Missed calls, missed due times and complaints are tracked and reviewed.",
  },
  {
    title: "Working relationship and pay",
    body: "You work as an independent contractor. Bluecut pays you off the platform, by the terms agreed with you separately; the platform records your performance but takes no payment and holds no banking details.",
  },
  {
    title: "Ending",
    body: "Either side may end the arrangement with the agreed notice. On ending, your access stops, your clients are reassigned, and your confidentiality duties continue.",
  },
];

export type SignedAgreement = {
  /** The full legal name the manager typed to sign. */
  fullName: string;
  /** ISO timestamp of signing. */
  signedAt: string;
  /** Agreement version signed, so a later revision is distinguishable. */
  version: string;
};

/** Builds the signed terms as plain text and saves them to the manager's device. */
export function downloadAgreement(a: SignedAgreement, opts: { name: string; email: string }) {
  const signed = new Date(a.signedAt);
  const lines = [
    "BLUECUT SOCIALS — ACCOUNT MANAGER AGREEMENT",
    `Version ${a.version}`,
    "",
    `Manager: ${opts.name}`,
    `Email: ${opts.email}`,
    "",
    ...agreementSections.flatMap((s, i) => [`${i + 1}. ${s.title.toUpperCase()}`, s.body, ""]),
    "ACCEPTANCE",
    `Signed by ${a.fullName} on ${signed.toLocaleString()}.`,
    "By signing, the manager agreed to the terms above.",
    "",
  ];
  const href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" }));
  const stamp = signed.toISOString().slice(0, 10);
  const link = Object.assign(document.createElement("a"), {
    href,
    download: `bluecut-am-agreement-${opts.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${stamp}.txt`,
  });
  link.click();
  URL.revokeObjectURL(href);
}
