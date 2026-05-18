import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex w-full items-center justify-between">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <span className="font-extrabold text-2xl tracking-tighter text-black">
                <span className="bg-brand-green px-2 py-0.5 rounded mr-1 border-2 border-black brutal-shadow">P</span>
                Prowider
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/request-service" className="text-black hover:bg-brand-green border-2 border-transparent hover:border-black hover:brutal-shadow inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold transition-all">
                Submit Lead
              </Link>
              <Link href="/dashboard" className="text-black hover:bg-brand-green border-2 border-transparent hover:border-black hover:brutal-shadow inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold transition-all">
                Dashboard
              </Link>
              <Link href="/test-tools" className="text-black hover:bg-brand-green border-2 border-transparent hover:border-black hover:brutal-shadow inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold transition-all">
                Test Tools
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
