import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="relative mx-auto mb-6 h-12 w-12 overflow-hidden rounded-xl">
          <Image
            src="/logo.jpg"
            alt="Accessories World"
            fill
            className="object-cover"
          />
        </div>

        <p className="text-6xl font-extrabold tracking-tight text-brand-primary">
          404
        </p>
        <h1 className="mt-3 text-2xl font-bold text-foreground">
          Page not found
        </h1>
        <p className="mt-2 text-muted-foreground">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>

        <div className="mt-8 flex flex-col flex-wrap gap-3 sm:flex-row sm:justify-center">
          <Button className="gap-2" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
