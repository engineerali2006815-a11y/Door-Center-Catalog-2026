"use client"

import React, { useState } from 'react';
import { generateDoorDescription } from '@/ai/flows/generate-door-description-flow';
import { Door } from '@/lib/inventory-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Plus, X } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface AddDoorFormProps {
  onAdd: (door: Door) => void;
  onCancel: () => void;
}

export function AddDoorForm({ onAdd, onCancel }: AddDoorFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    quantity: 10,
    style: 'حديث',
    material: 'خشب',
    color: 'بني داكن',
    dimensions: '200x90 سم',
    features: ['عازل للصوت'],
    description: '',
  });

  const generateAI = async () => {
    setLoading(true);
    try {
      const result = await generateDoorDescription({
        style: formData.style,
        material: formData.material,
        color: formData.color,
        dimensions: formData.dimensions,
        features: formData.features,
      });
      setFormData(prev => ({ ...prev, description: result.description }));
    } catch (error) {
      console.error("AI Generation failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const randomImage = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
    
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      imageUrl: randomImage.imageUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Label htmlFor="name" className="text-right block">اسم المنتج</Label>
          <Input 
            id="name" 
            required 
            value={formData.name} 
            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
            placeholder="مثال: باب تركي فاخر مودرن"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity" className="text-right block">الكمية الأولية</Label>
          <Input 
            id="quantity" 
            type="number" 
            required 
            min="0"
            value={formData.quantity} 
            onChange={e => setFormData(p => ({ ...p, quantity: parseInt(e.target.value) }))}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-right block">النمط</Label>
          <Select 
            value={formData.style} 
            onValueChange={v => setFormData(p => ({ ...p, style: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر النمط" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="كلاسيكي">كلاسيكي</SelectItem>
              <SelectItem value="حديث">حديث</SelectItem>
              <SelectItem value="ريفي">ريفي</SelectItem>
              <SelectItem value="بسيط">بسيط</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-right block">المادة</Label>
          <Input 
            value={formData.material} 
            onChange={e => setFormData(p => ({ ...p, material: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-right block">اللون</Label>
          <Input 
            value={formData.color} 
            onChange={e => setFormData(p => ({ ...p, color: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center mb-1">
          <Label className="text-right">وصف المنتج (بالذكاء الاصطناعي)</Label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={generateAI}
            disabled={loading}
            className="text-primary hover:text-primary-foreground hover:bg-primary border-primary gap-1"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            توليد وصف جذاب
          </Button>
        </div>
        <Textarea 
          value={formData.description} 
          onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
          rows={4}
          placeholder="سيظهر الوصف المولد هنا..."
          className="resize-none"
        />
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]">
          إضافة للمخزون
        </Button>
      </div>
    </form>
  );
}
