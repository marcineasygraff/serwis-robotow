import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// FIX IKON
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// 🔐 UŻYTKOWNICY
const USERS = [
  { login: "admin", password: "1234", role: "admin" }
];

// 📍 BAZA
const BASE = {
  lat: 49.8547,
  lon: 19.3386,
  name: "Baza",
};

export default function App() {

  const [user, setUser] = useState(null);
  const [login, setLogin] = useState("");
  const [haslo, setHaslo] = useState("");

  const zaloguj = () => {
    const u = USERS.find(
      (x) => x.login === login && x.password === haslo
    );
    if (!u) return alert("Błędny login");
    setUser(u);
  };

  const [formularz, setFormularz] = useState({
    klient: "",
    adres: "",
  });

  const [km, setKm] = useState("");
  const [eta, setEta] = useState("");
  const [geoKlient, setGeoKlient] = useState(null);
  const [loadingGeo, setLoadingGeo] = useState(false);

  // GEO
  const pobierzGeo = async (adres) => {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adres)}`,
        {
          headers: {
            "User-Agent": "app-serwis-robotow"
          }
        }
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

  const policzETA = async (a, b) => {
    try {
      const r = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=false`
      );
      const d = await r.json();

      return d?.routes?.length
        ? Math.round(d.routes[0].duration / 60)
        : null;
    } catch {
      return null;
    }
  };

  // AUTO GEO
  useEffect(() => {
    if (!formularz.adres) {
      setGeoKlient(null);
      setKm("");
      setEta("");
      return;
    }

    const t = setTimeout(async () => {
      setLoadingGeo(true);

      const geo = await pobierzGeo(formularz.adres);
      if (!geo) {
        setLoadingGeo(false);
        return;
      }

      setGeoKlient(geo);
      setKm(policzKm(BASE, geo).toFixed(1));

      const e = await policzETA(BASE, geo);
      if (e !== null) setEta(e);

      setLoadingGeo(false);
    }, 600);

    return () => clearTimeout(t);
  }, [formularz.adres]);

  // LOGIN
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="border p-6 w-80 space-y-3">
          <input
            className="border p-2 w-full"
            placeholder="Login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
          <input
            className="border p-2 w-full"
            type="password"
            placeholder="Hasło"
            value={haslo}
            onChange={(e) => setHaslo(e.target.value)}
          />
          <button
            onClick={zaloguj}
            className="bg-blue-600 text-white w-full p-2"
          >
            Zaloguj
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">

      <h1 className="text-2xl font-bold mb-4">
        Serwis Robotów + mapa
      </h1>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Klient"
        value={formularz.klient}
        onChange={(e) =>
          setFormularz({ ...formularz, klient: e.target.value })
        }
      />

      <input
        className="border p-2 w-full mb-2"
        placeholder="Adres"
        value={formularz.adres}
        onChange={(e) =>
          setFormularz({ ...formularz, adres: e.target.value })
        }
      />

      {loadingGeo && <div>🔄 Liczę lokalizację...</div>}

      <div className="my-2">
        🚗 {km} km | 🕒 {eta} min
      </div>

      {/* MAPA */}
      {geoKlient && (
        <div className="h-80 mt-4">
          <MapContainer
            center={[geoKlient.lat, geoKlient.lon]}
            zoom={13}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={[BASE.lat, BASE.lon]}>
              <Popup>🏢 Baza</Popup>
            </Marker>

            <Marker position={[geoKlient.lat, geoKlient.lon]}>
              <Popup>📍 Klient</Popup>
            </Marker>

          </MapContainer>
        </div>
      )}

    </div>
  );
}
