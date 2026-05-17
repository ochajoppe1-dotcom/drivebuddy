"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api";
import { sampleSpots, type ParkingSpot } from "./spots";

const containerStyle = {
  width: "100%",
  height: "100%",
};

// デフォルト中心：東京駅
const defaultCenter = {
  lat: 35.6812,
  lng: 139.7671,
};

// マーカーのSVGアイコン（型別・色別）
function makeMarkerIcon(largeVehicle: boolean, isSelected: boolean) {
  const color = largeVehicle ? "#1A365D" : "#FF8C42";
  const scale = isSelected ? 1.2 : 1;
  // data URI で SVG マーカーを作成
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${36 * scale}" height="${48 * scale}" viewBox="0 0 36 48">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="18" y="24" text-anchor="middle" font-size="18" fill="white" font-family="sans-serif" font-weight="bold">${largeVehicle ? "大" : "P"}</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${typeof window !== "undefined" ? btoa(svg) : ""}`;
}

// 2点間の距離（km）を計算
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

export default function ParkingMap() {
  const [center, setCenter] = useState(defaultCenter);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [filterLarge, setFilterLarge] = useState(false);
  const [showList, setShowList] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });

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

  // フィルタリング＆距離順ソート
  const visibleSpots = useMemo(() => {
    const filtered = filterLarge
      ? sampleSpots.filter((s) => s.largeVehicle)
      : sampleSpots;
    const base = userPos || center;
    return filtered
      .map((s) => ({ ...s, distance: calcDistance(base, s.position) }))
      .sort((a, b) => a.distance - b.distance);
  }, [filterLarge, userPos, center]);

  const onMarkerClick = useCallback((spot: ParkingSpot) => {
    setSelectedSpot(spot);
  }, []);

  if (!apiKey) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-20 bg-[#FFF8E7]">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔑</div>
          <h2 className="text-2xl font-bold text-[#1A365D] mb-3">APIキー未設定</h2>
          <p className="text-gray-600 text-sm">
            Google Maps APIキーが設定されていません。
          </p>
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
          <p className="text-gray-600 text-sm">時間を置いて再度お試しください。</p>
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
      {/* 上部バー：フィルタ＋情報 */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="inline-block w-3 h-3 rounded-full bg-[#1A365D]"></span>
          <span>大型対応</span>
          <span className="inline-block w-3 h-3 rounded-full bg-[#FF8C42] ml-2"></span>
          <span>中型まで</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-gray-700 cursor-pointer">
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
            className="text-xs bg-[#1A365D] text-white px-3 py-1 rounded-full hover:bg-[#2A4A7D]"
          >
            {showList ? "マップ表示" : "リスト表示"}
          </button>
        </div>
      </div>

      {locationError && (
        <div className="bg-amber-100 text-amber-900 text-xs px-4 py-2 text-center">
          {locationError}
        </div>
      )}

      <div className="flex-1 relative" style={{ minHeight: "60vh" }}>
        {showList ? (
          /* リスト表示 */
          <div className="absolute inset-0 overflow-y-auto bg-[#FFF8E7] p-4">
            <p className="text-xs text-gray-600 mb-3">
              {userPos ? "現在地" : "東京駅"} から近い順（{visibleSpots.length}件）
            </p>
            <div className="space-y-2">
              {visibleSpots.map((spot) => (
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
                        spot.largeVehicle ? "bg-[#1A365D]" : "bg-[#FF8C42]"
                      }`}
                    >
                      {spot.largeVehicle ? "大" : "P"}
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
                        {spot.hours} / {spot.note}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* マップ表示 */
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={userPos ? 11 : 6}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              gestureHandling: "greedy",
            }}
          >
            {/* 現在地マーカー（青い円） */}
            {userPos && (
              <MarkerF
                position={userPos}
                icon={{
                  url: `data:image/svg+xml;base64,${btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="3"/>
                    </svg>
                  `)}`,
                }}
                zIndex={1000}
              />
            )}

            {/* 駐車場マーカー */}
            {visibleSpots.map((spot) => (
              <MarkerF
                key={spot.id}
                position={spot.position}
                onClick={() => onMarkerClick(spot)}
                icon={{
                  url: makeMarkerIcon(spot.largeVehicle, selectedSpot?.id === spot.id),
                }}
              />
            ))}

            {/* 情報ウィンドウ */}
            {selectedSpot && (
              <InfoWindowF
                position={selectedSpot.position}
                onCloseClick={() => setSelectedSpot(null)}
              >
                <div className="p-1 max-w-xs">
                  <h3 className="font-bold text-[#1A365D] mb-1 text-sm">
                    {selectedSpot.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full text-white ${
                        selectedSpot.largeVehicle ? "bg-[#1A365D]" : "bg-[#FF8C42]"
                      }`}
                    >
                      {selectedSpot.largeVehicle ? "🚛 大型対応" : "中型まで"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {selectedSpot.type === "SA"
                        ? "SA"
                        : selectedSpot.type === "PA"
                        ? "PA"
                        : selectedSpot.type === "roadside"
                        ? "道の駅"
                        : "駐車場"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">
                    🕒 {selectedSpot.hours}
                  </p>
                  <p className="text-xs text-gray-700">{selectedSpot.note}</p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedSpot.position.lat},${selectedSpot.position.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs bg-[#FF8C42] text-white px-3 py-1 rounded-full"
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
