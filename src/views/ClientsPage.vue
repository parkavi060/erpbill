<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClientStore } from '../stores/clients'
import AppTable from '../components/organisms/AppTable.vue'
import AppModal from '../components/organisms/AppModal.vue'
import BaseButton from '../components/atoms/BaseButton.vue'
import BaseInput from '../components/atoms/BaseInput.vue'
import AppIcon from '../components/atoms/AppIcon.vue'

const clientStore = useClientStore()
const showModal = ref(false)
const searchQuery = ref('')

const columns = [
  { key: 'name', label: 'Client Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'gstin', label: 'GSTIN' }
]

const filteredClients = computed(() => {
  if (!searchQuery.value) return clientStore.clients
  return clientStore.clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const newClient = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  gstin: ''
})

const openAddModal = () => {
  newClient.value = { name: '', email: '', phone: '', address: '', gstin: '' }
  showModal.value = true
}

const handleAddClient = () => {
  if (!newClient.value.name) return
  clientStore.addClient(newClient.value)
  showModal.value = false
}

const handleDelete = (id: string) => {
  if (confirm('Are you sure you want to delete this client?')) {
    clientStore.deleteClient(id)
  }
}
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div class="header-info">
        <h1>Clients</h1>
        <p class="text-muted">Manage your customer database</p>
      </div>
      <BaseButton variant="glow" icon="plus" @click="openAddModal">Add Client</BaseButton>
    </header>

    <div class="table-actions glass-card">
      <BaseInput 
        v-model="searchQuery" 
        placeholder="Search clients..." 
        icon="users"
      />
    </div>

    <AppTable :columns="columns" :data="filteredClients">
      <template #actions="{ row }">
        <BaseButton variant="ghost" size="sm" icon="trash" @click="handleDelete(row.id)" />
      </template>
    </AppTable>

    <!-- Add Client Modal -->
    <AppModal 
      :show="showModal" 
      title="Add New Client" 
      @close="showModal = false" 
      @confirm="handleAddClient"
    >
      <div class="form-grid">
        <BaseInput v-model="newClient.name" label="Client Name" required placeholder="Acme Corp" />
        <BaseInput v-model="newClient.email" label="Email Address" type="email" placeholder="billing@acme.com" />
        <BaseInput v-model="newClient.phone" label="Phone Number" placeholder="+91 ..." />
        <BaseInput v-model="newClient.gstin" label="GSTIN" placeholder="27XXXX..." />
        <div class="full-width">
          <BaseInput v-model="newClient.address" label="Full Address" placeholder="Street, City, Pin Code" />
        </div>
      </div>
    </AppModal>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.table-actions {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  max-width: 400px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.full-width {
  grid-column: span 2;
}

.text-muted {
  color: var(--text-muted);
  font-size: 0.875rem;
}
</style>
