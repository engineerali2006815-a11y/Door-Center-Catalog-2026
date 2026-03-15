
"use client"

import React, { useState, useCallback } from 'react';
import { Door } from '@/lib/inventory-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface AddDoorFormProps {
  onAdd: (door: Door) => void;
  onCancel: () => void;
  initialData?: Door;
}

export function AddDoorForm({ onAdd, onCancel, initialData }: AddDoorFormProps) {
  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    quantity: initialData?.quantity || 0,
    imageUrl: initialData?.imageUrl || '',
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imageUrl || null);

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

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, []);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalImageUrl = formData.imageUrl;
    if (!finalImageUrl) {
      if (PlaceHolderImages && PlaceHolderImages.length > 0) {
        const randomIndex = Math.floor(Math.random() * PlaceHolderImages.length);
        finalImageUrl = PlaceHolderImages[randomIndex].imageUrl;
      } else {
        finalImageUrl = `https://picsum.photos/seed/${Math.random()}/600/800`;
      }
    }
    
    onAdd({
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      name: formData.code,
      style: initialData?.style || 'تركي',
      material: initialData?.material || 'خشب',
      color: initialData?.color || 'افتراضي',
      ...formData,
      imageUrl: finalImageUrl,
    });
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code" className="text-right block font-bold text-primary">رمز الباب</Label>
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
          <Label htmlFor="quantity" className="text-right block font-bold text-primary">الكمية</Label>
          <Input 
            id="quantity" 
            type="number" 
            required 
            min="0"
            className="h-12 text-lg text-center font-bold"
            value={formData.quantity} 
            onChange={e => setFormData(p => ({ ...p, quantity: parseInt(e.target.value) || 0 }))}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-right block font-bold text-primary">صورة الباب</Label>
          
          {previewUrl ? (
            <div className="relative aspect-[3/4] w-full max-w-[200px] mx-auto rounded-xl overflow-hidden border-2 border-primary shadow-md group">
              <Image 
                src={previewUrl} 
                alt="Preview" 
                fill 
                className="object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                "border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 bg-muted/30",
                isDragging ? "border-primary bg-primary/10 scale-[1.02]" : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <UploadCloud className={cn("w-12 h-12 transition-colors", isDragging ? "text-primary" : "text-muted-foreground")} />
              <div className="text-center">
                <p className="font-bold text-sm">اسحب الصورة هنا أو اضغط للاختيار</p>
                <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG حتى 5MB</p>
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
        <Button type="button" variant="ghost" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[140px] h-12 text-lg font-bold shadow-lg shadow-primary/20">
          {initialData ? 'حفظ التغييرات' : 'إضافة للمخزون'}
        </Button>
      </div>
    </form>
  );
}
