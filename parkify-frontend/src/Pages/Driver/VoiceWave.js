import React from 'react';
import './VoiceUI.css';

const VoiceWave = ({ isActive }) => {
    if (!isActive) return null;

    return (
        <div className="va-wave-wrapper">
            <svg className="va-wave-svg" viewBox="0 0 400 60" preserveAspectRatio="none">
                <defs>
                    <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    
                    {/* Using the Accessible Beige palette */}
                    <linearGradient id="gradTheme1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7A8487" />  {/* muted blue-gray */}
                        <stop offset="50%" stopColor="#A88373" /> {/* dusty rose */}
                        <stop offset="100%" stopColor="#7D846C" /> {/* sage green */}
                    </linearGradient>
                    <linearGradient id="gradTheme2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#A88373" />
                        <stop offset="50%" stopColor="#9C8B7A" /> {/* taupe/brown */}
                        <stop offset="100%" stopColor="#7A8487" />
                    </linearGradient>
                    <linearGradient id="gradTheme3" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7D846C" />
                        <stop offset="50%" stopColor="#7A8487" />
                        <stop offset="100%" stopColor="#9C8B7A" />
                    </linearGradient>
                </defs>
                <g filter="url(#soft-glow)">
                    <path className="va-wave-line va-wave-slow" fill="none" stroke="url(#gradTheme1)" strokeWidth="4" opacity="0.8"
                        d="M 0 30 Q 50 10, 100 30 T 200 30 T 300 30 T 400 30 T 500 30 T 600 30" />
                    <path className="va-wave-line va-wave-fast" fill="none" stroke="url(#gradTheme2)" strokeWidth="5" opacity="0.6"
                        d="M 0 30 Q 50 50, 100 30 T 200 30 T 300 30 T 400 30 T 500 30 T 600 30" />
                    <path className="va-wave-line va-wave-med" fill="none" stroke="url(#gradTheme3)" strokeWidth="3" opacity="0.9"
                        d="M 0 30 Q 50 20, 100 30 T 200 30 T 300 30 T 400 30 T 500 30 T 600 30" />
                </g>
            </svg>
        </div>
    );
};

export default VoiceWave;
