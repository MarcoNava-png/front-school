import { Badge } from "@/components/ui/badge";
import { ReceiptStatus } from "@/types/receipt";
import { formatReceiptStatus, getReceiptStatusVariant } from "@/lib/payment-utils";

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
