import { Button } from "@/components/ui/button"
import { Gift } from "lucide-react"

interface EmptyWishlistProps {
  onCreateClick?: () => void;
}

export function EmptyWishlist({ onCreateClick }: EmptyWishlistProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-24 h-24 bg-peach/30 rounded-full flex items-center justify-center mb-6">
        <Gift className="w-12 h-12 text-terracotta" />
      </div>
      <h2 className="font-playfair text-3xl font-semibold mb-2 text-storm">
        Здесь пока пусто...
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md font-jakarta">
        Загадайте желание, и друзья помогут его исполнить. 
        Каждый подарок — это маленький праздник.
      </p>
      <Button 
        size="lg" 
        className="rounded-full px-8 btn-hover bg-terracotta hover:bg-[#b36b3f] text-white"
        onClick={onCreateClick}
      >
        Загадать желание
      </Button>
    </div>
  )
}