import React from 'react';
import { useOrderStore } from './store';
import { Text } from '@react-three/drei';

export default function FinalCake() {
  const { layers, decorations } = useOrderStore();

  return (
    <group position={[0, -1.2, 0]}>
      {/* 1. رسم طبقات التورتة */}
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
      
      {/* 2. محرك الزينة */}
      {decorations.map((dec) => (
        <group key={dec.id} position={[0, 3.2, 0]}> 
          {dec.type === '🌹 ورد' && (
            <mesh>
              <sphereGeometry args={[0.3]} />
              <meshStandardMaterial color="red" />
            </mesh>
          )}
          {dec.type === '👑 تاج' && (
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.3, 0.1, 16, 32]} />
              <meshStandardMaterial color="gold" metalness={1} />
            </mesh>
          )}
          {dec.type === '🦋 فراشات' && (
            <mesh>
              <coneGeometry args={[0.2, 0.4, 3]} />
              <meshStandardMaterial color="purple" />
            </mesh>
          )}
          {dec.type === '✍️ كتابة' && (
            <Text position={[0, 0, 0]} fontSize={0.5} color="black" anchorX="center" anchorY="middle">
              نص
            </Text>
          )}
        </group>
      ))}

      {/* القاعدة الذهبية */}
      <mesh position={[0, -0.05, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3.2, 3.2, 0.1, 64]} />
        <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  );
}
