import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — CampusXchange" },
      {
        name: "description",
        content: "How CampusXchange collects, uses and protects your student account data.",
      },
      { property: "og:title", content: "Privacy Policy — CampusXchange" },
      { property: "og:description", content: "Our approach to student data, listings and messages." },
    ],
  }),
  component: Privacy,
});

const SECTIONS = [
  {
    title: "What we collect",
    body: "Your account email, the profile details you choose to add (name, department, year, college, phone, bio and photo), the listings you publish, your wishlist and the messages you send through the app.",
  },
  {
    title: "How we use it",
    body: "To show your listings to other students, to deliver messages and notifications, and to keep the marketplace safe. We do not sell your data or run third-party ad tracking.",
  },
  {
    title: "What other students see",
    body: "Your name, college, department, year, bio and photo appear on your listings. Your phone number is only shown to signed-in students on your listing pages.",
  },
  {
    title: "Storage and access",
    body: "Data is stored in our managed cloud backend with row-level access rules, so each account can only read and change its own private records. Listing photos are served through expiring signed links.",
  },
  {
    title: "Your choices",
    body: "You can edit or delete your listings at any time, clear your wishlist, and update or remove profile details from the profile page. Contact us to request deletion of your account data.",
  },
  {
    title: "Moderation",
    body: "Administrators can review and remove listings or reports that break campus rules. This page is maintained by the app owner and is not an independent certification.",
  },
];

function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-4xl font-extrabold">Privacy policy</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated {new Date().getFullYear()}. Plain language, no legal maze.
      </p>
      <div className="mt-10 space-y-4">
        {SECTIONS.map((s) => (
          <Card key={s.title} className="gap-2 p-7">
            <h2 className="font-display text-lg font-semibold">{s.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
