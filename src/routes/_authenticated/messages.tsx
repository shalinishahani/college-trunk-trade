import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { initials, timeAgo } from "@/lib/marketplace";
import { cn } from "@/lib/utils";

type MessagesSearch = { with?: string | undefined; product?: string | undefined };

export const Route = createFileRoute("/_authenticated/messages")({
  validateSearch: (search: Record<string, unknown>): MessagesSearch => ({
    with: typeof search['with'] === "string" ? search['with'] : undefined,
    product: typeof search['product'] === "string" ? search['product'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Messages — Campus Marketplace" },
      { name: "description", content: "Chat with buyers and sellers about campus listings." },
      { property: "og:title", content: "Messages — Campus Marketplace" },
      { property: "og:description", content: "Arrange meet-ups and ask questions before you buy." },
    ],
  }),
  component: MessagesPage,
});

type Msg = {
  id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  created_at: string;
  product_id: string | null;
};

function MessagesPage() {
  const { user } = useAuth();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/messages" });
  const qc = useQueryClient();
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useQuery({
    queryKey: ["messages", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Msg[];
    },
  });

  const partnerIds = useMemo(() => {
    const set = new Set<string>();
    (messages ?? []).forEach((m) => set.add(m.sender_id === user?.id ? m.receiver_id : m.sender_id));
    if (search.with) set.add(search.with);
    return [...set];
  }, [messages, user?.id, search.with]);

  const { data: partners } = useQuery({
    queryKey: ["message-partners", partnerIds],
    enabled: partnerIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, college")
        .in("id", partnerIds);
      return data ?? [];
    },
  });

  const activeId = search.with ?? partnerIds[0];

  const thread = useMemo(
    () =>
      (messages ?? []).filter(
        (m) => m.sender_id === activeId || m.receiver_id === activeId,
      ),
    [messages, activeId],
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("messages-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => void qc.invalidateQueries({ queryKey: ["messages", user.id] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, qc]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeId || !draft.trim()) return;
    const body = draft.trim();
    setDraft("");
    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: activeId,
      body,
      product_id: search.product ?? null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    await qc.invalidateQueries({ queryKey: ["messages", user.id] });
    await supabase.rpc("notify_user", {
      _user_id: activeId,
      _title: "New message",
      _message: body.slice(0, 90),
      _link: "/messages",
    });
  };

  const nameOf = (id?: string) =>
    partners?.find((p) => p.id === id)?.full_name ?? "Student";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-extrabold">Messages</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-[260px_1fr]">
        <Card className="h-[560px] overflow-y-auto p-2">
          {partnerIds.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No conversations yet. Message a seller from any listing.
            </p>
          ) : null}
          {partnerIds.map((id) => (
            <button
              key={id}
              onClick={() => navigate({ search: (prev: MessagesSearch) => ({ ...prev, with: id }) })}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-accent",
                id === activeId && "bg-accent",
              )}
            >
              <Avatar className="size-9">
                <AvatarFallback className="text-xs">{initials(nameOf(id))}</AvatarFallback>
              </Avatar>
              <span className="truncate text-sm font-medium">{nameOf(id)}</span>
            </button>
          ))}
        </Card>

        <Card className="flex h-[560px] flex-col gap-0 p-0">
          <div className="border-b p-4 font-display font-semibold">
            {activeId ? nameOf(activeId) : "Select a conversation"}
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {thread.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                  m.sender_id === user?.id
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                <p className="whitespace-pre-line">{m.body}</p>
                <p className="mt-1 text-[10px] opacity-70">{timeAgo(m.created_at)}</p>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form onSubmit={send} className="flex gap-2 border-t p-4">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={activeId ? "Write a message…" : "Pick a conversation first"}
              disabled={!activeId}
              maxLength={1000}
            />
            <Button type="submit" size="icon" disabled={!activeId} aria-label="Send message">
              <Send className="size-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
