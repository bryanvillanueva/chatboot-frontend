import React, { useRef, useState, useEffect } from 'react';
import { Box, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { keyframes } from '@emotion/react';

const waveAnimation = keyframes`
  0% { height: 10px; }
  50% { height: 20px; }
  100% { height: 10px; }
`;

const CustomAudioPlayer = ({ src, sentAt }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  // Cuando el audio finalice, se detiene la animación
  useEffect(() => {
    const audioEl = audioRef.current;
    if (audioEl) {
      const handleEnded = () => {
        setPlaying(false);
      };
      audioEl.addEventListener('ended', handleEnded);
      return () => {
        audioEl.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: '#f0f2f5',
        borderRadius: '25px',
        width: '350px',
        height: '15px',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      {/* Elemento de audio oculto */}
      <audio ref={audioRef} src={src} controls={false} />

      {/* Botón personalizado de Play/Pausa */}
      <IconButton
        sx={{
          display: 'flex',
          alignItems: 'center',
          top: '15px',
          position: 'relative'
        }}
        onClick={togglePlay}
      >
        {playing ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>

      {/* Animación de líneas simuladas */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          top: '15px',
          position: 'relative'
        }}
      >
        {[...Array(15)].map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 3,
              height: playing ? '10px' : '15px', // Ajusta la altura para simular animación
              bgcolor: 'grey.500',
              mx: 0.5,
              transition: 'height 0.3s',
              animation: playing
                ? `${waveAnimation} 1s ${i * 0.1}s infinite ease-in-out`
                : 'none'
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default CustomAudioPlayer;
