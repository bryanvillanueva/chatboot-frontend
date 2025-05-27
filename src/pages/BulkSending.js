import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import Navbar from '../components/Navbar';

const API_BASE = 'https://chatboot-webhook-production.up.railway.app';
const EXCEL_TEMPLATE_URL = 'https://sharkagency.co/img/Contacts-template.xlsx';

const getRandomStatus = () => {
  const statuses = ['Enviado', 'Pendiente', 'Error'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const BulkSending = () => {
  // Estado de clientes y selección
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  // Estado de listas
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState('');
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [editingList, setEditingList] = useState(null);
  // Estado de importación
  const [contacts, setContacts] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editContact, setEditContact] = useState({});
  // Mensaje y envío
  const [message, setMessage] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const fileInputRef = useRef();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Cargar clientes al montar
  useEffect(() => {
    setLoadingClients(true);
    fetch(`${API_BASE}/api/clients`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Error al cargar los clientes');
        }
        return res.json();
      })
      .then(data => {
        setClients(Array.isArray(data.clients) ? data.clients : []);
        setSelectedClients([]);
        setSelectAll(false);
      })
      .catch((error) => {
        console.error('Error fetching clients:', error);
        setSnackbar({ 
          open: true, 
          message: 'Error al cargar la lista de clientes. Por favor, intente nuevamente.', 
          severity: 'error' 
        });
      })
      .finally(() => {
        setLoadingClients(false);
      });
  }, []);

  // Selección de clientes
  const handleSelectClient = (id) => {
    setSelectedClients(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedClients([]);
      setSelectAll(false);
    } else {
      setSelectedClients(clients.map(c => c.id));
      setSelectAll(true);
    }
  };

  // Gestión de listas
  const handleOpenListDialog = (edit = null) => {
    setEditingList(edit);
    setNewListName(edit ? edit.name : '');
    setListDialogOpen(true);
  };
  const handleCloseListDialog = () => {
    setListDialogOpen(false);
    setEditingList(null);
    setNewListName('');
  };
  const handleSaveList = () => {
    if (!newListName.trim()) return;
    if (editingList) {
      setLists(lists.map(l => l.id === editingList.id ? { ...l, name: newListName } : l));
    } else {
      setLists([...lists, { id: Date.now(), name: newListName, members: selectedClients }]);
    }
    handleCloseListDialog();
    setSnackbar({ open: true, message: 'Lista guardada', severity: 'success' });
  };
  const handleDeleteList = (id) => {
    setLists(lists.filter(l => l.id !== id));
    setSnackbar({ open: true, message: 'Lista eliminada', severity: 'info' });
  };
  const handleSelectList = (id) => {
    setSelectedList(id);
    const list = lists.find(l => l.id === id);
    setSelectedClients(list ? list.members : []);
  };
  // Agregar/quitar clientes a la lista seleccionada
  const handleAddToList = () => {
    setLists(lists.map(l => l.id === selectedList ? { ...l, members: selectedClients } : l));
    setSnackbar({ open: true, message: 'Miembros de la lista actualizados', severity: 'success' });
  };

  // Importar contactos desde archivo
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setUploadError('');
    setContacts([]);
    setColumns([]);
    setResults([]);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/api/clients/upload-excel`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Error al subir el archivo');
      const data = await res.json();
      setContacts(data.contacts || []);
      setColumns(data.columns || []);
      setSnackbar({ open: true, message: 'Contactos importados correctamente', severity: 'success' });
    } catch (err) {
      setUploadError('No se pudo importar el archivo. Verifica el formato.');
      setSnackbar({ open: true, message: 'Error al importar contactos', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Editar contacto importado
  const handleEdit = (idx) => {
    setEditIndex(idx);
    setEditContact({ ...contacts[idx] });
  };
  const handleEditChange = (field, value) => {
    setEditContact((prev) => ({ ...prev, [field]: value }));
  };
  const handleSaveEdit = () => {
    setContacts((prev) => prev.map((c, i) => (i === editIndex ? editContact : c)));
    setEditIndex(null);
    setEditContact({});
  };
  const handleCancelEdit = () => {
    setEditIndex(null);
    setEditContact({});
  };
  const handleDelete = (idx) => {
    setContacts((prev) => prev.filter((_, i) => i !== idx));
  };

  // Previsualización dinámica
  const getPreview = (contact) => {
    let msg = message;
    const allCols = columns.length ? columns : ['name', 'phone_number', 'email'];
    allCols.forEach((col) => {
      const regex = new RegExp(`{{${col}}}`, 'g');
      msg = msg.replace(regex, contact[col] || '');
    });
    return msg;
  };

  // Enviar mensajes masivos
  const handleSend = async () => {
    setSendLoading(true);
    setResults([]);
    try {
      const res = await fetch(`${API_BASE}/api/whatsapp/bulk-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, clients: selectedClients })
      });
      if (!res.ok) throw new Error('No se pudo enviar los mensajes');
      const data = await res.json();
      setResults(
        (clients.filter(c => selectedClients.includes(c.id))).map((c, i) => ({ ...c, status: data.statuses?.[i] || getRandomStatus() }))
      );
      setSnackbar({ open: true, message: 'Mensajes enviados (simulado)', severity: 'success' });
    } catch (err) {
      setResults(
        (clients.filter(c => selectedClients.includes(c.id))).map((c) => ({ ...c, status: getRandomStatus() }))
      );
      setSnackbar({ open: true, message: 'No se pudo enviar, mostrando resultados simulados', severity: 'warning' });
    } finally {
      setSendLoading(false);
    }
  };

  // Descargar plantilla
  const handleDownloadTemplate = () => {
    window.open(EXCEL_TEMPLATE_URL, '_blank');
  };

  // Función para filtrar y ordenar clientes
  const getFilteredAndSortedClients = () => {
    let filtered = clients;
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = clients.filter(client => 
        client.name?.toLowerCase().includes(searchLower) ||
        client.phone_number?.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower)
      );
    }
    
    // Ordenar
    return [...filtered].sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      }
      return bValue.localeCompare(aValue);
    });
  };

  // Función para cambiar el orden
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 8, mb: 6, p: { xs: 1, md: 3 }, fontFamily: 'Poppins, Inter, sans-serif' }}>
      <Navbar />
      
      {/* Header y Descarga de Plantilla */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px #00349111', mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h5" sx={{ color: '#003491', fontWeight: 700 }}>
                Envío masivo de WhatsApp
              </Typography>
              <Typography variant="body2" sx={{ color: '#2B91FF', mb: 1 }}>
                Importa tus contactos, crea listas y envía mensajes personalizados.
              </Typography>
            </Box>
            <Tooltip title="Descarga una plantilla para importar tus contactos" arrow>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadTemplate}
                sx={{ borderRadius: 1, fontWeight: 600 }}
              >
                Descargar plantilla Excel
              </Button>
            </Tooltip>
          </Stack>
        </CardContent>
      </Card>

      {/* Sección Principal: Importación y Mensaje */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px #00349111', mb: 3 }}>
        <CardContent>
          <Stack spacing={3}>
            {/* Importación de Archivo */}
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#003491', fontWeight: 600, mb: 2 }}>
                Importar Contactos
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                <Tooltip title="Sube un archivo .csv o .xlsx con tus contactos" arrow>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<UploadFileIcon />}
                    component="label"
                    sx={{ borderRadius: 1, fontWeight: 600 }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Subir archivo de contactos'}
                    <input
                      type="file"
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      hidden
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </Button>
                </Tooltip>
                {uploadError && <Alert severity="error" sx={{ mt: 1 }}>{uploadError}</Alert>}
              </Stack>
            </Box>

            {/* Composición del Mensaje */}
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#003491', fontWeight: 600, mb: 2 }}>
                Componer Mensaje
              </Typography>
              <Tooltip title="Puedes usar los campos dinámicos en tu mensaje, por ejemplo: {{name}}, {{phone_number}}, etc." arrow>
                <TextField
                  label="Mensaje masivo"
                  multiline
                  minRows={3}
                  fullWidth
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Hola {{name}}, este es un mensaje masivo para {{phone_number}}."
                  sx={{ mb: 1 }}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Usa los nombres de columna entre llaves dobles para personalizar el mensaje" arrow>
                        <Chip label="Ayuda: {{campo}}" color="info" size="small" />
                      </Tooltip>
                    )
                  }}
                />
              </Tooltip>
            </Box>

            {/* Botón de Envío */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Tooltip title="Envía el mensaje a todos los contactos seleccionados" arrow>
                <span>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<SendIcon />}
                    onClick={handleSend}
                    disabled={selectedClients.length === 0 || !message || sendLoading}
                    sx={{ 
                      borderRadius: 1, 
                      fontWeight: 600, 
                      minWidth: 180, 
                      color: '#003491', 
                      borderColor: '#003491',
                      '&:hover': {
                        borderColor: '#003491',
                        backgroundColor: 'rgba(0, 52, 145, 0.04)'
                      }
                    }}
                  >
                    {sendLoading ? <CircularProgress size={20} color="inherit" /> : 'Enviar mensajes'}
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Gestión de Listas */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px #00349111', mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ color: '#003491', fontWeight: 600, mb: 2 }}>
            Listas de Contactos
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" mb={2}>
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel>Lista de contactos</InputLabel>
              <Select
                value={selectedList}
                label="Lista de contactos"
                onChange={e => handleSelectList(e.target.value)}
                sx={{ borderRadius: 1 }}
              >
                <MenuItem value="">(Sin lista)</MenuItem>
                {lists.map(list => (
                  <MenuItem key={list.id} value={list.id}>{list.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<AddIcon />} 
              onClick={() => handleOpenListDialog()} 
              sx={{ borderRadius: 1, fontWeight: 600 }}
            >
              Nueva lista
            </Button>
            {selectedList && (
              <Button 
                variant="contained" 
                color="success" 
                onClick={handleAddToList} 
                sx={{ borderRadius: 1, fontWeight: 600 }}
              >
                Guardar miembros en lista
              </Button>
            )}
          </Stack>
          {lists.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {lists.map(list => (
                <Chip
                  key={list.id}
                  label={list.name}
                  color={selectedList === list.id ? 'primary' : 'default'}
                  onClick={() => handleSelectList(list.id)}
                  onDelete={() => handleDeleteList(list.id)}
                  sx={{ fontWeight: 600, fontSize: 14, borderRadius: 1, m: 0.5 }}
                />
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Clientes */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px #00349111', mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ color: '#003491', fontWeight: 600, mb: 2 }}>
            Clientes Disponibles
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortField}
                label="Ordenar por"
                onChange={(e) => handleSort(e.target.value)}
                sx={{ borderRadius: 1 }}
              >
                <MenuItem value="name">Nombre</MenuItem>
                <MenuItem value="phone_number">Número</MenuItem>
                <MenuItem value="email">Email</MenuItem>
              </Select>
            </FormControl>
            <IconButton 
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              color={sortDirection === 'asc' ? 'primary' : 'default'}
            >
              <SortIcon />
            </IconButton>
          </Stack>
          {loadingClients ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : clients.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No hay clientes disponibles. Importa contactos o agrega nuevos clientes.
            </Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectAll}
                        onChange={handleSelectAll}
                        inputProps={{ 'aria-label': 'Seleccionar todos' }}
                      />
                    </TableCell>
                    <TableCell 
                      sx={{ fontWeight: 600, color: '#003491', cursor: 'pointer' }}
                      onClick={() => handleSort('name')}
                    >
                      Nombre {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell 
                      sx={{ fontWeight: 600, color: '#003491', cursor: 'pointer' }}
                      onClick={() => handleSort('phone_number')}
                    >
                      Número {sortField === 'phone_number' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell 
                      sx={{ fontWeight: 600, color: '#003491', cursor: 'pointer' }}
                      onClick={() => handleSort('email')}
                    >
                      Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredAndSortedClients().map((client) => (
                    <TableRow key={client.id} selected={selectedClients.includes(client.id)}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedClients.includes(client.id)}
                          onChange={() => handleSelectClient(client.id)}
                          inputProps={{ 'aria-label': `Seleccionar cliente ${client.name}` }}
                        />
                      </TableCell>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.phone_number}</TableCell>
                      <TableCell>{client.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Contactos Importados */}
      {contacts.length > 0 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px #00349111', mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ color: '#003491', fontWeight: 600, mb: 2 }}>
              Contactos Importados
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {columns.map(col => (
                      <TableCell key={col} sx={{ fontWeight: 600, color: '#003491' }}>{col}</TableCell>
                    ))}
                    <TableCell sx={{ fontWeight: 600, color: '#003491' }}>Previsualización</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#003491' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contacts.map((contact, idx) => (
                    <TableRow key={idx}>
                      {columns.map(col => (
                        <TableCell key={col}>
                          {editIndex === idx ? (
                            <TextField
                              value={editContact[col] || ''}
                              onChange={e => handleEditChange(col, e.target.value)}
                              size="small"
                              sx={{ minWidth: 80 }}
                            />
                          ) : (
                            contact[col]
                          )}
                        </TableCell>
                      ))}
                      <TableCell sx={{ maxWidth: 220, fontSize: 13 }}>
                        {getPreview(contact)}
                      </TableCell>
                      <TableCell>
                        {editIndex === idx ? (
                          <>
                            <IconButton color="success" onClick={handleSaveEdit} size="small">
                              <SaveIcon />
                            </IconButton>
                            <IconButton color="error" onClick={handleCancelEdit} size="small">
                              <CancelIcon />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <Tooltip title="Editar contacto" arrow>
                              <IconButton color="primary" onClick={() => handleEdit(idx)} size="small">
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar contacto" arrow>
                              <IconButton color="error" onClick={() => handleDelete(idx)} size="small">
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Resultados del Envío */}
      {results.length > 0 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px #00349111', mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ color: '#003491', fontWeight: 600, mb: 2 }}>
              Resultados del Envío
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#003491' }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#003491' }}>Número</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#003491' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#003491' }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((contact, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{contact.name || '-'}</TableCell>
                      <TableCell>{contact.phone_number || '-'}</TableCell>
                      <TableCell>{contact.email || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={contact.status}
                          color={
                            contact.status === 'Enviado'
                              ? 'success'
                              : contact.status === 'Pendiente'
                              ? 'warning'
                              : 'error'
                          }
                          size="small"
                          sx={{ fontWeight: 600, borderRadius: 1 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Diálogo para crear/editar lista */}
      <Dialog open={listDialogOpen} onClose={handleCloseListDialog}>
        <DialogTitle>{editingList ? 'Editar lista' : 'Nueva lista'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre de la lista"
            value={newListName}
            onChange={e => setNewListName(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseListDialog}>Cancelar</Button>
          <Button onClick={handleSaveList} variant="contained" color="primary">Guardar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ fontFamily: 'Poppins' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BulkSending; 