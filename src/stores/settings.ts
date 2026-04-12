import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { BusinessProfile } from '../types'
import { readJSONStorage, writeJSONStorage } from '../utils/browserStorage'

export const useSettingsStore = defineStore('settings', () => {
  const profile = ref<BusinessProfile>(
    readJSONStorage<BusinessProfile>('settings', {
      name: 'Your Business Name',
      address: 'Business Address, Chennai, Tamil Nadu',
      email: 'billing@yourbusiness.com',
      phone: '+91 0000000000',
      gstin: '33AABCU1234F1Z5',
      stateCode: '33',
      bankName: 'State Bank of India',
      bankAccountNo: '000000000000',
      bankIFSC: 'SBIN0000000'
    })
  )

  const taxInclusive = ref<boolean>(
    readJSONStorage<boolean>('settings_tax_inclusive', true)
  )

  const updateProfile = (newProfile: Partial<BusinessProfile>) => {
    profile.value = { ...profile.value, ...newProfile }
  }

  const setTaxPreference = (value: boolean) => {
    taxInclusive.value = value
  }

  watch(profile, (newProfile) => {
    writeJSONStorage('settings', newProfile)
  }, { deep: true })

  watch(taxInclusive, (newPreference) => {
    writeJSONStorage('settings_tax_inclusive', newPreference)
  })

  return { profile, taxInclusive, updateProfile, setTaxPreference }
})
