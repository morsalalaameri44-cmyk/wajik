import { create } from 'zustand';

export const useOrderStore = create((set) => ({
  // الحالة الافتراضية: كيكة من طبقة واحدة
  layers: [
    { id: 1, color: '#FFD700', radius: 2.1, height: 1.2 }
  ],

  // دالة لإضافة طبقة جديدة (بحد أقصى 3 طبقات للحفاظ على تناسق الشكل)
  addLayer: () => set((state) => {
    if (state.layers.length >= 3) return state;
    
    // الطبقة الجديدة يجب أن تكون أصغر من الطبقة التي تحتها
    const prevLayer = state.layers[state.layers.length - 1];
    const newRadius = prevLayer.radius * 0.75; 
    
    const newLayer = {
      id: state.layers.length + 1,
      color: '#ffffff', // لون افتراضي أبيض للطبقة الجديدة
      radius: newRadius,
      height: 1.2
    };
    
    return { layers: [...state.layers, newLayer] };
  }),

  // دالة لإزالة الطبقة العلوية (يجب أن تظل طبقة واحدة على الأقل)
  removeLayer: () => set((state) => {
    if (state.layers.length <= 1) return state;
    return { layers: state.layers.slice(0, -1) };
  }),

  // دالة لتحديث لون طبقة محددة
  updateLayerColor: (index, newColor) => set((state) => {
    const updatedLayers = [...state.layers];
    updatedLayers[index].color = newColor;
    return { layers: updatedLayers };
  })
}));

