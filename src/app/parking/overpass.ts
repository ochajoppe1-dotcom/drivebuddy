// OpenStreetMap Overpass API クライアント
// 無料で日本全国の駐車場データを取得

export type OsmParkingSpot = {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  largeVehicle: boolean | null; // null = 不明
  source: "osm";
  raw: Record<string, string | undefined>;
};

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements: OverpassElement[];
};

/**
 * 指定座標から半径(m)以内の駐車場をOpenStreetMapから取得
 */
export async function fetchParkingNearby(
  lat: number,
  lng: number,
  radiusMeters = 5000
): Promise<OsmParkingSpot[]> {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="parking"](around:${radiusMeters},${lat},${lng});
      way["amenity"="parking"](around:${radiusMeters},${lat},${lng});
    );
    out center tags;
  `;

  // 複数エンドポイントを順番に試す
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: `data=${encodeURIComponent(query)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      if (!res.ok) continue;
      const data: OverpassResponse = await res.json();
      return parseElements(data.elements);
    } catch (e) {
      console.warn(`Overpass endpoint failed: ${endpoint}`, e);
    }
  }
  throw new Error("すべてのOverpassエンドポイントが応答しません");
}

function parseElements(elements: OverpassElement[]): OsmParkingSpot[] {
  const results: OsmParkingSpot[] = [];
  for (const el of elements) {
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (lat === undefined || lng === undefined) continue;

      const tags = el.tags ?? {};
      const name =
        tags.name ||
        tags["name:ja"] ||
        tags.operator ||
        tags["parking"] ||
        "駐車場";

      // 大型対応判定：
      // - hgv=yes : Heavy Goods Vehicle許可
      // - access=yes でかつ taxi=yes など
      // - hgv=no や maxweight 制限あり → 大型不可
      let largeVehicle: boolean | null = null;
      if (tags.hgv === "yes" || tags.hgv === "designated") {
        largeVehicle = true;
      } else if (
        tags.hgv === "no" ||
        tags.hgv === "private" ||
        tags["hgv:lanes"] === "no"
      ) {
        largeVehicle = false;
      } else if (tags.maxweight) {
        // 重量制限あり → だいたい大型不可
        const w = parseFloat(tags.maxweight);
        largeVehicle = !isNaN(w) && w >= 20;
      } else if (tags.maxheight) {
        const h = parseFloat(tags.maxheight);
        largeVehicle = !isNaN(h) && h >= 3.5;
      }
      // それ以外は null（不明）

    results.push({
      id: `osm-${el.type}-${el.id}`,
      name,
      position: { lat, lng },
      largeVehicle,
      source: "osm",
      raw: tags,
    });
  }
  return results;
}
