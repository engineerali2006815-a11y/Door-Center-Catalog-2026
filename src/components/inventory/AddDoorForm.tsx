"use client"

import React, { useState } from 'react';
import { Door } from '@/lib/inventory-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface AddDoorFormProps {
  onAdd: (door: Door) => void;
  onCancel: () => void;
  initialData?: Door;
}

export function AddDoorForm({ onAdd, onCancel, initialData }: AddDoorFormProps) {
  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    quantity: initialData?.quantity || 1,
    imageUrl: initialData?.imageUrl || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If no image URL is provided, use a random placeholder
    const finalImageUrl = formData.imageUrl || 
      PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)].imageUrl;
    
    onAdd({
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      name: formData.code, // Use code as name for simplicity
      style: 'تركي',
      material: 'خشب',
      color: 'افتراضي',
      ...formData,
      imageUrl: finalImageUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code" className="text-right block">رمز الباب</Label>
          <Input 
            id="code" 
            required 
            value={formData.code} 
            onChange={e => setFormData(p => ({ ...p, code: e.target.value }))}
            placeholder="مثال: TKR-2024"
            dir="ltr"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quantity" className="text-right block">الكمية</Label>
          <Input 
            id="quantity" 
            type="number" 
            required 
            min="0"
            value={formData.quantity} 
            onChange={e => setFormData(p => ({ ...p, quantity: parseInt(e.target.value) || 0 }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl" className="text-right block">رابط صورة المنتج (اختياري)</Label>
          <Input 
            id="imageUrl" 
            value={formData.imageUrl} 
            onChange={e => setFormData(p => ({ ...p, imageUrl: e.target.value }))}
            placeholder="أدخل رابط الصورة هنا..."
            dir="ltr"
          />
          <p className="text-[10px] text-muted-foreground mt-1">في حال ترك الحقل فارغاً، سيتم اختيار صورة عشوائية.</p>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]">
          {initialData ? 'حفظ التغييرات' : 'إضافة للمخزون'}
        </Button>
      </div>
    </form>
  );
}
