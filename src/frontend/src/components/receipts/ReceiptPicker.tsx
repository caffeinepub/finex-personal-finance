import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useUploadReceipt } from '../../hooks/useQueries';
import { toast } from 'sonner';

interface ReceiptPickerProps {
  receiptId: string;
  onReceiptIdChange: (receiptId: string) => void;
}

export default function ReceiptPicker({ receiptId, onReceiptIdChange }: ReceiptPickerProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadReceipt = useUploadReceipt();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.match(/^image\/(jpeg|jpg|png)$/)) {
      toast.error('Hanya file JPG dan PNG yang diperbolehkan');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const newReceiptId = `receipt-${Date.now()}`;

      await uploadReceipt.mutateAsync({
        receiptId: newReceiptId,
        imageData: uint8Array,
      });

      onReceiptIdChange(newReceiptId);
      toast.success('Bukti transaksi berhasil diunggah');
    } catch (error) {
      toast.error('Gagal mengunggah bukti transaksi');
      console.error(error);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFile(null);
    onReceiptIdChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>Bukti Transaksi (Opsional)</Label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="space-y-2">
          <div className="relative rounded-lg border border-border overflow-hidden">
            <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {!receiptId && (
            <Button
              type="button"
              onClick={handleUpload}
              disabled={uploadReceipt.isPending}
              className="w-full"
            >
              {uploadReceipt.isPending ? 'Mengunggah...' : 'Unggah Bukti'}
            </Button>
          )}
        </div>
      ) : receiptId ? (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/50">
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm flex-1">Bukti transaksi tersimpan</span>
          <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full gap-2"
        >
          <Upload className="h-4 w-4" />
          Pilih File (JPG/PNG, Max 5MB)
        </Button>
      )}
    </div>
  );
}
