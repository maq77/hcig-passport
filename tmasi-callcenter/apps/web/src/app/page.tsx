import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-semibold">TMASI Call Center (local)</h1>
      <p className="mt-4">
        <Link className="underline" href="/demo">
          Open /demo
        </Link>
      </p>
    </main>
  );
}
