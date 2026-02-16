import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ReceiptPreviewModalProps {
  imageUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReceiptPreviewModal({
  imageUrl,
  open,
  onOpenChange,
}: ReceiptPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <img src={imageUrl} alt="Receipt Preview" className="w-full h-auto rounded-lg" />
      </DialogContent>
    </Dialog>
  );
}
