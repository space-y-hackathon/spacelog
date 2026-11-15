import audioManager from "../audioManager";
import { SFX } from "../assets/audioRegistry";

const playButtonClick = () => {
  audioManager.playSFX(SFX.buttonClick);
};

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
          onClick={() => {
            playButtonClick();
            onClose();
          }}
          aria-label="Close"
        >
          ×
        </button>
      )}
      {children}
    </section>
  </div>
);

export default Modal