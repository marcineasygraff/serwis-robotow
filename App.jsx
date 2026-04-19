import React, { useEffect, useMemo, useState } from "react";

export default function SerwisRobotowApp() {
  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [dojazd, setDojazd] = useState("");
  const [machineQuantity, setMachineQuantity] = useState("");
  const [manualQuantity, setManualQuantity] = useState("");
  const [points, setPoints] = useState("");
  const [activeTab, setActiveTab] = useState("calculator");
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem("serwis-robotow-orders");
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  const PRICE_MACHINE_PER_METER = 7;
  const PRICE_MANUAL_PER_METER = 10;
  const PRICE_PER_POINT = 50;
  const TRAVEL_COST = 150;

  const total = useMemo(() => {
    const mq = Number(machineQuantity) || 0;
    const manq = Number(manualQuantity) || 0;
    const p = Number(points) || 0;

    return (
      mq * PRICE_MACHINE_PER_METER +
      manq * PRICE_MANUAL_PER_METER +
      p * PRICE_PER_POINT +
      TRAVEL_COST
    );
  }, [machineQuantity, manualQuantity, points]);

  const saveOrder = () => {
    if (!clientName.trim()) return;

    const newOrder = {
      id: Date.now(),
      clientName,
      address,
      phone,
      dojazd,
      machineQuantity,
      manualQuantity,
      points,
      total,
      date: new Date().toLocaleDateString("pl-PL"),
      status: "Oczekuje",
    };

    setOrders([newOrder, ...orders]);

    setClientName("");
    setAddress("");
    setPhone("");
    setDojazd("");
    setMachineQuantity("");
    setManualQuantity("");
    setPoints("");
  };

  useEffect(() => {
    localStorage.setItem(
      "serwis-robotow-orders",
      JSON.stringify(orders)
    );
  }, [orders]);

  const monthlyTotal = orders.reduce(
    (sum, item) => sum + item.total,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Serwis Robotów</h1>
        <p className="text-gray-600">
          Kalkulator zleceń + historia klientów
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab("calculator")}
            className="rounded-2xl border px-4 py-2 font-medium"
          >
            Kalkulator
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className="rounded-2xl border px-4 py-2 font-medium"
          >
            Historia zleceń
          </button>
        </div>

        {activeTab === "calculator" && (
        <>
        <div className="rounded-2xl shadow-sm border bg-white">
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Nowe zlecenie</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="border rounded-xl p-3 w-full"
                placeholder="Imię klienta"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />

              <input
                className="border rounded-xl p-3 w-full"
                placeholder="Telefon"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <input
                className="border rounded-xl p-3 w-full"
                placeholder="Adres"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <input
                className="border rounded-xl p-3 w-full"
                placeholder="Dojazd"
                type="number"
                value={dojazd}
                onChange={(e) => setDojazd(e.target.value)}
              />  
              
              <input
                className="border rounded-xl p-3 w-full"
                placeholder="Ilość mm przewodu wkopana maszynowo"
                type="number"
                value={machineQuantity}
                onChange={(e) => setMachineQuantity(e.target.value)}
              />

              <input
                className="border rounded-xl p-3 w-full"
                placeholder="Ilość mm przewodu wkopana ręcznie"
                type="number"
                value={manualQuantity}
                onChange={(e) => setManualQuantity(e.target.value)}
              />

              <input
                className="border rounded-xl p-3 w-full"
                placeholder="Punkty"
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
            </div>

            <div className="bg-white border rounded-2xl p-4 space-y-2">
              <p>
                Przewód wkopany maszynowo: <strong>7 zł / mm</strong>
              </p>
              <p>
                Przewód wkopany ręcznie: <strong>10 zł / mm</strong>
               </p>
              <p>
                ilość kilometrów: <dojazd>3 zł</strong>
              </p>
              <p>
                1 punkt: <strong>50 zł</strong>
              </p>
              <p>
                Koszt stały: <strong>150 zł</strong>
              </p>
              <p className="text-lg font-bold">Suma: {total} zł</p>
            </div>

            <button
              onClick={saveOrder}
              className="rounded-2xl border px-4 py-2 font-medium"
            >
              Zapisz zlecenie
            </button>
          </div>
        </div>

        <div className="rounded-2xl shadow-sm border bg-white">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Podsumowanie</h2>
            <p>
              Liczba zleceń: <strong>{orders.length}</strong>
            </p>
            <p>
              Suma zarobku: <strong>{monthlyTotal} zł</strong>
            </p>
          </div>
        </div>

        </>
        )}

        {activeTab === "history" && (
        <div className="rounded-2xl shadow-sm border bg-white">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Historia zleceń</h2>

            {orders.length === 0 ? (
              <p className="text-gray-500">Brak zapisanych zleceń</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-2xl p-4 bg-white"
                  >
                    <p>
                      <strong>{order.clientName}</strong>
                    </p>
                    <p>{order.address}</p>
                    <p>{order.phone}</p>
                    <p>Dojazd: {order.dojazd}</p>
                    <p>Maszynowo: {order.machineQuantity}</p>
                    <p>Ręcznie: {order.manualQuantity}</p>
                    <p>Punkty: {order.points}</p>
                    <p>
                      Suma: <strong>{order.total} zł</strong>
                    </p>
                    <p>Data: {order.date}</p>
                    <p>Status: {order.status}</p>
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
