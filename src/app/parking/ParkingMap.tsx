"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api";
import { sampleSpots, type ParkingSpot } from "./spots";
import { fetchParkingNearby, type OsmParkingSpot } from "./overpass";

const containerStyle = {
  width: "100%",
  height: "100%",
};

// デフォルト中心：東京駅
const defaultCenter = {
  lat: 35.6812,
  lng: 139.7671,
};

// 統合スポット型（既知の優良スポット or OSM取得）
type UnifiedSpot = {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  largeVehicle: boolean | null;
  source: "curated" | "osm";
  hours?: string;
  note?: string;
  type?: string;
  distance?: number;
};

function makeMarkerIcon(
  largeVehicle: boolean | null,
  isSelected: boolean,
  isCurated: boolean
) {
  // 色：大型確定=濃紺、大型不可=オレンジ、不明=グレー
  const color =
    largeVehicle === true
      ? "#1A365D"
      : largeVehicle === false
      ? "#FF8C42"
      : "#94A3B8";
  const scale = isSelected ? 1.2 : isCurated ? 1.1 : 0.9;
  const label = largeVehicle === true ? "L" : largeVehicle === false ? "P" : "?";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${
    36 * scale
  }" height="${
    48 * scale
  }" viewBox="0 0 36 48"><path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z" fill="${color}" stroke="white" stroke-width="2"/><text x="18" y="24" text-anchor="middle" font-size="18" fill="white" font-family="sans-serif" font-weight="bold">${label}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function makeUserMarkerIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="3"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function calcDistance(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

function curatedToUnified(s: ParkingSpot): UnifiedSpot {
  return {
    id: s.id,
    name: s.name,
    position: s.position,
    largeVehicle: s.largeVehicle,
    source: "curated",
    hours: s.hours,
    note: s.note,
    type: s.type,
  };
}

function osmToUnified(s: OsmParkingSpot): UnifiedSpot {
  return {
    id: s.id,
    name: s.name,
    position: s.position,
    largeVehicle: s.largeVehicle,
    source: "osm",
    note:
      s.largeVehicle === true
        ? "大型対応"
        : s.largeVehicle === false
        ? "大型不可"
        : "大型対応不明",
  };
}

export default function ParkingMap() {
  const [center, setCenter] = useState(defaultCenter);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<UnifiedSpot | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [filterLarge, setFilterLarge] = useState(false);
  const [showList, setShowList] = useState(false);
  const [osmSpots, setOsmSpots] = useState<OsmParkingSpot[]>([]);
  const [loadingOsm, setLoadingOsm] = useState(false);
  const [osmError, setOsmError] = useState<string | null>(null);
  const lastFetchPos = useRef<{ lat: number; lng: number } | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });

  // 現在地取得
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("位置情報が利用できません（東京駅を表示中）");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(p);
        setUserPos(p);
      },
      () => {
        setLocationError("位置情報の取得が拒否されました（東京駅を表示中）");
      },
      { timeout: 5000 }
    );
  }, []);

  // OSM から駐車場を取得
  const loadOsmParking = useCallback(async (lat: number, lng: number) => {
    setLoadingOsm(true);
    setOsmError(null);
    try {
      const spots = await fetchParkingNearby(lat, lng, 5000);
      setOsmSpots(spots);
      lastFetchPos.current = { lat, lng };
    } catch (e) {
      console.error(e);
      setOsmError("駐車場データの取得に失敗しました");
    } finally {
      setLoadingOsm(false);
    }
  }, []);

  // 現在地が変わったら自動取得
  useEffect(() => {
    if (userPos) {
      loadOsmParking(userPos.lat, userPos.lng);
    }
  }, [userPos, loadOsmParking]);

  // 統合スポット
  const allSpots = useMemo(() => {
    const curated = sampleSpots.map(curatedToUnified);
    const osm = osmSpots.map(osmToUnified);
    // OSMと既知データが重複する場合は既知優先（同じ位置なら）
    const seen = new Set(
      curated.map((c) => `${c.position.lat.toFixed(3)},${c.position.lng.toFixed(3)}`)
    );
    const osmFiltered = osm.filter(
      (o) => !seen.has(`${o.position.lat.toFixed(3)},${o.position.lng.toFixed(3)}`)
    );
    return [...curated, ...osmFiltered];
  }, [osmSpots]);

  // フィルタ＆距離順
  const visibleSpots = useMemo(() => {
    const filtered = filterLarge
      ? allSpots.filter((s) => s.largeVehicle === true)
      : allSpots;
    const base = userPos || center;
    return filtered
      .map((s) => ({ ...s, distance: calcDistance(base, s.position) }))
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }, [filterLarge, userPos, center, allSpots]);

  const onMarkerClick = useCallback((spot: UnifiedSpot) => {
    setSelectedSpot(spot);
  }, []);

  // 「このエリアで再検索」ボタン
  const handleResearch = useCallback(() => {
    loadOsmParking(center.lat, center.lng);
  }, [center, loadOsmParking]);

  if (!apiKey) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-20 bg-[#FFF8E7]">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔑</div>
          <h2 className="text-2xl font-bold text-[#1A365D] mb-3">APIキー未設定</h2>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-20 bg-[#FFF8E7]">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-3">マップ読み込みエラー</h2>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-20 bg-[#FFF8E7]">
        <div className="text-center">
          <div className="inline-block animate-spin text-6xl mb-3">🗺️</div>
          <p className="text-gray-600">マップを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative">
      {/* 上部バー */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between gap-2 flex-wrap text-xs">
        <div className="flex items-center gap-2 text-gray-600">
          <span className="inline-block w-3 h-3 rounded-full bg-[#1A365D]"></span>
          <span>大型対応</span>
          <span className="inline-block w-3 h-3 rounded-full bg-[#FF8C42] ml-2"></span>
          <span>大型不可</span>
          <span className="inline-block w-3 h-3 rounded-full bg-gray-400 ml-2"></span>
          <span>不明</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={filterLarge}
              onChange={(e) => setFilterLarge(e.target.checked)}
              className="cursor-pointer"
            />
            大型対応のみ
          </label>
          <button
            onClick={() => setShowList(!showList)}
            className="bg-[#1A365D] text-white px-3 py-1 rounded-full hover:bg-[#2A4A7D]"
          >
            {showList ? "マップ表示" : "リスト表示"}
          </button>
        </div>
      </div>

      {/* ステータスバー */}
      <div className="bg-blue-50 text-blue-900 text-xs px-4 py-1.5 text-center flex items-center justify-center gap-3 flex-wrap">
        <span>
          {loadingOsm
            ? "🔄 駐車場データ取得中..."
            : `📍 表示中: ${visibleSpots.length}件`}
        </span>
        {!loadingOsm && (
          <button
            onClick={handleResearch}
            className="bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700"
          >
            このエリアで再検索
          </button>
        )}
      </div>

      {locationError && (
        <div className="bg-amber-100 text-amber-900 text-xs px-4 py-1 text-center">
          {locationError}
        </div>
      )}
      {osmError && (
        <div className="bg-red-100 text-red-900 text-xs px-4 py-1 text-center">
          {osmError}
        </div>
      )}

      <div
        className="relative"
        style={{ height: "calc(100vh - 240px)", minHeight: "400px" }}
      >
        {showList ? (
          <div className="absolute inset-0 overflow-y-auto bg-[#FFF8E7] p-4">
            <p className="text-xs text-gray-600 mb-3">
              {userPos ? "現在地" : "東京駅"} から近い順（{visibleSpots.length}件）
            </p>
            <div className="space-y-2">
              {visibleSpots.slice(0, 100).map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => {
                    setCenter(spot.position);
                    setSelectedSpot(spot);
                    setShowList(false);
                  }}
                  className="w-full text-left bg-white rounded-lg p-3 shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-bold flex-shrink-0 ${
                        spot.largeVehicle === true
                          ? "bg-[#1A365D]"
                          : spot.largeVehicle === false
                          ? "bg-[#FF8C42]"
                          : "bg-gray-400"
                      }`}
                    >
                      {spot.largeVehicle === true
                        ? "L"
                        : spot.largeVehicle === false
                        ? "P"
                        : "?"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-[#1A365D] text-sm truncate">
                          {spot.name}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {spot.distance} km
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {spot.hours ? `${spot.hours} / ` : ""}
                        {spot.note}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
              {visibleSpots.length > 100 && (
                <p className="text-xs text-center text-gray-500 py-2">
                  最大100件まで表示
                </p>
              )}
            </div>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={userPos ? 13 : 6}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              gestureHandling: "greedy",
            }}
            onCenterChanged={() => {}}
          >
            {userPos && (
              <MarkerF
                position={userPos}
                icon={{ url: makeUserMarkerIcon() }}
                zIndex={1000}
              />
            )}

            {visibleSpots.map((spot) => (
              <MarkerF
                key={spot.id}
                position={spot.position}
                onClick={() => onMarkerClick(spot)}
                icon={{
                  url: makeMarkerIcon(
                    spot.largeVehicle,
                    selectedSpot?.id === spot.id,
                    spot.source === "curated"
                  ),
                }}
              />
            ))}

            {selectedSpot && (
              <InfoWindowF
                position={selectedSpot.position}
                onCloseClick={() => setSelectedSpot(null)}
              >
                <div className="p-1 max-w-xs">
                  <h3 className="font-bold text-[#1A365D] mb-1 text-sm">
                    {selectedSpot.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full text-white ${
                        selectedSpot.largeVehicle === true
                          ? "bg-[#1A365D]"
                          : selectedSpot.largeVehicle === false
                          ? "bg-[#FF8C42]"
                          : "bg-gray-400"
                      }`}
                    >
                      {selectedSpot.largeVehicle === true
                        ? "🚛 大型対応"
                        : selectedSpot.largeVehicle === false
                        ? "大型不可"
                        : "情報なし"}
                    </span>
                    {selectedSpot.source === "curated" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-600 text-white">
                        ✓ 公認
                      </span>
                    )}
                  </div>
                  {selectedSpot.hours && (
                    <p className="text-xs text-gray-600 mb-1">
                      🕒 {selectedSpot.hours}
                    </p>
                  )}
                  {selectedSpot.note && (
                    <p className="text-xs text-gray-700 mb-2">
                      {selectedSpot.note}
                    </p>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedSpot.position.lat},${selectedSpot.position.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs bg-[#FF8C42] text-white px-3 py-1 rounded-full"
                  >
                    🧭 ナビ起動
                  </a>
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        )}
      </div>
    </div>
  );
}
