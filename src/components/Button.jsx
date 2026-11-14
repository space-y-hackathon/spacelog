const Button = ({ children, onClick, variant = 'secondary', className = '' }) => {
  return (
    <button
      type="button"
      className={`menu-btn menu-btn-${variant} ${className}`.trim()}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button