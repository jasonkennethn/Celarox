import Image from "next/image";
import Link from "next/link";

const products = [
  {
    title: "Celarox LaunchPad",
    description: "Start and establish your business with website creation, landing pages, domain configuration, and more.",
  },
  {
    title: "Celarox Customer",
    description: "Manage customer relationships with sales, CRM, help desk, and live chat.",
  },
  {
    title: "Celarox Ledger",
    description: "Manage your finances with estimates, invoices, expenses, and financial reports.",
  },
  {
    title: "Celarox Workspace",
    description: "Collaborate with your team using projects, tasks, and file management.",
  },
  {
    title: "Celarox Education",
    description: "Deliver learning and training with courses, learning paths, and progress tracking.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Celarox Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-xl font-semibold text-gray-900">Celarox</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#products" className="text-gray-600 hover:text-gray-900 font-medium">
              Products
            </Link>
            <Link href="#why" className="text-gray-600 hover:text-gray-900 font-medium">
              Why Celarox
            </Link>
            <Link href="#contact" className="text-gray-600 hover:text-gray-900 font-medium">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="#contact"
              className="px-5 py-2.5 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Request a Quote
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-gray-900 tracking-tight mb-6">
              One Platform.
              <br />
              Endless Possibilities.
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
              Celarox is a unified business platform that helps organizations launch, manage, and grow from a single connected ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="#contact"
                className="px-8 py-4 bg-gray-900 text-white rounded-full font-medium text-lg hover:bg-gray-800 transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="#products"
                className="px-8 py-4 bg-white text-gray-900 border border-gray-300 rounded-full font-medium text-lg hover:bg-gray-50 transition-colors"
              >
                Explore Products
              </Link>
            </div>
          </div>
        </section>

        <section id="products" className="py-20 md:py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-semibold text-gray-900 tracking-tight mb-4">
                Our Products
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Five core products that work seamlessly together to power your business.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-white font-semibold text-lg">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{product.title}</h3>
                  <p className="text-gray-600">{product.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="why" className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-semibold text-gray-900 tracking-tight mb-4">
                Why Choose Celarox
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Instead of using multiple disconnected tools, get everything you need in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 border border-gray-100">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Unified Experience</h3>
                <p className="text-gray-600 text-lg">
                  One platform, one user experience, one login. No more switching between dozens of apps.
                </p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 border border-gray-100">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Connected Workflows</h3>
                <p className="text-gray-600 text-lg">
                  Data flows seamlessly between products, eliminating manual data entry and errors.
                </p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 border border-gray-100">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Enterprise Security</h3>
                <p className="text-gray-600 text-lg">
                  Built with security and scalability in mind, trusted by organizations of all sizes.
                </p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 border border-gray-100">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Modern Cloud Platform</h3>
                <p className="text-gray-600 text-lg">
                  Always up-to-date, accessible from anywhere, and built for performance.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-20 md:py-32 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Request a personalized quote or book a demo to see Celarox in action.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="#"
                className="px-8 py-4 bg-white text-gray-900 rounded-full font-medium text-lg hover:bg-gray-100 transition-colors"
              >
                Request a Quote
              </Link>
              <Link
                href="#"
                className="px-8 py-4 bg-transparent text-white border border-gray-600 rounded-full font-medium text-lg hover:bg-gray-800 transition-colors"
              >
                Book a Demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Celarox Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-lg font-semibold text-gray-900">Celarox</span>
            </div>
            <p className="text-gray-500">
              © 2026 Celarox. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
