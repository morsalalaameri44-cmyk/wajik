import { create } from 'zustand';

const LAYER_PRICE = 5000;

export const useOrderStore = create((set) => ({
  // بيانات العميل
  customerData: { name: '', phone: '', occasion: 'عيد ميلاد', deliveryDate: '', deliveryTime: '', notes: '' },
  updateCustomerData: (field, value) => set((state) => ({ customerData: { ...state.customerData, [field]: value } })),

  // النكهات
  flavorData: { cakeFlavor: 'فانيليا', filling: 'شوكولاتة', topping: 'كريمة زبدة' },
  updateFlavorData: (field, value) => set((state) => ({ flavorData: { ...state.flavorData, [field]: value } })),

  // الكيك والزينة
  layers: [{ id: 1, color: '#fcd34d' }],
  decorations: [], // الزينة التي سنقوم بسحبها وإفلاتها

  addLayer: () => set((state) => (state.layers.length < 3 ? { layers: [...state.layers, { id: Date.now(), color: '#ffffff' }] } : state)),
  removeLayer: () => set((state) => (state.layers.length > 1 ? { layers: state.layers.slice(0, -1) } : state)),
  updateLayerColor: (index, color) => set((state) => {
    const newLayers = [...state.layers];
    newLayers[index].color = color;
    return { layers: newLayers };
  }),

  // إضافة زينة جديدة
  addDecoration: (type) => set((state) => ({
    decorations: [...state.decorations, { id: Date.now(), type, position: [0, 2.5, 0] }]
  })),
  removeDecoration: (id) => set((state) => ({ decorations: state.decorations.filter((d) => d.id !== id) })),
}));
