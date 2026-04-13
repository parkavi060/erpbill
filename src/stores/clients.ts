import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Client } from '../types'
import { readJSONStorage, writeJSONStorage } from '../utils/browserStorage'
import api from '../utils/api'
import { useBusinessStore } from './business'

// Store for managing client entities
export const useClientStore = defineStore('clients', () => {
  const businessStore = useBusinessStore()
  const storageKey = `clients_${businessStore.activeBusinessId}`
  const clients = ref<Client[]>(readJSONStorage<Client[]>(storageKey, []))

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients')
      clients.value = response.data.data
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    }
  }

  const addClient = async (client: Omit<Client, 'id' | 'createdAt'>) => {
    try {
      const response = await api.post('/clients', client)
      clients.value.push(response.data.data)
    } catch (error) {
      console.error('Failed to add client:', error)
    }
  }

  const updateClient = async (id: string, updatedClient: Partial<Client>) => {
    try {
      const response = await api.put(`/clients/${id}`, updatedClient)
      const index = clients.value.findIndex(c => (c._id || c.id) === id)
      if (index !== -1) {
        clients.value[index] = response.data.data
      }
    } catch (error) {
      console.error('Failed to update client:', error)
    }
  }

  const deleteClientById = async (id: string) => {
    try {
      await api.delete(`/clients/${id}`)
      clients.value = clients.value.filter(c => (c._id || c.id) !== id)
    } catch (error) {
      console.error('Failed to delete client:', error)
    }
  }

  // We still keep the watch for local caching if needed, 
  // but it's secondary to the API now.
  watch(clients, (newClients) => {
    writeJSONStorage(storageKey, newClients)
  }, { deep: true })

  return { clients, fetchClients, addClient, updateClient, deleteClient: deleteClientById }
})
