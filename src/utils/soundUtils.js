// 将绘图转换为声音的工具函数

// 使用Web Audio API创建声音
export const convertDrawingToSound = async (canvas) => {
  return new Promise((resolve, reject) => {
    try {
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // 创建音频上下文
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = audioContext.createBuffer(1, canvas.width, audioContext.sampleRate);
      const channelData = audioBuffer.getChannelData(0);
      
      // 将图像数据转换为音频数据
      // 这里使用一个简单的算法，可以根据需要调整
      for (let i = 0; i < canvas.width; i++) {
        let sum = 0;
        
        // 对每一列像素求平均值
        for (let j = 0; j < canvas.height; j++) {
          const pixelIndex = (j * canvas.width + i) * 4;
          const r = data[pixelIndex];
          const g = data[pixelIndex + 1];
          const b = data[pixelIndex + 2];
          const a = data[pixelIndex + 3];
          
          if (a > 0) {  // 只考虑不透明的像素
            // 计算像素亮度
            const brightness = (r + g + b) / (3 * 255);
            sum += brightness;
          }
        }
        
        // 将平均亮度映射到[-1, 1]范围的音频样本
        const avgBrightness = sum / canvas.height;
        channelData[i] = avgBrightness * 2 - 1;
      }
      
      // 创建音频源并播放
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // 创建一个音频处理器来平滑音频
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      
      // 连接节点
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      // 导出为WAV格式
      const offlineContext = new OfflineAudioContext(1, audioBuffer.length, audioContext.sampleRate);
      const offlineSource = offlineContext.createBufferSource();
      offlineSource.buffer = audioBuffer;
      offlineSource.connect(offlineContext.destination);
      offlineSource.start();
      
      offlineContext.startRendering().then((renderedBuffer) => {
        // 将AudioBuffer转换为WAV格式
        const wavData = audioBufferToWav(renderedBuffer);
        resolve(wavData);
      }).catch(err => {
        reject(err);
      });
      
    } catch (error) {
      reject(error);
    }
  });
};

// 将AudioBuffer转换为WAV格式
function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  let result;
  if (numChannels === 2) {
    result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
  } else {
    result = buffer.getChannelData(0);
  }
  
  return encodeWAV(result, format, sampleRate, numChannels, bitDepth);
}

function interleave(leftChannel, rightChannel) {
  const length = leftChannel.length + rightChannel.length;
  const result = new Float32Array(length);
  
  let inputIndex = 0;
  for (let i = 0; i < length;) {
    result[i++] = leftChannel[inputIndex];
    result[i++] = rightChannel[inputIndex];
    inputIndex++;
  }
  
  return result;
}

function encodeWAV(samples, format, sampleRate, numChannels, bitDepth) {
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);
  
  // RIFF标识
  writeString(view, 0, 'RIFF');
  // RIFF块大小
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  // RIFF类型
  writeString(view, 8, 'WAVE');
  // 格式块标识
  writeString(view, 12, 'fmt ');
  // 格式块大小
  view.setUint32(16, 16, true);
  // 音频格式（PCM）
  view.setUint16(20, format, true);
  // 声道数
  view.setUint16(22, numChannels, true);
  // 采样率
  view.setUint32(24, sampleRate, true);
  // 字节率
  view.setUint32(28, sampleRate * blockAlign, true);
  // 块对齐
  view.setUint16(32, blockAlign, true);
  // 每个样本的位数
  view.setUint16(34, bitDepth, true);
  // 数据块标识
  writeString(view, 36, 'data');
  // 数据块大小
  view.setUint32(40, samples.length * bytesPerSample, true);
  
  // 写入PCM样本
  if (bitDepth === 16) {
    floatTo16BitPCM(view, 44, samples);
  } else {
    floatTo8BitPCM(view, 44, samples);
  }
  
  return buffer;
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function floatTo16BitPCM(output, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function floatTo8BitPCM(output, offset, input) {
  for (let i = 0; i < input.length; i++, offset++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    const val = s < 0 ? s * 128 + 128 : s * 127 + 128;
    output.setInt8(offset, val, true);
  }
} 