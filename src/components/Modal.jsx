const Modal = ({ children, onClose }) => (
  <div className="menu-modal-backdrop" onClick={onClose}>
    <section className="menu-modal" onClick={(event) => event.stopPropagation()}>
      <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
      {children}
    </section>
  </div>
)

export default Modal
