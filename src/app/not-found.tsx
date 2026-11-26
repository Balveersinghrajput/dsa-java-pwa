import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
      <p className="text-[64px] leading-none font-extrabold text-primary">404</p>
      <h1 className="mt-4 text-[22px] font-bold">This page doesn&apos;t exist</h1>
      <p className="mt-2 text-muted">The link may be old or mistyped.</p>
      <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 font-semibold text-white">Back to dashboard</Link>
    </div>
  );
}
