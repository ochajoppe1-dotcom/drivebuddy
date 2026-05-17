import Link from "next/link";
import ParkingMap from "./ParkingMap";

export default function ParkingPage() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="bg-[#1A365D] text-white px-6 py-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-[#A0AEC0] hover:text-white">
            ← 戻る
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-3xl">🅿️</span>
            <h1 className="text-2xl font-bold">駐車場マップ</h1>
          </div>
        </div>
      </header>

      <section className="flex-1 flex flex-col">
        <ParkingMap />
      </section>
    </main>
  );
}
