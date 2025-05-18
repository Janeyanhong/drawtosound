import React, { useState } from 'react';
import Canvas from './components/Canvas';
import ColorBrushes from './components/ColorBrushes';
import SoundConverter from './components/SoundConverter';
import './styles/App.css';

function App() {
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [canvasRef, setCanvasRef] = useState(null);
  
  const handleColorChange = (color) => {
    setSelectedColor(color);
  };
  
  const handleCanvasRef = (ref) => {
    setCanvasRef(ref);
  };
  
  return (
    <div className="app">
      <h1>绘图变音频</h1>
      <ColorBrushes onColorChange={handleColorChange} />
      <Canvas 
        selectedColor={selectedColor} 
        onCanvasRef={handleCanvasRef}
      />
      <SoundConverter canvasRef={canvasRef} />
    </div>
  );
}

export default App; 