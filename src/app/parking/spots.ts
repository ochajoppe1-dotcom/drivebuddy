// 駐車場データ（全国の主要SA/PA/道の駅）
// 後でデータベース or 公的データから取得する想定

export type ParkingSpot = {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  largeVehicle: boolean;
  type: "SA" | "PA" | "roadside" | "parking";
  hours: string;
  note: string;
};

export const sampleSpots: ParkingSpot[] = [
  // ===== 東名高速 =====
  {
    id: "tomei-ebina-up",
    name: "海老名SA（上り）",
    position: { lat: 35.4395, lng: 139.3905 },
    largeVehicle: true,
    type: "SA",
    hours: "24時間",
    note: "大型100台超、混雑注意",
  },
  {
    id: "tomei-ashigara-up",
    name: "足柄SA（上り）",
    position: { lat: 35.2862, lng: 139.0124 },
    largeVehicle: true,
    type: "SA",
    hours: "24時間",
    note: "大型・休憩施設充実",
  },
  {
    id: "tomei-fujikawa",
    name: "富士川SA",
    position: { lat: 35.1408, lng: 138.5803 },
    largeVehicle: true,
    type: "SA",
    hours: "24時間",
    note: "富士山の絶景ポイント",
  },
  {
    id: "tomei-nihondaira",
    name: "日本平PA",
    position: { lat: 34.985, lng: 138.4214 },
    largeVehicle: true,
    type: "PA",
    hours: "24時間",
    note: "中型〜大型対応",
  },
  {
    id: "tomei-hamanako",
    name: "浜名湖SA",
    position: { lat: 34.7178, lng: 137.5972 },
    largeVehicle: true,
    type: "SA",
    hours: "24時間",
    note: "湖畔の絶景、大型駐車場あり",
  },

  // ===== 名神高速 =====
  {
    id: "meishin-otsu",
    name: "大津SA",
    position: { lat: 34.9956, lng: 135.9089 },
    largeVehicle: true,
    type: "SA",
    hours: "24時間",
    note: "琵琶湖を一望、大型対応",
  },
  {
    id: "meishin-kariya",
    name: "刈谷PA",
    position: { lat: 35.0033, lng: 137.0011 },
    largeVehicle: true,
    type: "PA",
    hours: "24時間",
    note: "観覧車併設、大型多数",
  },

  // ===== 関越自動車道 =====
  {
    id: "kanetsu-uesato",
    name: "上里SA",
    position: { lat: 36.2356, lng: 139.1531 },
    largeVehicle: true,
    type: "SA",
    hours: "24時間",
    note: "群馬・埼玉県境、大型対応",
  },
  {
    id: "kanetsu-akagi",
    name: "赤城高原SA",
    position: { lat: 36.575, lng: 138.9381 },
    largeVehicle: true,
    type: "SA",
    hours: "24時間",
    note: "山間部、休憩に最適",
  },

  // ===== 東北自動車道 =====
  {
    id: "tohoku-sano",
    name: "佐野SA",
    position: { lat: 36.3014, lng: 139.5575 },
    largeVehicle: true,
    type: "SA",
    hours: "24時間",
    note: "栃木県、大型多数、佐野ラーメン有名",
  },
  {
    id: "tohoku-nasu",
    name: "那須高原SA",
    position: { lat: 36.9333, lng: 139.9667 },
    largeVehicle: true,
    type: "SA",
    hours: "24時間",
    note: "高原リゾート、大型駐車場広い",
  },
  {
    id: "tohoku-adatara",
    name: "安達太良SA",
    position: { lat: 37.6308, lng: 140.4314 },
    largeVehicle: true,
    type: "SA",
    hours: "24時間",
    note: "福島、休憩に最適",
  },

  // ===== 中央自動車道 =====
  {
    id: "chuo-futaba",
    name: "双葉SA",
    position: { lat: 35.6669, lng: 138.5172 },
    largeVehicle: true,
    type: "SA",
    hours: "24時間",
    note: "山梨、富士山絶景",
  },
  {
    id: "chuo-suwako",
    name: "諏訪湖SA",
    position: { lat: 36.0581, lng: 138.0986 },
    largeVehicle: true,
    type: "SA",
    hours: "24時間",
    note: "諏訪湖の眺望、大型あり",
  },
  {
    id: "chuo-komagatake",
    name: "駒ヶ岳SA",
    position: { lat: 35.7361, lng: 137.9472 },
    largeVehicle: true,
    type: "SA",
    hours: "24時間",
    note: "中央アルプスの絶景",
  },

  // ===== 新東名 =====
  {
    id: "shinto-mei-sunto",
    name: "駿河湾沼津SA",
    position: { lat: 35.1247, lng: 138.85 },
    largeVehicle: true,
    type: "SA",
    hours: "24時間",
    note: "駿河湾を一望、新東名屈指",
  },
  {
    id: "shinto-mei-okazaki",
    name: "岡崎SA（上り）",
    position: { lat: 34.9978, lng: 137.2261 },
    largeVehicle: true,
    type: "SA",
    hours: "24時間",
    note: "愛知、大型・施設充実",
  },

  // ===== 中国自動車道 =====
  {
    id: "chugoku-katsura",
    name: "桂川PA",
    position: { lat: 34.9789, lng: 135.6669 },
    largeVehicle: true,
    type: "PA",
    hours: "24時間",
    note: "京都府、大型対応",
  },

  // ===== 道の駅（大型対応） =====
  {
    id: "michi-kawaba",
    name: "道の駅 川場田園プラザ",
    position: { lat: 36.6489, lng: 139.0461 },
    largeVehicle: true,
    type: "roadside",
    hours: "9:00-18:00（駐車場24h）",
    note: "群馬、関東No.1人気道の駅",
  },
  {
    id: "michi-yatsugatake",
    name: "道の駅 こぶちさわ",
    position: { lat: 35.9181, lng: 138.3197 },
    largeVehicle: true,
    type: "roadside",
    hours: "9:00-18:00（駐車場24h）",
    note: "山梨・八ヶ岳、温泉併設",
  },
  {
    id: "michi-motegi",
    name: "道の駅 もてぎ",
    position: { lat: 36.5311, lng: 140.1797 },
    largeVehicle: true,
    type: "roadside",
    hours: "9:00-18:00（駐車場24h）",
    note: "栃木、地元グルメ豊富",
  },
  {
    id: "michi-fuji",
    name: "道の駅 富士",
    position: { lat: 35.1817, lng: 138.6597 },
    largeVehicle: true,
    type: "roadside",
    hours: "8:00-22:00（駐車場24h）",
    note: "静岡、富士山絶景",
  },
  {
    id: "michi-yuai",
    name: "道の駅 那須高原友愛の森",
    position: { lat: 36.9756, lng: 140.0322 },
    largeVehicle: true,
    type: "roadside",
    hours: "9:00-18:00（駐車場24h）",
    note: "栃木、観光拠点",
  },
  {
    id: "michi-rokugou",
    name: "道の駅 とよはし",
    position: { lat: 34.7831, lng: 137.4111 },
    largeVehicle: true,
    type: "roadside",
    hours: "9:00-21:00（駐車場24h）",
    note: "愛知、新東名近く",
  },

  // ===== 関西エリア =====
  {
    id: "shinmei-mahuji",
    name: "養老SA",
    position: { lat: 35.305, lng: 136.5236 },
    largeVehicle: true,
    type: "SA",
    hours: "24時間",
    note: "岐阜、養老の滝で有名",
  },
  {
    id: "hanshin-kanaoka",
    name: "西宮名塩SA",
    position: { lat: 34.8053, lng: 135.3133 },
    largeVehicle: true,
    type: "SA",
    hours: "24時間",
    note: "兵庫、中国道",
  },

  // ===== 九州 =====
  {
    id: "kyushu-yamanaga",
    name: "山川PA",
    position: { lat: 33.225, lng: 130.8617 },
    largeVehicle: true,
    type: "PA",
    hours: "24時間",
    note: "福岡、九州自動車道",
  },
  {
    id: "kyushu-yamaga",
    name: "山鹿SA",
    position: { lat: 32.9667, lng: 130.7167 },
    largeVehicle: true,
    type: "SA",
    hours: "24時間",
    note: "熊本、九州道",
  },

  // ===== 北海道 =====
  {
    id: "hokkaido-yuni",
    name: "由仁PA",
    position: { lat: 42.9839, lng: 141.7956 },
    largeVehicle: true,
    type: "PA",
    hours: "24時間",
    note: "北海道、道央道",
  },

  // ===== 都内・コインパーキング例（中型まで） =====
  {
    id: "tokyo-shinjuku",
    name: "新宿駅周辺コインパーキング",
    position: { lat: 35.6896, lng: 139.7006 },
    largeVehicle: false,
    type: "parking",
    hours: "24時間",
    note: "中型まで、料金高め",
  },
  {
    id: "tokyo-shibuya",
    name: "渋谷駅周辺コインパーキング",
    position: { lat: 35.6595, lng: 139.7004 },
    largeVehicle: false,
    type: "parking",
    hours: "24時間",
    note: "中型まで",
  },
];
