const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

const playSound = (type: OscillatorType, frequency: number, duration: number, volume: number = 0.5) => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
};

export const playLikeSound = () => {
    playSound('triangle', 523.25, 0.1, 0.3); // C5 note
};

export const playFollowSound = () => {
    playSound('sine', 659.25, 0.15, 0.4); // E5 note
    setTimeout(() => playSound('sine', 783.99, 0.15, 0.4), 100); // G5 note
};

export const playNotificationSound = () => {
    playSound('sine', 880, 0.2, 0.5); // A5 note
};
