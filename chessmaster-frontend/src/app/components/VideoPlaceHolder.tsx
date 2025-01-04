import React, { forwardRef, useState } from "react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa"; // Icons
import "../css/VideoPlaceHolder.css"; // Import the CSS file

interface VideoPlaceHolderProps {
  isMe: boolean;
  onAudioToggle: (enabled: boolean) => void;
  onVideoToggle: (enabled: boolean) => void;
}

const VideoPlaceHolder = forwardRef<HTMLVideoElement, VideoPlaceHolderProps>(
  ({ isMe, onAudioToggle, onVideoToggle }, ref) => {
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);

    const handleAudioToggle = () => {
      const newAudioState = !isAudioEnabled;
      setIsAudioEnabled(newAudioState);
      onAudioToggle(newAudioState);
    };

    const handleVideoToggle = () => {
      const newVideoState = !isVideoEnabled;
      setIsVideoEnabled(newVideoState);
      onVideoToggle(newVideoState);
    };

    return (
      <div className="video-container">
        {/* Video Element */}
        <video
          className="video-element"
          playsInline
          ref={ref}
          autoPlay
          muted={isMe}
        />

        {/* Control Buttons */}
        {isMe && (
          <div className="video-controls">
            {/* Audio Button */}
            <button
              className="control-button"
              onClick={handleAudioToggle}
              aria-label={isAudioEnabled ? "Mute Audio" : "Unmute Audio"}
            >
              {isAudioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
            </button>

            {/* Video Button */}
            <button
              className="control-button"
              onClick={handleVideoToggle}
              aria-label={isVideoEnabled ? "Disable Video" : "Enable Video"}
            >
              {isVideoEnabled ? <FaVideo /> : <FaVideoSlash />}
            </button>
          </div>
        )}
      </div>
    );
  }
);

export default VideoPlaceHolder;
