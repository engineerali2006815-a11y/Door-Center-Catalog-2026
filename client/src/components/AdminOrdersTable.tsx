import React, { useState, useMemo, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Printer, Plus, Trash2, CloudUpload, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
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
  phoneNumber?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

const AutosizeInput = ({ 
  value, 
  onChange, 
  placeholder, 
  className,
  minWidth = 80,
  maxWidth = 200
}: { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  placeholder?: string;
  className?: string;
  minWidth?: number;
  maxWidth?: number;
}) => {
  return (
    <div 
      className="relative overflow-hidden" 
      style={{ 
        width: 'max-content', 
        minWidth: `${minWidth}px`, 
        maxWidth: `${maxWidth}px` 
      }}
    >
      <div 
        className={cn("invisible whitespace-pre", className)} 
        aria-hidden="true"
      >
        {value || placeholder || ''}
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn("absolute inset-0 w-full h-full", className)}
      />
    </div>
  );
};

export default function AdminOrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastSaveTime, setLastSaveTime] = useState<string>('');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
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

  useEffect(() => {
    if (initialOrders && initialOrders.length > 0) {
      setOrders(sortOrders(initialOrders as Order[]));
    } else if (initialOrders) {
      setOrders([]);
    }
  }, [initialOrders]);

  useEffect(() => {
    if (!autoSaveEnabled || orders.length === 0) return;
    const autoSaveInterval = setInterval(async () => {
      try {
        await saveMutation.mutateAsync({ orders, passcode: '2026326' });
      } catch (error) {}
    }, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [orders, autoSaveEnabled, saveMutation]);

  const handlePrint = () => window.print();
  
  const handleSaveToCloud = async () => {
    try {
      await saveMutation.mutateAsync({ orders, passcode: '2026326' });
    } catch (error) {}
  };

  const handleRefresh = async () => {
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
      phoneNumber: '',
      latitude: null,
      longitude: null,
    };
    setOrders([...orders, newRow]);
    setExpandedRows(prev => new Set(prev).add(newRow.id));
  };

  const handleDeleteRow = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const updateField = (id: string, field: keyof Order, value: any) => {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, [field]: value } : o)));
  };

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

  const handleDateBlur = (id: string, field: 'orderDate' | 'installationDate', val: string) => {
    const parsed = parseDate(val);
    if (parsed !== val) updateField(id, field, parsed);
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  const handleSmartLocationPaste = (id: string, text: string) => {
    const regex = /(-?\d+\.\d+),\s*(-?\d+\.\d+)/;
    const match = text.match(regex);
    if (match) {
      updateField(id, 'latitude', parseFloat(match[1]));
      updateField(id, 'longitude', parseFloat(match[2]));
      toast.success("تم استخراج الإحداثيات بنجاح!");
    } else {
      toast.error("لم يتم العثور على إحداثيات صالحة. يرجى لصق رابط أو نص من خرائط جوجل يحتوي على إحداثيات.");
    }
  };

  const totalUnreceived = useMemo(() => orders.filter(o => !o.isDownPaymentPaid).reduce((sum, o) => sum + (Number(o.downPayment) || 0), 0), [orders]);
  const totalDoors = useMemo(() => orders.reduce((sum, o) => sum + (Number(o.doorsCount) || 0), 0), [orders]);
  const formatCurrency = (amount: number) => new Intl.NumberFormat('ar-IQ', { style: 'currency', currency: 'IQD' }).format(amount);

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
          {lastSaveTime && <p className="text-sm text-gray-500 mt-1">آخر حفظ: {lastSaveTime}</p>}
        </div>
        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">العدد الإجمالي: {orders.length}</span>
          <Button type="button" onClick={handleSaveToCloud} disabled={saveMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 flex-1 sm:flex-none" title="احفظ جميع البيانات في السحابة">
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
            حفظ سحابياً
          </Button>
          <Button type="button" onClick={handleRefresh} disabled={isFetching} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 flex-1 sm:flex-none" title="تحديث البيانات من السحابة">
            {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            تحديث
          </Button>
          <Button type="button" onClick={handlePrint} className="bg-slate-800 hover:bg-slate-700 text-white gap-2 flex-1 sm:flex-none">
            <Printer className="w-4 h-4" /> طباعة الجدول
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full text-sm mx-auto sm:mx-0">
          <TableHeader>
            <TableRow className="bg-blue-50 border-b-2 border-blue-200">
              <TableHead className="w-10"></TableHead>
              <TableHead className="text-right py-3 px-2 font-bold text-blue-900 whitespace-nowrap">اسم العميل</TableHead>
              <TableHead className="text-right py-3 px-2 font-bold text-blue-900 whitespace-nowrap">الموقع</TableHead>
              <TableHead className="text-center py-3 px-2 font-bold text-blue-900 whitespace-nowrap w-[80px]">الأبواب</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order, idx) => {
              const isExpanded = expandedRows.has(order.id);
              return (
                <React.Fragment key={order.id}>
                  <TableRow className={cn("border-b hover:bg-blue-50 transition-colors cursor-pointer", idx % 2 === 0 ? "bg-white" : "bg-gray-50")} onClick={() => toggleRow(order.id)}>
                    <TableCell className="py-2 px-2 text-center">
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                    </TableCell>
                    <TableCell className="py-2 px-2" onClick={(e) => e.stopPropagation()}>
                      <AutosizeInput value={order.customerName} onChange={(e) => updateField(order.id, 'customerName', e.target.value)} className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent font-medium" placeholder="اسم العميل" minWidth={120} maxWidth={300} />
                    </TableCell>
                    <TableCell className="py-2 px-2" onClick={(e) => e.stopPropagation()}>
                      <AutosizeInput value={order.location} onChange={(e) => updateField(order.id, 'location', e.target.value)} className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent" placeholder="المدينة / الحي" minWidth={100} maxWidth={250} />
                    </TableCell>
                    <TableCell className="py-2 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <input type="number" value={order.doorsCount ?? ''} onChange={(e) => updateField(order.id, 'doorsCount', e.target.value ? parseInt(e.target.value) : null)} className="w-[50px] mx-auto text-center px-1 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent" placeholder="0" />
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow className={cn("border-b shadow-inner", idx % 2 === 0 ? "bg-gray-50" : "bg-gray-100")}>
                      <TableCell colSpan={4} className="py-4 px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          
                          <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-200">
                            <h4 className="font-bold text-blue-800 border-b pb-2">معلومات التواصل والموقع</h4>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">رقم الهاتف</label>
                              <input type="text" value={order.phoneNumber || ''} onChange={(e) => updateField(order.id, 'phoneNumber', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="07XX..." />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">الموقع (نسخ من خرائط جوجل)</label>
                              <input type="text" onChange={(e) => handleSmartLocationPaste(order.id, e.target.value)} className="w-full px-2 py-1.5 border border-blue-300 bg-blue-50 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="مثال: 31.2873, 45.2674" />
                            </div>
                            <div className="flex gap-2 text-xs text-gray-500">
                              <span className="bg-gray-100 px-2 py-1 rounded">خط العرض: {order.latitude || '-'}</span>
                              <span className="bg-gray-100 px-2 py-1 rounded">خط الطول: {order.longitude || '-'}</span>
                            </div>
                          </div>

                          <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-200">
                            <h4 className="font-bold text-blue-800 border-b pb-2">التواريخ والتركيب</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">تاريخ الطلب</label>
                                <input type="text" value={order.orderDate} onChange={(e) => updateField(order.id, 'orderDate', e.target.value)} onBlur={(e) => handleDateBlur(order.id, 'orderDate', e.target.value)} className="w-full text-center px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="YYYY-MM-DD" />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">تاريخ التركيب</label>
                                <input type="text" value={order.installationDate} onChange={(e) => updateField(order.id, 'installationDate', e.target.value)} onBlur={(e) => handleDateBlur(order.id, 'installationDate', e.target.value)} className={cn("w-full text-center px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500", order.isInstalled && "line-through opacity-50")} placeholder="YYYY-MM-DD" />
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                              <span className="text-sm font-medium text-gray-700">تم التركيب بنجاح</span>
                              <Checkbox checked={order.isInstalled} onCheckedChange={(checked) => updateField(order.id, 'isInstalled', checked)} className="h-5 w-5" />
                            </div>
                          </div>

                          <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-200">
                            <h4 className="font-bold text-blue-800 border-b pb-2">الدفعة المقدمة</h4>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">مبلغ المقدمة (د.ع)</label>
                              <input type="number" value={order.downPayment ?? ''} onChange={(e) => updateField(order.id, 'downPayment', e.target.value ? parseInt(e.target.value) : null)} className={cn("w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500", order.isDownPaymentPaid && "line-through opacity-50")} placeholder="0" />
                            </div>
                            <div className="flex items-center justify-between pt-2">
                              <span className="text-sm font-medium text-gray-700">تم استلام المقدمة</span>
                              <Checkbox checked={order.isDownPaymentPaid} onCheckedChange={(checked) => updateField(order.id, 'isDownPaymentPaid', checked)} className="h-5 w-5" />
                            </div>
                            <div className="pt-4 flex justify-end">
                              <Button type="button" onClick={() => handleDeleteRow(order.id)} size="sm" variant="destructive" className="gap-1 bg-red-100 text-red-600 hover:bg-red-200 w-full sm:w-auto">
                                <Trash2 className="w-4 h-4" /> حذف الطلب
                              </Button>
                            </div>
                          </div>

                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
          <TableFooter className="bg-blue-50 border-t-2 border-blue-200">
            <TableRow>
              <TableCell colSpan={4} className="py-4 px-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4">
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
                  <Button type="button" onClick={handleAddRow} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full sm:w-auto">
                    <Plus className="w-4 h-4" /> إضافة طلب جديد
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
