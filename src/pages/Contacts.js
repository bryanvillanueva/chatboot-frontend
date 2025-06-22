import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, IconButton, TextField, Chip, Avatar,
  Tooltip, Stack, Dialog, Snackbar, Alert
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Label as LabelIcon, Note as NoteIcon
} from '@mui/icons-material';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import TagModal from '../modals/tags';
import NoteModal from '../modals/notes';

const API_BASE = 'https://chatboot-webhook-production.up.railway.app';

export default function Contacts() {
  // Estados de contactos
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Estados para modales
  const [openTagModal, setOpenTagModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [selectedContactForTag, setSelectedContactForTag] = useState(null);

  const [openNoteModal, setOpenNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [selectedContactForNote, setSelectedContactForNote] = useState(null);

  // Para crear/editar contactos
  const [openContactModal, setOpenContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactForm, setContactForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    city: '', 
    country: '',
    address: '',
    birthday: ''
  });

  // Fetch contactos
  const loadContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/contacts`);
      const data = await res.json();
      setContacts(Array.isArray(data.contacts) ? data.contacts : []);
    } catch {
      setContacts([]);
      setSnackbar({ open: true, message: 'Error al cargar contactos', severity: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => { loadContacts(); }, []);

  // Filtrado por búsqueda
  useEffect(() => {
    let arr = contacts;
    if (search.trim()) {
      arr = arr.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search)
      );
    }
    setFiltered(arr);
  }, [contacts, search]);

  // CRUD de contacto (ejemplo: crear y editar)
  const handleOpenContactModal = (contact = null) => {
    setEditingContact(contact);
    setContactForm(contact
      ? { 
          name: contact.name || '', 
          email: contact.email || '', 
          phone: contact.phone || '', 
          city: contact.city || '', 
          country: contact.country || '',
          address: contact.address || '',
          birthday: contact.birthday || ''
        }
      : { 
          name: '', 
          email: '', 
          phone: '', 
          city: '', 
          country: '',
          address: '',
          birthday: ''
        });
    setOpenContactModal(true);
  };

  const handleSaveContact = async () => {
    // Validación: debe tener al menos nombre y email, o nombre y teléfono
    if (!contactForm.name.trim()) {
      setSnackbar({ open: true, message: 'El nombre es requerido', severity: 'error' });
      return;
    }
    
    if (!contactForm.email.trim() && !contactForm.phone.trim()) {
      setSnackbar({ open: true, message: 'Debe proporcionar al menos un email o teléfono', severity: 'error' });
      return;
    }

    // Preparar datos para enviar al backend
    const contactData = {
      name: contactForm.name.trim(),
      email: contactForm.email.trim() || null,
      phone: contactForm.phone.trim() || null,
      city: contactForm.city.trim() || null,
      country: contactForm.country.trim() || null,
      address: contactForm.address.trim() || null,
      birthday: contactForm.birthday.trim() || null
    };

    try {
      let res, data;
      if (editingContact) {
        res = await fetch(`${API_BASE}/api/contacts/${editingContact.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactData)
        });
      } else {
        res = await fetch(`${API_BASE}/api/contacts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactData)
        });
      }
      data = await res.json();
      setSnackbar({
        open: true,
        message: editingContact ? 'Contacto actualizado' : 'Contacto creado',
        severity: 'success'
      });
      setOpenContactModal(false);
      loadContacts();
    } catch {
      setSnackbar({ open: true, message: 'Error guardando contacto', severity: 'error' });
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('¿Eliminar contacto?')) return;
    try {
      await fetch(`${API_BASE}/api/contacts/${id}`, { method: 'DELETE' });
      setSnackbar({ open: true, message: 'Contacto eliminado', severity: 'info' });
      loadContacts();
    } catch {
      setSnackbar({ open: true, message: 'Error eliminando', severity: 'error' });
    }
  };

  // Etiquetas y notas (depende de tu modelo, aquí ejemplos para abrir modales)
  const handleEditTags = (contact) => {
    setSelectedContactForTag(contact);
    setEditingTag(null);
    setOpenTagModal(true);
  };

  const handleEditNotes = (contact) => {
    setSelectedContactForNote(contact);
    setEditingNote(null);
    setOpenNoteModal(true);
  };

  // Lógica para guardar etiquetas/notas: llamas a tu API y refrescas
  const handleSaveTag = async (tag) => {
    if (!selectedContactForTag) return;
    // Llama al endpoint para crear/editar tag relacionado a contacto (ajusta según tu backend)
    await fetch(`${API_BASE}/api/contacts/${selectedContactForTag.id}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tag)
    });
    loadContacts();
  };

  const handleSaveNote = async (note) => {
    if (!selectedContactForNote) return;
    await fetch(`${API_BASE}/api/contacts/${selectedContactForNote.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    });
    loadContacts();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: '#f7faff', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>Contactos</Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Buscar contacto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 220 }}
        />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenContactModal()}>Nuevo contacto</Button>
      </Stack>
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 24px #00349111' }}>
        <CardContent>
          {loading ? (
            <Typography>Cargando...</Typography>
          ) : filtered.length === 0 ? (
            <Typography>No hay contactos.</Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Teléfono</TableCell>
                    <TableCell>Etiquetas</TableCell>
                    <TableCell>Notas</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map(contact => (
                    <TableRow key={contact.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar>{contact.name?.charAt(0)?.toUpperCase() || '?'}</Avatar>
                          {contact.name}
                        </Stack>
                      </TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          {(contact.tags || []).map(tag => (
                            <Chip key={tag.id} label={tag.name} size="small" style={{ background: tag.color, color: '#fff' }} />
                          ))}
                          <Tooltip title="Editar etiquetas">
                            <IconButton size="small" onClick={() => handleEditTags(contact)}>
                              <LabelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          {(contact.notes || []).slice(0, 1).map(note => (
                            <Tooltip key={note.id} title={note.content}>
                              <Chip label="Ver" size="small" color="info" />
                            </Tooltip>
                          ))}
                          <Tooltip title="Agregar/Editar nota">
                            <IconButton size="small" onClick={() => handleEditNotes(contact)}>
                              <NoteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton onClick={() => handleOpenContactModal(contact)}><EditIcon /></IconButton>
                          <IconButton onClick={() => handleDeleteContact(contact.id)}><DeleteIcon /></IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Modal para crear/editar contacto */}
      <Dialog open={openContactModal} onClose={() => setOpenContactModal(false)} maxWidth="sm" fullWidth>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {editingContact ? 'Editar contacto' : 'Nuevo contacto'}
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Nombre *"
              value={contactForm.name}
              onChange={e => setContactForm(prev => ({ ...prev, name: e.target.value }))}
              required
              fullWidth
              autoFocus
              helperText="Campo obligatorio"
            />
            <TextField
              label="Email"
              type="email"
              value={contactForm.email}
              onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))}
              fullWidth
              helperText="Obligatorio si no se proporciona teléfono"
            />
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Teléfono
              </Typography>
              <PhoneInput
                international
                defaultCountry="CO"
                value={contactForm.phone}
                onChange={(value) => setContactForm(prev => ({ ...prev, phone: value || '' }))}
                style={{
                  width: '100%',
                  padding: '16.5px 14px',
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontFamily: 'inherit'
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Obligatorio si no se proporciona email
              </Typography>
            </Box>
            <TextField
              label="Ciudad"
              value={contactForm.city}
              onChange={e => setContactForm(prev => ({ ...prev, city: e.target.value }))}
              fullWidth
            />
            <TextField
              label="País"
              value={contactForm.country}
              onChange={e => setContactForm(prev => ({ ...prev, country: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Dirección"
              value={contactForm.address}
              onChange={e => setContactForm(prev => ({ ...prev, address: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Fecha de nacimiento"
              type="date"
              value={contactForm.birthday}
              onChange={e => setContactForm(prev => ({ ...prev, birthday: e.target.value }))}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button 
                variant="contained" 
                onClick={handleSaveContact}
                disabled={!contactForm.name.trim() || (!contactForm.email.trim() && !contactForm.phone.trim())}
              >
                {editingContact ? 'Actualizar' : 'Crear'}
              </Button>
              <Button onClick={() => setOpenContactModal(false)}>Cancelar</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Dialog>

      {/* Modal Etiqueta */}
      <TagModal
        open={openTagModal}
        onClose={() => setOpenTagModal(false)}
        onSave={handleSaveTag}
        tagToEdit={editingTag}
      />

      {/* Modal Nota */}
      <NoteModal
        open={openNoteModal}
        onClose={() => setOpenNoteModal(false)}
        onSave={handleSaveNote}
        noteToEdit={editingNote}
      />

      {/* Snackbar notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
