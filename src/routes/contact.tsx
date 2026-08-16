import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — CampusXchange" },
      {
        name: "description",
        content: "Questions, feedback or a listing to report? Reach the CampusXchange team.",
      },
      { property: "og:title", content: "Contact — CampusXchange" },
      { property: "og:description", content: "Get in touch with the CampusXchange team." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-4xl font-extrabold">Get in touch</h1>
      <p className="mt-3 text-muted-foreground">
        We usually reply within a day during the semester.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-[1fr_260px]">
        <Card className="p-8">
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              e.currentTarget.reset();
              toast.success("Thanks! We'll get back to you soon.");
            }}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required maxLength={255} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" rows={5} required maxLength={1000} />
            </div>
            <Button type="submit" className="rounded-full">
              Send message
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          {[
            { icon: Mail, title: "Email", body: "hello@campusmarket.app" },
            { icon: MessageSquare, title: "In-app chat", body: "Message any seller directly" },
            { icon: MapPin, title: "Where", body: "Your campus, every campus" },
          ].map(({ icon: Icon, title, body }) => (
            <Card key={title} className="gap-1 p-5">
              <Icon className="size-5 text-primary" />
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-muted-foreground">{body}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
