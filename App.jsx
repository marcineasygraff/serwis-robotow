import React, { useEffect, useMemo, useState } from "react";

export default function SerwisRobotowApp() {

  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [machineQuantity, setMachineQuantity] = useState("");
  const [manualQuantity, setManualQuantity] = useState("");
  const [points, setPoints] = useState("");

  const [activeTab, setActiveTab] = useState("calculator");
  const [orders, setOrders] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const PRICE_MACHINE_PER_METER = 7;
  const PRICE_MANUAL_PER_METER = 10;
  const PRICE_PER_POINT = 50;
  const TRAVEL_COST = 150;

  // 🔹 Ładowanie z localStorage
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem(
        "serwis-robotow-orders"
      );

      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    } catch (error) {
      console.error("Błąd localStorage:", error);
    }
  }, []);

  // 🔹 Zapisywanie
  useEffect(() => {
    try {
      localStorage.setItem(
        "serwis-robotow-orders",
        JSON.stringify(orders)
      );
    } catch (error) {
      console.error("Błąd zapisu:", error);
    }
  }, [orders]);

  // 🔹 Liczenie sumy
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

  // 🔹 Dodawanie / Edycja
  const saveOrder = () => {

    if (!clientName.trim()) {
      alert("Podaj imię klienta");
      return;
    }

    if (editingId) {

      // EDYCJA
      setOrders((prev) =>
        prev.map((order) =>
          order.id === editingId
            ? {
                ...order,
                clientName,
                address,
                phone,
                machineQuantity,
                manualQuantity,
                points,
                fixedCost: TRAVEL_COST,
                total: Number(total),
              }
            : order
        )
      );

      setEditingId(null);

    } else {

      // NOWE
      const newOrder = {
        id: Date.now(),
        clientName,
        address,
        phone,
        machineQuantity,
        manualQuantity,
        points,
        fixedCost: TRAVEL_COST,
        total: Number(total),
        date: new Date().toLocaleDateString("pl-PL"),
        status: "Oczekuje",
      };

      setOrders((prev) => [newOrder, ...prev]);

    }

    clearForm();

  };

  // 🔹 Czyszczenie formularza
  const clearForm = () => {

    setClientName("");
    setAddress("");
    setPhone("");
    setMachineQuantity("");
    setManualQuantity("");
    setPoints("");

  };

  // 🔹 Usuwanie
  const deleteOrder = (id) => {

    const confirmed = window.confirm(
      "Czy na pewno chcesz usunąć to zlecenie?"
    );

    if (!confirmed) return;

    setOrders((prev) =>
      prev.filter((order) => order.id !== id)
    );

  };

  // 🔹 Edycja
  const editOrder = (order) => {

    setClientName(order.clientName);
    setAddress(order.address);
    setPhone(order.phone);
    setMachineQuantity(order.machineQuantity);
    setManualQuantity(order.manualQuantity);
    setPoints(order.points);

    setEditingId(order.id);

    setActiveTab("calculator");

  };

  // 🔹 Podsumowania

  const totalFixedCosts = orders.reduce(
    (sum, item) => sum + Number(item.fixedCost || 150),
    0
  );

  const monthlyTotal = orders.reduce(
    (sum, item) => sum + Number(item.total),
    0
  );

  const workTotal = monthlyTotal - totalFixedCosts;

  return (

    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-5xl mx-auto space-y-6">

        <h1 className="text-3xl font-bold">
          Serwis Robotów
        </h1>

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

            <div className="rounded-2xl border bg-white p-6 space-y-4">

              <h2 className="text-xl font-semibold">

                {editingId
                  ? "Edytuj zlecenie"
                  : "Nowe zlecenie"}

              </h2>

              <div className="grid md:grid-cols-2 gap-4">

                <input
                  className="border rounded-xl p-3"
                  placeholder="Imię klienta"
                  value={clientName}
                  onChange={(e) =>
                    setClientName(e.target.value)
                  }
                />

                <input
                  className="border rounded-xl p-3"
                  placeholder="Telefon"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                />

                <input
                  className="border rounded-xl p-3"
                  placeholder="Adres"
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                />

                <input
                  className="border rounded-xl p-3"
                  placeholder="Maszynowo (metry)"
                  type="number"
                  value={machineQuantity}
                  onChange={(e) =>
                    setMachineQuantity(e.target.value)
                  }
                />

                <input
                  className="border rounded-xl p-3"
                  placeholder="Ręcznie (metry)"
                  type="number"
                  value={manualQuantity}
                  onChange={(e) =>
                    setManualQuantity(e.target.value)
                  }
                />

                <input
                  className="border rounded-xl p-3"
                  placeholder="Punkty"
                  type="number"
                  value={points}
                  onChange={(e) =>
                    setPoints(e.target.value)
                  }
                />

              </div>

              <div className="border rounded-2xl p-4 space-y-1">

                <p>
                  Koszt stały: <strong>150 zł</strong>
                </p>

                <p className="text-lg font-bold">
                  Suma: {total} zł
                </p>

              </div>

              <button
                onClick={saveOrder}
                className="rounded-2xl border px-4 py-2 font-medium"
              >

                {editingId
                  ? "Zapisz zmiany"
                  : "Zapisz zlecenie"}

              </button>

            </div>

            <div className="rounded-2xl border bg-white p-6">

              <h2 className="text-xl font-semibold mb-4">
                Podsumowanie
              </h2>

              <p>
                Liczba zleceń:{" "}
                <strong>{orders.length}</strong>
              </p>

              <p>
                Koszty stałe razem:{" "}
                <strong>{totalFixedCosts} zł</strong>
              </p>

              <p>
                Zarobek z pracy:{" "}
                <strong>{workTotal} zł</strong>
              </p>

              <p className="text-lg font-bold">
                Suma całkowita:{" "}
                <strong>{monthlyTotal} zł</strong>
              </p>

            </div>

          </>

        )}

        {activeTab === "history" && (

          <div className="rounded-2xl border bg-white p-6">

            <h2 className="text-xl font-semibold mb-4">
              Historia zleceń
            </h2>

            {orders.length === 0 ? (

              <p>Brak zapisanych zleceń</p>

            ) : (

              <div className="space-y-4">

                {orders.map((order) => (

                  <div
                    key={order.id}
                    className="border rounded-2xl p-4"
                  >

                    <p>
                      <strong>
                        {order.clientName}
                      </strong>
                    </p>

                    <p>{order.address}</p>
                    <p>{order.phone}</p>

                    <p>
                      Maszynowo: {order.machineQuantity}
                    </p>

                    <p>
                      Ręcznie: {order.manualQuantity}
                    </p>

                    <p>
                      Punkty: {order.points}
                    </p>

                    <p>
                      Koszt stały:{" "}
                      {order.fixedCost || 150} zł
                    </p>

                    <p>
                      Suma:{" "}
                      <strong>
                        {order.total} zł
                      </strong>
                    </p>

                    <p>Data: {order.date}</p>

                    <div className="flex gap-2 mt-3">

                      <button
                        onClick={() =>
                          editOrder(order)
                        }
                        className="bg-blue-500 text-white px-4 py-2 rounded-xl"
                      >
                        Edytuj
                      </button>

                      <button
                        onClick={() =>
                          deleteOrder(order.id)
                        }
                        className="bg-red-500 text-white px-4 py-2 rounded-xl"
                      >
                        Usuń
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        )}

      </div>

    </div>

  );

}
