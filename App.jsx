import React, { useEffect, useMemo, useState } from "react";

// 🔐 USERS
const USERS = [{ login: "admin", password: "1234", role: "admin" }];

// 📍 BAZA (STAŁA)
const BASE = {
  lat: 49.8547,
  lon: 19.3386,
  name: "Andrychów, Lenartowicza 64",
};

// 🎨 STATUSY
const STATUS_STYLE = {
  Nowe: "bg-red-200 text-red-800",
  "W trakcie": "bg-yellow-200 text-yellow-800",
  Zakończone: "bg-green-200 text-green-800",
};

export default function App() {
  // ================= LOGIN =================
  const [user, setUser] = useState(null);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const u = USERS.find(
      (x) => x.login === login && x.password === password
    );
    if (!u) return alert("Błędne dane");
    setUser(u);
  };

  const isAdmin = user?.role === "admin";

  // ================= CENY (ADMIN) =================
  const [price, setPrice] = useState({
    machine: 7,
    manual: 10,
    point: 50,
    km: 3,
    travel: 150,
  });

  // 💾 ceny zapis
  useEffect(() => {
    const saved = localStorage.getItem("prices");
    if (saved) setPrice(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("prices", JSON.stringify(price));
  }, [price]);

  // ================= FORM =================
  const [form, setForm] = useState({
    clientName: "",
    address: "",
    phone: "",
    machine: "",
    manual: "",
    points: "",
  });

  const [km, setKm] = useState("");
  const [eta, setEta] = useState("");
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("calculator");
  const [editId, setEditId] = useState(null);

  const num = (v) => Number(v) || 0;

  // ================= GEO =================
  const geocode = async (addr) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}`
      );
      const data = await res.json();
      if (!data?.length) return null;

      return {
        lat: +data[0].lat,
        lon: +data[0].lon,
      };
    } catch {
      return null;
    }
  };

  // 📍 KM (Haversine)
  const getDistanceKm = (a, b) => {
    const R = 6371;

    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLon = ((b.lon - a.lon) * Math.PI) / 180;

    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;

    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(x));
  };

  // 🕒 ETA (OSRM)
  const getEta = async (a, b) => {
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=false`
      );

      const data = await res.json();
      if (!data?.routes?.length) return null;

      return Math.round(data.routes[0].duration / 60);
    } catch {
      return null;
    }
  };

  // ================= AUTO KM + ETA =================
  useEffect(() => {
    if (!form.address) {
      setKm("");
      setEta("");
      return;
    }

    const t = setTimeout(async () => {
      const geo = await geocode(form.address);
      if (!geo) return;

      // 📍 KM zawsze: Andrychów → klient
      const kmValue = getDistanceKm(BASE, geo);
      setKm(kmValue.toFixed(1));

      // 🕒 ETA
      const etaValue = await getEta(BASE, geo);
      if (etaValue !== null) setEta(etaValue);
    }, 600);

    return () => clearTimeout(t);
  }, [form.address]);

  // ================= TOTAL =================
  const total = useMemo(() => {
    const base =
      num(form.machine) * price.machine +
      num(form.manual) * price.manual +
      num(form.points) * price.point +
      num(km) * price.km;

    return base + (base > 0 ? price.travel : 0);
  }, [form, km, price]);

  const format = (v) =>
    new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(v);

  const id = () => crypto?.randomUUID?.() || String(Date.now());

  // ================= SAVE =================
  const save = () => {
    if (!form.clientName) return alert("Brak imienia");

    const order = {
      id: editId || id(),
      ...form,
      km,
      eta,
      total,
      status: "Nowe",
      createdAt: new Date().toISOString(),
    };

    setOrders((p) =>
      editId ? p.map((o) => (o.id === editId ? order : o)) : [order, ...p]
    );

    setForm({
      clientName: "",
      address: "",
      phone: "",
      machine: "",
      manual: "",
      points: "",
    });

    setKm("");
    setEta("");
    setEditId(null);
    setTab("zlecenia");
  };

  const changeStatus = (id, status) => {
    setOrders((p) =>
      p.map((o) => (o.id === id ? { ...o, status } : o))
    );
  };

  const del = (id) => {
    if (confirm("Usunąć?")) setOrders((p) => p.filter((o) => o.id !== id));
  };

  const edit = (o) => {
    setForm(o);
    setKm(o.km);
    setEta(o.eta);
    setEditId(o.id);
    setTab("calculator");
  };

  // ================= LOGIN =================
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="border p-6 w-80 space-y-3">
          <input className="border p-2 w-full" placeholder="login"
            value={login} onChange={(e) => setLogin(e.target.value)} />

          <input className="border p-2 w-full" type="password"
            placeholder="hasło" value={password}
            onChange={(e) => setPassword(e.target.value)} />

          <button onClick={handleLogin} className="bg-blue-600 text-white w-full p-2">
            Zaloguj
          </button>
        </div>
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="p-4 max-w-5xl mx-auto">

      <h1 className="text-3xl font-bold">Serwis Robotów</h1>

      {/* TABS */}
      <div className="flex gap-2 my-4">
        <button onClick={() => setTab("calculator")}>Kalkulator</button>
        <button onClick={() => setTab("zlecenia")}>Zlecenia</button>
        {isAdmin && <button onClick={() => setTab("admin")}>Admin</button>}
      </div>

      {/* CALCULATOR */}
      {tab === "calculator" && (
        <div className="border p-4 space-y-2">

          <input placeholder="Imię"
            value={form.clientName}
            onChange={(e) => setForm({ ...form, clientName: e.target.value })} />

          <input placeholder="Adres"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })} />

          <input placeholder="Telefon"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />

          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Maszyny"
              value={form.machine}
              onChange={(e) => setForm({ ...form, machine: e.target.value })} />

            <input placeholder="Ręczne"
              value={form.manual}
              onChange={(e) => setForm({ ...form, manual: e.target.value })} />

            <input placeholder="Punkty"
              value={form.points}
              onChange={(e) => setForm({ ...form, points: e.target.value })} />

            <input value={km} readOnly className="bg-gray-100" />
          </div>

          <div>📍 {BASE.name} → klient</div>
          <div>🚗 {km} km | 🕒 {eta} min</div>

          <div className="font-bold">{format(total)}</div>

          <button onClick={save} className="bg-green-600 text-white p-2">
            Zapisz
          </button>
        </div>
      )}

      {/* ZLECENIA */}
      {tab === "zlecenia" && (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="border p-3">

              <div className="font-bold">{o.clientName}</div>

              <span className={`px-2 py-1 ${STATUS_STYLE[o.status]}`}>
                {o.status}
              </span>

              <div>🚗 {o.km} km | 🕒 {o.eta} min</div>
              <div>{format(o.total)}</div>

              <div className="flex gap-2">
                <button onClick={() => changeStatus(o.id, "Nowe")}>Nowe</button>
                <button onClick={() => changeStatus(o.id, "W trakcie")}>W trakcie</button>
                <button onClick={() => changeStatus(o.id, "Zakończone")}>Zakończone</button>
              </div>

              <div className="flex gap-2">
                <button onClick={() => edit(o)}>Edytuj</button>
                <button onClick={() => del(o.id)}>Usuń</button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ADMIN */}
      {tab === "admin" && isAdmin && (
        <div className="border p-4 space-y-2">

          <h2 className="font-bold">Panel cen</h2>

          {Object.keys(price).map((k) => (
            <input
              key={k}
              className="border p-2 w-full"
              value={price[k]}
              onChange={(e) =>
                setPrice({ ...price, [k]: Number(e.target.value) })
              }
              placeholder={k}
            />
          ))}

        </div>
      )}

    </div>
  );
}
