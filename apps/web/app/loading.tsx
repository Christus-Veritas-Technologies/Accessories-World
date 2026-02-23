import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="text-center">
        <div className="relative mx-auto mb-6 h-12 w-12 overflow-hidden rounded-xl animate-pulse">
          <Image
            src="/logo.jpg"
            alt="Loading"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative mx-auto h-10 w-10">
          <div className="absolute inset-0 rounded-full border-[3px] border-muted" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-brand-primary animate-spin" />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
