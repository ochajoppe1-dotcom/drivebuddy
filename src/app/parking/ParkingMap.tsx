"use client";

import { useEffect, useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "calc(100vh - 88px)",
};

// デフォルト中心：東京駅（位置情報取得失敗時のフォールバック）
const defaultCenter = {
  lat: 35.6812,
  lng: 139.7671,
};

// サンプル駐車場データ（後でDBから取得に置き換え）
type ParkingSpot = {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  largeVehicle: boolean;
  hours: string;
  note: string;
};

const sampleSpots: ParkingSpot[] = [
  {
    id: "1",
    name: "大型対応SA・海老名上り",
    position: { lat: 35.4395, lng: 139.3905 },
    largeVehicle: true,
    hours: "24時間",
    note: "大型トラック多数。混雑注意",
  },
  {
    id: "2",
    name: "道の駅・足柄",
    position: { lat: 35.2862, lng: 139.0124 },
    largeVehicle: true,
    hours: "24時間（建物9-21）",
    note: "大型駐車場あり、休憩可",
  },
  {
    id: "3",
    name: "都内・コインパーキング例",
    position: { lat: 35.6812, lng: 139.7671 },
    largeVehicle: false,
    hours: "24時間",
    note: "中型まで対応",
  },
];

export default function ParkingMap() {
  const [center, setCenter] = useState(defaultCenter);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("位置情報が利用できません");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setLocationError("位置情報の取得が拒否されました（東京駅を表示中）");
      },
      { timeout: 5000 }
    );
  }, []);

  const onMarkerClick = useCallback((spot: ParkingSpot) => {
    setSelectedSpot(spot);
  }, []);

  if (!apiKey) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-20 bg-[#FFF8E7]">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔑</div>
          <h2 className="text-2xl font-bold text-[#1A365D] mb-3">
            APIキー未設定
          </h2>
          <p className="text-gray-600 text-sm">
            Google Maps APIキーが設定されていません。
            <br />
            管理者にお問い合わせください。
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
          <h2 className="text-2xl font-bold text-red-600 mb-3">
            マップ読み込みエラー
          </h2>
          <p className="text-gray-600 text-sm">
            Google Mapsの読み込みに失敗しました。
            <br />
            時間を置いて再度お試しください。
          </p>
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
    <div className="flex-1 flex flex-col">
      {locationError && (
        <div className="bg-amber-100 text-amber-900 text-sm px-4 py-2 text-center">
          {locationError}
        </div>
      )}
      <div className="flex-1">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          }}
        >
          {/* 現在地マーカー */}
          <MarkerF
            position={center}
            icon={{
              path: 0, // CIRCLE
              scale: 8,
              fillColor: "#FF8C42",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
            }}
          />

          {/* 駐車場マーカー */}
          {sampleSpots.map((spot) => (
            <MarkerF
              key={spot.id}
              position={spot.position}
              onClick={() => onMarkerClick(spot)}
              label={{
                text: spot.largeVehicle ? "🚛" : "P",
                color: "#FFFFFF",
                fontSize: "14px",
              }}
            />
          ))}

          {/* 情報ウィンドウ */}
          {selectedSpot && (
            <InfoWindowF
              position={selectedSpot.position}
              onCloseClick={() => setSelectedSpot(null)}
            >
              <div className="p-2 max-w-xs">
                <h3 className="font-bold text-[#1A365D] mb-1">
                  {selectedSpot.name}
                </h3>
                <p className="text-xs text-gray-600 mb-1">
                  {selectedSpot.largeVehicle ? "🚛 大型対応" : "中型まで"}
                </p>
                <p className="text-xs text-gray-600 mb-1">
                  営業時間: {selectedSpot.hours}
                </p>
                <p className="text-xs text-gray-700">{selectedSpot.note}</p>
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
