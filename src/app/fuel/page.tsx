import Link from "next/link";

export default function FuelPage() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="bg-[#FF8C42] text-white px-6 py-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-white/80 hover:text-white">
            ← 戻る
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-3xl">⛽</span>
            <h1 className="text-2xl font-bold">燃料価格比較</h1>
          </div>
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold text-[#1A365D] mb-3">準備中</h2>
          <p className="text-gray-600 mb-6">
            周辺のガソリン・軽油価格を
            <br />
            リアルタイム比較する機能を開発中です。
          </p>
          <Link
            href="/"
            className="inline-block bg-[#FF8C42] text-white px-6 py-3 rounded-full font-bold hover:bg-[#FFA468] transition-colors"
          >
            トップに戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
