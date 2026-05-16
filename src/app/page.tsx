import Link from "next/link";

const features = [
  {
    href: "/parking",
    emoji: "🅿️",
    title: "駐車場マップ",
    description: "大型対応の駐車場・休憩スポットを検索",
    color: "from-[#1A365D] to-[#2A4A7D]",
  },
  {
    href: "/fuel",
    emoji: "⛽",
    title: "燃料価格比較",
    description: "周辺のガソリン・軽油価格をリアルタイム比較",
    color: "from-[#FF8C42] to-[#FFA468]",
  },
  {
    href: "/expense",
    emoji: "🧾",
    title: "経費レシート記録",
    description: "写真撮影でAIが自動仕訳・確定申告対応",
    color: "from-[#1A365D] to-[#2A4A7D]",
  },
  {
    href: "/hours",
    emoji: "⏱️",
    title: "拘束時間チェッカー",
    description: "2024年問題対応・法令違反を事前警告",
    color: "from-[#FF8C42] to-[#FFA468]",
  },
];

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Header */}
      <header className="bg-[#1A365D] text-white px-6 py-8 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🚛</span>
            <h1 className="text-3xl font-bold">
              Drive<span className="text-[#FF8C42]">Buddy</span>
            </h1>
          </div>
          <p className="text-sm text-[#A0AEC0]">
            プロドライバーの毎日に、頼れる相棒を。
          </p>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#1A365D] to-[#2A4A7D] text-white px-6 py-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            運転手のためだけに作られた実用アプリ
          </h2>
          <p className="text-[#A0AEC0] text-base">
            駐車場、燃料、経費、拘束時間。
            <br />
            毎日のドライブを支える4つの機能。
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="flex-1 px-6 py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className={`block rounded-2xl p-6 text-white shadow-lg bg-gradient-to-br ${feature.color} hover:scale-[1.02] transition-transform`}
            >
              <div className="text-5xl mb-3">{feature.emoji}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-sm opacity-90">{feature.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A365D] text-[#A0AEC0] text-center text-xs py-6 px-6">
        <p>© 2026 DriveBuddy — Built with ❤️ by REHL</p>
      </footer>
    </main>
  );
}
