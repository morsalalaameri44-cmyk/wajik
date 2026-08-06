import React from 'react';
import { useOrderStore } from './store';

export default function FinalCake() {
  const layers = useOrderStore((state) => state.layers);

  // إعدادات هندسية دقيقة لتراص الطبقات بدون فراغات مع تناقص الحجم
  const layerSettings = [
    { radius: 2.2, height: 1.5, yPos: 0.75 }, // الطبقة الأولى (السفلية - الأكبر)
    { radius: 1.7, height: 1.5, yPos: 2.25 }, // الطبقة الثانية (الوسطى)
    { radius: 1.2, height: 1.5, yPos: 3.75 }  // الطبقة الثالثة (العلوية - الأصغر)
  ];

  return (
    <group position={[0, -1.2, 0]}>
      {layers.map((layer, index) => {
        const setting = layerSettings[index];
        return (
          <mesh key={layer.id} position={[0, setting.yPos, 0]} castShadow receiveShadow>
            {/* 64 لضمان دائرية فائقة النعومة للمجسم */}
            <cylinderGeometry args={[setting.radius, setting.radius, setting.height, 64]} />
            <meshStandardMaterial color={layer.color} roughness={0.4} metalness={0.1} />
          </mesh>
        );
      })}
      
      {/* الصحن الذهبي الفاخر (القاعدة) */}
      <mesh position={[0, -0.05, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3.2, 3.2, 0.1, 64]} />
        <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  );
}
