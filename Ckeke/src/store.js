import { create } from 'zustand';

const LAYER_PRICE = 5000; 

export const useOrderStore = create((set) => ({
  // ==========================================
  // 1. بيانات العميل (الخطوة الأولى)
  // ==========================================
  customerData: {
    name: '',
    phone: '',
    occasion: 'عيد ميلاد', // قيمة افتراضية لتسريع العمل
    deliveryDate: '',
    deliveryTime: '',
    notes: ''
  },
  
  // دالة لتحديث أي حقل في بيانات العميل فوراً
  updateCustomerData: (field, value) => set((state) => ({
    customerData: { 
      ...state.customerData, 
      [field]: value 
    }
  })),

  // ==========================================
  // 2. بيانات التورتة (الخطوة الثانية)
  // ==========================================
  layers: [{ id: 1, color: '#fcd34d' }],
  
  addLayer: () => set((state) => {
    if (state.layers.length < 3) {
      return { layers: [...state.layers, { id: state.layers.length + 1, color: '#ffffff' }] };
    }
    return state;
  }),
  
  removeLayer: () => set((state) => {
    if (state.layers.length > 1) {
      return { layers: state.layers.slice(0, -1) };
    }
    return state;
  }),
  
  updateLayerColor: (index, color) => set((state) => {
    const newLayers = [...state.layers];
    newLayers[index].color = color;
    return { layers: newLayers };
  }),

  // حساب السعر
  getTotalPrice: (state) => state.layers.length * LAYER_PRICE
}));
