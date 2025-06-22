import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button
} from '@mui/material';

export default function NoteModal({ open, onClose, onSave, noteToEdit }) {
  const [note, setNote] = useState({ content: '' });

  useEffect(() => {
    if (noteToEdit) setNote(noteToEdit);
    else setNote({ content: '' });
  }, [noteToEdit]);

  const handleSave = () => {
    if (!note.content.trim()) return;
    onSave(note);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{noteToEdit ? 'Editar Nota' : 'Agregar Nota'}</DialogTitle>
      <DialogContent>
        <TextField
          label="Nota"
          value={note.content}
          onChange={e => setNote({ content: e.target.value })}
          multiline
          rows={4}
          fullWidth
          autoFocus
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">{noteToEdit ? 'Actualizar' : 'Agregar'}</Button>
      </DialogActions>
    </Dialog>
  );
}
