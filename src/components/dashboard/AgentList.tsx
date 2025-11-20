'use client';

import React from 'react';
import styles from './AgentList.module.css';

interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
}

const mockAgents: Agent[] = [
  { id: 'agent1', name: 'Carlos Ruiz', email: 'carlos.ruiz@example.com', role: 'Agente Senior' },
  { id: 'agent2', name: 'Ana Torres', email: 'ana.torres@example.com', role: 'Agente Junior' },
  { id: 'agent3', name: 'Luis Mendoza', email: 'luis.mendoza@example.com', role: 'Supervisor' },
];

export default function AgentList() {
  const handleViewClients = (agentId: string) => {
    alert(`Ver clientes del agente ${agentId}`);
    // In a real application, navigate to agent's client list or open a modal
  };

  const handleEditAgent = (agentId: string) => {
    alert(`Editar agente ${agentId}`);
    // In a real application, open an edit modal for the agent
  };

  return (
    <div className={styles.agentListContainer}>
      <button className={styles.addAgentButton}>Añadir Nuevo Agente</button>
      
      {mockAgents.length === 0 ? (
        <p>No hay agentes registrados.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mockAgents.map(agent => (
              <tr key={agent.id}>
                <td>{agent.name}</td>
                <td>{agent.email}</td>
                <td>{agent.role}</td>
                <td>
                  <button onClick={() => handleViewClients(agent.id)} className={styles.actionButton}>Ver Clientes</button>
                  <button onClick={() => handleEditAgent(agent.id)} className={styles.actionButton}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
