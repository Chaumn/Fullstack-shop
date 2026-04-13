import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-3xl font-bold">🛍️ Fullstack Shop</h1>
      <p className="text-gray-500">Lab 3 — NextJS + Express</p>
      <Link
        href="/products"
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
      >
        Xem quản lý sản phẩm →
      </Link>
    </main>
  );
}