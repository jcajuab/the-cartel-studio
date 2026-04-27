import { Badge } from "@/components/ui/badge";

interface Props {
  stockQty: number;
}

export function StockBadge({ stockQty }: Props) {
  if (stockQty > 20) {
    return (
      <Badge
        variant="outline"
        className="bg-green-500/10 text-green-400 border-green-500/20"
      >
        {stockQty}
      </Badge>
    );
  }

  if (stockQty >= 5) {
    return (
      <Badge
        variant="outline"
        className="bg-amber-500/10 text-amber-400 border-amber-500/20"
      >
        {stockQty}
      </Badge>
    );
  }

  return <Badge variant="destructive">{stockQty}</Badge>;
}
