export default function Home() {
  return (
    <html>
      <body>{NavBar()}</body>
    </html>
  );
}

function NavBar() {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <a className="btn btn-ghost text-xl">LnkCnt</a>
    </div>
  );
}
