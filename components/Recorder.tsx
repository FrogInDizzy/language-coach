import { useRef } from 'react';

/**
 * A very minimal audio recorder component.  In a real application you would
 * integrate the MediaRecorder API to capture audio from the microphone.  For
 * this scaffold we simply provide a file input that accepts audio files.
 */
export default function Recorder({ onRecorded }: { onRecorded: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = () => {
    const file = inputRef.current?.files?.[0];
    if (file) {
      onRecorded(file);
    }
  };

  const triggerFileInput = () => {
    inputRef.current?.click();
  };

  return (
    <div className="text-center space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        onChange={handleChange}
        className="hidden"
      />
      
      {/* Main Record Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={triggerFileInput}
          className="w-20 h-20 bg-accent hover:bg-accent/90 active:scale-95 rounded-full flex items-center justify-center shadow-2 transition-all duration-150 group"
        >
          <span className="text-white text-2xl group-hover:scale-110 transition-transform">🎤</span>
        </button>
      </div>
      
      {/* Instructions */}
      <div className="space-y-2">
        <p className="text-ink font-medium">Ready to practice?</p>
        <p className="text-sm text-ink-secondary">
          For this demo, upload an audio file to simulate recording.
        </p>
        <div className="text-xs text-ink-secondary space-y-1">
          <p>💡 <strong>In the full version:</strong> Tap to start recording, speak naturally, then tap again to stop</p>
          <p>📱 Works on mobile and desktop with built-in microphone support</p>
        </div>
      </div>
      
      {/* Alternative Upload Button */}
      <button
        onClick={triggerFileInput}
        className="btn-secondary text-sm !py-2 !px-4"
      >
        📎 Upload Audio File
      </button>
    </div>
  );
}