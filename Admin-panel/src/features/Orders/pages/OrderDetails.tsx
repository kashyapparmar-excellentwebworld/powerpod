import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  User,
  Truck,
  Printer,
  XCircle,
  MapPin,
  CheckCircle2,
  Package,
  Phone
} from "lucide-react";

// ── Dummy Data ──────────────────────────────────────────────────────────────
const ORDER_ITEMS = [
  { id: 1, name: "Premium Wireless Headphones", quantity: 2, price: 450, total: 900 },
  { id: 2, name: "Mechanical Gaming Keyboard", quantity: 1, price: 350, total: 350 },
  { id: 3, name: "Ergonomic Office Chair", quantity: 1, price: 1200, total: 1200 },
];

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const subtotal = ORDER_ITEMS.reduce((acc, item) => acc + item.total, 0);
  const tax = subtotal * 0.15; // 15% VAT
  const total = subtotal + tax;

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/orders")}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900">Order Details</h1>
          <p className="text-xs text-gray-400 font-medium">
            Order #{id || "ORD-2024101"}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-xl border border-gray-200 transition-all shadow-sm">
            <Printer className="w-4 h-4" />
            Print Invoice
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-bold rounded-xl transition-all shadow-sm">
            <XCircle className="w-4 h-4" />
            Cancel Order
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Order Summary & Info */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-600" />
              Order Info
            </h3>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-[13px] font-medium">Order Date</span>
                </div>
                <span className="text-[13px] font-bold text-gray-800">12/03/2024</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[13px] font-medium">Payment Status</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">Paid</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[13px] font-medium">Order Status</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">Ongoing</span>
              </div>
            </div>

            <div className="w-full h-px bg-gray-100 my-5" />

            <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-purple-600" />
              Customer Details
            </h3>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-black">
                   A
                 </div>
                 <div>
                   <p className="text-[13px] font-bold text-gray-800">Ahmed Al-Rashid</p>
                   <p className="text-[11px] text-gray-500">ahmed@example.com</p>
                 </div>
              </div>
              <div className="flex items-start gap-2 mt-2 text-gray-600">
                <Phone className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-[13px]">+966 50 123 4567</span>
              </div>
            </div>

            <div className="w-full h-px bg-gray-100 my-5" />

            <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-purple-600" />
              Shipping Address
            </h3>

            <div className="flex items-start gap-2 text-gray-600">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[13px] leading-relaxed">
                1234 King Fahd Road,<br/>
                Olaya District,<br/>
                Riyadh 12211,<br/>
                Saudi Arabia
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Order Items */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
               <h3 className="text-base font-black text-gray-900">Order Items</h3>
               <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">{ORDER_ITEMS.length} Items</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase">Item Description</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase text-center">Price</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase text-center">Qty</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ORDER_ITEMS.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <p className="text-[13px] font-semibold text-gray-800">{item.name}</p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-[13px] text-gray-600">SAR {item.price.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-[13px] font-bold text-gray-800">{item.quantity}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-[13px] font-black text-purple-700">SAR {item.total.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-gray-50/50 border-t border-gray-100">
              <div className="flex flex-col gap-2 w-full max-w-xs ml-auto">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="text-gray-800 font-semibold">SAR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-gray-500 font-medium">VAT (15%)</span>
                  <span className="text-gray-800 font-semibold">SAR {tax.toLocaleString()}</span>
                </div>
                <div className="w-full h-px bg-gray-200 my-1" />
                <div className="flex items-center justify-between text-base">
                  <span className="text-gray-900 font-black">Total</span>
                  <span className="text-purple-700 font-black">SAR {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
