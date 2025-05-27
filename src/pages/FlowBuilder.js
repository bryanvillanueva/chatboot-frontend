import React, { useCallback, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Typography,
  Button,
  Card,
  Stack,
  Alert,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Navbar from '../components/Navbar';

const nodeTypes = {
  trigger: {
    label: 'Trigger',
    color: '#2B91FF',
    icon: <ArrowForwardIcon />
  },
  condition: {
    label: 'Condición',
    color: '#FFC107',
    icon: <SettingsIcon />
  },
  action: {
    label: 'Acción',
    color: '#25D366',
    icon: <AddIcon />
  }
};

const initialNodes = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 100, y: 100 },
    data: { label: 'Mensaje recibido', type: 'trigger' }
  }
];
const initialEdges = [];

function Sidebar({ onAddNode }) {
  return (
    <Box sx={{ width: 220, p: 2, height: '100%' }}>
      <Typography variant="h6" sx={{ color: '#003491', fontWeight: 700, mb: 2, fontFamily: 'Poppins' }}>
        Paleta de nodos
      </Typography>
      <Stack spacing={2}>
        {Object.entries(nodeTypes).map(([type, { label, color, icon }]) => (
          <Button
            key={type}
            variant="outlined"
            startIcon={icon}
            sx={{
              borderColor: color,
              color: color,
              fontWeight: 600,
              fontFamily: 'Poppins',
              textTransform: 'none',
              borderRadius: 2
            }}
            onClick={() => onAddNode(type)}
          >
            {label}
          </Button>
        ))}
      </Stack>
    </Box>
  );
}

function NodeDetailPanel({ node, onChange }) {
  if (!node)
    return (
      <Box sx={{ p: 3, color: '#888', fontFamily: 'Poppins' }}>
        Selecciona un nodo para ver detalles.
      </Box>
    );
  return (
    <Box sx={{ width: 300, p: 3, height: '100%' }}>
      <Typography variant="h6" sx={{ color: '#003491', fontWeight: 700, mb: 2, fontFamily: 'Poppins' }}>
        Detalles del nodo
      </Typography>
      <Typography variant="subtitle2" sx={{ color: '#2B91FF', mb: 1, fontFamily: 'Poppins' }}>
        Tipo: {nodeTypes[node.type]?.label || node.type}
      </Typography>
      <input
        style={{
          width: '100%',
          padding: 8,
          borderRadius: 6,
          border: '1px solid #e0e0e0',
          fontFamily: 'Poppins',
          fontSize: 16,
          marginBottom: 12
        }}
        value={node.data.label}
        onChange={e => onChange({ ...node, data: { ...node.data, label: e.target.value } })}
      />
      <Typography variant="caption" sx={{ color: '#888' }}>
        Puedes editar el nombre del nodo aquí.
      </Typography>
    </Box>
  );
}

const FlowBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleAddNode = (type) => {
    const id = (nodes.length + 1).toString();
    const newNode = {
      id,
      type,
      position: { x: 150 + Math.random() * 200, y: 150 + Math.random() * 200 },
      data: { label: nodeTypes[type].label, type }
    };
    setNodes((nds) => [...nds, newNode]);
    // Conectar automáticamente al nodo anterior si existe
    if (nodes.length > 0) {
      setEdges((eds) => [
        ...eds,
        {
          id: `e${nodes[nodes.length - 1].id}-${id}`,
          source: nodes[nodes.length - 1].id,
          target: id,
          type: 'default'
        }
      ]);
    }
  };

  const handleNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  const handleNodeDetailChange = (updatedNode) => {
    setNodes((nds) => nds.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
    setSelectedNode(updatedNode);
  };

  const handleDelete = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        background: '#f7faff',
        fontFamily: 'Poppins',
        overflowX: 'hidden',
        mt: 8,
        maxWidth: '160vh',
        mx: 'auto'
      }}
    >
      <Navbar />
      <Alert
        severity="info"
        sx={{
          mb: 2,
          borderRadius: 2,
          background: '#e3f0ff',
          color: '#003491',
          fontWeight: 500,
          mt: 2
        }}
      >
        Este constructor de flujos es funcional en modo demostración. La integración con WhatsApp Business ya está habilitada para cuentas conectadas.
      </Alert>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: { xs: '60vh', md: '74vh' },
          background: '#fff',
          borderRadius: { xs: '24px', md: '48px' },
          boxShadow: '0 4px 32px #00349111',
          overflow: 'hidden',
          padding: 0,
          flexDirection: 'row',
          flexWrap: 'nowrap'
        }}
      >
        <Sidebar onAddNode={handleAddNode} />
        <Box sx={{ flex: 1, height: { xs: '60vh', md: '80vh' }, minWidth: 0, maxWidth: '100vw', p: 0 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            fitView
            style={{ width: '100%', height: '100%' }}
          >
            <MiniMap nodeColor={n => nodeTypes[n.type]?.color || '#003491'} />
            <Controls />
            <Background gap={16} color="#e0e0e0" />
          </ReactFlow>
        </Box>
        <NodeDetailPanel node={selectedNode} onChange={handleNodeDetailChange} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          disabled
          sx={{
            fontWeight: 600,
            fontFamily: 'Poppins',
            borderRadius: 2,
            px: 4,
            background: '#fff',
            borderColor: '#2B91FF',
            color: '#2B91FF',
            boxShadow: 'none',
            '&:hover': { background: '#f7faff', borderColor: '#003491', color: '#003491' }
          }}
        >
          Guardar flujo
        </Button>
        <Button
          variant="outlined"
          color="error"
          disabled={!selectedNode}
          onClick={handleDelete}
          sx={{ fontWeight: 600, fontFamily: 'Poppins', borderRadius: 2, px: 3 }}
        >
          Eliminar nodo
        </Button>
      </Box>
      <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 5 }}>
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px #00349122', p: 3, background: '#f7faff', mb: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={3}>
            <img
              src="https://registry.npmmirror.com/@lobehub/icons-static-png/1.46.0/files/dark/make-color.png"
              alt="Make"
              style={{ height: 40, marginRight: 16 }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ color: '#003491', fontWeight: 700, fontFamily: 'Poppins' }}>
                Integración con Make (Integromat)
              </Typography>
              <Typography variant="body2" sx={{ color: '#003491', opacity: 0.8, mb: 1 }}>
                Este flujo está conectado con Make (Integromat) para ejecutar automatizaciones externas.
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip label="Make conectado" color="success" sx={{ fontWeight: 600, fontFamily: 'Poppins' }} />
                <Button
                  variant="contained"
                  color="primary"
                  href="https://eu2.make.com/694108/scenarios/3109058"
                  target="_blank"
                  sx={{ fontWeight: 600, fontFamily: 'Poppins', borderRadius: 2, ml: 2 }}
                >
                  Ver integración en Make
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Card>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 2px 12px #00349122',
            p: 3,
            background: '#fafbfc',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: 0.7,
            mb: { xs: 4, md: 6 }
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <img
              src="https://apps4u.com/wp-content/uploads/2024/05/Make-Logo-RGB@2x-1.webp"
              alt="Make"
              style={{ height: 32, marginRight: 8 }}
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/N8n-logo-new.svg/2560px-N8n-logo-new.svg.png"
              alt="n8n"
              style={{ height: 32 }}
            />
          </Stack>
          <Button
            variant="outlined"
            color="inherit"
            disabled
            sx={{ borderRadius: 2, fontWeight: 600, fontFamily: 'Poppins', color: '#888', borderColor: '#e0e0e0', background: '#fff', mb: 1 }}
          >
            Agregar integración
          </Button>
          <Typography variant="caption" sx={{ color: '#bdbdbd', textAlign: 'center', mt: 1 }}>
            Esta funcionalidad estará disponible pronto
          </Typography>
        </Card>
      </Box>
    </Box>
  );
};

export default FlowBuilder;
