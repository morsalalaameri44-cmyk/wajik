import { create } from 'zustand';

export const useOrderStore = create((set) => ({
  // ... البيانات السابقة (CustomerData, FlavorData)
  customerData: { name: '', phone: '', occasion: 'عيد ميلاد', deliveryDate: '', deliveryTime: '', notes: '' },
  updateCustomerData: (field, value) => set((state) => ({ customerData: { ...state.customerData, [field]: value } })),

  flavorData: { cakeFlavor: 'فانيليا', filling: 'شوكولاتة', topping: 'كريمة زبدة' },
  updateFlavorData: (field, value) => set((state) => ({ flavorData: { ...state.flavorData, [field]: value } })),

  // المجسم
  layers: [{ id: 1, color: '#fcd34d' }],
  updateLayerColor: (index, color) => set((state) => {
    const newLayers = [...state.layers];
    newLayers[index].color = color;
    return { layers: newLayers };
  }),

  // [جديد] محرك الزينة
  decorations: [], // مصفوفة ستخزن { type: 'rose', position: [x,y,z], id: 1 }
  addDecoration: (type) => set((state) => ({
    decorations: [...state.decorations, { id: Date.now(), type, position: [0, 1.5, 0] }]
  })),
  removeDecoration: (id) => set((state) => ({
    decorations: state.decorations.filter((d) => d.id !== id)
  })),
}));
