"use client";

import { EmptyWishlist } from "@/components/EmptyWishlist";
import { CategoryStrip } from "@/components/CategoryStrip";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleCreateWishlist = () => {
    router.push("/login");
  };

  return (
    <main className="container mx-auto py-8">
      <CategoryStrip />
      <EmptyWishlist onCreateClick={handleCreateWishlist} />
    </main>
  );
}