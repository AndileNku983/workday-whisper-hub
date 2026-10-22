export type EmailPriority = "urgent" | "high" | "normal" | "low";

export interface DemoEmail {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  preview: string;
  body: string;
  receivedAt: string; // ISO
  priority: EmailPriority;
  unread: boolean;
  label: string;
}

const h = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 3600_000).toISOString();

export const DEMO_EMAILS: DemoEmail[] = [
  {
    id: "e1",
    from: "Priya Natarajan",
    fromEmail: "priya.n@meridiancorp.com",
    subject: "Contract redlines needed by 3pm today",
    preview: "Our legal team has two outstanding questions on clauses 4.2 and 7.1…",
    body: "Hi,\n\nOur legal team has two outstanding questions on clauses 4.2 (liability cap) and 7.1 (termination notice period). We need your position on both by 3pm today so we can sign before the quarter closes.\n\nCould you also confirm whether the SLA appendix is final?\n\nThanks,\nPriya",
    receivedAt: h(1),
    priority: "urgent",
    unread: true,
    label: "Client",
  },
  {
    id: "e2",
    from: "David Mokoena",
    fromEmail: "david.mokoena@company.com",
    subject: "Q4 budget review — slides for Thursday",
    preview: "Can you send your department's forecast slides before Wednesday EOD?",
    body: "Hi team,\n\nAhead of Thursday's leadership review, please send your department's Q4 forecast slides before Wednesday end of day. Highlight any variance above 5% and the main drivers.\n\nRegards,\nDavid\nFinance Director",
    receivedAt: h(3),
    priority: "high",
    unread: true,
    label: "Internal",
  },
  {
    id: "e3",
    from: "Sarah Chen",
    fromEmail: "sarah.chen@company.com",
    subject: "Agenda items for weekly sync?",
    preview: "Anything you'd like to add for Monday's sync? I've got the roadmap update…",
    body: "Hey!\n\nAnything you'd like to add for Monday's sync? So far I have the roadmap update and the hiring plan. Let me know by Friday.\n\nSarah",
    receivedAt: h(6),
    priority: "normal",
    unread: false,
    label: "Team",
  },
  {
    id: "e4",
    from: "IT Service Desk",
    fromEmail: "it-support@company.com",
    subject: "Scheduled maintenance this Saturday",
    preview: "VPN and email will be unavailable between 22:00 and 02:00…",
    body: "Hello,\n\nPlease note VPN and email will be unavailable this Saturday between 22:00 and 02:00 for scheduled maintenance. No action is required.\n\nIT Service Desk",
    receivedAt: h(20),
    priority: "low",
    unread: false,
    label: "Notice",
  },
  {
    id: "e5",
    from: "James Okafor",
    fromEmail: "james.okafor@company.com",
    subject: "Starting Monday — what should I prepare?",
    preview: "Really looking forward to joining. Is there anything I should read beforehand?",
    body: "Hi,\n\nReally looking forward to joining the team on Monday. Is there anything I should read or set up beforehand? Also, what time should I arrive?\n\nBest,\nJames",
    receivedAt: h(26),
    priority: "normal",
    unread: true,
    label: "Onboarding",
  },
  {
    id: "e6",
    from: "Vendor Partnerships",
    fromEmail: "partners@cloudsuite.io",
    subject: "Your annual renewal: 15% early-bird discount",
    preview: "Renew before the 31st and save 15% on your CloudSuite licence…",
    body: "Hello,\n\nRenew your CloudSuite licence before the 31st and save 15%. Reply to this email to receive your renewal quote.\n\nThe CloudSuite team",
    receivedAt: h(48),
    priority: "low",
    unread: false,
    label: "Vendor",
  },
];

const RANK: Record<EmailPriority, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
export const sortEmailsByPriority = (emails: DemoEmail[]) =>
  [...emails].sort((a, b) => RANK[a.priority] - RANK[b.priority] || b.receivedAt.localeCompare(a.receivedAt));
