import { create } from "zustand";

export const useOrderStore = create((set) => ({
  // بيانات العميل
  customer: {
    name: "",
    phone: "",
    occasion: "",
    deliveryDate: "",
    deliveryTime: "",
    notes: "",
  },

  // مواصفات التورتة
  cake: {
    shape: "round",
    size: "medium",
    weight: 1,
    layers: 1,

    flavor: "vanilla",
    filling: "chocolate",
    cover: "cream",

    primaryColor: "#FFD700",
    secondaryColor: "#FFFFFF",

    text: "",
    image: null,

    decorations: [],
  },

  price: 0,

  //--------------------------
  // Customer
  //--------------------------

  setCustomerField: (field, value) =>
    set((state) => ({
      customer: {
        ...state.customer,
        [field]: value,
      },
    })),

  //--------------------------
  // Cake
  //--------------------------

  updateCake: (field, value) =>
    set((state) => ({
      cake: {
        ...state.cake,
        [field]: value,
      },
    })),

  //--------------------------
  // Decorations
  //--------------------------

  addDecoration: (item) =>
    set((state) => ({
      cake: {
        ...state.cake,
        decorations: [...state.cake.decorations, item],
      },
    })),

  removeDecoration: (item) =>
    set((state) => ({
      cake: {
        ...state.cake,
        decorations: state.cake.decorations.filter(
          (d) => d !== item
        ),
      },
    })),

  //--------------------------
  // Price
  //--------------------------

  setPrice: (price) => set({ price }),

  //--------------------------
  // Reset
  //--------------------------

  resetOrder: () =>
    set({
      customer: {
        name: "",
        phone: "",
        occasion: "",
        deliveryDate: "",
        deliveryTime: "",
        notes: "",
      },

      cake: {
        shape: "round",
        size: "medium",
        weight: 1,
        layers: 1,

        flavor: "vanilla",
        filling: "chocolate",
        cover: "cream",

        primaryColor: "#FFD700",
        secondaryColor: "#FFFFFF",

        text: "",
        image: null,

        decorations: [],
      },

      price: 0,
    }),
}));