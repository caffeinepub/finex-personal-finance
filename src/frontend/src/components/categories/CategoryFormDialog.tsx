import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddCategory, useUpdateCategory } from '../../hooks/useQueries';
import { toast } from 'sonner';
import type { Category, CategoryType } from '../../backend';
import { CategoryType as CategoryTypeEnum } from '../../backend';

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
}

const PRESET_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
];

export default function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: CategoryFormDialogProps) {
  const [name, setName] = useState(category?.name || '');
  const [type, setType] = useState<CategoryType>(category?.categoryType || CategoryTypeEnum.expense);
  const [color, setColor] = useState(category?.color || PRESET_COLORS[0]);
  const [icon, setIcon] = useState(category?.icon || '');

  const addCategory = useAddCategory();
  const updateCategory = useUpdateCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Nama kategori tidak boleh kosong');
      return;
    }

    const categoryData: Category = {
      id: category?.id || `cat-${Date.now()}`,
      name: name.trim(),
      categoryType: type,
      color,
      icon: icon || undefined,
    };

    try {
      if (category) {
        await updateCategory.mutateAsync(categoryData);
        toast.success('Kategori berhasil diperbarui');
      } else {
        await addCategory.mutateAsync(categoryData);
        toast.success('Kategori berhasil ditambahkan');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error('Gagal menyimpan kategori');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Jenis Kategori</Label>
            <Select value={type} onValueChange={(v: CategoryType) => setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CategoryTypeEnum.income}>Pemasukan</SelectItem>
                <SelectItem value={CategoryTypeEnum.expense}>Pengeluaran</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nama Kategori</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Gaji, Makan, Transport"
            />
          </div>

          <div className="space-y-2">
            <Label>Warna</Label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`h-10 w-10 rounded-full border-2 transition-all ${
                    color === presetColor ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: presetColor }}
                />
              ))}
            </div>
            <Input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#000000"
            />
          </div>

          <div className="space-y-2">
            <Label>Icon (Opsional)</Label>
            <Input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Emoji atau karakter (contoh: 💰)"
              maxLength={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={addCategory.isPending || updateCategory.isPending}
            >
              {addCategory.isPending || updateCategory.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
