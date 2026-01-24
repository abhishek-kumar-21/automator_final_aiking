import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'default', ...props }, ref) => {
    // UPDATED: focus ring to a clearer blue and base text to a dark slate
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
    
    const variants = {
      // Primary blue button
      default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
      // Outline with slate border and blue-tinted hover
      outline: "border border-slate-200 bg-white text-slate-900 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200",
      // Subtle ghost with blue-tinted hover
      ghost: "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
    }
    
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-8 text-base"
    }
    
    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }