import { create } from 'zustand';
import { Product, MaterialOption, HardwareOption } from '@/types/product';

interface ConfiguratorState {
  currentProduct: Product | null;
  selectedWidth: number;
  selectedHeight: number;
  selectedMaterial: MaterialOption | null;
  selectedHardware: HardwareOption | null;
  calculatedPrice: number;

  // Actions
  setProduct: (product: Product) => void;
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setMaterial: (material: MaterialOption) => void;
  setHardware: (hardware: HardwareOption) => void;
  resetConfiguration: () => void;
}

export const useConfiguratorStore = create<ConfiguratorState>((set, get) => ({
  currentProduct: null,
  selectedWidth: 0,
  selectedHeight: 0,
  selectedMaterial: null,
  selectedHardware: null,
  calculatedPrice: 0,

  setProduct: (product) => {
    const defaultMat = product.customizable.materials[0] || null;
    const defaultHard = product.customizable.hardware[0] || null;
    const base = product.basePrice;
    const matPrice = defaultMat?.priceModifier || 0;
    const hardPrice = defaultHard?.price || 0;

    set({
      currentProduct: product,
      selectedWidth: product.dimensions.defaultWidth,
      selectedHeight: product.dimensions.defaultHeight,
      selectedMaterial: defaultMat,
      selectedHardware: defaultHard,
      calculatedPrice: base + matPrice + hardPrice,
    });
  },

  setWidth: (width) => set({ selectedWidth: width }),
  setHeight: (height) => set({ selectedHeight: height }),

  setMaterial: (material) => {
    const { currentProduct, selectedHardware } = get();
    if (!currentProduct) return;
    const base = currentProduct.basePrice;
    const hardPrice = selectedHardware?.price || 0;
    set({
      selectedMaterial: material,
      calculatedPrice: base + material.priceModifier + hardPrice,
    });
  },

  setHardware: (hardware) => {
    const { currentProduct, selectedMaterial } = get();
    if (!currentProduct) return;
    const base = currentProduct.basePrice;
    const matPrice = selectedMaterial?.priceModifier || 0;
    set({
      selectedHardware: hardware,
      calculatedPrice: base + matPrice + hardware.price,
    });
  },

  resetConfiguration: () => {
    const { currentProduct } = get();
    if (currentProduct) {
      get().setProduct(currentProduct);
    }
  },
}));
