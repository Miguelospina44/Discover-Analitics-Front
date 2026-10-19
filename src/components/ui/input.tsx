"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-md border-0 bg-input px-3.5 py-2 text-[0.95rem] font-normal text-foreground outline-none transition-[box-shadow] duration-[var(--dur-fast)] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "aria-invalid:outline-2 aria-invalid:outline-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
