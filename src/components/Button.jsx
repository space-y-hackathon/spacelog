import '../pages/MainMenu.css'

const Button = ({ children, onClick, variant = 'primary' }) => {
  return (
    <button className={`menu-button menu-button-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;