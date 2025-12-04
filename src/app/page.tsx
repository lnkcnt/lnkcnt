/**
 * Main Page.
 * @returns JSX.Element containing NavBar & Content.
 */
export default function Home() {
  return (
    <>
      {NavBar()}
      {Content()}
    </>
  );
}

/**
 * Navigation bar for mainpage.
 * @returns JSX.Element containing div.
 */
function NavBar() {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <a className="btn btn-ghost text-xl">LnkCnt</a>
    </div>
  );
}

// TO-DO: Implement URL Generation Feature
/**
 * Mainpage's content.
 * @returns JSX.Element containing div.
 */
function Content() {
  return (
    <div className="m-1% flex flex-col items-center justify-start p-10">
      <div>
        <h1 className="text-6xl font-black">URL Shortener + Click Checker</h1>
      </div>
      <div className="h-20" />
      <div>
        <input
          type="text"
          placeholder="Enter your URL here..."
          className="input input-xl"
        />
        <button className="btn btn-xl m-5">Shorten!</button>
      </div>
    </div>
  );
}
