import React, { useEffect, useMemo, useState } from "react";

// 🔐 UŻYTKOWNICY
const USERS = [
  { login: "admin", password: "1234", role: "admin" }
];

// 📍 BAZA FIRMY
const BASE = {
  lat: 49.8547,
  lon: 19.3386,
  name: "Andrychów, Lenartowicza 64",
};

// 🎨 STATUSY
const STATUS_STYLE = {
  Nowe: "bg-red-600 text-white",
  "W trakcie": "bg-yellow-500 text-black",
  Zakończone: "bg-green-600 text-white",
};

export default function App() {

  const [user, setUser] = useState(null);
  const [login, setLogin] = useState("");
  const [haslo, setHaslo] = useState("");

  const zaloguj = () => {
    const u = USERS.find(
      (x) => x.login === login && x.password === haslo
    );

    if (!u) return alert("Błędny login lub hasło");
    setUser(u);
  };

  const czyAdmin = user?.role === "admin";

  const [zakladka, setZakladka] = useState("kalkulator");

  const [ceny, setCeny] = useState({
    maszynowa: 7,
    reczna: 10,
    punkty: 50,
    km: 3,
    wyjazd: 150,
  });

  useEffect(() => {
    const z = localStorage.getItem("ceny");
    if (z) setCeny(JSON.parse(z));
  }, []);

  useEffect(() => {
    localStorage.setItem("ceny", JSON.stringify(ceny));
  }, [ceny]);

  const [zlecenia, setZlecenia] = useState([]);
  const [historia, setHistoria] = useState([]);

  useEffect(() => {
    const z = localStorage.getItem("zlecenia");
    const h = localStorage.getItem("historia");

    if (z) setZlecenia(JSON.parse(z));
    if (h) setHistoria(JSON.parse(h));
  }, []);

  useEffect(() => {
    localStorage.setItem("zlecenia", JSON.stringify(zlecenia));
  }, [zlecenia]);

  useEffect(() => {
    localStorage.setItem("historia", JSON.stringify(historia));
  }, [historia]);

  const empty = {
    klient: "",
    adres: "",
    telefon: "",
    dataWizyty: "",
    maszynowa: "",
    reczna: "",
    punkty: "",
  };

  const [formularz, setFormularz] = useState(empty);
  const [km, setKm] = useState("");
  const [eta, setEta] = useState("");
  const [edycjaId, setEdycjaId] = useState(null);

  const licz = (v) => Number(v) || 0;

  // 🗺️ GOOGLE MAPS TRASA
  const otworzTrase = (adres) => {

    if (!adres) {
      alert("Brak adresu klienta");
      return;
    }

    const start = encodeURIComponent(
      BASE.name
    );

    const cel = encodeURIComponent(
      adres
    );

    const url =
      `https://www.google.com/maps/dir/${start}/${cel}`;

    window.open(url, "_blank");

  };

  // 📍 GEO
  const pobierzGeo = async (adres) => {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adres)}`
      );
      const d = await r.json();
      if (!d?.length) return null;

      return { lat: +d[0].lat, lon: +d[0].lon };
    } catch {
      return null;
    }
  };

  const policzKm = (a, b) => {
    const R = 6371;

    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLon = ((b.lon - a.lon) * Math.PI) / 180;

    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;

    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(x));
  };

  useEffect(() => {

    if (!formularz.adres) {
      setKm("");
      return;
    }

    const t = setTimeout(async () => {

      const geo = await pobierzGeo(
        formularz.adres
      );

      if (!geo) return;

      setKm(
        policzKm(BASE, geo).toFixed(1)
      );

    }, 600);

    return () => clearTimeout(t);

  }, [formularz.adres]);

  const suma = useMemo(() => {

    const baza =
      licz(formularz.maszynowa) * ceny.maszynowa +
      licz(formularz.reczna) * ceny.reczna +
      licz(formularz.punkty) * ceny.punkty +
      licz(km) * ceny.km;

    return baza + (baza > 0 ? ceny.wyjazd : 0);

  }, [formularz, km, ceny]);

  const id = () =>
    crypto?.randomUUID?.() ||
    String(Date.now());

  const zapisz = () => {

    if (!formularz.klient)
      return alert("Podaj klienta");

    const nowe = {
      id: edycjaId || id(),
      ...formularz,
      km,
      suma,
      status: "Nowe",
    };

    setZlecenia((p) => {

      if (edycjaId) {

        return p.map((o) =>
          o.id === edycjaId ? nowe : o
        );

      }

      return [nowe, ...p];

    });

    setFormularz(empty);
    setKm("");
    setEdycjaId(null);
    setZakladka("zlecenia");

  };

  const zmienStatus = (id, status) => {

    setZlecenia((p) => {

      const znalezione =
        p.find((o) => o.id === id);

      if (status === "Zakończone") {

        setHistoria((h) => [
          {
            ...znalezione,
            dataZakonczenia:
              new Date().toISOString(),
          },
          ...h,
        ]);

        return p.filter(
          (o) => o.id !== id
        );

      }

      return p;

    });

  };

  if (!user) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        <div className="border border-gray-700 bg-gray-900 p-6 w-80 space-y-3 rounded">

          <input
            className="bg-gray-800 border border-gray-600 p-2 w-full text-white"
            placeholder="Login"
            value={login}
            onChange={(e) =>
              setLogin(e.target.value)
            }
          />

          <input
            className="bg-gray-800 border border-gray-600 p-2 w-full text-white"
            type="password"
            placeholder="Hasło"
            value={haslo}
            onChange={(e) =>
              setHaslo(e.target.value)
            }
          />

          <button
            onClick={zaloguj}
            className="bg-blue-600 text-white w-full p-2 rounded"
          >
            Zaloguj
          </button>

        </div>

      </div>
    );

  }

  return (

    <div className="min-h-screen bg-black text-white p-4 max-w-5xl mx-auto">

      <h1 className="text-3xl font-bold mb-4">
        Serwis Robotów
      </h1>

      <div className="flex gap-2 mb-4">

        <button onClick={() => setZakladka("kalkulator")}>
          Kalkulator
        </button>

        <button onClick={() => setZakladka("zlecenia")}>
          Zlecenia
        </button>

        <button onClick={() => setZakladka("historia")}>
          Historia
        </button>

      </div>

      {/* ZLECENIA */}

      {zakladka === "zlecenia" && (

        <div className="space-y-3">

          {zlecenia.map((o) => (

            <div key={o.id}
              className="border border-gray-700 bg-gray-900 p-3 rounded">

              <div className="font-bold">
                {o.klient}
              </div>

              <div>
                📞 {o.telefon}
              </div>

              <div>
                🚗 {o.km} km
              </div>

              <div>
                💰 {o.suma} zł
              </div>

              <button
                onClick={() =>
                  zmienStatus(o.id, "Zakończone")
                }
              >
                Zakończ
              </button>

              <button
                onClick={() =>
                  otworzTrase(o.adres)
                }
                className="bg-blue-600 text-white px-2 py-1 rounded ml-2"
              >
                🗺️ Trasa Google
              </button>

            </div>

          ))}

        </div>

      )}

      {/* HISTORIA */}

      {zakladka === "historia" && (

        <div className="space-y-3">

          {historia.map((o) => (

            <div key={o.id}
              className="border border-gray-700 bg-gray-900 p-3 rounded">

              <div className="font-bold">
                {o.klient}
              </div>

              <div>
                📞 {o.telefon}
              </div>

              <div>
                💰 {o.suma} zł
              </div>

              <button
                onClick={() =>
                  otworzTrase(o.adres)
                }
                className="bg-blue-600 text-white px-2 py-1 rounded mt-2"
              >
                🗺️ Trasa Google
              </button>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}
