export default function Home() {
  return (
    <>
      {NavBar()}
      {Content()}
    </>
  );
}

function NavBar() {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <a className="btn btn-ghost text-xl">LnkCnt</a>
    </div>
  );
}

function Content() {
  return (
    <div className="m-1% flex flex-col items-center justify-start p-10">
      <div>
        <h1 className="text-6xl font-black">URL Shortener + Click Checker</h1>
      </div>
    </div>
  );
}
