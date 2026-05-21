import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Door {
  id: number;
  code: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AddDoorFormProps {
  onCancel: () => void;
  initialData?: Door;
}

export default function AddDoorForm({ onCancel, initialData }: AddDoorFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    imageUrl: initialData?.imageUrl || '',
  });

  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imageUrl || null);

  const addMutation = trpc.doors.add.useMutation();
  const updateMutation = trpc.doors.update.useMutation();
  const uploadMutation = trpc.doors.uploadImage.useMutation();

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        setFormData(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.imageUrl) {
      alert('يرجى ملء جميع الحقول');
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = formData.imageUrl;

      // Upload image to S3 if it's a base64 data URL
      if (formData.imageUrl.startsWith('data:')) {
        const uploadResult = await uploadMutation.mutateAsync({
          imageData: formData.imageUrl,
        });
        finalImageUrl = uploadResult.url;
      }

      if (initialData) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          code: formData.code,
          imageUrl: finalImageUrl,
          passcode: '2026326',
        });
      } else {
        await addMutation.mutateAsync({
          code: formData.code,
          imageUrl: finalImageUrl,
          passcode: '2026326',
        });
      }
      onCancel();
    } catch (error) {
      console.error('Failed to save door:', error);
      alert('فشل حفظ الباب. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code" className="text-right block font-bold text-blue-600">رمز الباب</Label>
          <Input
            id="code"
            required
            value={formData.code}
            onChange={e => setFormData(p => ({ ...p, code: e.target.value }))}
            placeholder="مثال: TR-500"
            className="h-12 text-lg text-center font-bold"
            dir="ltr"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-right block font-bold text-blue-600">صورة الباب (اسحب وأفلت هنا)</Label>

          {previewUrl ? (
            <div className="relative aspect-[3/4] w-full max-w-[200px] mx-auto rounded-xl overflow-hidden border-2 border-blue-600 shadow-md group">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => document.getElementById('fileInput')?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 bg-gray-50",
                isDragging ? "border-blue-600 bg-blue-50 scale-[1.02]" : "border-gray-300 hover:border-blue-600/50 hover:bg-gray-100"
              )}
            >
              <UploadCloud className={cn("w-12 h-12 transition-colors", isDragging ? "text-blue-600" : "text-gray-400")} />
              <div className="text-center">
                <p className="font-bold text-sm">اسحب الصورة هنا أو اضغط للاختيار</p>
              </div>
              <input
                id="fileInput"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={onFileSelect}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          إلغاء
        </Button>
        <Button type="submit" disabled={loading} className="bg-blue-600 text-white hover:bg-blue-700 min-w-[140px] h-12 text-lg font-bold shadow-lg shadow-blue-600/20">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : initialData ? 'حفظ التغييرات' : 'إضافة للكتالوج'}
        </Button>
      </div>
    </form>
  );
}
