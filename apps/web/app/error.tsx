"use client";

import Link from "next/link";
import { AlertCircle, RotateCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>

        <h1 className="text-2xl font-bold text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 text-muted-foreground">
          We are sorry for the trouble. Please try again or go back to the home
          page.
        </p>

        {error.message && (
          <div className="mt-4 rounded-xl bg-muted/50 border border-border/60 p-4 text-left">
            <p className="text-xs font-mono text-muted-foreground break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col flex-wrap gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} className="gap-2">
            <RotateCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
