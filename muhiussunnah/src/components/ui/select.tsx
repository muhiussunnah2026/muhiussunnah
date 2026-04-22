"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

const Select = SelectPrimitive.Root

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 text-left", className)}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        // Structure
        "group/select-trigger flex w-fit items-center justify-between gap-2 rounded-xl border py-2 pr-3 pl-3.5 text-sm font-medium whitespace-nowrap outline-none select-none",
        // Resting state — subtle primary tint so it reads as interactive
        "border-primary/20 bg-gradient-to-br from-card via-card to-primary/[0.03] text-foreground shadow-sm shadow-primary/5",
        // Hover — cursor pointer (the user specifically asked for this),
        // lift on hover, stronger border + gentle gradient shift
        "cursor-pointer transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/40 hover:bg-gradient-to-br hover:from-card hover:via-card hover:to-primary/[0.08] hover:shadow-md hover:shadow-primary/15",
        // Focus-visible ring
        "focus-visible:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:shadow-lg focus-visible:shadow-primary/10",
        // Popup-open state — filled primary tint so it mirrors the sidebar's
        // active-item look when the menu is open
        "data-[popup-open]:border-primary/60 data-[popup-open]:bg-gradient-to-br data-[popup-open]:from-primary/10 data-[popup-open]:to-accent/5 data-[popup-open]:shadow-lg data-[popup-open]:shadow-primary/20 data-[popup-open]:-translate-y-[1px]",
        // Chevron rotates when popup opens — small, gold-plated detail
        "[&>svg:last-of-type]:transition-transform [&>svg:last-of-type]:duration-200 data-[popup-open]:[&>svg:last-of-type]:rotate-180",
        // Disabled / invalid
        "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive/60 aria-invalid:ring-4 aria-invalid:ring-destructive/15",
        // Placeholder styling
        "data-placeholder:text-muted-foreground/70",
        // Sizing
        "data-[size=default]:h-11 data-[size=sm]:h-9 data-[size=sm]:rounded-lg",
        // Value slot polish
        "*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5",
        // Dark mode
        "dark:border-primary/25 dark:from-input/30 dark:via-input/30 dark:to-primary/5 dark:hover:border-primary/50 dark:focus-visible:bg-input/60 dark:aria-invalid:border-destructive/50",
        // Icon defaults
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn("relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-xl border border-border/60 bg-popover text-popover-foreground shadow-xl shadow-primary/5 backdrop-blur-xl duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-1.5 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        // Structure + cursor pointer (hand icon on hover — user ask)
        "relative flex w-full cursor-pointer items-center gap-2 rounded-lg py-2 pr-8 pl-2.5 text-sm font-medium outline-hidden select-none",
        // Smooth transition + subtle lift on hover
        "transition-all duration-150 focus:bg-gradient-to-r focus:from-primary/12 focus:to-accent/8 focus:text-foreground focus:shadow-sm focus:shadow-primary/10 focus:translate-x-0.5",
        // Selected state — sidebar-style active indicator: stronger gradient
        // + left-edge rail + primary-colored text weight
        "data-[selected=true]:bg-gradient-to-r data-[selected=true]:from-primary/18 data-[selected=true]:via-primary/10 data-[selected=true]:to-transparent data-[selected=true]:text-primary data-[selected=true]:font-semibold data-[selected=true]:shadow-sm data-[selected=true]:shadow-primary/15",
        "data-[selected=true]:before:absolute data-[selected=true]:before:start-0 data-[selected=true]:before:top-1/2 data-[selected=true]:before:h-5 data-[selected=true]:before:w-[3px] data-[selected=true]:before:-translate-y-1/2 data-[selected=true]:before:rounded-e-full data-[selected=true]:before:bg-gradient-primary data-[selected=true]:before:shadow-[0_0_8px_rgba(124,92,255,0.6)]",
        // Destructive variant text colour
        "not-data-[variant=destructive]:focus:**:text-foreground",
        // Disabled
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        // Icons + last-span polish
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute end-2 flex size-5 items-center justify-center rounded-full bg-gradient-primary text-white shadow-sm shadow-primary/30" />
        }
      >
        <CheckIcon className="pointer-events-none size-3" strokeWidth={3} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronUpIcon
      />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronDownIcon
      />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
