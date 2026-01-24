import * as React from "react"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => (
  <div
    ref={ref}
    // Changed: bg-white, black text, and a soft blue-ish border/shadow
    className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-100"
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => (
  <div
    ref={ref}
    className="flex flex-col space-y-1.5 p-6"
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ ...props }, ref) => (
  <h3
    ref={ref}
    // Changed: Explicitly set text to slate-900 (near black) for better contrast
    className="text-2xl font-bold leading-none tracking-tight text-slate-900"
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => (
  <div 
    ref={ref} 
    // Changed: Slate-700 gives a professional dark gray/black feel for body text
    className="p-6 pt-0 text-slate-700" 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }