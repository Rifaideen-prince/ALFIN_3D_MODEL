import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'Ctrl + O / ⌘ + O', action: 'Open 3D Model file picker (.obj, .stl)' },
  { key: 'F', action: 'Fit complete model into viewport' },
  { key: 'R', action: 'Reset camera to default isometric view' },
  { key: 'G', action: 'Toggle ground reference grid' },
  { key: 'A', action: 'Toggle XYZ coordinate axes' },
  { key: 'W', action: 'Toggle Wireframe rendering mode' },
  { key: '1', action: 'Isometric view (ISO)' },
  { key: '2', action: 'Front view' },
  { key: '3', action: 'Rear / Back view' },
  { key: '4', action: 'Left-side view' },
  { key: '5', action: 'Right-side view' },
  { key: '6', action: 'Top-down view' },
  { key: '7', action: 'Bottom view' },
  { key: 'Esc', action: 'Close any active panel or dialog' },
];

export const KeyboardShortcutsDialog: React.FC<KeyboardShortcutsDialogProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Keyboard size={18} color="#00BFFF" />
            <span>Keyboard Shortcuts</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '60vh' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SHORTCUTS.map((item) => (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'rgba(21, 27, 36, 0.6)',
                  borderRadius: '4px',
                  border: '1px solid #202B38'
                }}
              >
                <span style={{ fontSize: '12px', color: '#8A96A5' }}>{item.action}</span>
                <kbd
                  style={{
                    background: '#0D1015',
                    border: '1px solid #00BFFF',
                    color: '#00BFFF',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    fontWeight: 600
                  }}
                >
                  {item.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
