"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ESTADOS: Record<string, { label: string; color: string }> = {
  received: { label: "Recibido", color: "bg-blue-100 text-blue-700" },
  preparing: { label: "Preparando", color: "bg-yellow-100 text-yellow-700" },
  ready: { label: "Listo", color: "bg-purple-100 text-purple-700" },
  on_way: { label: "En camino", color: "bg-orange-100 text-orange-700" },
  delivered: { label: "Entregado", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700" },
};

export default function RepartidorPage() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const REPARTIDOR_ID = "00000000-0000-0000-0000-000000000001";

  async function cargarPedidos() {
    const { data } = await supabase
      .from("deliveries")
      .select("*, orders(*)")
      .eq("delivery_user_id", REPARTIDOR_ID);

    const pedidosActivos = (data || [])
      .map((d) => d.orders)
      .filter((o) => o.status !== "delivered" && o.status !== "cancelled");

    setPedidos(pedidosActivos);
    setCargando(false);
  }

  useEffect(() => {
  cargarPedidos()

  const channel = supabase
    .channel('repartidor-' + Date.now())
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'deliveries' },
      () => cargarPedidos()
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders' },
      () => cargarPedidos()
    )
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, []);

  async function cambiarEstado(id: string, nuevoEstado: string) {
    await supabase.from("orders").update({ status: nuevoEstado }).eq("id", id);
    cargarPedidos();
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">🛵 Mis Pedidos</h1>
        <span className="text-sm text-gray-500">Pedro Repartidor</span>
      </div>

      {pedidos.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-gray-500">No tienes pedidos pendientes</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {pedidos.map((pedido) => {
            const estado = ESTADOS[pedido.status];
            return (
              <div key={pedido.id} className="bg-white rounded-xl shadow p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-gray-800">
                    {pedido.customer_name}
                  </p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${estado.color}`}
                  >
                    {estado.label}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-1">
                  📞 {pedido.customer_phone}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  📍 {pedido.customer_address}
                </p>

                {pedido.notes && (
                  <p className="text-sm bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mb-3">
                    📝 {pedido.notes}
                  </p>
                )}

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pedido.customer_address)}`}
                  target="_blank"
                  className="block text-center bg-gray-100 text-gray-700 rounded-lg py-2 text-sm font-medium mb-3 hover:bg-gray-200"
                >
                  🗺️ Ver en Google Maps
                </a>

                <div className="flex gap-2">
                  {pedido.status === "ready" && (
                    <button
                      onClick={() => cambiarEstado(pedido.id, "on_way")}
                      className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600"
                    >
                      🛵 Salí a entregar
                    </button>
                  )}
                  {pedido.status === "on_way" && (
                    <button
                      onClick={() => cambiarEstado(pedido.id, "delivered")}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600"
                    >
                      ✅ Entregado
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
