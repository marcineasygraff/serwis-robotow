import React, { useEffect, useMemo, useState } from "react";

export default function SerwisRobotowApp() {

  // DARK MODE (bezpieczny localStorage)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("darkMode") === "true";
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("darkMode", darkMode);
    }
  }, [darkMode]);

  // Dane formularza
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

  // Format PLN
  const formatCurrency = (value) =>
    new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(value);

  // Wczytanie danych
  useEffect(() => {

    if (typeof window === "undefined") return;

    const saved =
      localStorage.getItem("serwis-robotow-orders");

    if (saved) {

      try {
        setOrders(JSON.parse(saved));
      } catch (e) {
        console.error("Błąd odczytu localStorage:", e);
        setOrders([]);
      }

    }

  }, []);

  // Zapis danych
  useEffect(() => {

    if (typeof window === "undefined") return;

    localStorage.setItem(
      "serwis-robotow-orders",
      JSON.stringify(orders)
    );

  }, [orders]);

  // Liczenie sumy
  const total = useMemo(() => {

    const mq = Number(machineQuantity) || 0;
    const manq = Number(manualQuantity) || 0;
    const p = Number(points) || 0;
    const travelKm = Number(km) || 0;

    const calculated =
      mq * PRICE_MACHINE_PER_METER +
      manq * PRICE_MANUAL_PER_METER +
      p * PRICE_PER_POINT +
      travelKm * PRICE_PER_KM;

    return calculated +
      (travelKm > 0
        ? FIXED_TRAVEL_COST
        : 0);

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

  // Walidacja telefonu
  const validatePhone = (phone) => {

    if (!phone) return true;

    const phoneRegex = /^[0-9]{9}$/;

    return phoneRegex.test(phone);

  };

  // Zapis zlecenia
  const saveOrder = () => {

    if (!clientName.trim()) {
      alert("Podaj imię klienta");
      return;
    }

    if (!validatePhone(phone)) {
      alert("Niepoprawny numer telefonu");
      return;
    }

    const orderData = {

      id:
        editingId ||
        crypto.randomUUID(),

      clientName,
      address,
      phone,

      machineQuantity:
        Number(machineQuantity) || 0,

      manualQuantity:
        Number(manualQuantity) || 0,

      points:
        Number(points) || 0,

      km:
        Number(km) || 0,

      total,

      date:
        new Date().toLocaleDateString("pl-PL"),

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

      setOrders((prev) =>
        [orderData, ...prev]
      );

    }

    resetForm();

    setActiveTab("history");

  };

  // Usuwanie
  const deleteOrder = (id) => {

    if (window.confirm("Usunąć zlecenie?")) {

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

    setMachineQuantity(order.machineQuantity);
    setManualQuantity(order.manualQuantity);
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

  // Suma historii
  const totalSum =
    filteredOrders.reduce(
      (sum, item) =>
        sum + item.total,
      0
    );

  return (

    <div
      className={`min-h-screen p-6 ${
        darkMode
          ? "bg-black text-white"
          : "bg-white text-black"
      }`}
    >

      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}

        <div className="flex justify-between items-center">

          <h1 className="text-3xl font-bold">
            Serwis Robotów
          </h1>

          <button
            onClick={() =>
              setDarkMode(!darkMode)
            }
            className={`rounded-xl border px-4 py-2 text-sm ${
              darkMode
                ? "border-white/20 bg-black hover:bg-white/10"
                : "border-black/20 bg-white hover:bg-black/10"
            }`}
          >
            {darkMode
              ? "☀️ Jasny"
              : "🌙 Ciemny"}
          </button>

        </div>

        {/* TABY */}

        <div className="flex gap-3">

          <button
            onClick={() =>
              setActiveTab("calculator")
            }
            className="rounded-xl border px-4 py-2"
          >
            Kalkulator
          </button>

          <button
            onClick={() =>
              setActiveTab("history")
            }
            className="rounded-xl border px-4 py-2"
          >
            Historia
          </button>

        </div>

        {/* KALKULATOR */}

        {activeTab === "calculator" && (

          <div
            className={`rounded-2xl border p-6 space-y-4 ${
              darkMode
                ? "border-white/20 bg-black"
                : "border-black/20 bg-white"
            }`}
          >

            <h2 className="text-xl font-semibold">

              {editingId
                ? "Edytuj zlecenie"
                : "Nowe zlecenie"}

            </h2>

            <div className="grid md:grid-cols-2 gap-4">

              {[
                { value: clientName, set: setClientName, placeholder: "Imię klienta" },
                { value: phone, set: setPhone, placeholder: "Telefon" },
                { value: address, set: setAddress, placeholder: "Adres" }
              ].map((field, i) => (

                <input
                  key={i}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={(e) =>
                    field.set(e.target.value)
                  }
                  className={`border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? "border-white/20 bg-black text-white"
                      : "border-black/20 bg-white text-black"
                  }`}
                />

              ))}

              <input
                type="number"
                placeholder="Maszynowo (mm)"
                value={machineQuantity}
                onChange={(e)=>setMachineQuantity(e.target.value)}
                className="border rounded-xl p-3"
              />

              <input
                type="number"
                placeholder="Ręcznie (mm)"
                value={manualQuantity}
                onChange={(e)=>setManualQuantity(e.target.value)}
                className="border rounded-xl p-3"
              />

              <input
                type="number"
                placeholder="Punkty"
                value={points}
                onChange={(e)=>setPoints(e.target.value)}
                className="border rounded-xl p-3"
              />

              <input
                type="number"
                placeholder="Ilość km dojazdu"
                value={km}
                onChange={(e)=>setKm(e.target.value)}
                className="border rounded-xl p-3"
              />

            </div>

            <div className="font-bold text-lg">
              Suma: {formatCurrency(total)}
            </div>

            <button
              onClick={saveOrder}
              className="rounded-xl border border-green-600 bg-green-700 hover:bg-green-600 px-4 py-2"
            >
              {editingId
                ? "Zapisz zmiany"
                : "Zapisz zlecenie"}
            </button>

          </div>

        )}

      </div>

    </div>

  );

}
