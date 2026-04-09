<script setup lang="ts">
import { ref } from 'vue'
import { useThemeStore } from '../stores/theme'
import AppIcon from '../components/atoms/AppIcon.vue'
import BaseButton from '../components/atoms/BaseButton.vue'

const themeStore = useThemeStore()
const isCollapsed = ref(false)
const toggleTheme = () => themeStore.toggleTheme()
</script>

<template>
  <div class="app-layout">
    <aside :class="['sidebar', 'glass-card', { 'collapsed': isCollapsed }]">
      <div class="sidebar-header">
        <div class="brand" v-if="!isCollapsed">
          <h1>BillSoft</h1>
        </div>
        <button class="toggle-btn" @click="isCollapsed = !isCollapsed">
          <AppIcon name="menu" :size="22" />
        </button>
      </div>
      
      <nav class="nav-menu">
        <router-link to="/" class="nav-item" exact-active-class="active" title="Dashboard">
          <AppIcon name="home" />
          <span v-show="!isCollapsed">Dashboard</span>
        </router-link>
        <router-link to="/invoices" class="nav-item" active-class="active" title="Invoices">
          <AppIcon name="invoice" />
          <span v-show="!isCollapsed">Invoices</span>
        </router-link>
        <router-link to="/clients" class="nav-item" active-class="active" title="Clients">
          <AppIcon name="users" />
          <span v-show="!isCollapsed">Clients</span>
        </router-link>
        <router-link to="/products" class="nav-item" active-class="active" title="Products">
          <AppIcon name="box" />
          <span v-show="!isCollapsed">Products</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <BaseButton 
          variant="ghost" 
          :icon="themeStore.theme === 'light' ? 'moon' : 'sun'" 
          @click="toggleTheme"
          class="footer-btn"
        >
          <span v-show="!isCollapsed">{{ themeStore.theme === 'light' ? 'Dark' : 'Light' }}</span>
        </BaseButton>
      </div>
    </aside>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--bg-app);
}

.sidebar {
  width: 260px;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-lg);
  gap: var(--spacing-xl);
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.sidebar.collapsed {
  width: 80px;
  padding: var(--spacing-lg) var(--spacing-md);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  width: 100%;
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  white-space: nowrap;
}

.logo-box {
  background: var(--color-primary);
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-box-mini {
  background: var(--color-primary);
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-left: auto;
}

.toggle-btn:hover {
  background: var(--bg-app);
  color: var(--color-primary);
}

.brand h1 {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 0;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex-grow: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  font-weight: 500;
  color: var(--text-muted);
  transition: all 0.2s ease;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
}

.collapsed .nav-item {
  justify-content: center;
  padding: var(--spacing-md) 0;
}

.nav-item:hover {
  background: var(--bg-app);
  color: var(--text-main);
}

.nav-item.active {
  background: var(--color-primary-glow);
  color: var(--color-primary);
}

.sidebar-footer {
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.footer-btn {
  width: 100%;
  justify-content: flex-start;
}

.collapsed .footer-btn {
  justify-content: center;
}

.main-content {
  flex-grow: 1;
  overflow-y: auto;
  border-radius: var(--radius-xl);
  background: var(--bg-surface);
  margin: 0;
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

/* Page Transitions */
.page-fade-enter-active, .page-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-fade-enter-from { opacity: 0; transform: translateY(10px); }
.page-fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
