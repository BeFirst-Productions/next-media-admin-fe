import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useNotificationStore = create(
  persist(
    (set) => ({
      notifications: [],
      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            read: false,
            ...notification
          },
          ...state.notifications
        ]
      })),
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'admin-notifications',
    }
  )
)
