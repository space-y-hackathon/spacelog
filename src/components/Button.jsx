import audioManager from "../audioManager";
import { SFX } from "../assets/audioRegistry";

const Button = ({
  children,
  onClick,
  variant = "secondary",
  className = "",
}) => {
  const handleClick = (event) => {
    audioManager.playSFX(SFX.buttonClick);
    onClick?.(event);
  };

  const handleHover = () => {
    audioManager.playSFX(SFX.buttonHover);
  };

  return (
    <button
      type="button"
      className={`menu-btn menu-btn-${variant} ${className}`.trim()}
      onClick={handleClick}
      onMouseEnter={handleHover}
    >
      {children}
    </button>
  );
};

export default Button;