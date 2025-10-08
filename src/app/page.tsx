'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-screen flex items-end">
          <div className="absolute inset-0 z-0">
            <img src="/back.jpg" alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>

          <div className="relative z-10 px-8 lg:px-16 pb-24 w-full">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight overflow-hidden">
              <span className="inline-block animate-slide-up opacity-0" style={{animationDelay: '1.2s'}}>テクノロジーで</span><br />
              <span className="inline-block animate-slide-up opacity-0" style={{animationDelay: '1.5s'}}>取り戻す</span>
            </h1>
            <div className="relative max-w-2xl mt-6">
              <div className="h-3 bg-gradient-to-r from-purple-600 to-blue-500 animate-border-expand mb-4" style={{animationDelay: '0.3s'}}></div>
              <p className="text-lg md:text-xl text-white leading-relaxed opacity-0 animate-fade-in" style={{animationDelay: '2s'}}>
                PaleTechは福岡でAIを活用し、<br className="hidden md:block" />
                ウェルビーイングな社会を創造する企業です。
              </p>
            </div>
          </div>
        </section>

        {/* News Section */}
        <section className="py-24 md:py-32 bg-white">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
                  NEWS
                </h2>
                <div className="w-20 h-1 bg-black"></div>
              </div>
              <a href="/news" className="text-sm font-medium text-black hover:opacity-70 transition-opacity">
                View All →
              </a>
            </div>

            <div className="space-y-6">
              {[
                { date: '2024.01.15', category: 'お知らせ', title: '新サービスをリリースしました' },
                { date: '2024.01.10', category: 'プレスリリース', title: '資金調達に関するお知らせ' },
                { date: '2024.01.05', category: 'イベント', title: 'オンラインセミナー開催のお知らせ' }
              ].map((news, index) => (
                <a key={index} href="#" className="flex items-center gap-6 p-6 bg-white rounded-lg hover:shadow-md transition-shadow">
                  <div className="text-sm text-gray-500 whitespace-nowrap">
                    {news.date}
                  </div>
                  <div className="px-4 py-1 bg-black text-white text-xs font-medium rounded whitespace-nowrap">
                    {news.category}
                  </div>
                  <div className="text-lg font-medium text-black flex-1">
                    {news.title}
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M9 5l7 7-7 7"></path>
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-24 md:py-32 bg-gray-50">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="order-1 md:order-2">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
                  VISION
                </h2>
                <div className="w-20 h-1 bg-black mb-8"></div>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  多様性を認め合い、それぞれの強みを活かせる社会。
                  誰もが自分らしく生きられる世界を目指しています。
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  テクノロジーと人の温かさを融合させ、
                  持続可能で包括的なコミュニティを創造します。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Section */}
        <section className="py-24 md:py-32 bg-white">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
                SERVICE
              </h2>
              <div className="w-20 h-1 bg-black mx-auto mb-8"></div>
              <p className="text-lg text-gray-600">
                私たちが提供するサービス
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'コンサルティング',
                  description: '企業や組織のギフテッド人材活用をサポートし、新しい価値創造を実現します。'
                },
                {
                  title: '教育プログラム',
                  description: '個性を伸ばす独自の教育プログラムで、才能の開花をサポートします。'
                },
                {
                  title: 'コミュニティ',
                  description: 'ギフテッドが集まり、交流できる場を提供し、新たなつながりを創出します。'
                }
              ].map((service, index) => (
                <div key={index} className="bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-shadow duration-300">
                  <div className="w-16 h-16 bg-black rounded-full mb-6"></div>
                  <h3 className="text-2xl font-bold mb-4 text-black">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 bg-black text-white">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              一緒に未来を創りませんか？
            </h2>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              私たちと共に、新しい社会の形を実現しましょう。
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a href="/careers" className="px-8 py-4 bg-white text-black font-medium rounded-full hover:bg-gray-100 transition-colors">
                採用情報を見る
              </a>
              <a href="/contact" className="px-8 py-4 border-2 border-white text-white font-medium rounded-full hover:bg-white hover:text-black transition-colors">
                お問い合わせ
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
