import React from "react";

const Buttons: React.FC<{
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean; // New prop for active state
}> = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  active = false, // Default to false
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors";

  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline:
      "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
  };

  const sizeClasses = {
    sm: "text-sm px-2 py-1",
    md: "px-4 py-2",
    lg: "text-lg px-6 py-3",
  };

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  // Add active styles
  const activeClasses = active
    ? "bg-blue-700 text-white" // Change background and text color for active state
    : "";

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${activeClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Buttons;