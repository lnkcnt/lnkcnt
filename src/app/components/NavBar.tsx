import Link from "next/link";

export default function NavBar() {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <Link href="/" className="btn btn-ghost text-xl">
        LnkCnt
      </Link>
    </div>
  );
}
