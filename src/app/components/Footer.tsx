import { headers } from "next/headers";
import Link from "next/link";

export default async function Footer() {
    return (
        <div className="flex h-full items-center justify-center px-4">
            <div className="text-center text-xs sm:text-sm">
                Contact:&nbsp;
                <Link
                    href={"mailto:admin@" + (await headers()).get("host")}
                    className="break-all"
                >
                    admin@{(await headers()).get("host")}
                </Link>
            </div>
        </div>
    );
}
