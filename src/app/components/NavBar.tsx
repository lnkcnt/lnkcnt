import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";

export default function NavBar() {
  return (
    // <div className="navbar bg-base-100 shadow-sm">
    //   <Link href="/" className="btn btn-ghost text-xl">
    //     LnkCnt
    //   </Link>
    // </div>
    <NavigationMenu>
      <NavigationMenuList className="flex w-screen flex-row justify-start p-3 shadow">
        <NavigationMenuItem>
          <Button variant="ghost" asChild>
            <Link href="/">LnkCnt</Link>
          </Button>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
