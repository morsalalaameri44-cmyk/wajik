import { create } from 'zustand';

export const useOrderStore = create((set) => ({
  cakeConfig: {
    color: '#FFD700', 
  },
  setCakeColor: (newColor) => 
    set((state) => ({
      cakeConfig: { ...state.cakeConfig, color: newColor }
    })),
}));
