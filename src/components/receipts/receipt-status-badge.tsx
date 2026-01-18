import { Badge } from "@/components/ui/badge";
import { formatReceiptStatus, getReceiptStatusVariant } from "@/lib/payment-utils";
import { ReceiptStatus } from "@/types/receipt";

interface ReceiptStatusBadgeProps {
  status: ReceiptStatus;
  className?: string;
}

export function ReceiptStatusBadge({ status, className }: ReceiptStatusBadgeProps) {
  return (
    <Badge variant={getReceiptStatusVariant(status)} className={className}>
      {formatReceiptStatus(status)}
    </Badge>
  );
}
