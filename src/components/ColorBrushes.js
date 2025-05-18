import React from 'react';
import '../styles/ColorBrushes.css';

const ColorBrushes = ({ onColorChange }) => {
  const colors = [
    '#000000', // 黑色
    '#FF0000', // 红色
    '#00FF00', // 绿色
    '#0000FF', // 蓝色
    '#FFFF00', // 黄色
    '#FF00FF', // 洋红
    '#00FFFF', // 青色
    '#FFA500', // 橙色
    '#800080', // 紫色
    '#008000', // 深绿色
  ];
  
  return (
    <div className="color-brushes">
      <h2>不同颜色画笔</h2>
      <div className="color-palette">
        {colors.map((color, index) => (
          <div
            key={index}
            className="color-option"
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(color)}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorBrushes; 