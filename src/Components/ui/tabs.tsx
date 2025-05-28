import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

function Tabs({
                className,
                ...props
              }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      className={cn("flex flex-col", className)}
      {...props}
    />
  )
}

function TabsList({
                    className,
                    ...props
                  }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        // outer border & top corners
        "flex border border-border bg-background rounded-t-lg",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
                       className,
                       ...props
                     }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "px-4 py-2 text-sm font-medium text-muted-foreground",
        "border-r border-border last:border-r-0",             // separators between tabs
        "first:rounded-tl-lg last:rounded-tr-lg",             // round only the outer corners
        "hover:bg-muted/30 transition-colors",
        // when active: lift up, hide bottom border so panel connects
        "data-[state=inactive]:bg-muted",
        "data-[state=inactive]:text-foreground",
        "data-[state=inactive]:border-b-transparent",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
                       className,
                       ...props
                     }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(
        // panel look
        "border border-border border-t-0 rounded-b-lg bg-background p-2",
        className,   // ← keep anything the caller sends
        "!-mt-px"    // ← always last and with `!` so it overrides mt-4
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
