import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Product } from '../types'

export const useProductStore = defineStore('products', () => {
  const products = ref<Product[]>(JSON.parse(localStorage.getItem('products') || '[]'))

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Math.random().toString(36).substring(2, 9)
    }
    products.value.push(newProduct)
  }

  const updateProduct = (id: string, updatedProduct: Partial<Product>) => {
    const index = products.value.findIndex(p => p.id === id)
    if (index !== -1) {
      products.value[index] = { ...products.value[index], ...updatedProduct }
    }
  }

  const deleteProduct = (id: string) => {
    products.value = products.value.filter(p => p.id !== id)
  }

  // Persist to localStorage
  watch(products, (newProducts) => {
    localStorage.setItem('products', JSON.stringify(newProducts))
  }, { deep: true })

  return { products, addProduct, updateProduct, deleteProduct }
})
