import React, { useState, useMemo, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Printer, Plus, Trash2, CloudUpload, Loader2 } from 'lucide-react';
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
  
  // TRPC Hooks
  const { data: initialOrders, isLoading: isFetching } = trpc.orders.list.useQuery();
  const saveMutation = trpc.orders.saveAll.useMutation({
    onSuccess: () => {
      toast.success("تم الحفظ سحابياً بنجاح!", {
        description: "جميع بيانات الجدول تم مزامنتها مع الخادم."
      });
    },
    onError: (err) => {
      toast.error("فشل الحفظ", {
        description: err.message
      });
    }
  });

  // Populate local state when data is loaded
  useEffect(() => {
    if (initialOrders) {
      setOrders(initialOrders as Order[]);
    }
  }, [initialOrders]);

  const handlePrint = () => {
    window.print();
  };
  
  const handleSaveToCloud = async () => {
    await saveMutation.mutateAsync({
      orders: orders,
      passcode: '2026326'
    });
  };

  const handleAddRow = () => {
    setOrders([
      ...orders,
      {
        id: nanoid(),
        customerName: '',
        location: '',
        doorsCount: null,
        orderDate: '',
        installationDate: '',
        downPayment: null,
        isDownPaymentPaid: false,
        isInstalled: false,
      }
    ]);
  };

  const handleDeleteRow = (id: string) => {
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
      const currentYear = new Date().getFullYear(); // e.g., 2026
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
        <h2 className="text-2xl font-bold text-blue-900">إدارة المبيعات والتركيبات</h2>
        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
            العدد الإجمالي: {orders.length}
          </span>
          <Button 
            onClick={handleSaveToCloud} 
            disabled={saveMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 flex-1 sm:flex-none"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
            حفظ سحابياً
          </Button>
          <Button onClick={handlePrint} className="bg-slate-800 hover:bg-slate-700 text-white gap-2 flex-1 sm:flex-none">
            <Printer className="w-4 h-4" />
            طباعة الجدول
          </Button>
        </div>
      </div>
      
      <div className="rounded-xl border border-gray-200 bg-white print:border-none print:rounded-none overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table className="print:text-sm min-w-[800px] w-full">
            <TableHeader className="bg-slate-900 print:bg-gray-200 print:text-black">
              <TableRow className="hover:bg-slate-900 border-b-0 print:border-b-2 print:border-gray-800">
                <TableHead className="text-right text-white font-bold py-4 px-2 w-16 print:hidden whitespace-nowrap">إجراءات</TableHead>
                <TableHead className="text-right text-white font-bold py-4 px-2 w-20 print:text-black whitespace-nowrap">حالة الشد</TableHead>
                <TableHead className="text-right text-white font-bold py-4 px-2 w-24 print:text-black whitespace-nowrap">حالة المقدمة</TableHead>
                <TableHead className="text-right text-white font-bold py-4 px-2 print:text-black whitespace-nowrap min-w-[120px]">موعد الشد</TableHead>
                <TableHead className="text-right text-white font-bold py-4 px-2 print:text-black whitespace-nowrap min-w-[120px]">التاريخ</TableHead>
                <TableHead className="text-center text-white font-bold py-4 px-2 w-24 print:text-black whitespace-nowrap">عدد الأبواب</TableHead>
                <TableHead className="text-right text-white font-bold py-4 px-2 print:text-black whitespace-nowrap min-w-[150px]">الموقع</TableHead>
                <TableHead className="text-right text-white font-bold py-4 px-2 print:text-black whitespace-nowrap min-w-[150px]">الاسم</TableHead>
                <TableHead className="text-left text-white font-bold py-4 px-4 w-32 print:text-black whitespace-nowrap min-w-[120px]">المقدمة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, index) => (
                <TableRow 
                  key={order.id} 
                  className={cn(
                    "transition-colors group",
                    index % 2 === 0 ? "bg-white" : "bg-slate-50",
                    "hover:bg-blue-50/80 print:hover:bg-transparent"
                  )}
                >
                  <TableCell className="px-2 py-1 print:hidden align-middle text-center whitespace-nowrap">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteRow(order.id)}
                      className="text-red-400 hover:text-red-700 hover:bg-red-50 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="px-2 py-1 align-middle whitespace-nowrap">
                    <div className="flex justify-start">
                      <Checkbox 
                        checked={order.isInstalled}
                        onCheckedChange={(checked) => updateField(order.id, 'isInstalled', checked)}
                        className="border-gray-400 data-[state=checked]:bg-blue-600 h-5 w-5 rounded-sm print:border-black"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-1 align-middle whitespace-nowrap">
                    <div className="flex justify-start">
                      <Checkbox 
                        checked={order.isDownPaymentPaid}
                        onCheckedChange={(checked) => updateField(order.id, 'isDownPaymentPaid', checked)}
                        className="border-gray-400 data-[state=checked]:bg-blue-600 h-5 w-5 rounded-sm print:border-black"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="px-1 py-1 align-middle whitespace-nowrap">
                    <input
                      className={cn(
                        "w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-2 py-1.5 transition-all text-right font-medium print:p-0",
                        order.isInstalled && "line-through text-gray-400 print:text-gray-600"
                      )}
                      value={order.installationDate || ''}
                      onChange={(e) => updateField(order.id, 'installationDate', e.target.value)}
                      onBlur={(e) => handleDateBlur(order.id, 'installationDate', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleDateBlur(order.id, 'installationDate', order.installationDate)}
                      placeholder="YYYY-MM-DD"
                    />
                  </TableCell>
                  <TableCell className="px-1 py-1 align-middle whitespace-nowrap">
                    <input
                      className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-2 py-1.5 transition-all text-right text-gray-700 print:p-0 print:text-black"
                      value={order.orderDate || ''}
                      onChange={(e) => updateField(order.id, 'orderDate', e.target.value)}
                      onBlur={(e) => handleDateBlur(order.id, 'orderDate', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleDateBlur(order.id, 'orderDate', order.orderDate)}
                      placeholder="YYYY-MM-DD"
                    />
                  </TableCell>
                  <TableCell className="px-1 py-1 align-middle whitespace-nowrap">
                    <div className="flex justify-center">
                      <input
                        type="number"
                        className="w-16 bg-blue-100/50 hover:bg-blue-100 focus:bg-white border-none outline-none focus:ring-2 focus:ring-blue-400 rounded-lg py-1 text-center font-bold text-blue-800 transition-colors print:bg-transparent print:p-0 print:text-black"
                        value={order.doorsCount === null ? '' : order.doorsCount}
                        onChange={(e) => updateField(order.id, 'doorsCount', e.target.value === '' ? null : Number(e.target.value))}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="px-1 py-1 align-middle whitespace-nowrap">
                    <input
                      className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-2 py-1.5 transition-all text-right text-gray-800 print:p-0 print:text-black min-w-[120px]"
                      value={order.location || ''}
                      onChange={(e) => updateField(order.id, 'location', e.target.value)}
                      placeholder="الموقع..."
                    />
                  </TableCell>
                  <TableCell className="px-1 py-1 align-middle whitespace-nowrap">
                    <input
                      className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-2 py-1.5 transition-all text-right font-bold text-gray-900 print:p-0 print:text-black min-w-[120px]"
                      value={order.customerName || ''}
                      onChange={(e) => updateField(order.id, 'customerName', e.target.value)}
                      placeholder="اسم العميل..."
                    />
                  </TableCell>
                  <TableCell className="px-1 py-1 align-middle whitespace-nowrap">
                    <div className="relative">
                      <input
                        type="number"
                        className={cn(
                          "w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-2 py-1.5 transition-all text-left font-bold print:p-0 print:text-black min-w-[100px]",
                          order.isDownPaymentPaid ? "line-through text-gray-400 print:text-gray-600" : "text-emerald-600 print:text-black"
                        )}
                        value={order.downPayment === null ? '' : order.downPayment}
                        onChange={(e) => updateField(order.id, 'downPayment', e.target.value === '' ? null : Number(e.target.value))}
                        placeholder="0"
                        min="0"
                        step="1000"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="bg-slate-100 border-t-2 border-slate-300 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] print:border-t-2 print:border-black print:bg-white print:text-black">
              <TableRow className="hover:bg-slate-100 print:hover:bg-transparent">
                <TableCell className="print:hidden whitespace-nowrap"></TableCell>
                <TableCell colSpan={4} className="text-right font-bold text-slate-700 py-4 px-4 text-lg print:text-black whitespace-nowrap">
                  المجموع الكلي:
                </TableCell>
                <TableCell className="text-center font-black text-blue-800 py-4 px-2 text-xl print:text-black whitespace-nowrap">
                  {totalDoors}
                </TableCell>
                <TableCell colSpan={2} className="text-right font-bold text-slate-700 py-4 px-4 text-lg print:text-black whitespace-nowrap">
                  مجموع المبالغ غير المستلمة:
                </TableCell>
                <TableCell className="text-left font-black text-emerald-600 py-4 px-4 text-xl tracking-tight print:text-black whitespace-nowrap">
                  {formatCurrency(totalUnreceived)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      <div className="mt-4 print:hidden">
        <Button 
          onClick={handleAddRow}
          variant="outline" 
          className="w-full h-12 border-dashed border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-600 hover:text-blue-700 font-bold gap-2 text-lg"
        >
          <Plus className="w-5 h-5" />
          إضافة صف جديد
        </Button>
      </div>
    </div>
  );
}
