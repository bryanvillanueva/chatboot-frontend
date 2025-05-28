import React, { useCallback, useState, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import Navbar from '../components/Navbar';
import {
  Message as MessageIcon,
  Link as LinkIcon,
  Timer as TimerIcon,
  Search as SearchIcon,
  Psychology as PsychologyIcon,
  Help as HelpIcon,
  Send as SendIcon,
  SmartToy as SmartToyIcon,
  Api as ApiIcon,
  Pause as PauseIcon,
  Visibility as VisibilityIcon,
  ContentCopy as ContentCopyIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Save as SaveIcon,
  WhatsApp as WhatsAppIcon,
  Hub as HubIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';

// Definición de tipos de nodos mejorada
const nodeCategories = {
  triggers: {
    name: 'Disparadores',
    color: '#10B981',
    nodes: {
      messageReceived: {
        label: 'Mensaje Recibido',
        description: 'Se activa cuando llega un mensaje',
        icon: <MessageIcon />,
        outputs: ['success']
      },
      webhook: {
        label: 'Webhook',
        description: 'Se activa por webhook externo',
        icon: <LinkIcon />,
        outputs: ['success']
      },
      timer: {
        label: 'Temporizador',
        description: 'Se activa después de un tiempo',
        icon: <TimerIcon />,
        outputs: ['success']
      }
    }
  },
  conditions: {
    name: 'Condiciones',
    color: '#F59E0B',
    nodes: {
      textContains: {
        label: 'Contiene Texto',
        description: 'Verifica si el mensaje contiene texto específico',
        icon: <SearchIcon />,
        outputs: ['yes', 'no']
      },
      aiClassification: {
        label: 'Clasificación IA',
        description: 'Clasifica el mensaje usando IA',
        icon: <PsychologyIcon />,
        outputs: ['positive', 'negative', 'neutral']
      },
      userInput: {
        label: 'Entrada de Usuario',
        description: 'Espera una respuesta específica del usuario',
        icon: <HelpIcon />,
        outputs: ['valid', 'invalid']
      }
    }
  },
  actions: {
    name: 'Acciones',
    color: '#3B82F6',
    nodes: {
      sendMessage: {
        label: 'Enviar Mensaje',
        description: 'Envía un mensaje al usuario',
        icon: <SendIcon />,
        outputs: ['success', 'error']
      },
      aiResponse: {
        label: 'Respuesta IA',
        description: 'Genera respuesta usando IA',
        icon: <SmartToyIcon />,
        outputs: ['success', 'error']
      },
      apiCall: {
        label: 'Llamada API',
        description: 'Realiza una llamada a API externa',
        icon: <ApiIcon />,
        outputs: ['success', 'error']
      },
      wait: {
        label: 'Esperar',
        description: 'Pausa la ejecución por un tiempo',
        icon: <PauseIcon />,
        outputs: ['success']
      }
    }
  }
};

// Componente de nodo personalizado
const CustomNode = ({ data, selected }) => {
  const nodeInfo = nodeCategories[data.category]?.nodes[data.type];
  const categoryInfo = nodeCategories[data.category];
  
  const outputs = nodeInfo?.outputs || ['success'];
  const hasMultipleOutputs = outputs.length > 1;

  return (
    <div 
      style={{
        minWidth: '200px',
        backgroundColor: 'white',
        border: selected ? '2px solid #003491' : '2px solid rgba(0, 52, 145, 0.2)',
        borderRadius: '12px',
        boxShadow: selected 
          ? '0 8px 32px rgba(0, 52, 145, 0.3)' 
          : '0 4px 16px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      {/* Header del nodo */}
      <div 
        style={{
          background: `linear-gradient(135deg, ${categoryInfo?.color || '#666'} 0%, ${categoryInfo?.color || '#666'}CC 100%)`,
          color: 'white',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderTopLeftRadius: '10px',
          borderTopRightRadius: '10px'
        }}
      >
        <span style={{ fontSize: '16px' }}>{nodeInfo?.icon}</span>
        <span style={{ fontSize: '14px', fontWeight: '600' }}>{data.label}</span>
      </div>

      {/* Contenido del nodo */}
      <div style={{ padding: '16px' }}>
        <p style={{ 
          fontSize: '12px', 
          color: '#6B7280', 
          marginBottom: '12px',
          margin: '0 0 12px 0'
        }}>
          {nodeInfo?.description}
        </p>
        
        {/* Configuración específica según el tipo */}
        {data.type === 'textContains' && (
          <input
            type="text"
            placeholder="Texto a buscar..."
            value={data.config?.searchText || ''}
            onChange={(e) => {
              data.onConfigChange?.({ ...data.config, searchText: e.target.value });
            }}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              fontSize: '12px',
              marginBottom: '8px',
              boxSizing: 'border-box'
            }}
          />
        )}
        
        {data.type === 'sendMessage' && (
          <textarea
            placeholder="Mensaje a enviar..."
            value={data.config?.message || ''}
            onChange={(e) => {
              data.onConfigChange?.({ ...data.config, message: e.target.value });
            }}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              fontSize: '12px',
              marginBottom: '8px',
              resize: 'none',
              minHeight: '60px',
              boxSizing: 'border-box'
            }}
            rows={3}
          />
        )}
        
        {data.type === 'wait' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <input
              type="number"
              placeholder="5"
              value={data.config?.seconds || ''}
              onChange={(e) => {
                data.onConfigChange?.({ ...data.config, seconds: e.target.value });
              }}
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '12px',
                boxSizing: 'border-box'
              }}
            />
            <span style={{ fontSize: '12px', color: '#6B7280' }}>seg</span>
          </div>
        )}

        {data.type === 'aiClassification' && (
          <textarea
            placeholder="Prompt de clasificación..."
            value={data.config?.prompt || ''}
            onChange={(e) => {
              data.onConfigChange?.({ ...data.config, prompt: e.target.value });
            }}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              fontSize: '12px',
              marginBottom: '8px',
              resize: 'none',
              minHeight: '50px',
              boxSizing: 'border-box'
            }}
            rows={2}
          />
        )}

        {/* Estado del nodo */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: '8px' 
        }}>
          <span 
            style={{
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '500',
              backgroundColor: `${categoryInfo?.color}20`,
              color: categoryInfo?.color
            }}
          >
            {data.category}
          </span>
          <span 
            style={{
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '500',
              backgroundColor: data.enabled !== false ? '#DEF7EC' : '#F3F4F6',
              color: data.enabled !== false ? '#065F46' : '#6B7280'
            }}
          >
            {data.enabled !== false ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* Handles de entrada y salida */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 12,
          height: 12,
          backgroundColor: '#9CA3AF',
          border: '2px solid white',
          left: -6
        }}
      />
      
      {/* Múltiples handles de salida para nodos condicionales */}
      {hasMultipleOutputs ? (
        outputs.map((output, index) => (
          <Handle
            key={output}
            type="source"
            position={Position.Right}
            id={output}
            style={{
              width: 12,
              height: 12,
              backgroundColor: output === 'yes' || output === 'positive' || output === 'success' || output === 'valid' 
                ? '#10B981' 
                : output === 'no' || output === 'negative' || output === 'invalid'
                ? '#EF4444'
                : '#F59E0B',
              border: '2px solid white',
              right: -6,
              top: `${30 + (index * 25)}%`
            }}
          />
        ))
      ) : (
        <Handle
          type="source"
          position={Position.Right}
          style={{
            width: 12,
            height: 12,
            backgroundColor: '#10B981',
            border: '2px solid white',
            right: -6
          }}
        />
      )}
      
      {/* Etiquetas para múltiples salidas */}
      {hasMultipleOutputs && (
        <div style={{ position: 'absolute', right: '-50px', top: '20px' }}>
          {outputs.map((output, index) => (
            <div
              key={output}
              style={{
                fontSize: '11px',
                color: '#6B7280',
                textTransform: 'capitalize',
                marginTop: `${index * 24}px`
              }}
            >
              {output}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Sidebar mejorado
function EnhancedSidebar({ onAddNode }) {
  const [expandedCategory, setExpandedCategory] = useState('triggers');

  return (
    <div style={{
      width: '320px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#FAFBFC',
      borderRight: '1px solid #E5E7EB'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid #E5E7EB',
        backgroundColor: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '24px' }}>🌳</span>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#003491',
            margin: 0
          }}>
            Paleta de Nodos
          </h2>
        </div>
        <p style={{
          fontSize: '14px',
          color: '#6B7280',
          margin: 0
        }}>
          Arrastra o haz clic para agregar nodos
        </p>
      </div>

      {/* Categorías de nodos */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }}>
        {Object.entries(nodeCategories).map(([categoryKey, category]) => (
          <div key={categoryKey} style={{ marginBottom: '16px' }}>
            <button
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: expandedCategory === categoryKey ? '#F3F4F6' : '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setExpandedCategory(expandedCategory === categoryKey ? '' : categoryKey)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div 
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: category.color
                  }}
                />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  {category.name}
                </span>
              </div>
              <span style={{
                transform: expandedCategory === categoryKey ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                fontSize: '16px',
                color: '#6B7280'
              }}>
                ⌄
              </span>
            </button>
            
            {expandedCategory === categoryKey && (
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(category.nodes).map(([nodeKey, node]) => (
                  <button
                    key={nodeKey}
                    onClick={() => onAddNode(categoryKey, nodeKey)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${category.color}40`,
                      borderRadius: '12px',
                      backgroundColor: 'white',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      color: category.color
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = category.color;
                      e.target.style.backgroundColor = `${category.color}08`;
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = `${category.color}40`;
                      e.target.style.backgroundColor = 'white';
                      e.target.style.transform = 'translateY(0px)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '16px' }}>{node.icon}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{node.label}</span>
                    </div>
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#6B7280', 
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {node.description}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Panel de propiedades mejorado
function PropertiesPanel({ node, onChange, onDelete }) {
  if (!node) {
    return (
      <div style={{
        width: '320px',
        padding: '48px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FAFBFC',
        borderLeft: '1px solid #E5E7EB'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>👁️</div>
        <p style={{
          color: '#6B7280',
          textAlign: 'center',
          fontSize: '14px',
          lineHeight: '1.5',
          margin: 0
        }}>
          Selecciona un nodo para ver y editar sus propiedades
        </p>
      </div>
    );
  }

  const nodeInfo = nodeCategories[node.data.category]?.nodes[node.data.type];
  const categoryInfo = nodeCategories[node.data.category];

  return (
    <div style={{
      width: '320px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#FAFBFC',
      borderLeft: '1px solid #E5E7EB'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid #E5E7EB',
        backgroundColor: `${categoryInfo?.color}08`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: `${categoryInfo?.color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '20px' }}>{nodeInfo?.icon}</span>
          </div>
          <div>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              margin: '0 0 4px 0',
              color: '#111827'
            }}>
              {node.data.label}
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6B7280', 
              margin: 0 
            }}>
              {categoryInfo?.name}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{
            padding: '6px 12px',
            backgroundColor: '#DBEAFE',
            color: '#1E40AF',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <ContentCopyIcon fontSize="small" /> Duplicar
          </button>
          <button 
            onClick={onDelete}
            style={{
              padding: '6px 12px',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <DeleteIcon fontSize="small" /> Eliminar
          </button>
        </div>
      </div>

      {/* Propiedades */}
      <div style={{
        flex: 1,
        padding: '24px',
        overflowY: 'auto'
      }}>
        {/* Configuración básica */}
        <div style={{ marginBottom: '32px' }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#111827'
          }}>
            Configuración General
          </h4>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Nombre del nodo
            </label>
            <input
              type="text"
              value={node.data.label}
              onChange={(e) => onChange({ ...node, data: { ...node.data, label: e.target.value } })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="enabled"
              checked={node.data.enabled !== false}
              onChange={(e) => onChange({ ...node, data: { ...node.data, enabled: e.target.checked } })}
              style={{ width: '16px', height: '16px' }}
            />
            <label htmlFor="enabled" style={{ fontSize: '14px', color: '#374151' }}>
              Nodo activo
            </label>
          </div>
        </div>

        <div style={{
          height: '1px',
          backgroundColor: '#E5E7EB',
          margin: '24px 0'
        }} />

        {/* Configuración específica del nodo */}
        <div style={{ marginBottom: '32px' }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#111827'
          }}>
            Configuración Específica
          </h4>

          {node.data.type === 'textContains' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Texto a buscar
                </label>
                <input
                  type="text"
                  value={node.data.config?.searchText || ''}
                  onChange={(e) => {
                    const newConfig = { ...node.data.config, searchText: e.target.value };
                    onChange({ ...node, data: { ...node.data, config: newConfig } });
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="caseSensitive" style={{ width: '16px', height: '16px' }} />
                <label htmlFor="caseSensitive" style={{ fontSize: '14px', color: '#374151' }}>
                  Distinguir mayúsculas/minúsculas
                </label>
              </div>
            </div>
          )}

          {node.data.type === 'sendMessage' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Mensaje
                </label>
                <textarea
                  rows={4}
                  value={node.data.config?.message || ''}
                  onChange={(e) => {
                    const newConfig = { ...node.data.config, message: e.target.value };
                    onChange({ ...node, data: { ...node.data, config: newConfig } });
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Tipo de mensaje
                </label>
                <select
                  value={node.data.config?.messageType || 'text'}
                  onChange={(e) => {
                    const newConfig = { ...node.data.config, messageType: e.target.value };
                    onChange({ ...node, data: { ...node.data, config: newConfig } });
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="text">Texto</option>
                  <option value="image">Imagen</option>
                  <option value="document">Documento</option>
                </select>
              </div>
            </div>
          )}

          {node.data.type === 'wait' && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Tiempo de espera (segundos)
              </label>
              <input
                type="number"
                value={node.data.config?.seconds || ''}
                onChange={(e) => {
                  const newConfig = { ...node.data.config, seconds: e.target.value };
                  onChange({ ...node, data: { ...node.data, config: newConfig } });
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          {node.data.type === 'aiClassification' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Prompt de clasificación
                </label>
                <textarea
                  rows={3}
                  value={node.data.config?.prompt || ''}
                  onChange={(e) => {
                    const newConfig = { ...node.data.config, prompt: e.target.value };
                    onChange({ ...node, data: { ...node.data, config: newConfig } });
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Modelo IA
                </label>
                <select
                  value={node.data.config?.model || 'gpt-3.5-turbo'}
                  onChange={(e) => {
                    const newConfig = { ...node.data.config, model: e.target.value };
                    onChange({ ...node, data: { ...node.data, config: newConfig } });
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="claude-3">Claude 3</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div style={{
          height: '1px',
          backgroundColor: '#E5E7EB',
          margin: '24px 0'
        }} />

        {/* Información del nodo */}
        <div>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#111827'
          }}>
            Información
          </h4>
          <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>ID:</strong> {node.id}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Tipo:</strong> {nodeInfo?.label}
            </div>
            <div>
              <strong>Salidas:</strong> {nodeInfo?.outputs?.join(', ') || 'success'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const EnhancedFlowBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [flowName, setFlowName] = useState('Mi Flujo de Chatbot');

  // Definir tipos de nodos personalizados
  const nodeTypes = useMemo(() => ({ customNode: CustomNode }), []);

  const onConnect = useCallback((params) => {
    const edge = {
      ...params,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { 
        strokeWidth: 2,
        stroke: '#003491'
      }
    };
    setEdges((eds) => addEdge(edge, eds));
  }, [setEdges]);

  const handleAddNode = (category, type) => {
    const id = `${category}_${type}_${Date.now()}`;
    const nodeInfo = nodeCategories[category]?.nodes[type];
    
    const newNode = {
      id,
      type: 'customNode',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: { 
        label: nodeInfo?.label || 'Nuevo Nodo',
        category,
        type,
        config: {},
        enabled: true,
        onConfigChange: (newConfig) => {
          setNodes((nds) => nds.map((n) => 
            n.id === id ? { ...n, data: { ...n.data, config: newConfig } } : n
          ));
        }
      }
    };
    
    setNodes((nds) => [...nds, newNode]);
  };

  const handleNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  const handleNodeChange = (updatedNode) => {
    setNodes((nds) => nds.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
    setSelectedNode(updatedNode);
  };

  const handleDeleteNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  const handleSaveFlow = () => {
    const flowData = {
      name: flowName,
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.data.type,
        category: node.data.category,
        label: node.data.label,
        config: node.data.config,
        position: node.position,
        enabled: node.data.enabled
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle
      }))
    };
    console.log('Guardando flujo:', flowData);
    alert('Flujo guardado exitosamente! (Ver consola para detalles)');
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#F9FAFB',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <Navbar pageTitle="Constructor de Flujos" />
      
      {/* Header con controles */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #E5E7EB',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '64px',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <input
            type="text"
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#003491',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              minWidth: '200px'
            }}
          />
          <span style={{
            padding: '4px 12px',
            backgroundColor: '#DBEAFE',
            color: '#1E40AF',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {nodes.length} nodos
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{
            padding: '8px 16px',
            border: '1px solid #003491',
            color: '#003491',
            backgroundColor: 'white',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}>
            <PlayArrowIcon /> Probar
          </button>
          <button
            onClick={handleSaveFlow}
            style={{
              padding: '8px 16px',
              backgroundColor: '#003491',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <SaveIcon /> Guardar Flujo
          </button>
        </div>
      </div>

      {/* Cuerpo principal */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <EnhancedSidebar onAddNode={handleAddNode} />

        {/* Área del flujo */}
        <div style={{ flex: 1, position: 'relative', backgroundColor: '#FFFFFF' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              markerEnd: { type: MarkerType.ArrowClosed }
            }}
          >
            <Background 
              gap={20} 
              size={1} 
              color="#E5E7EB" 
            />
            <Controls style={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }} />
            <MiniMap 
              nodeColor={(node) => {
                const category = node.data?.category;
                return nodeCategories[category]?.color || '#9CA3AF';
              }}
              style={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
          </ReactFlow>
          
          {/* Estado vacío */}
          {nodes.length === 0 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 10
            }}>
             
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>
                Comienza construyendo tu flujo
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#6B7280',
                margin: 0,
                maxWidth: '300px'
              }}>
                Selecciona nodos del panel izquierdo para crear tu chatbot inteligente
              </p>
            </div>
          )}
        </div>

        {/* Panel de propiedades */}
        <PropertiesPanel 
          node={selectedNode} 
          onChange={handleNodeChange}
          onDelete={handleDeleteNode}
        />
      </div>

      {/* Footer con integraciones */}
      <div style={{
        backgroundColor: '#F0F9FF',
        padding: '12px 24px',
        borderTop: '1px solid #E0E7FF'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px'
        }}>
          <span style={{ 
            fontSize: '14px', 
            color: '#6B7280',
            fontWeight: '500'
          }}>
            Integrado con:
          </span>
          <span style={{
            padding: '4px 12px',
            backgroundColor: '#DEF7EC',
            color: '#065F46',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <WhatsAppIcon fontSize="small" /> WhatsApp Business API
          </span>
          <span style={{
            padding: '4px 12px',
            backgroundColor: '#DBEAFE',
            color: '#1E40AF',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <HubIcon fontSize="small" /> Make (Integromat)
          </span>
          <span style={{
            padding: '4px 12px',
            backgroundColor: '#F3E8FF',
            color: '#7C3AED',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <AutoAwesomeIcon fontSize="small" /> OpenAI GPT
          </span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedFlowBuilder;