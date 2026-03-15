"use client"

import React, { useState, useMemo } from 'react';
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
  PackageSearch,
  LayoutGrid,
  List,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Door } from '@/lib/inventory-types';

export default function InventoryDashboard() {
  const db = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDoor, setEditingDoor] = useState<Door | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const doorsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'doors'), orderBy('code', 'asc'));
  }, [db]);

  const { data: doors, loading } = useCollection(doorsQuery);

  const filteredDoors = useMemo(() => {
    if (!doors) return [];
    const typedDoors = doors as unknown as Door[];
    return typedDoors.filter(door => 
      door.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [doors, searchQuery]);

  const handleUpdateQuantity = (id: string, newQty: number) => {
    if (!db) return;
    const doorRef = doc(db, 'doors', id);
    updateDoc(doorRef, { quantity: Math.max(0, newQty) });
  };

  const handleDeleteDoor = (id: string) => {
    if (!db || !confirm('هل أنت متأكد من حذف هذا الباب؟')) return;
    const doorRef = doc(db, 'doors', id);
    deleteDoc(doorRef);
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-primary">إدارة المخزون</h2>
            <p className="text-muted-foreground mt-1">تتبع الأبواب المتاحة في مستودع Door Center (سحابي ومتزامن)</p>
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
                <AddDoorForm onCancel={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <Dialog open={!!editingDoor} onOpenChange={(open) => !open && setEditingDoor(null)}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary text-right">تعديل بيانات الباب</DialogTitle>
            </DialogHeader>
            {editingDoor && (
              <AddDoorForm 
                initialData={editingDoor} 
                onCancel={() => setEditingDoor(null)} 
              />
            )}
          </DialogContent>
        </Dialog>

        <section className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border mb-8">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              placeholder="ابحث برمز الباب..." 
              className="pr-10 h-12 bg-white/80"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">جاري تحميل البيانات من السحابة...</p>
          </div>
        ) : filteredDoors.length > 0 ? (
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
    </div>
  );
}
