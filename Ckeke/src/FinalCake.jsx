import React from 'react';
import { useOrderStore } from './store';

export default function FinalCake() {
  const layers = useOrderStore((state) => state.layers) || [];

  return (
    <group position={[0, -1.2, 0]}>
      {layers.map((layer, index) => {
        // معادلة هندسية ديناميكية تمنع انهيار التصميم: 
        // كل طبقة تصغر بمقدار 0.5 وترتفع بمقدار 1.5 تلقائياً
        const radius = Math.max(2.2 - (index * 0.5), 0.5); 
        const yPos = 0.75 + (index * 1.5);
        
        return (
          <mesh key={layer?.id || index} position={[0, yPos, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[radius, radius, 1.5, 64]} />
            <meshStandardMaterial color={layer?.color || '#ffffff'} roughness={0.4} metalness={0.1} />
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
