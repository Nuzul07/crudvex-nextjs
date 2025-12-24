import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-white">
      <main className="flex items-center justify-center min-h-screen w-full py-64 px-6 sm:px-10 lg:px-16 bg-white dark:bg-white sm:items-start">
        <div className="text-center">
          <h1 className="text-xl text-black mb-3">Lanjut ke halaman test dengan menekan tombol di bawah ini</h1>
          <Link href={"/test"}>
            <button className="rounded-xl bg-black text-white py-2 px-6 transition hover:bg-gray-900 active:scale-95 cursor-pointer">
              Beralih
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
