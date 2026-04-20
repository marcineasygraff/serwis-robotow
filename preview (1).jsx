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
  const [search, setSearch] = useState("");

  // Cennik
  const PRICE_MACHINE_PER_METER = 7;
  const PRICE_MANUAL_PER_METER = 10;
  const PRICE_PER_POINT = 50;
  const PRICE_PER_KM = 3;
  const FIXED_TRAVEL_COST = 150;

  // Format pieniędzy
  const formatCurrency = (value) =>
    new Intl.NumberFormat("pl-PL").format(value);

  // Wczytanie localStorage
  useEffect(() => {

    const saved =
      localStorage.getItem(
        "serwis-robotow-orders"
      );

    if (saved) {

      try {
        setOrders(JSON.parse(saved));
      } catch {
        setOrders([]);
      }

    }

  }, []);

  // Zapis localStorage
  useEffect(() => {

    localStorage.setItem(
      "serwis-robotow-orders",
      JSON.stringify(orders)
    );

  }, [orders]);

  // Liczenie sumy
  const total = useMemo(() => {

    const mq =
      Number(machineQuantity) || 0;

    const manq =
      Number(manualQuantity) || 0;

    const p = Number(points) || 0;

    const travelKm =
      Number(km) || 0;

    const calculated =
      mq * PRICE_MACHINE_PER_METER +
      manq * PRICE_MANUAL_PER_METER +
      p * PRICE_PER_POINT +
      travelKm * PRICE_PER_KM;

    return calculated > 0
      ? calculated +
          FIXED_TRAVEL_COST
      : 0;

  }, [
    machineQuantity,
    manualQuantity,
    points,
    km,
  ]);

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

  // Zapis zlecenia
  const saveOrder = () => {

    if (!clientName.trim()) {
      alert("Podaj imię klienta");
      return;
    }

    if (phone && phone.length < 9) {
      alert("Niepoprawny numer telefonu");
      return;
    }

    const orderData = {

      id:
        editingId ||
        Date.now(),

      clientName,
      address,
      phone,

      machineQuantity:
        Number(machineQuantity) ||
        0,

      manualQuantity:
        Number(manualQuantity) ||
        0,

      points:
        Number(points) || 0,

      km:
        Number(km) || 0,

      total,

      date:
        new Date().toLocaleDateString(
          "pl-PL"
        ),

    };

    if (editingId) {

      setOrders((prev) =>
        prev.map((order) =>
          order.id === editingId
            ? orderData
            : order
        )
      );

    } else {

      setOrders((prev) => [
        orderData,
        ...prev,
      ]);

    }

    resetForm();

  };

  // Usuwanie
  const deleteOrder = (id) => {

    if (
      window.confirm(
        "Usunąć zlecenie?"
      )
    ) {

      setOrders((prev) =>
        prev.filter(
          (o) => o.id !== id
        )
      );

    }

  };

  // Edycja
  const editOrder = (order) => {

    setClientName(order.clientName);
    setAddress(order.address);
    setPhone(order.phone);
    setMachineQuantity(
      order.machineQuantity
    );
    setManualQuantity(
      order.manualQuantity
    );
    setPoints(order.points);
    setKm(order.km);

    setEditingId(order.id);

    setActiveTab("calculator");

  };

  // Filtrowanie
  const filteredOrders =
    orders.filter((order) =>
      order.clientName
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  // Suma
  const totalSum =
    filteredOrders.reduce(
      (sum, item) =>
        sum + item.total,
      0
    );

  return (

    <div className="min-h-screen bg-black text-white p-6">

      <div className="max-w-5xl mx-auto space-y-6">

        <h1 className="text-3xl font-bold text-white">
          Serwis Robotów
        </h1>

        <p className="text-white/60">
          Kalkulator zleceń + historia klientów
        </p>

        {/* TABY */}

        <div className="flex gap-3">

          <button
            onClick={() =>
              setActiveTab("calculator")
            }
            className="rounded-xl border border-white/20 bg-black hover:bg-white/10 px-4 py-2 text-white"
          >
            Kalkulator
          </button>

          <button
            onClick={() =>
              setActiveTab("history")
            }
            className="rounded-xl border border-white/20 bg-black hover:bg-white/10 px-4 py-2 text-white"
          >
            Historia
          </button>

        </div>

        {/* KALKULATOR */}

        {activeTab === "calculator" && (

          <div className="rounded-2xl border border-white/20 bg-black p-6 space-y-4">

            <h2 className="text-xl font-semibold text-white">

              {editingId
                ? "Edytuj zlecenie"
                : "Nowe zlecenie"}

            </h2>

            <div className="grid md:grid-cols-2 gap-4">

              {[

                {
                  placeholder:
                    "Imię klienta",
                  value: clientName,
                  setter:
                    setClientName,
                },

                {
                  placeholder:
                    "Telefon",
                  value: phone,
                  setter: setPhone,
                },

                {
                  placeholder:
                    "Adres",
                  value: address,
                  setter:
                    setAddress,
                },

              ].map(
                (
                  field,
                  index
                ) => (

                  <input
                    key={index}
                    className="border border-white/20 bg-black text-white rounded-xl p-3"
                    placeholder={
                      field.placeholder
                    }
                    value={
                      field.value
                    }
                    onChange={(e) =>
                      field.setter(
                        e.target.value
                      )
                    }
                  />

                )
              )}

              <input
                type="number"
                placeholder="Maszynowo (mm)"
                value={machineQuantity}
                onChange={(e) =>
                  setMachineQuantity(
                    e.target.value
                  )
                }
                className="border border-white/20 bg-black text-white rounded-xl p-3"
              />

              <input
                type="number"
                placeholder="Ręcznie (mm)"
                value={manualQuantity}
                onChange={(e) =>
                  setManualQuantity(
                    e.target.value
                  )
                }
                className="border border-white/20 bg-black text-white rounded-xl p-3"
              />

              <input
                type="number"
                placeholder="Punkty"
                value={points}
                onChange={(e) =>
                  setPoints(
                    e.target.value
                  )
                }
                className="border border-white/20 bg-black text-white rounded-xl p-3"
              />

              <input
                type="number"
                placeholder="Ilość km dojazdu"
                value={km}
                onChange={(e) =>
                  setKm(
                    e.target.value
                  )
                }
                className="border border-white/20 bg-black text-white rounded-xl p-3"
              />

            </div>

            {/* SUMA */}

            <div className="border border-white/20 rounded-xl p-4 bg-black">

              <p>Maszynowo: 7 zł / mm</p>
              <p>Ręcznie: 10 zł / mm</p>
              <p>Punkty: 50 zł</p>
              <p>Dojazd: 3 zł / km</p>
              <p>Koszt stały: 150 zł</p>

              <p className="text-lg font-bold mt-2">

                Suma:
                {" "}
                {formatCurrency(total)} zł

              </p>

            </div>

            <div className="flex gap-2">

              <button
                onClick={saveOrder}
                className="rounded-xl border border-green-600 bg-green-700 hover:bg-green-600 px-4 py-2"
              >

                {editingId
                  ? "Zapisz zmiany"
                  : "Zapisz zlecenie"}

              </button>

              {editingId && (

                <button
                  onClick={resetForm}
                  className="rounded-xl border border-red-600 bg-red-700 hover:bg-red-600 px-4 py-2"
                >
                  Anuluj
                </button>

              )}

            </div>

          </div>

        )}

        {/* HISTORIA */}

        {activeTab === "history" && (

          <div className="rounded-2xl border border-white/20 bg-black p-6 space-y-4">

            <h2 className="text-xl font-semibold">
              Historia zleceń
            </h2>

            <input
              placeholder="Szukaj klienta..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="border border-white/20 bg-black text-white rounded-xl p-3 w-full"
            />

            {filteredOrders.map(
              (order) => (

                <div
                  key={order.id}
                  className="border border-white/20 rounded-xl p-4 bg-black"
                >

                  <p>
                    <strong>
                      {order.clientName}
                    </strong>
                  </p>

                  <p>
                    {order.address}
                  </p>

                  <p>
                    {order.phone}
                  </p>

                  <p>

                    Suma:

                    <strong>
                      {" "}
                      {formatCurrency(
                        order.total
                      )} zł
                    </strong>

                  </p>

                  <div className="flex gap-2 mt-2">

                    <button
                      onClick={() =>
                        editOrder(order)
                      }
                      className="rounded-xl border border-blue-600 bg-blue-700 hover:bg-blue-600 px-3 py-1 text-sm"
                    >
                      Edytuj
                    </button>

                    <button
                      onClick={() =>
                        deleteOrder(
                          order.id
                        )
                      }
                      className="rounded-xl border border-red-600 bg-red-700 hover:bg-red-600 px-3 py-1 text-sm"
                    >
                      Usuń
                    </button>

                  </div>

                </div>

              )
            )}

            <p className="text-lg font-bold">

              Łączna suma:
              {" "}
              {formatCurrency(totalSum)} zł

            </p>

          </div>

        )}

      </div>

    </div>

  );

}