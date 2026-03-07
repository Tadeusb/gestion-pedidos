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

const SIGUIENTE_ESTADO: Record<string, string> = {
  received: "preparing",
  preparing: "ready",
  ready: "on_way",
  on_way: "delivered",
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [repartidores, setRepartidores] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const audioRef =
    typeof window !== "undefined"
      ? new Audio(
          "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
        )
      : null;

async function cargarPedidos() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setPedidos(data || []);
    setCargando(false);
  }

  async function cargarRepartidores() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", "delivery");
    console.log("Repartidores data:", data);
    console.log("Repartidores error:", error);
    setRepartidores(data || []);
  }

  useEffect(() => {
    cargarPedidos();
    cargarRepartidores();

    const channel = supabase
      .channel('orders-' + Date.now())
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          setPedidos((prev) => [payload.new, ...prev]);
          audioRef?.play().catch(() => {})
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          setPedidos((prev) =>
            prev.map((p) =>
              p.id === payload.new.id ? { ...p, ...payload.new } : p,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function cambiarEstado(id: string, nuevoEstado: string) {
    await supabase.from("orders").update({ status: nuevoEstado }).eq("id", id);
  }

  async function asignarRepartidor(orderId: string, userId: string) {
    const { error } = await supabase.from("deliveries").insert({
      order_id: orderId,
      delivery_user_id: userId,
    });
    if (error) alert("Error: " + error.message);
    else cargarPedidos();
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-gray-400">Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Pedidos</h2>
        <span className="flex items-center gap-2 text-sm text-green-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Tiempo real activo
        </span>
      </div>

      {pedidos.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-gray-500">No hay pedidos todavía</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {pedidos.map((pedido) => {
            const estado = ESTADOS[pedido.status];
            const siguiente = SIGUIENTE_ESTADO[pedido.status];
            const tieneRepartidor = false;
            return (
              <div key={pedido.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-bold text-gray-800">
                        {pedido.customer_name}
                      </p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${estado.color}`}
                      >
                        {estado.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      📍 {pedido.customer_address}
                    </p>
                    <p className="text-sm text-gray-500">
                      📞 {pedido.customer_phone}
                    </p>
                    {pedido.notes && (
                      <p className="text-sm text-gray-500 mt-1">
                        📝 {pedido.notes}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      #{pedido.tracking_code} ·{" "}
                      {new Date(pedido.created_at).toLocaleTimeString()}
                    </p>

                    {/* Asignar repartidor */}
                    {!tieneRepartidor &&
                      pedido.status !== "delivered" &&
                      pedido.status !== "cancelled" && (
                        <div className="mt-3 flex items-center gap-2">
                          <select
                            className="border-2 border-blue-400 rounded-lg px-2 py-1 text-sm bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value)
                                asignarRepartidor(pedido.id, e.target.value);
                            }}
                          >
                            <option value="">Asignar repartidor...</option>
                            {repartidores.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.full_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    {tieneRepartidor && (
                      <p className="text-sm text-green-600 mt-2">
                        🛵 Repartidor asignado
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-800">
                      ${pedido.total.toLocaleString()}
                    </p>
                    {siguiente && (
                      <button
                        onClick={() => cambiarEstado(pedido.id, siguiente)}
                        className="mt-2 bg-blue-600 text-white text-sm px-3 py-1 rounded-lg hover:bg-blue-700"
                      >
                        → {ESTADOS[siguiente].label}
                      </button>
                    )}
                    {pedido.status !== "cancelled" &&
                      pedido.status !== "delivered" && (
                        <button
                          onClick={() => cambiarEstado(pedido.id, "cancelled")}
                          className="mt-1 block text-red-500 hover:text-red-700 text-xs"
                        >
                          Cancelar
                        </button>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
