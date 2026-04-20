import React, { useEffect, useMemo, useState } from "react";

export default function SerwisRobotowApp() {
  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [machineQuantity, setMachineQuantity] = useState("");
  const [manualQuantity, setManualQuantity] = useState("");
  const [points, setPoints] = useState("");
  const [km, setKm] = useState("");
  const [activeTab, setActiveTab] = useState("calculator");

  const [orders, setOrders] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const PRICE_MACHINE_PER_METER = 7;
  const PRICE_MANUAL_PER_METER = 10;
  const PRICE_PER_POINT = 50;
  const PRICE_PER_KM = 3;
  const FIXED_TRAVEL_COST = 150;

  // Wczytanie z localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedOrders =
        localStorage.getItem("serwis-robotow-orders");

      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    }
  }, []);

  // Zapis do localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "serwis-robotow-orders",
        JSON.stringify(orders)
      );
    }
  }, [orders]);

  // Liczenie sumy
  const total = useMemo(() => {
    const mq = Number(machineQuantity) || 0;
    const manq = Number(manualQuantity) || 0;
    const p = Number(points) || 0;
    const travelKm = Number(km) || 0;

    return (
  mq * PRICE_MACHINE_PER_METER +
  manq * PRICE_MANUAL_PER_METER +
  p * PRICE_PER_POINT +
  travelKm * PRICE_PER_KM +
  (mq + manq + p + travelKm > 0
    ? FIXED_TRAVEL_COST
    : 0)
);
  }, [machineQuantity, manualQuantity, points, km]);

  // Reset formularza
  const resetForm = () => {
    setClientName("");
    setAddress("");
    setPhone("");
    setMachineQuantity("");
    setManualQuantity("");
    setPoints("");
    setKm("");
    setEditingId(null);
  };

  // Zapis / edycja
  const saveOrder = () => {
    if (!clientName.trim()) {
      alert("Podaj imię klienta");
      return;
    }

    const orderData = {
      id: editingId || Date.now(),
      clientName,
      address,
      phone,
      machineQuantity: Number(machineQuantity) || 0,
      manualQuantity: Number(manualQuantity) || 0,
      points: Number(points) || 0,
      km: Number(km) || 0,
      total,
      date: new Date().toLocaleDateString("pl-PL"),
      status: "Oczekuje",
    };

    if (editingId) {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === editingId ? orderData : order
        )
      );
    } else {
      setOrders((prev) => [orderData, ...prev]);
    }

    resetForm();
  };

  // Edycja
  const editOrder = (order) => {
    setClientName(order.clientName);
    setAddress(order.address);
    setPhone(order.phone);
    setMachineQuantity(order.machineQuantity);
    setManualQuantity(order.manualQuantity);
    setPoints(order.points);
    setKm(order.km);
    setEditingId(order.id);

    setActiveTab("calculator");
  };

  const monthlyTotal = orders.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        <h1 className="text-3xl font-bold">
          Serwis Robotów
        </h1>

        <p className="text-gray-400">
          Kalkulator zleceń + historia klientów
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab("calculator")}
            className="rounded-2xl border border-gray-600 bg-gray-800 hover:bg-gray-700 px-4 py-2"
          >
            Kalkulator
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className="rounded-2xl border border-gray-600 bg-gray-800 hover:bg-gray-700 px-4 py-2"
          >
            Historia zleceń
          </button>
        </div>

        {activeTab === "calculator" && (
          <>
            <div className="rounded-2xl border border-gray-700 bg-gray-900">
              <div className="p-6 space-y-4">

                <h2 className="text-xl font-semibold">
                  {editingId
                    ? "Edytuj zlecenie"
                    : "Nowe zlecenie"}
                </h2>

                <div className="grid md:grid-cols-2 gap-4">

                  <input
                    className="border border-gray-700 bg-gray-800 text-white rounded-xl p-3 w-full"
                    placeholder="Imię klienta"
                    value={clientName}
                    onChange={(e) =>
                      setClientName(e.target.value)
                    }
                  />

                  <input
                    className="border border-gray-700 bg-gray-800 text-white rounded-xl p-3 w-full"
                    placeholder="Telefon"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                  />

                  <input
                    className="border border-gray-700 bg-gray-800 text-white rounded-xl p-3 w-full"
                    placeholder="Adres"
                    value={address}
                    onChange={(e) =>
                      setAddress(e.target.value)
                    }
                  />

                  <input
                    className="border border-gray-700 bg-gray-800 text-white rounded-xl p-3 w-full"
                    placeholder="Maszynowo (mm)"
                    type="number"
                    value={machineQuantity}
                    onChange={(e) =>
                      setMachineQuantity(e.target.value)
                    }
                  />

                  <input
                    className="border border-gray-700 bg-gray-800 text-white rounded-xl p-3 w-full"
                    placeholder="Ręcznie (mm)"
                    type="number"
                    value={manualQuantity}
                    onChange={(e) =>
                      setManualQuantity(e.target.value)
                    }
                  />

                  <input
                    className="border border-gray-700 bg-gray-800 text-white rounded-xl p-3 w-full"
                    placeholder="Punkty"
                    type="number"
                    value={points}
                    onChange={(e) =>
                      setPoints(e.target.value)
                    }
                  />

                  <input
                    className="border border-gray-700 bg-gray-800 text-white rounded-xl p-3 w-full"
                    placeholder="Ilość km dojazdu"
                    type="number"
                    value={km}
                    onChange={(e) =>
                      setKm(e.target.value)
                    }
                  />

                </div>

                <div className="border border-gray-700 rounded-2xl p-4 space-y-2 bg-gray-800">
                  <p>Maszynowo: 7 zł / mm</p>
                  <p>Ręcznie: 10 zł / mm</p>
                  <p>Punkty: 50 zł</p>
                  <p>Dojazd: 3 zł / km</p>
                  <p>Koszty stałe: 150 zł</p>

                  <p className="text-lg font-bold">
                    Suma: {total} zł
                  </p>
                </div>

                <div className="flex gap-2">

                  <button
                    onClick={saveOrder}
                    className="rounded-2xl border border-gray-600 bg-green-700 hover:bg-green-600 px-4 py-2"
                  >
                    {editingId
                      ? "Zapisz zmiany"
                      : "Zapisz zlecenie"}
                  </button>

                  {editingId && (
                    <button
                      onClick={resetForm}
                      className="rounded-2xl border border-gray-600 bg-red-700 hover:bg-red-600 px-4 py-2"
                    >
                      Anuluj
                    </button>
                  )}

                </div>

              </div>
            </div>

            <div className="rounded-2xl border border-gray-700 bg-gray-900">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Podsumowanie
                </h2>

                <p>
                  Liczba zleceń:
                  <strong> {orders.length}</strong>
                </p>

                <p>
                  Suma zarobku:
                  <strong> {monthlyTotal} zł</strong>
                </p>

              </div>
            </div>
          </>
        )}

        {activeTab === "history" && (
          <div className="rounded-2xl border border-gray-700 bg-gray-900">
            <div className="p-6">

              <h2 className="text-xl font-semibold mb-4">
                Historia zleceń
              </h2>

              {orders.length === 0 ? (
                <p className="text-gray-400">
                  Brak zapisanych zleceń
                </p>
              ) : (
                <div className="space-y-4">

                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-700 rounded-2xl p-4 bg-gray-800"
                    >

                      <p>
                        <strong>
                          {order.clientName}
                        </strong>
                      </p>

                      <p>{order.address}</p>
                      <p>{order.phone}</p>

                      <p>
                        Maszynowo:
                        {order.machineQuantity}
                      </p>

                      <p>
                        Ręcznie:
                        {order.manualQuantity}
                      </p>

                      <p>Punkty: {order.points}</p>

                      <p>
                        Dojazd km: {order.km}
                      </p>

                      <p>
                        Suma:
                        <strong>
                          {" "}
                          {order.total} zł
                        </strong>
                      </p>

                      <p>Data: {order.date}</p>

                      <button
                        onClick={() =>
                          editOrder(order)
                        }
                        className="mt-2 rounded-xl border border-gray-600 bg-blue-700 hover:bg-blue-600 px-3 py-1 text-sm"
                      >
                        Edytuj
                      </button>

                    </div>
                  ))}

                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
