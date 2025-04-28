import React from "react";
import classNames from "classnames";
import { X, Info } from "lucide-react";

type BadgeVariant = "success" | "warning" | "error" | "info" | "default";
type BadgeSize = "small" | "medium" | "large";

interface BadgeProps {
  variant?: BadgeVariant;
  children?: React.ReactNode; // Changed from required to optional
  text?: string; // Added to maintain compatibility with CreateAPI
  className?: string;
  onRemove?: () => void; // Added to maintain compatibility with CreateAPI
  onClose?: () => void; // New optional callback for closable badge
  closable?: boolean; // New prop to enable close button
  icon?: React.ReactNode; // New prop for leading icon
  size?: BadgeSize; // New prop for size variants
  tooltip?: string; // New prop for tooltip
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
  default: "bg-gray-100 text-gray-800",
};

const sizeStyles: Record<BadgeSize, string> = {
  small: "px-2 py-0.25 text-xs",
  medium: "px-2.5 py-0.5 text-sm",
  large: "px-3 py-1 text-base",
};

const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  children,
  text,
  className,
  onRemove,
  onClose,
  closable = false,
  icon,
  size = "medium",
  tooltip,
}) => {
  const handleClose = () => {
    if (onRemove) onRemove(); // Maintain compatibility with CreateAPI
    if (onClose) onClose(); // Support new onClose callback
  };

  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full font-medium",
        variantStyles[variant],
        sizeStyles[size],
        { "cursor-pointer": closable || onRemove },
        className
      )}
      title={tooltip} // Adds tooltip on hover
    >
      {icon && <span className="mr-1">{icon}</span>}
      {text || children}
      {(closable || onRemove) && (
        <button
          type="button"
          className="ml-1 -mr-0.5 flex-shrink-0 rounded-full p-0.5 hover:bg-opacity-50 focus:outline-none"
          onClick={handleClose}
        >
          <X size={size === "small" ? 12 : size === "medium" ? 14 : 16} />
        </button>
      )}
    </span>
  );
};

export default Badge;
