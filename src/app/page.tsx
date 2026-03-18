
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
  Loader2,
  ShieldCheck,
  User,
  ZoomIn,
  ZoomOut,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { Door } from '@/lib/inventory-types';
import { useToast } from '@/hooks/use-toast';

type Role = 'admin' | 'customer' | null;

export default function CatalogDashboard() {
  const db = useFirestore();
  const { toast } = useToast();
  const [role, setRole] = useState<Role>(null);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDoor, setEditingDoor] = useState<Door | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const doorsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'doors'), orderBy('code', 'asc'));
  }, [db]);

  const { data: doors, loading } = useCollection(doorsQuery);

  const filteredDoors = useMemo(() => {
    if (!doors) return [];
    return (doors as unknown as Door[]).filter(door => 
      door.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [doors, searchQuery]);

  const handleDeleteDoor = async (id: string) => {
    if (!db) return;
    if (!window.confirm('هل أنت متأكد من حذف هذا الباب؟')) return;
    
    try {
      const doorRef = doc(db, 'doors', id);
      await deleteDoc(doorRef);
      toast({
        title: "تم الحذف",
        description: "تمت إزالة الباب من الكتالوج بنجاح.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ في الحذف",
        description: "لم يتم حذف الباب بنجاح. يرجى المحاولة مرة أخرى.",
      });
    }
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '2026326') {
      setRole('admin');
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  if (role === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 font-body">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Door Center</h1>
          <p className="text-muted-foreground mb-8 text-lg">Turkish Doors Catalog</p>
          
          <div className="grid gap-4">
            <Button 
              onClick={() => setRole('customer')}
              variant="outline"
              className="h-20 text-xl gap-3 rounded-2xl border-2 hover:bg-primary/5 hover:border-primary transition-all"
            >
              <User className="w-8 h-8 text-primary" />
              <span>دخول كعميل (عرض فقط)</span>
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="h-20 text-xl gap-3 rounded-2xl shadow-lg shadow-primary/20">
                  <ShieldCheck className="w-8 h-8" />
                  <span>دخول الإدارة</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-primary text-right">مصادقة الإدارة</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAdminAuth} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Input 
                      type="password" 
                      placeholder="أدخل رمز المرور..." 
                      className={cn("h-12 text-center text-2xl tracking-widest", passcodeError && "border-destructive")}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      autoFocus
                    />
                    {passcodeError && <p className="text-destructive text-sm text-center">رمز المرور غير صحيح!</p>}
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg">دخول</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-4xl font-bold text-primary">Door Center</h2>
            <p className="text-muted-foreground mt-1 text-lg">Turkish Doors Catalog</p>
          </div>
          
          {role === 'admin' && (
            <div className="flex items-center gap-3">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12 px-6 shadow-lg shadow-primary/20">
                    <Plus className="w-5 h-5" />
                    <span>إضافة باب جديد</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-primary text-right">إضافة منتج للكتالوج</DialogTitle>
                  </DialogHeader>
                  <AddDoorForm onCancel={() => setIsAddDialogOpen(false)} />
                </DialogContent>
              </Dialog>
              <Button variant="ghost" onClick={() => setRole(null)}>تسجيل الخروج</Button>
            </div>
          )}
          {role === 'customer' && (
            <Button variant="outline" onClick={() => setRole(null)}>رجوع للرئيسية</Button>
          )}
        </header>

        {role === 'admin' && (
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
        )}

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
            <p className="text-muted-foreground">جاري تحميل الكتالوج...</p>
          </div>
        ) : filteredDoors.length > 0 ? (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDoors.map(door => (
              <DoorCard 
                key={door.id} 
                door={door} 
                isAdmin={role === 'admin'}
                onDelete={handleDeleteDoor}
                onEdit={(d) => setEditingDoor(d)}
                onImageClick={(url) => {
                  setSelectedImageUrl(url);
                  setZoomLevel(1);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white/30 rounded-3xl border-2 border-dashed border-muted">
            <div className="bg-muted p-6 rounded-full mb-4">
              <PackageSearch className="w-16 h-16 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-muted-foreground">لا توجد نتائج مطابقة</h3>
            <Button variant="link" className="mt-2 text-primary" onClick={() => setSearchQuery('')}>إعادة تعيين البحث</Button>
          </div>
        )}
      </main>

      {/* Fullscreen Image Viewer */}
      {selectedImageUrl && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center overflow-hidden touch-none">
          <div className="absolute top-4 right-4 flex gap-4 z-10">
            <Button 
              variant="secondary" 
              size="icon" 
              className="rounded-full w-12 h-12 bg-white/10 hover:bg-white/20 border-white/20 text-white"
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 4))}
            >
              <ZoomIn className="w-6 h-6" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              className="rounded-full w-12 h-12 bg-white/10 hover:bg-white/20 border-white/20 text-white"
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 1))}
            >
              <ZoomOut className="w-6 h-6" />
            </Button>
            <Button 
              variant="destructive" 
              size="icon" 
              className="rounded-full w-12 h-12"
              onClick={() => setSelectedImageUrl(null)}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
          
          <div className="relative w-full h-full flex items-center justify-center overflow-auto p-4">
            <div 
              className="relative transition-transform duration-200 ease-out"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img 
                src={selectedImageUrl} 
                alt="Fullscreen" 
                className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl rounded-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
