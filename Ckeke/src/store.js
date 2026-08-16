import { create } from 'zustand';

export const useOrderStore = create((set) => ({
  layers: [{ id: 1, color: '#fcd34d' }],
  decorations: [],
  selectedId: null,

  setSelectedId: (id) => set({ selectedId: id }),
  addDecoration: (type) => set((state) => ({
    decorations: [...state.decorations, { id: Date.now(), type, position: [0, 2.5, 0] }],
    selectedId: null // لا نحدد أي شيء تلقائياً ليبقى المنظر نظيفاً
  })),
  removeDecoration: (id) => set((state) => ({
    decorations: state.decorations.filter((d) => d.id !== id),
    selectedId: null
  })),
}));
