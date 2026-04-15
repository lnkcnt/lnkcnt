import { Button } from "@/src/components/ui/button";

export default function SkipToContent() {
    return (
        <Button
            asChild
            className="sr-only absolute! z-50 rounded-none p-2! focus:not-sr-only"
        >
            <a href="#main-content">Skip to content</a>
        </Button>
    );
}
