import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">PaleTech</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              テクノロジーで取り戻す
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              PaleTechは福岡でAIを活用し、ウェルビーイングな社会を創造する企業です。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white text-sm transition-colors">
                  ABOUT
                </Link>
              </li>
              <li>
                <Link href="/service" className="text-gray-400 hover:text-white text-sm transition-colors">
                  SERVICE
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-gray-400 hover:text-white text-sm transition-colors">
                  NEWS
                </Link>
              </li>
              <li>
                <Link href="/ir" className="text-gray-400 hover:text-white text-sm transition-colors">
                  IR
                </Link>
              </li>
            </ul>
          </div>

          {/* More Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">More</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/careers" className="text-gray-400 hover:text-white text-sm transition-colors">
                  CAREERS
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">
                  CONTACT
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} PaleTech
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                個人情報保護方針
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
