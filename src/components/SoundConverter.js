import React, { useState } from 'react';
import { convertDrawingToSound } from '../utils/soundUtils';
import '../styles/SoundConverter.css';

const SoundConverter = ({ canvasRef }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  
  const handleConvert = async () => {
    if (!canvasRef || !canvasRef.current) return;
    
    try {
      setIsPlaying(true);
      const audioData = await convertDrawingToSound(canvasRef.current);
      
      // 创建可下载的音频URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      const blob = new Blob([audioData], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      
      // 播放声音
      const audio = new Audio(url);
      audio.play();
      
      audio.onended = () => {
        setIsPlaying(false);
      };
    } catch (error) {
      console.error('转换声音时出错:', error);
      setIsPlaying(false);
    }
  };
  
  const handleDownload = () => {
    if (!audioUrl) return;
    
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = 'doodle-sound.wav';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  return (
    <div className="sound-converter">
      <button 
        className="convert-button" 
        onClick={handleConvert}
        disabled={isPlaying}
      >
        {isPlaying ? '正在生成声音...' : '将绘图转换为声音'}
      </button>
      
      {audioUrl && (
        <div className="audio-controls">
          <audio controls src={audioUrl} className="audio-player"></audio>
          <button className="download-button" onClick={handleDownload}>
            下载音频
          </button>
        </div>
      )}
    </div>
  );
};

export default SoundConverter; 