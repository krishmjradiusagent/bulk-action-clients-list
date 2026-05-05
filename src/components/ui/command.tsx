import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";

export const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={["flex h-full w-full flex-col overflow-hidden rounded-xl bg-transparent", className ?? ""].join(" ")}
    {...props}
  />
));
Command.displayName = "Command";

export const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-border px-3">
    <CommandPrimitive.Input
      ref={ref}
      className={["flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground", className ?? ""].join(" ")}
      {...props}
    />
  </div>
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

export const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={["max-h-[320px] overflow-y-auto overflow-x-hidden p-2", className ?? ""].join(" ")}
    {...props}
  />
));
CommandList.displayName = CommandPrimitive.List.displayName;

export const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className={["py-6 text-center text-sm text-muted-foreground", className ?? ""].join(" ")}
    {...props}
  />
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

export const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={["relative flex cursor-default select-none items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none aria-selected:bg-[rgba(90,95,242,0.08)] aria-selected:text-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50", className ?? ""].join(" ")}
    {...props}
  />
));
CommandItem.displayName = CommandPrimitive.Item.displayName;
