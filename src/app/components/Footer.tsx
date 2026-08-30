import { headers } from "next/headers";
import Link from "next/link";

export default async function Footer() {
    const hostname = (await headers()).get("host");
    return (
        <footer className="flex h-full items-center justify-center bg-gray-200 px-4 py-3 text-center text-xs sm:text-sm dark:bg-gray-700 dark:text-white">
            <p>Contact:&nbsp;</p>
            <Link href={`mailto:admin@${hostname}`} className="break-all">
                admin@{hostname}
            </Link>
        </footer>
    );
}
