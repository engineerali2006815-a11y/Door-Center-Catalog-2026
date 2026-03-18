
"use client"

import React, { useState, useCallback } from 'react';
import { Door } from '@/lib/inventory-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useFirestore } from '@/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface AddDoorFormProps {
  onCancel: () => void;
  initialData?: Door;
}

export function AddDoorForm({ onCancel, initialData }: AddDoorFormProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: initialData?.code || '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    setLoading(true);
    
    let finalImageUrl = formData.imageUrl;
    if (!finalImageUrl) {
      const randomIndex = Math.floor(Math.random() * PlaceHolderImages.length);
      finalImageUrl = PlaceHolderImages[randomIndex].imageUrl;
    }
    
    const doorData = {
      code: formData.code,
      imageUrl: finalImageUrl,
    };

    try {
      if (initialData) {
        const doorRef = doc(db, 'doors', initialData.id);
        await updateDoc(doorRef, doorData);
      } else {
        await addDoc(collection(db, 'doors'), doorData);
      }
      onCancel(); // Close modal on success
    } catch (error) {
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: "فشل تنفيذ العملية. يرجى المحاولة لاحقاً.",
      });
    } finally {
      setLoading(false);
    }
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
          <Label className="text-right block font-bold text-primary">صورة الباب (اسحب وأفلت هنا)</Label>
          
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
        <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[140px] h-12 text-lg font-bold shadow-lg shadow-primary/20">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : initialData ? 'حفظ التغييرات' : 'إضافة للكتالوج'}
        </Button>
      </div>
    </form>
  );
}
