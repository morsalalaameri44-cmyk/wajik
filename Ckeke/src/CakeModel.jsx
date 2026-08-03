import { useOrderStore } from './store';

export default function CakeModel() {
  const cakeColor = useOrderStore((state) => state.cakeConfig.color);

  return (
    <mesh position={[0, 0, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[2, 2, 1, 64]} />
      <meshStandardMaterial color={cakeColor} roughness={0.7} />
    </mesh>
  );
}
