import React from "react";

const Card: React.FC<
  React.PropsWithChildren<{ className?: string; onClick?: () => void }>
> = ({ children, className, onClick }) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md w-full ${
        className || ""
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;