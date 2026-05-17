import React, { useState, useMemo, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Printer, Plus, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { nanoid } from 'nanoid';
import { trpc } from '@/lib/trpc';

export type Order = {
  id: number;
  customerName: string;
  location: string;
  doorsCount: number | '';
  orderDate: string;
  installationDate: string;
  downPayment: number | '';
  isDownPaymentPaid: boolean;
  isInstalled: boolean;
};

export default function AdminOrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // tRPC queries and mutations
  const { data: dbOrders = [], isLoading: isLoadingOrders } = trpc.orders.list.useQuery();
  const addOrderMutation = trpc.orders.add.useMutation();
  const updateOrderMutation = trpc.orders.update.useMutation();
  const deleteOrderMutation = trpc.orders.delete.useMutation();

  // Load orders from database on mount
  useEffect(() => {
    if (!isLoadingOrders) {
      const formattedOrders = dbOrders.map(order => ({
        id: order.id,
        customerName: order.customerName,
        location: order.location,
        doorsCount: order.doorsCount,
        orderDate: order.orderDate,
        installationDate: order.installationDate,
        downPayment: order.downPayment,
        isDownPaymentPaid: Boolean(order.isDownPaymentPaid),
        isInstalled: Boolean(order.isInstalled),
      }));
      setOrders(formattedOrders);
      setIsLoading(false);
    }
  }, [dbOrders, isLoadingOrders]);

  const handlePrint = () => {
    window.print();
  };

  const handleAddRow = async () => {
    const newOrder: Order = {
      id: -1,
      customerName: '',
      location: '',
      doorsCount: '',
      orderDate: '',
      installationDate: '',
      downPayment: '',
      isDownPaymentPaid: false,
      isInstalled: false,
    };
    setOrders([...orders, newOrder]);
  };

  const handleDeleteRow = async (id: number) => {
    if (id > 0) {
      try {
        setIsSaving(true);
        await deleteOrderMutation.mutateAsync({ id });
        setOrders(prev => prev.filter(o => o.id !== id));
      } catch (error) {
        console.error('Failed to delete order:', error);
      } finally {
        setIsSaving(false);
      }
    } else {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
  };

  const updateField = async (id: number, field: keyof Order, value: any) => {
    const updatedOrders = orders.map(o => (o.id === id ? { ...o, [field]: value } : o));
    setOrders(updatedOrders);

    // Save to database if it's an existing order
    if (id > 0) {
      try {
        setIsSaving(true);
        const order = updatedOrders.find(o => o.id === id);
        if (order) {
          await updateOrderMutation.mutateAsync({
            id,
            [field]: value,
          });
        }
      } catch (error) {
        console.error('Failed to update order:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const saveNewOrder = async (order: Order) => {
    if (order.id === -1 && order.customerName) {
      try {
        setIsSaving(true);
        const result = await addOrderMutation.mutateAsync({
          customerName: order.customerName,
          location: order.location,
          doorsCount: Number(order.doorsCount) || 0,
          orderDate: order.orderDate,
          installationDate: order.installationDate,
          downPayment: Number(order.downPayment) || 0,
          isDownPaymentPaid: order.isDownPaymentPaid ? 1 : 0,
          isInstalled: order.isInstalled ? 1 : 0,
        });
        
        // Update the local order with the database ID
        setOrders(prev => prev.map(o => (o.id === -1 ? { ...o, id: result?.id || -1 } : o)));
      } catch (error) {
        console.error('Failed to save order:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Smart Date Parsing logic
  const parseDate = (val: string) => {
    const str = val.trim();
    if (!str) return str;
    
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

  const handleDateBlur = (id: number, field: 'orderDate' | 'installationDate', val: string) => {
    const parsed = parseDate(val);
    if (parsed !== val) {
      updateField(id, field, parsed);
    } else if (id > 0) {
      updateField(id, field, parsed);
    }
  };

  const handleFieldBlur = (id: number, field: keyof Order) => {
    const order = orders.find(o => o.id === id);
    if (order && id === -1) {
      saveNewOrder(order);
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">جاري تحميل بيانات المبيعات...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm print:p-0 print:shadow-none relative" dir="rtl">
      {isSaving && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl z-50">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-600">جاري الحفظ...</p>
          </div>
        </div>
      )}

      <div className="mb-6 flex justify-between items-center print:hidden">
        <h2 className="text-2xl font-bold text-blue-900">إدارة المبيعات والتركيبات</h2>
        <div className="flex gap-3 items-center">
          <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
            العدد الإجمالي: {orders.length}
          </span>
          <Button onClick={handlePrint} className="bg-slate-800 hover:bg-slate-700 text-white gap-2">
            <Printer className="w-4 h-4" />
            طباعة الجدول
          </Button>
        </div>
      </div>
      
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white print:border-none print:rounded-none">
        <Table className="print:text-sm">
          <TableHeader className="bg-slate-900 print:bg-gray-200 print:text-black">
            <TableRow className="hover:bg-slate-900 border-b-0 print:border-b-2 print:border-gray-800">
              <TableHead className="text-right text-white font-bold py-4 px-2 w-16 print:hidden">إجراءات</TableHead>
              <TableHead className="text-right text-white font-bold py-4 px-2 w-20 print:text-black">حالة الشد</TableHead>
              <TableHead className="text-right text-white font-bold py-4 px-2 w-24 print:text-black">حالة المقدمة</TableHead>
              <TableHead className="text-right text-white font-bold py-4 px-2 print:text-black">موعد الشد</TableHead>
              <TableHead className="text-right text-white font-bold py-4 px-2 print:text-black">التاريخ</TableHead>
              <TableHead className="text-center text-white font-bold py-4 px-2 w-24 print:text-black">عدد الأبواب</TableHead>
              <TableHead className="text-right text-white font-bold py-4 px-2 print:text-black">الموقع</TableHead>
              <TableHead className="text-right text-white font-bold py-4 px-2 print:text-black">الاسم</TableHead>
              <TableHead className="text-left text-white font-bold py-4 px-4 w-32 print:text-black">المقدمة</TableHead>
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
                <TableCell className="px-2 py-1 print:hidden align-middle text-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteRow(order.id)}
                    className="text-red-400 hover:text-red-700 hover:bg-red-50 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
                <TableCell className="px-2 py-1 align-middle">
                  <div className="flex justify-start">
                    <Checkbox 
                      checked={order.isInstalled}
                      onCheckedChange={(checked) => updateField(order.id, 'isInstalled', checked)}
                      className="border-gray-400 data-[state=checked]:bg-blue-600 h-5 w-5 rounded-sm print:border-black"
                    />
                  </div>
                </TableCell>
                <TableCell className="px-2 py-1 align-middle">
                  <div className="flex justify-start">
                    <Checkbox 
                      checked={order.isDownPaymentPaid}
                      onCheckedChange={(checked) => updateField(order.id, 'isDownPaymentPaid', checked)}
                      className="border-gray-400 data-[state=checked]:bg-blue-600 h-5 w-5 rounded-sm print:border-black"
                    />
                  </div>
                </TableCell>
                <TableCell className="px-1 py-1 align-middle">
                  <input
                    className={cn(
                      "w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-2 py-1.5 transition-all text-right font-medium print:p-0",
                      order.isInstalled && "line-through text-gray-400 print:text-gray-600"
                    )}
                    value={order.installationDate}
                    onChange={(e) => updateField(order.id, 'installationDate', e.target.value)}
                    onBlur={(e) => handleDateBlur(order.id, 'installationDate', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDateBlur(order.id, 'installationDate', order.installationDate as string)}
                    placeholder="YYYY-MM-DD"
                  />
                </TableCell>
                <TableCell className="px-1 py-1 align-middle">
                  <input
                    className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-2 py-1.5 transition-all text-right text-gray-700 print:p-0 print:text-black"
                    value={order.orderDate}
                    onChange={(e) => updateField(order.id, 'orderDate', e.target.value)}
                    onBlur={(e) => handleDateBlur(order.id, 'orderDate', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDateBlur(order.id, 'orderDate', order.orderDate as string)}
                    placeholder="YYYY-MM-DD"
                  />
                </TableCell>
                <TableCell className="px-1 py-1 align-middle">
                  <div className="flex justify-center">
                    <input
                      type="number"
                      className="w-16 bg-blue-100/50 hover:bg-blue-100 focus:bg-white border-none outline-none focus:ring-2 focus:ring-blue-400 rounded-lg py-1 text-center font-bold text-blue-800 transition-colors print:bg-transparent print:p-0 print:text-black"
                      value={order.doorsCount}
                      onChange={(e) => updateField(order.id, 'doorsCount', e.target.value === '' ? '' : Number(e.target.value))}
                      onBlur={() => handleFieldBlur(order.id, 'doorsCount')}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </TableCell>
                <TableCell className="px-1 py-1 align-middle">
                  <input
                    className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-2 py-1.5 transition-all text-right text-gray-800 print:p-0 print:text-black"
                    value={order.location}
                    onChange={(e) => updateField(order.id, 'location', e.target.value)}
                    onBlur={() => handleFieldBlur(order.id, 'location')}
                    placeholder="الموقع..."
                  />
                </TableCell>
                <TableCell className="px-1 py-1 align-middle">
                  <input
                    className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-2 py-1.5 transition-all text-right font-bold text-gray-900 print:p-0 print:text-black"
                    value={order.customerName}
                    onChange={(e) => updateField(order.id, 'customerName', e.target.value)}
                    onBlur={() => handleFieldBlur(order.id, 'customerName')}
                    placeholder="اسم العميل..."
                  />
                </TableCell>
                <TableCell className="px-1 py-1 align-middle">
                  <div className="relative">
                    <input
                      type="number"
                      className={cn(
                        "w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-2 py-1.5 transition-all text-left font-bold print:p-0 print:text-black",
                        order.isDownPaymentPaid ? "line-through text-gray-400 print:text-gray-600" : "text-emerald-600 print:text-black"
                      )}
                      value={order.downPayment}
                      onChange={(e) => updateField(order.id, 'downPayment', e.target.value === '' ? '' : Number(e.target.value))}
                      onBlur={() => handleFieldBlur(order.id, 'downPayment')}
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
              <TableCell className="print:hidden"></TableCell>
              <TableCell colSpan={4} className="text-right font-bold text-slate-700 py-4 px-4 text-lg print:text-black">
                المجموع الكلي:
              </TableCell>
              <TableCell className="text-center font-black text-blue-800 py-4 px-2 text-xl print:text-black">
                {totalDoors}
              </TableCell>
              <TableCell colSpan={2} className="text-right font-bold text-slate-700 py-4 px-4 text-lg print:text-black">
                مجموع المبالغ غير المستلمة:
              </TableCell>
              <TableCell className="text-left font-black text-emerald-600 py-4 px-4 text-xl tracking-tight print:text-black">
                {formatCurrency(totalUnreceived)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
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
