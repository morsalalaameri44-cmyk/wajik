import React from 'react';
import { useOrderStore } from './store';

export default function FinalCake() {
  const { layers, decorations } = useOrderStore();

  return (
    <group position={[0, -1.2, 0]}>
      {/* 1. رسم طبقات التورتة (الموجودة مسبقاً) */}
      {layers.map((layer, index) => {
        const radius = Math.max(2.2 - (index * 0.5), 0.5); 
        const yPos = 0.75 + (index * 1.5);
        return (
          <mesh key={index} position={[0, yPos, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[radius, radius, 1.5, 64]} />
            <meshStandardMaterial color={layer.color} roughness={0.4} metalness={0.1} />
          </mesh>
        );
      })}
      
      {/* 2. رسم الزينة (المحرك الجديد) */}
      {decorations.map((dec) => (
        <mesh key={dec.id} position={[0, 2.5, 0]}> 
          {/* هنا نستخدم صندوق صغير كـ "مؤشر" للزينة، سنحوله لأشكال احترافية لاحقاً */}
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color={dec.type === '🌹 ورد' ? 'red' : 'gold'} />
        </mesh>
      ))}

      {/* القاعدة الذهبية */}
      <mesh position={[0, -0.05, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3.2, 3.2, 0.1, 64]} />
        <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  );
}
