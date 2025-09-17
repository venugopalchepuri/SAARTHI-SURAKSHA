import React from "react";
import logo from "../images/saarthi logo.png";

interface LogoProps {
  size?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 32, className }) => {
  return (
    <img
      src={logo}
      alt="Saarthi Suraksha Logo"
      style={{ width: size, height: size }}
      className={className}
    />
  );
};

export default Logo;
