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
    name: 'TR-101',
    quantity: 12,
    imageUrl: 'https://picsum.photos/seed/door1/600/800',
    style: 'حديث',
    material: 'خشب',
    color: 'بني'
  },
  {
    id: '2',
    code: 'TR-102',
    name: 'TR-102',
    quantity: 0,
    imageUrl: 'https://picsum.photos/seed/door5/600/800',
    style: 'حديث',
    material: 'فولاذ',
    color: 'أسود'
  }
];

export default function InventoryDashboard() {
  const [doors, setDoors] = useState<Door[]>(INITIAL_DOORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDoor, setEditingDoor] = useState<Door | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredDoors = useMemo(() => {
    return doors.filter(door => 
      door.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [doors, searchQuery]);

  const handleUpdateQuantity = (id: string, newQty: number) => {
    setDoors(prev => prev.map(door => 
      door.id === id ? { ...door, quantity: Math.max(0, newQty) } : door
    ));
  };

  const handleAddDoor = (newDoor: Door) => {
    if (editingDoor) {
      setDoors(prev => prev.map(d => d.id === newDoor.id ? newDoor : d));
      setEditingDoor(null);
    } else {
      setDoors(prev => [newDoor, ...prev]);
      setIsAddDialogOpen(false);
    }
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
            <h2 className="text-3xl font-bold text-primary">إدارة المخزون</h2>
            <p className="text-muted-foreground mt-1">تتبع الأبواب المتاحة في مستودع Door Center</p>
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
              <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-primary text-right">إضافة منتج للمخزون</DialogTitle>
                </DialogHeader>
                <AddDoorForm onAdd={handleAddDoor} onCancel={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Edit Dialog */}
        <Dialog open={!!editingDoor} onOpenChange={(open) => !open && setEditingDoor(null)}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary text-right">تعديل بيانات الباب</DialogTitle>
            </DialogHeader>
            {editingDoor && (
              <AddDoorForm 
                initialData={editingDoor} 
                onAdd={handleAddDoor} 
                onCancel={() => setEditingDoor(null)} 
              />
            )}
          </DialogContent>
        </Dialog>

        <section className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              placeholder="ابحث برمز الباب..." 
              className="pr-10 h-12 bg-white/80"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 gap-2 px-6 border-accent bg-white/80">
            <SlidersHorizontal className="w-5 h-5 text-accent-foreground" />
            <span>تصفية</span>
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
                onEdit={(d) => setEditingDoor(d)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white/30 rounded-3xl border-2 border-dashed border-muted">
            <div className="bg-muted p-6 rounded-full mb-4">
              <PackageSearch className="w-16 h-16 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-muted-foreground">لا توجد نتائج مطابقة</h3>
            <p className="text-muted-foreground">جرب البحث بكلمات أخرى أو أضف منتجاً جديداً</p>
            <Button variant="link" className="mt-2 text-primary" onClick={() => setSearchQuery('')}>إعادة تعيين البحث</Button>
          </div>
        )}
      </main>
      
      <footer className="mt-20 border-t bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-xl font-bold text-primary">Door Center</h4>
            <span className="text-[10px] tracking-widest text-accent-foreground font-semibold mt-1">مركز الأبواب / 2017</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 جميع الحقوق محفوظة لـ Door Center.</p>
        </div>
      </footer>
    </div>
  );
}
