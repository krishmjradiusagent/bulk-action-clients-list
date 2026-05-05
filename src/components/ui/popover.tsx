import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

function isFigmaCaptureSession() {
  if (typeof window === "undefined") return false;
  return window.location.hash.includes("figmacapture=") || window.location.search.includes("figmacapture=");
}

export function Popover(props: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root modal={!isFigmaCaptureSession()} {...props} />;
}
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;

export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "start", sideOffset = 8, onPointerDownOutside, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      onPointerDownOutside={(event) => {
        if (isFigmaCaptureSession()) {
          event.preventDefault();
          return;
        }

        onPointerDownOutside?.(event);
      }}
      className={[
        "z-50 w-80 rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-xl outline-none",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
