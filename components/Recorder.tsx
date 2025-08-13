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
          className="w-20 h-20 bg-accent-500 hover:bg-accent-600 active:scale-95 rounded-full flex items-center justify-center shadow-lg transition-all duration-150 group"
        >
          <span className="text-white text-2xl group-hover:scale-110 transition-transform">🎤</span>
        </button>
      </div>
      
      {/* Instructions */}
      <div className="space-y-2">
        <p className="text-neutral-900 font-medium">Ready to practice?</p>
        <p className="text-sm text-neutral-600">
          For this demo, upload an audio file to simulate recording.
        </p>
        <div className="text-xs text-neutral-600 space-y-1">
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