import React, { useEffect, useMemo, useState } from "react";

// 🔐 USERS (z rolami)
const USERS = [
  { login: "admin", password: "1234", role: "admin" },
];

// 📍 BAZA
const BASE_LOCATION = {
  lat: 49.8547,
  lon: 19.3386,
};

// 💰 CENNIK
const PRICE_MACHINE = 7;
const PRICE_MANUAL = 10;
const PRICE_POINT = 50;
const PRICE_KM = 3;
const FIXED_TRAVEL = 150;

export default function SerwisRobotowApp() {
  // =========================
  // 🔐 LOGIN
  // =========================
  const [user, setUser] = useState(null);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const found = USERS.find(
      (u) => u.login === login && u.password === password
    );

    if (!found) return alert("Błędne dane");
    setUser(found);
  };

  // =========================
  // 📋 STATE
  // =========================
  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [machineQuantity, setMachineQuantity] = useState("");
  const [manualQuantity, setManualQuantity] = useState("");
  const [points, setPoints] = useState("");
  const [km, setKm] = useState("");

  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("calculator");
  const [editingId, setEditingId] = useState(null);

  // =========================
  // 🎨 STATUS COLORS
  // =========================
  const statusColor = (status) => {
    switch (status) {
      case "Nowe":
        return "bg-red-200 text-red-800";
      case "W trakcie":
        return "bg-yellow-200 text-yellow-800";
      case "Zakończone":
        return "bg-green-200 text-green-800";
      default:
        return "bg-gray-200";
    }
  };

  const changeStatus = (id, status) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  };

  const num = (v) => Number(v) || 0;

  const formatCurrency = (v) =>
    new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(v);

  const generateId = () =>
    crypto?.randomUUID?.() || String(Date.now() + Math.random());

  // =========================
  // 💰 TOTAL
  // =========================
  const total = useMemo(() => {
    const mq = num(machineQuantity);
    const manq = num(manualQuantity);
    const p = num(points);
    const kmVal = num(km);

    const base =
      mq * PRICE_MACHINE +
      manq * PRICE_MANUAL +
      p * PRICE_POINT +
      kmVal * PRICE_KM;

    return base + (mq + manq + p + kmVal > 0 ? FIXED_TRAVEL : 0);
  }, [machineQuantity, manualQuantity, points, km]);

  // =========================
  // 💾 SAVE ORDER
  // =========================
  const reset = () => {
    setClientName("");
    setAddress("");
    setPhone("");
    setMachineQuantity("");
    setManualQuantity("");
    setPoints("");
    setKm("");
    setEditingId(null);
  };

  const saveOrder = () => {
    if (!clientName) return alert("Brak imienia");

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
      status: "Nowe",
      createdAt: new Date().toISOString(),
    };

    if (editingId) {
      setOrders((p) => p.map((o) => (o.id === editingId ? order : o)));
    } else {
      setOrders((p) => [order, ...p]);
    }

    reset();
    setActiveTab("history");
  };

  const deleteOrder = (id) => {
    if (confirm("Usunąć?")) {
      setOrders((p) => p.filter((o) => o.id !== id));
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
  // 🔐 LOGIN SCREEN
  // =========================
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="border p-6 rounded-xl w-80 space-y-3">
          <h1 className="text-xl font-bold">Logowanie</h1>

          <input
            className="border p-2 w-full"
            placeholder="login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />

          <input
            className="border p-2 w-full"
            type="password"
            placeholder="hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white w-full py-2 rounded-xl"
          >
            Zaloguj
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";

  // =========================
  // 🎨 UI
  // =========================
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-5xl mx-auto space-y-5">

        <h1 className="text-3xl font-bold">Serwis Robotów</h1>

        {/* TABS */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setActiveTab("calculator")} className="border px-3 py-2 rounded">
            Kalkulator
          </button>

          <button onClick={() => setActiveTab("history")} className="border px-3 py-2 rounded">
            Historia
          </button>

          <button onClick={() => setActiveTab("zlecenia")} className="border px-3 py-2 rounded">
            Zlecenia
          </button>

          {isAdmin && (
            <button onClick={() => setActiveTab("admin")} className="border px-3 py-2 rounded bg-black text-white">
              Admin
            </button>
          )}
        </div>

        {/* CALCULATOR */}
        {activeTab === "calculator" && (
          <div className="border p-4 rounded-xl space-y-3">
            <input className="border p-2 w-full" placeholder="Imię" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            <input className="border p-2 w-full" placeholder="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input className="border p-2 w-full" placeholder="Adres" value={address} onChange={(e) => setAddress(e.target.value)} />

            <div className="grid grid-cols-2 gap-2">
              <input className="border p-2" type="number" placeholder="Maszynowo" value={machineQuantity} onChange={(e) => setMachineQuantity(e.target.value)} />
              <input className="border p-2" type="number" placeholder="Ręcznie" value={manualQuantity} onChange={(e) => setManualQuantity(e.target.value)} />
              <input className="border p-2" type="number" placeholder="Punkty" value={points} onChange={(e) => setPoints(e.target.value)} />
              <input className="border p-2" type="number" placeholder="Km" value={km} onChange={(e) => setKm(e.target.value)} />
            </div>

            <div className="font-bold">Suma: {formatCurrency(total)}</div>

            <button onClick={saveOrder} className="bg-green-600 text-white px-4 py-2 rounded-xl">
              Zapisz
            </button>
          </div>
        )}

        {/* ZLECENIA */}
        {activeTab === "zlecenia" && (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="border p-3 rounded-xl">

                <div className="font-bold">{o.clientName}</div>

                {/* STATUS COLOR */}
                <span className={`px-2 py-1 rounded text-sm ${statusColor(o.status)}`}>
                  {o.status}
                </span>

                <div className="font-bold mt-2">{formatCurrency(o.total)}</div>

                <div className="flex gap-2 mt-2">
                  <button onClick={() => changeStatus(o.id, "Nowe")}>Nowe</button>
                  <button onClick={() => changeStatus(o.id, "W trakcie")}>W trakcie</button>
                  <button onClick={() => changeStatus(o.id, "Zakończone")}>Zakończone</button>
                </div>

                <div className="flex gap-2 mt-2">
                  <button onClick={() => editOrder(o)}>Edytuj</button>
                  <button onClick={() => deleteOrder(o.id)}>Usuń</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ADMIN PANEL */}
        {activeTab === "admin" && isAdmin && (
          <div className="border p-4 rounded-xl space-y-3">
            <h2 className="text-xl font-bold">Panel Admina</h2>

            <div>Liczba zleceń: {orders.length}</div>

            <div>Wartość wszystkich: {formatCurrency(orders.reduce((a,b)=>a+b.total,0))}</div>

            <div className="space-y-2">
              {orders.map((o) => (
                <div key={o.id} className="border p-2 rounded">
                  <div className="font-bold">{o.clientName}</div>

                  <span className={`px-2 py-1 rounded text-sm ${statusColor(o.status)}`}>
                    {o.status}
                  </span>

                  <div className="flex gap-2 mt-2">
                    <button onClick={() => changeStatus(o.id, "Nowe")}>Nowe</button>
                    <button onClick={() => changeStatus(o.id, "W trakcie")}>W trakcie</button>
                    <button onClick={() => changeStatus(o.id, "Zakończone")}>Zakończone</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTORY */}
        {activeTab === "history" && (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="border p-3 rounded-xl">
                <div className="font-bold">{o.clientName}</div>

                <span className={`px-2 py-1 rounded text-sm ${statusColor(o.status)}`}>
                  {o.status}
                </span>

                <div className="font-bold mt-2">{formatCurrency(o.total)}</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
