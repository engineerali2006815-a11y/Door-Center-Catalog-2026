import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, Search, PackageSearch, ShieldCheck, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import AddDoorForm from '@/components/AddDoorForm';
import DoorCard from '@/components/DoorCard';

type Role = 'admin' | 'customer' | null;

export default function Home() {
  const [role, setRole] = useState<Role>(null);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDoor, setEditingDoor] = useState<any | null>(null);

  const { data: doors = [], isLoading } = trpc.doors.list.useQuery();
  const deleteMutation = trpc.doors.delete.useMutation();

  const filteredDoors = useMemo(() => {
    return doors.filter(door =>
      door.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [doors, searchQuery]);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '2026326') {
      setRole('admin');
      setPasscodeError(false);
      setPasscode('');
    } else {
      setPasscodeError(true);
    }
  };

  const handleDeleteDoor = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الباب؟')) {
      try {
        await deleteMutation.mutateAsync({ id, passcode: '2026326' });
      } catch (error) {
        console.error('Failed to delete door:', error);
      }
    }
  };

  if (role === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 font-body" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-200 text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Door Center</h1>
          <p className="text-gray-600 mb-8 text-lg">Turkish Doors Catalog</p>

          <div className="grid gap-4">
            <Button
              onClick={() => setRole('customer')}
              variant="outline"
              className="h-20 text-xl gap-3 rounded-2xl border-2 hover:bg-blue-50 hover:border-blue-600 transition-all"
            >
              <User className="w-8 h-8 text-blue-600" />
              <span>دخول كعميل (عرض فقط)</span>
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="h-20 text-xl gap-3 rounded-2xl shadow-lg shadow-blue-600/20 bg-blue-600 hover:bg-blue-700">
                  <ShieldCheck className="w-8 h-8" />
                  <span>دخول الإدارة</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-blue-600 text-right">مصادقة الإدارة</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAdminAuth} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="أدخل رمز المرور..."
                      className={cn("h-12 text-center text-2xl tracking-widest", passcodeError && "border-red-500")}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      autoFocus
                    />
                    {passcodeError && <p className="text-red-500 text-sm text-center">رمز المرور غير صحيح!</p>}
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700">دخول</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-body" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-blue-600">Door Center</h1>
            <p className="text-gray-600 mt-1">Turkish Doors Catalog</p>
          </div>

          <div className="flex items-center gap-3">
            {role === 'admin' && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-12 px-6 shadow-lg shadow-blue-600/20">
                    <Plus className="w-5 h-5" />
                    <span>إضافة باب جديد</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px]" dir="rtl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-blue-600 text-right">إضافة منتج للكتالوج</DialogTitle>
                  </DialogHeader>
                  <AddDoorForm onCancel={() => setIsAddDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            )}
            <Button variant="outline" onClick={() => setRole(null)}>تسجيل الخروج</Button>
          </div>
        </div>
      </header>

      {/* Edit Dialog */}
      {role === 'admin' && (
        <Dialog open={!!editingDoor} onOpenChange={(open) => !open && setEditingDoor(null)}>
          <DialogContent className="sm:max-w-[450px]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-blue-600 text-right">تعديل بيانات الباب</DialogTitle>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search Bar */}
        <section className="bg-white p-4 rounded-xl border border-gray-200 mb-8 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="ابحث برمز الباب..."
              className="pl-10 h-12 bg-gray-50 border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {/* Doors Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">جاري تحميل الكتالوج...</p>
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
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-300">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <PackageSearch className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-600">لا توجد نتائج مطابقة</h3>
            <Button variant="link" className="mt-2 text-blue-600" onClick={() => setSearchQuery('')}>إعادة تعيين البحث</Button>
          </div>
        )}
      </main>
    </div>
  );
}
