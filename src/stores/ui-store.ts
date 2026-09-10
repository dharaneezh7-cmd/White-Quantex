import { create } from "zustand"

interface UIStoreState {
  sidebarOpen: boolean
  searchOpen: boolean
  mobileMenuOpen: boolean
  toggleSidebar: () => void
  toggleSearch: () => void
  toggleMobileMenu: () => void
  closeSearch: () => void
  closeMobileMenu: () => void
}

export const useUIStore = create<UIStoreState>((set) => ({
  sidebarOpen: true,
  searchOpen: false,
  mobileMenuOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  closeSearch: () => set({ searchOpen: false }),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
}))
