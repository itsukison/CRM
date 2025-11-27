import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-[#B1B7C3] selection:bg-[#0052FF] selection:text-white h-10 w-full min-w-0 rounded-xl border-none bg-[#F5F5F7] px-4 py-2 text-base font-mono text-[#0A0B0D] shadow-none transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:ring-2 focus-visible:ring-[#0052FF]",
        "aria-invalid:ring-[#FC401F]/20 aria-invalid:border-[#FC401F]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
