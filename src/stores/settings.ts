import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { BusinessProfile } from '../types'

export const useSettingsStore = defineStore('settings', () => {
  const profile = ref<BusinessProfile>(
    JSON.parse(localStorage.getItem('settings') || JSON.stringify({
      name: 'Your Business Name',
      address: 'Business Address, City, State',
      email: 'billing@yourbusiness.com',
      phone: '+91 0000000000',
      gstin: '27AABCU1234F1Z5'
    }))
  )

  const updateProfile = (newProfile: Partial<BusinessProfile>) => {
    profile.value = { ...profile.value, ...newProfile }
  }

  watch(profile, (newProfile) => {
    localStorage.setItem('settings', JSON.stringify(newProfile))
  }, { deep: true })

  return { profile, updateProfile }
})
