import Link from "next/link";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "@/src/components/ui/navigation-menu";
import { Button } from "@/src/components/ui/button";
import SkipToContent from "./SkipToContent";

export default function NavBar() {
    return (
        <>
            <SkipToContent />
            <NavigationMenu>
                <NavigationMenuList className="flex w-screen flex-row justify-start p-2 shadow sm:p-3">
                    <NavigationMenuItem>
                        <Button
                            title="Go to the main page."
                            variant="ghost"
                            asChild
                            size="sm"
                            className="text-base sm:text-lg"
                        >
                            <Link href="/">LnkCnt</Link>
                        </Button>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </>
    );
}
