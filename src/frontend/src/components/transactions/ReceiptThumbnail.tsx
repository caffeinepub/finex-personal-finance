import { useState } from 'react';
import { useGetReceipt } from '../../hooks/useQueries';
import { Image } from 'lucide-react';
import ReceiptPreviewModal from '../receipts/ReceiptPreviewModal';

interface ReceiptThumbnailProps {
  receiptId: string;
}

export default function ReceiptThumbnail({ receiptId }: ReceiptThumbnailProps) {
  const [showPreview, setShowPreview] = useState(false);
  const { data: receiptData } = useGetReceipt(receiptId);

  if (!receiptData) {
    return (
      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
        <Image className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }

  const blob = new Blob([new Uint8Array(receiptData)], { type: 'image/jpeg' });
  const imageUrl = URL.createObjectURL(blob);

  return (
    <>
      <button
        onClick={() => setShowPreview(true)}
        className="h-12 w-12 rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-primary transition-all"
      >
        <img src={imageUrl} alt="Receipt" className="h-full w-full object-cover" />
      </button>
      {showPreview && (
        <ReceiptPreviewModal
          imageUrl={imageUrl}
          open={showPreview}
          onOpenChange={setShowPreview}
        />
      )}
    </>
  );
}
