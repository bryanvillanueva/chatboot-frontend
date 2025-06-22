import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, MenuItem, Box, Typography
} from '@mui/material';

const COLORS = [
  { name: 'Rojo', value: '#FF5A5F' },
  { name: 'Verde', value: '#17BF63' },
  { name: 'Azul', value: '#2B91FF' },
  { name: 'Naranja', value: '#FF9900' },
  { name: 'Gris', value: '#7F8C8D' }
];

export default function TagModal({ open, onClose, onSave, tagToEdit }) {
  const [tag, setTag] = useState({ name: '', color: COLORS[0].value });

  useEffect(() => {
    if (tagToEdit) setTag(tagToEdit);
    else setTag({ name: '', color: COLORS[0].value });
  }, [tagToEdit]);

  const handleChange = (field, value) => setTag(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!tag.name.trim()) return;
    onSave(tag);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{tagToEdit ? 'Editar Etiqueta' : 'Crear Etiqueta'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <TextField
            label="Nombre"
            value={tag.name}
            onChange={e => handleChange('name', e.target.value)}
            fullWidth
            required
            autoFocus
          />
          <TextField
            select
            label="Color"
            value={tag.color}
            onChange={e => handleChange('color', e.target.value)}
            fullWidth
          >
            {COLORS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>
                <Box sx={{ display: 'inline-block', width: 20, height: 20, borderRadius: '50%', mr: 1, background: opt.value, border: '1px solid #eee', verticalAlign: 'middle' }} />
                <Typography sx={{ display: 'inline', verticalAlign: 'middle' }}>{opt.name}</Typography>
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">{tagToEdit ? 'Actualizar' : 'Crear'}</Button>
      </DialogActions>
    </Dialog>
  );
}
