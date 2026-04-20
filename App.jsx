import React, { useEffect, useMemo, useState } from "react";

export default function SerwisRobotowApp() {
  // =========================
  // 🌙 DARK MODE
  // =========================
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

  // =========================
  // 📋 FORM STATE
  // =========================
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

  // =========================
  // 💰 CENNIK
  // =========================
  const PRICE_MACHINE = 7;
  const PRICE_MANUAL = 10;
  const PRICE_POINT = 50;
  const PRICE_KM = 3;
  const FIXED_TRAVEL = 150;

  // =========================
  // 🧠 HELPERY
  // =========================
  const num = (v) => Number(v) || 0;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(value);

  const generateId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return String(Date.now()) + Math.random().toString(16).slice(2);
  };

  const validatePhone = (phone) =>
    !phone || /^[0-9]{9}$/.test(phone);

  const inputClass = () =>
    `border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      darkMode
        ? "border-white/20 bg-black text-white"
        : "border-black/20 bg-white text-black"
    }`;

  const tabClass = (tab) =>
    `rounded-xl border px-4 py-2 ${
      activeTab === tab
        ? "bg-blue-600 text-white"
        : darkMode
        ? "border-white/20"
        : "border-black/20"
    }`;

  // =========================
  // 💾 LOCAL STORAGE LOAD
  // =========================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("serwis-robotow-orders");

    if (saved) {
      try {
        setOrders(JSON.parse(saved));
      } catch {
        setOrders([]);
      }
    }
  }, []);

  // =========================
  // 💾 LOCAL STORAGE SAVE
  // =========================
  useEffect(() => {
    if (typeof window === "undefined") return;

    localStorage.setItem(
      "serwis-robotow-orders",
      JSON.stringify(orders)
    );
  }, [orders]);

  // =========================
  // 💰 LICZENIE KOSZTÓW (POPRAWIONE)
  // =========================
  const total = useMemo(() => {
    const mq = num(machineQuantity);
    const manq = num(manualQuantity);
    const p = num(points);
    const travelKm = num(km);

    const base =
      mq * PRICE_MACHINE +
      manq * PRICE_MANUAL +
      p * PRICE_POINT +
      travelKm * PRICE_KM;

    // ✔ koszt stały tylko jeśli istnieje REALNE zlecenie
    const hasOrder = mq + manq + p + travelKm > 0;

    return base + (hasOrder ? FIXED_TRAVEL : 0);
  }, [machineQuantity, manualQuantity, points, km]);

  // =========================
  // 🔎 FILTR
  // =========================
  const filteredOrders = useMemo(() => {
    return orders.filter((o) =>
      (o.clientName || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [orders, search]);

  const totalSum = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + o.total, 0);
  }, [filteredOrders]);

  // =========================
  // 🔄 RESET FORM
  // =========================
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

  // =========================
  // 💾 ZAPIS
  // =========================
  const saveOrder = () => {
    if (!clientName.trim()) {
      alert("Podaj imię klienta");
      return;
    }

    if (!validatePhone(phone)) {
      alert("Niepoprawny numer telefonu");
      return;
    }

    const order = {
      id: editingId || generateId(),
      clientName,
      address,
      phone,

      machineQuantity: num(machineQuantity),
      manualQuantity: num(manualQuantity),
      points: num(points),
      km: num(km),

      total,
      date: new Date().toLocaleDateString("pl-PL"),
    };

    if (editingId) {
      setOrders((prev) =>
        prev.map((o) => (o.id === editingId ? order : o))
      );
    } else {
      setOrders((prev) => [order, ...prev]);
    }

    resetForm();
    setActiveTab("history");
  };

  const deleteOrder = (id) => {
    if (window.confirm("Usunąć zlecenie?")) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
    }
  };

  const editOrder = (o) => {
    setClientName(o.clientName);
    setAddress(o.address);
    setPhone(o.phone);
    setMachineQuantity(o.machineQuantity);
    setManualQuantity(o.manualQuantity);
    setPoints(o.points);
    setKm(o.km);
    setEditingId(o.id);
    setActiveTab("calculator");
  };

  // =========================
  // 🎨 UI
  // =========================
  return (
    <div
      className={`min-h-screen p-6 ${
        darkMode ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            Serwis Robotów
          </h1>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`rounded-xl border px-4 py-2 text-sm ${
              darkMode
                ? "border-white/20 bg-black"
                : "border-black/20 bg-white"
            }`}
          >
            {darkMode ? "☀️ Jasny" : "🌙 Ciemny"}
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab("calculator")}
            className={tabClass("calculator")}
          >
            Kalkulator
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={tabClass("history")}
          >
            Historia
          </button>
        </div>

        {/* CALCULATOR */}
        {activeTab === "calculator" && (
          <div className={`border p-6 rounded-2xl space-y-4 ${
            darkMode ? "border-white/20" : "border-black/20"
          }`}>

            <h2 className="text-xl font-semibold">
              {editingId ? "Edytuj zlecenie" : "Nowe zlecenie"}
            </h2>

            <div className="grid md:grid-cols-2 gap-4">

              <input className={inputClass()} placeholder="Imię klienta"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />

              <input className={inputClass()} placeholder="Telefon"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <input className={inputClass()} placeholder="Adres"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <input className={inputClass()} type="number" placeholder="Maszynowo"
                value={machineQuantity}
                onChange={(e) => setMachineQuantity(e.target.value)}
              />

              <input className={inputClass()} type="number" placeholder="Ręcznie"
                value={manualQuantity}
                onChange={(e) => setManualQuantity(e.target.value)}
              />

              <input className={inputClass()} type="number" placeholder="Punkty"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />

              <input className={inputClass()} type="number" placeholder="Km"
                value={km}
                onChange={(e) => setKm(e.target.value)}
              />

            </div>

            <div className="text-lg font-bold">
              Suma: {formatCurrency(total)}
            </div>

            <button
              onClick={saveOrder}
              className="px-4 py-2 rounded-xl bg-green-700 text-white"
            >
              Zapisz
            </button>

          </div>
        )}

        {/* HISTORY */}
        {activeTab === "history" && (
          <div className="border p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">
              Historia
            </h2>

            <div className="font-bold mb-4">
              Suma: {formatCurrency(totalSum)}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th>Klient</th>
                    <th>Usługa</th>
                    <th>Suma</th>
                    <th>Akcje</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="border-b">
                      <td className="p-2">{o.clientName}</td>

                      <td className="p-2 text-xs opacity-80">
                        {o.machineQuantity} / {o.manualQuantity} / {o.points} / {o.km} km
                      </td>

                      <td className="p-2 font-bold">
                        {formatCurrency(o.total)}
                      </td>

                      <td className="p-2 space-x-2">
                        <button onClick={() => editOrder(o)}>Edytuj</button>
                        <button onClick={() => deleteOrder(o.id)}>Usuń</button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
