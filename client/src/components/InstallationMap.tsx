import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { trpc } from '@/lib/trpc';
import { Menu, Phone, MessageCircle, Navigation, X, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Order } from './AdminOrdersTable';

// Fix Leaflet icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Component to handle map flyTo animations
function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function InstallationMap({ onLogout }: { onLogout: () => void }) {
  const { data: orders = [] } = trpc.orders.list.useQuery();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeCenter, setActiveCenter] = useState<[number, number] | null>(null);
  
  // Filter only orders that have coordinates
  const validOrders = orders.filter(
    o => typeof o.latitude === 'number' && typeof o.longitude === 'number'
  ) as (Order & { latitude: number, longitude: number })[];

  // Baghdad default center
  const defaultCenter: [number, number] = [33.3152, 44.3661];

  const handleClientClick = (lat: number, lng: number) => {
    setActiveCenter([lat, lng]);
    setIsSidebarOpen(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-100 font-body" dir="rtl">
      {/* Map */}
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        zoomControl={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <MapController center={activeCenter} />

        {validOrders.map(order => (
          <Marker 
            key={order.id} 
            position={[order.latitude, order.longitude]}
            eventHandlers={{
              click: () => setActiveCenter([order.latitude, order.longitude])
            }}
          >
            <Popup className="custom-popup" minWidth={280}>
              <div className="flex flex-col gap-4 p-1" dir="rtl">
                <div className="border-b pb-3">
                  <h3 className="text-xl font-bold text-gray-900 mb-1" style={{ margin: 0 }}>{order.customerName}</h3>
                  {order.phoneNumber ? (
                    <p className="text-gray-600 text-lg font-mono m-0" dir="ltr" style={{ margin: 0 }}>{order.phoneNumber}</p>
                  ) : (
                    <p className="text-gray-400 text-sm m-0" style={{ margin: 0 }}>لا يوجد رقم هاتف</p>
                  )}
                </div>
                
                <div className="flex flex-col gap-3">
                  <a 
                    href={order.phoneNumber ? `tel:${order.phoneNumber}` : '#'} 
                    className={cn(
                      "flex items-center justify-center gap-3 w-full py-4 rounded-xl text-white font-bold text-lg transition-transform active:scale-95 no-underline",
                      order.phoneNumber ? "bg-blue-600 hover:bg-blue-700 shadow-md" : "bg-gray-300 cursor-not-allowed"
                    )}
                  >
                    <Phone className="w-6 h-6" />
                    <span>اتصال</span>
                  </a>

                  <a 
                    href={order.phoneNumber ? `https://wa.me/${order.phoneNumber.replace(/\D/g, '')}` : '#'} 
                    target="_blank" 
                    rel="noreferrer"
                    className={cn(
                      "flex items-center justify-center gap-3 w-full py-4 rounded-xl text-white font-bold text-lg transition-transform active:scale-95 no-underline",
                      order.phoneNumber ? "bg-green-500 hover:bg-green-600 shadow-md" : "bg-gray-300 cursor-not-allowed"
                    )}
                  >
                    <MessageCircle className="w-6 h-6" />
                    <span>واتساب</span>
                  </a>

                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${order.latitude},${order.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-4 rounded-xl text-white font-bold text-lg bg-orange-500 hover:bg-orange-600 shadow-md transition-transform active:scale-95 no-underline"
                  >
                    <Navigation className="w-6 h-6" />
                    <span>الاتجاهات</span>
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Action Buttons */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-4">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center text-blue-900 border-2 border-blue-100 hover:bg-blue-50 transition-colors active:scale-95"
        >
          <Menu className="w-8 h-8" />
        </button>
      </div>

      <div className="absolute top-4 left-4 z-[1000]">
        <button 
          onClick={onLogout}
          className="px-5 py-3 bg-white/90 backdrop-blur rounded-full shadow-md text-red-600 font-bold text-base border border-red-100 active:scale-95 transition-transform"
        >
          خروج
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[2000] transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-[85vw] max-w-[320px] bg-white z-[3000] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col",
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b bg-blue-50">
          <h2 className="text-2xl font-bold text-blue-900">قائمة العملاء</h2>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-full hover:bg-blue-100 text-blue-900 transition-colors"
          >
            <X className="w-7 h-7" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {validOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MapPin className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-xl">لا يوجد عملاء حالياً</p>
            </div>
          ) : (
            validOrders.map(order => (
              <button
                key={order.id}
                onClick={() => handleClientClick(order.latitude, order.longitude)}
                className="w-full text-right p-5 rounded-2xl border-2 border-gray-100 bg-white hover:bg-blue-50 hover:border-blue-200 shadow-sm transition-all text-xl font-bold text-gray-800 active:scale-95"
              >
                {order.customerName}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
