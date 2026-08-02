import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function useWishlist() {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!user) {
      setIds(new Set());
      return;
    }
    const { data } = await supabase.from("wishlists").select("product_id").eq("user_id", user.id);
    setIds(new Set((data ?? []).map((w) => w.product_id)));
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = useCallback(
    async (productId: string) => {
      if (!user) {
        toast.error("Sign in to save items to your wishlist");
        return;
      }
      if (ids.has(productId)) {
        await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId);
        setIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        toast("Removed from wishlist");
      } else {
        const { error } = await supabase.from("wishlists").insert({ user_id: user.id, product_id: productId });
        if (error) {
          toast.error(error.message);
          return;
        }
        setIds((prev) => new Set(prev).add(productId));
        toast.success("Saved to wishlist");

        const { data: product } = await supabase
          .from("products")
          .select("seller_id, title")
          .eq("id", productId)
          .maybeSingle();
        if (product && product.seller_id !== user.id) {
          await supabase.rpc("notify_user", {
            _user_id: product.seller_id,
            _title: "Someone saved your listing",
            _message: `"${product.title}" was added to a wishlist.`,
            _link: `/products/${productId}`,
          });
        }
      }
    },
    [ids, user],
  );

  return { wishlistIds: ids, toggleWishlist: toggle, reloadWishlist: load };
}
