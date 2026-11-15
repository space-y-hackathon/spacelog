import audioManager from "../audioManager";
import { SFX } from "../assets/audioRegistry";

const playButtonClick = () => {
    audioManager.playSFX(SFX.buttonClick);
  };

const Modal = ({ children, onClose }) => (
  <div className="menu-modal-backdrop" onClick={onClose}>
    <section className="menu-modal" onClick={(event) => event.stopPropagation()}>
      <button type="button" className="modal-close" onClick={() => {playButtonClick(); onClose();}} aria-label="Close">
        ×
      </button>
      {children}
    </section>
  </div>
)

export default Modal