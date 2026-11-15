const Modal = ({
  children,
  onClose,
  dismissible = true,
  ariaLabel,
}) => (
  <div
    className="menu-modal-backdrop"
    onClick={dismissible ? onClose : undefined}
  >
    <section
      className="menu-modal"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={(event) => event.stopPropagation()}
    >
      {dismissible && (
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      )}
      {children}
    </section>
  </div>
)

export default Modal