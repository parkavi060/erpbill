import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Client } from '../types'

export const useClientStore = defineStore('clients', () => {
  const clients = ref<Client[]>(JSON.parse(localStorage.getItem('clients') || '[]'))

  const addClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...client,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: Date.now()
    }
    clients.value.push(newClient)
  }

  const updateClient = (id: string, updatedClient: Partial<Client>) => {
    const index = clients.value.findIndex(c => c.id === id)
    if (index !== -1) {
      clients.value[index] = { ...clients.value[index], ...updatedClient }
    }
  }

  const deleteClient = (id: string) => {
    clients.value = clients.value.filter(c => c.id !== id)
  }

  // Persist to localStorage
  watch(clients, (newClients) => {
    localStorage.setItem('clients', JSON.stringify(newClients))
  }, { deep: true })

  return { clients, addClient, updateClient, deleteClient }
})
