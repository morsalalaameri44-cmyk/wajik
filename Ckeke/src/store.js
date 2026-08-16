import { create } from 'zustand';

export const useOrderStore = create((set) => ({
  // بيانات العميل
  customerData: { name: '', phone: '', occasion: 'عيد ميلاد', deliveryDate: '', deliveryTime: '', notes: '' },
  updateCustomerData: (field, value) => set((state) => ({ customerData: { ...state.customerData, [field]: value } })),

  // المجسم والزينة
  layers: [{ id: 1, color: '#fcd34d' }],
  decorations: [],
  selectedId: null,

  setSelectedId: (id) => set({ selectedId: id }),

  addLayer: () => set((state) => (state.layers.length < 3 ? { layers: [...state.layers, { id: Date.now(), color: '#ffffff' }] } : state)),
  removeLayer: () => set((state) => (state.layers.length > 1 ? { layers: state.layers.slice(0, -1) } : state)),
  updateLayerColor: (index, color) => set((state) => {
    const newLayers = [...state.layers];
    newLayers[index].color = color;
    return { layers: newLayers };
  }),

  addDecoration: (type) => set((state) => ({
    decorations: [...state.decorations, { id: Date.now(), type, position: [0, 2.5, 0] }]
  })),

  removeDecoration: (id) => set((state) => ({
    decorations: state.decorations.filter((d) => d.id !== id),
    selectedId: null
  })),
}));
