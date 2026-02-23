import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-red-500 text-white",
    secondary: "bg-gray-100 text-gray-700",
    destructive: "bg-black text-white",
    outline: "border border-gray-300 text-gray-700",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
