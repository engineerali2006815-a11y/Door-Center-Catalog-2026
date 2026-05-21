import React, { useState, useMemo, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Printer, Plus, Trash2, CloudUpload, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { nanoid } from 'nanoid';

export type Order = {
  id: string;
  customerName: string;
  location: string;
  doorsCount: number | null;
  orderDate: string;
  installationDate: string;
  downPayment: number | null;
  isDownPaymentPaid: boolean;
  isInstalled: boolean;
};

export default function AdminOrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastSaveTime, setLastSaveTime] = useState<string>('');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
  // TRPC Hooks
  const { data: initialOrders, isLoading: isFetching, refetch } = trpc.orders.list.useQuery();
  const saveMutation = trpc.orders.saveAll.useMutation({
    onSuccess: () => {
      const now = new Date().toLocaleTimeString('ar-IQ');
      setLastSaveTime(now);
      console.log('[AdminOrdersTable] ✓ Save successful at', now);
      toast.success("تم الحفظ سحابياً بنجاح!", {
        description: `جميع بيانات الجدول تم مزامنتها مع الخادم في ${now}`
      });
    },
    onError: (err) => {
      console.error('[AdminOrdersTable] ✗ Save failed:', err);
      toast.error("فشل الحفظ السحابي", {
        description: err.message || "حدث خطأ أثناء حفظ البيانات"
      });
    }
  });

  const sortOrders = (ordersList: Order[]) => {
    return [...ordersList].sort((a, b) => {
      const dateA = new Date(a.orderDate).getTime();
      const dateB = new Date(b.orderDate).getTime();
      if (!isNaN(dateA) && !isNaN(dateB)) return dateA - dateB;
      return 0;
    });
  };

  // Populate local state when data is loaded
  useEffect(() => {
    if (initialOrders && initialOrders.length > 0) {
      console.log('[AdminOrdersTable] Loaded', initialOrders.length, 'orders from database');
      setOrders(sortOrders(initialOrders as Order[]));
    } else if (initialOrders) {
      console.log('[AdminOrdersTable] Database is empty, starting with blank table');
      setOrders([]);
    }
  }, [initialOrders]);

  // Auto-save every 30 seconds if there are changes
  useEffect(() => {
    if (!autoSaveEnabled || orders.length === 0) return;

    const autoSaveInterval = setInterval(async () => {
      console.log('[AdminOrdersTable] Auto-saving', orders.length, 'orders...');
      try {
        await saveMutation.mutateAsync({
          orders: orders,
          passcode: '2026326'
        });
      } catch (error) {
        console.error('[AdminOrdersTable] Auto-save failed:', error);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [orders, autoSaveEnabled, saveMutation]);

  const handlePrint = () => {
    window.print();
  };
  
  const handleSaveToCloud = async () => {
    console.log('[AdminOrdersTable] Manual save triggered with', orders.length, 'orders');
    try {
      await saveMutation.mutateAsync({
        orders: orders,
        passcode: '2026326'
      });
    } catch (error) {
      console.error('[AdminOrdersTable] Manual save error:', error);
    }
  };

  const handleRefresh = async () => {
    console.log('[AdminOrdersTable] Refreshing data from database...');
    const result = await refetch();
    if (result.data) {
      setOrders(sortOrders(result.data as Order[]));
    }
  };

  const handleAddRow = () => {
    const newRow: Order = {
      id: nanoid(),
      customerName: '',
      location: '',
      doorsCount: null,
      orderDate: '',
      installationDate: '',
      downPayment: null,
      isDownPaymentPaid: false,
      isInstalled: false,
    };
    console.log('[AdminOrdersTable] Adding new row with ID:', newRow.id);
    setOrders([...orders, newRow]);
  };

  const handleDeleteRow = (id: string) => {
    console.log('[AdminOrdersTable] Deleting row with ID:', id);
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const updateField = (id: string, field: keyof Order, value: any) => {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, [field]: value } : o)));
  };

  // Smart Date Parsing logic
  const parseDate = (val: string) => {
    const str = val.trim();
    if (!str) return str;
    
    // Check if it's like 5/16 or 05/16 or 5-16
    const shortDateRegex = /^(\d{1,2})[\/\-](\d{1,2})$/;
    const match = str.match(shortDateRegex);
    if (match) {
      const currentYear = new Date().getFullYear();
      let month = match[1].padStart(2, '0');
      let day = match[2].padStart(2, '0');
      return `${currentYear}-${month}-${day}`;
    }
    return str;
  };

  const handleDateBlur = (id: string, field: 'orderDate' | 'installationDate', val: string) => {
    const parsed = parseDate(val);
    if (parsed !== val) {
      updateField(id, field, parsed);
    }
  };

  const totalUnreceived = useMemo(() => {
    return orders
      .filter(o => !o.isDownPaymentPaid)
      .reduce((sum, o) => sum + (Number(o.downPayment) || 0), 0);
  }, [orders]);

  const totalDoors = useMemo(() => {
    return orders.reduce((sum, o) => sum + (Number(o.doorsCount) || 0), 0);
  }, [orders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-IQ', { style: 'currency', currency: 'IQD' }).format(amount);
  };

  if (isFetching && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">جاري تحميل البيانات السحابية...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm print:p-0 print:shadow-none" dir="rtl">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">إدارة المبيعات والتركيبات</h2>
          {lastSaveTime && (
            <p className="text-sm text-gray-500 mt-1">آخر حفظ: {lastSaveTime}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
            العدد الإجمالي: {orders.length}
          </span>
          <Button 
            type="button"
            onClick={handleSaveToCloud} 
            disabled={saveMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 flex-1 sm:flex-none"
            title="احفظ جميع البيانات في السحابة"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
            حفظ سحابياً
          </Button>
          <Button 
            type="button"
            onClick={handleRefresh} 
            disabled={isFetching}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 flex-1 sm:flex-none"
            title="تحديث البيانات من السحابة"
          >
            {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            تحديث
          </Button>
          <Button type="button" onClick={handlePrint} className="bg-slate-800 hover:bg-slate-700 text-white gap-2 flex-1 sm:flex-none">
            <Printer className="w-4 h-4" />
            طباعة الجدول
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow className="bg-blue-50 border-b-2 border-blue-200">
              <TableHead className="text-right py-3 px-2 font-bold text-blue-900">اسم العميل</TableHead>
              <TableHead className="text-right py-3 px-2 font-bold text-blue-900">الموقع</TableHead>
              <TableHead className="text-right py-3 px-2 font-bold text-blue-900">عدد الأبواب</TableHead>
              <TableHead className="text-right py-3 px-2 font-bold text-blue-900">تاريخ الطلب</TableHead>
              <TableHead className="text-right py-3 px-2 font-bold text-blue-900">تاريخ التركيب</TableHead>
              <TableHead className="text-right py-3 px-2 font-bold text-blue-900">المقدمة</TableHead>
              <TableHead className="text-center py-3 px-2 font-bold text-blue-900">استلام المقدمة</TableHead>
              <TableHead className="text-center py-3 px-2 font-bold text-blue-900">مركب</TableHead>
              <TableHead className="text-center py-3 px-2 font-bold text-blue-900">حذف</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order, idx) => (
              <TableRow key={order.id} className={cn(
                "border-b hover:bg-blue-50 transition-colors",
                idx % 2 === 0 ? "bg-white" : "bg-gray-50"
              )}>
                <TableCell className="py-3 px-2">
                  <input
                    type="text"
                    value={order.customerName}
                    onChange={(e) => updateField(order.id, 'customerName', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل اسم العميل"
                  />
                </TableCell>
                <TableCell className="py-3 px-2">
                  <input
                    type="text"
                    value={order.location}
                    onChange={(e) => updateField(order.id, 'location', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل الموقع"
                  />
                </TableCell>
                <TableCell className="py-3 px-2">
                  <input
                    type="number"
                    value={order.doorsCount ?? ''}
                    onChange={(e) => updateField(order.id, 'doorsCount', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </TableCell>
                <TableCell className="py-3 px-2">
                  <input
                    type="text"
                    value={order.orderDate}
                    onChange={(e) => updateField(order.id, 'orderDate', e.target.value)}
                    onBlur={(e) => handleDateBlur(order.id, 'orderDate', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="YYYY-MM-DD أو M/D"
                  />
                </TableCell>
                <TableCell className="py-3 px-2">
                  <input
                    type="text"
                    value={order.installationDate}
                    onChange={(e) => updateField(order.id, 'installationDate', e.target.value)}
                    onBlur={(e) => handleDateBlur(order.id, 'installationDate', e.target.value)}
                    className={cn(
                      "w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500",
                      order.isInstalled && "line-through opacity-40"
                    )}
                    placeholder="YYYY-MM-DD أو M/D"
                  />
                </TableCell>
                <TableCell className="py-3 px-2">
                  <input
                    type="number"
                    value={order.downPayment ?? ''}
                    onChange={(e) => updateField(order.id, 'downPayment', e.target.value ? parseInt(e.target.value) : null)}
                    className={cn(
                      "w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500",
                      order.isDownPaymentPaid && "line-through opacity-40"
                    )}
                    placeholder="0"
                  />
                </TableCell>
                <TableCell className="py-3 px-2 text-center">
                  <Checkbox
                    checked={order.isDownPaymentPaid}
                    onCheckedChange={(checked) => updateField(order.id, 'isDownPaymentPaid', checked)}
                    className="mx-auto"
                  />
                </TableCell>
                <TableCell className="py-3 px-2 text-center">
                  <Checkbox
                    checked={order.isInstalled}
                    onCheckedChange={(checked) => updateField(order.id, 'isInstalled', checked)}
                    className="mx-auto"
                  />
                </TableCell>
                <TableCell className="py-3 px-2 text-center">
                  <Button
                    type="button"
                    onClick={() => handleDeleteRow(order.id)}
                    size="sm"
                    variant="destructive"
                    className="gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter className="bg-blue-50 border-t-2 border-blue-200">
            <TableRow>
              <TableCell colSpan={9} className="py-4 px-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex gap-6">
                    <div>
                      <p className="text-sm text-gray-600">إجمالي الأبواب</p>
                      <p className="text-lg font-bold text-blue-900">{totalDoors}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">المبالغ المستحقة</p>
                      <p className="text-lg font-bold text-red-600">{formatCurrency(totalUnreceived)}</p>
                    </div>
                  </div>
                  <Button 
                    type="button"
                    onClick={handleAddRow} 
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة صف جديد
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* Debug Info */}
      <div className="mt-6 p-4 bg-gray-100 rounded text-xs text-gray-700 print:hidden">
        <p className="font-bold mb-2">معلومات التصحيح:</p>
        <p>عدد الصفوف: {orders.length}</p>
        <p>حالة الحفظ: {saveMutation.isPending ? 'جاري الحفظ...' : 'جاهز'}</p>
        <p>آخر حفظ: {lastSaveTime || 'لم يتم الحفظ بعد'}</p>
        <p>الحفظ التلقائي: {autoSaveEnabled ? 'مفعل' : 'معطل'}</p>
      </div>
    </div>
  );
}
