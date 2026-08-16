import React from 'react';
import { useOrderStore } from './store';
import { Text, TransformControls, Float } from '@react-three/drei';

export default function FinalCake() {
  const { layers, decorations } = useOrderStore();

  return (
    <group position={[0, -1.2, 0]}>
      {/* طبقات الكيك */}
      {layers.map((layer, index) => (
        <mesh key={index} position={[0, 0.75 + (index * 1.5), 0]} castShadow receiveShadow>
          <cylinderGeometry args={[Math.max(2.2 - (index * 0.5), 0.5), Math.max(2.2 - (index * 0.5), 0.5), 1.5, 64]} />
          <meshStandardMaterial color={layer.color} roughness={0.4} metalness={0.1} />
        </mesh>
      ))}
      
      {/* الزينة القابلة للسحب */}
      {decorations.map((dec) => (
        <TransformControls key={dec.id} mode="translate">
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <group position={[0, 2.5, 0]}>
              {dec.type === '🌹 ورد' && <Text fontSize={1}>🌹</Text>}
              {dec.type === '👑 تاج' && <Text fontSize={1}>👑</Text>}
              {dec.type === '🦋 فراشات' && <Text fontSize={1}>🦋</Text>}
              {dec.type === '✍️ كتابة' && <Text fontSize={0.5} color="black">نص</Text>}
            </group>
          </Float>
        </TransformControls>
      ))}

      {/* القاعدة */}
      <mesh position={[0, -0.05, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3.2, 3.2, 0.1, 64]} />
        <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  );
}
