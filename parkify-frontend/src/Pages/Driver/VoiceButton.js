import React from 'react';
import './VoiceUI.css';

const VoiceButton = ({ isListening, onClick }) => {
    return (
        <button 
            className={`voice-centered-btn ${isListening ? 'listening' : ''}`} 
            onClick={onClick}
        >
            <span className="material-symbols-outlined">
                {isListening ? 'mic_off' : 'mic'}
            </span>
        </button>
    );
};

export default VoiceButton;
