"use client"

import React, { useState, useMemo } from 'react';
import { Door } from '@/lib/inventory-types';
import { Navbar } from '@/components/layout/Navbar';
import { DoorCard } from '@/components/inventory/DoorCard';
import { AddDoorForm } from '@/components/inventory/AddDoorForm';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  PackageSearch,
  LayoutGrid,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';

const INITIAL_DOORS: Door[] = [
  {
    id: '1',
    code: 'TR-101',
    name: 'باب تركي مودرن بلوط',
    quantity: 12,
    imageUrl: 'https://picsum.photos/seed/door1/600/800',
    style: 'حديث',
    material: 'خشب طبيعي',
    color: 'بني فاتح'
  },
  {
    id: '2',
    code: 'TR-102',
    name: 'باب أمان فولاذي',
    quantity: 0,
    imageUrl: 'https://picsum.photos/seed/door5/600/800',
    style: 'حديث',
    material: 'فولاذ معزز',
    color: 'رمادي فحمي'
  },
  {
    id: '3',
    code: 'TR-103',
    name: 'باب كلاسيكي منقوش',
    quantity: 5,
    imageUrl: 'https://picsum.photos/seed/door4/600/800',
    style: 'كلاسيكي',
    material: 'MDF فاخر',
    color: 'أبيض لؤلؤي'
  },
  {
    id: '4',
    code: 'TR-104',
    name: 'باب زجاجي بإطار تركي',
    quantity: 8,
    imageUrl: 'https://picsum.photos/seed/door3/600/800',
    style: 'بسيط',
    material: 'زجاج وخشب',
    color: 'بني داكن'
  }
];

export default function InventoryDashboard() {
  const [doors, setDoors] = useState<Door[]>(INITIAL_DOORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredDoors = useMemo(() => {
    return doors.filter(door => 
      door.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      door.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [doors, searchQuery]);

  const handleUpdateQuantity = (id: string, newQty: number) => {
    setDoors(prev => prev.map(door => 
      door.id === id ? { ...door, quantity: Math.max(0, newQty) } : door
    ));
  };

  const handleAddDoor = (newDoor: Door) => {
    setDoors(prev => [newDoor, ...prev]);
    setIsAddDialogOpen(false);
  };

  const handleDeleteDoor = (id: string) => {
    setDoors(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-headline font-bold text-primary">لوحة قيادة المخزون</h2>
            <p className="text-muted-foreground mt-1">إدارة وتتبع الأبواب التركية المتاحة في المستودع</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-white rounded-lg p-1 border shadow-sm">
              <Button 
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                size="icon" 
                onClick={() => setViewMode('grid')}
                className="w-10 h-10"
              >
                <LayoutGrid className="w-5 h-5" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                size="icon" 
                onClick={() => setViewMode('list')}
                className="w-10 h-10"
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12 px-6 shadow-lg shadow-primary/20">
                  <Plus className="w-5 h-5" />
                  <span>إضافة باب جديد</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-headline font-bold text-primary text-right">إضافة منتج جديد للمخزون</DialogTitle>
                </DialogHeader>
                <AddDoorForm onAdd={handleAddDoor} onCancel={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <section className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              placeholder="ابحث عن باب بالاسم أو الرمز..." 
              className="pr-10 h-12 bg-white/80"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 gap-2 px-6 border-accent bg-white/80">
            <SlidersHorizontal className="w-5 h-5 text-accent-foreground" />
            <span>تصفية متقدمة</span>
          </Button>
        </section>

        {filteredDoors.length > 0 ? (
          <div className={cn(
            "grid gap-8",
            viewMode === 'grid' 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          )}>
            {filteredDoors.map(door => (
              <DoorCard 
                key={door.id} 
                door={door} 
                onUpdateQuantity={handleUpdateQuantity}
                onDelete={handleDeleteDoor}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white/30 rounded-3xl border-2 border-dashed border-muted">
            <div className="bg-muted p-6 rounded-full mb-4">
              <PackageSearch className="w-16 h-16 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-headline font-bold text-muted-foreground">لا توجد نتائج مطابقة</h3>
            <p className="text-muted-foreground">جرب البحث بكلمات أخرى أو أضف منتجاً جديداً</p>
            <Button variant="link" className="mt-2 text-primary" onClick={() => setSearchQuery('')}>إعادة تعيين البحث</Button>
          </div>
        )}
      </main>
      
      <footer className="mt-20 border-t bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-xl font-headline font-bold text-primary">كنوز الأبواب</h4>
            <span className="text-xs tracking-widest text-accent-foreground font-semibold">DOOR CENTER / 2017</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 جميع الحقوق محفوظة لمركز الأبواب - كنوز الأبواب التركية.</p>
        </div>
      </footer>
    </div>
  );
}
