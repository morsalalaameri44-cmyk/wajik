import { useOrderStore } from './store';
import { useTexture } from '@react-three/drei';

export default function CakeModel() {
  const cakeColor = useOrderStore((state) => state.cakeConfig.color);

  return (
    <group position={[0, -0.5, 0]}>
      {/* جسم الكيكة الرئيسي - أسطوانة عالية الدقة */}
      <mesh castShadow receiveShadow>
        {/* زيادة عدد الـ radial segments إلى 128 لتنعيم الحواف تماماً */}
        <cylinderGeometry args={[2.1, 2.1, 1.2, 128]} />
        <meshStandardMaterial 
          color={cakeColor || '#FFD700'} 
          roughness={0.6} // جعل السطح أقل لمعاناً لتبدو كالكريمة
          metalness={0.1}
          envMapIntensity={0.5} // تفاعل جيد مع إضاءة البيئة
        />
      </mesh>
      
      {/* ظل خفيف إضافي تحت المجسم لتأكيد مكانه في الفراغ */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.6} receiveShadow>
        <planeGeometry args={[5, 5]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </group>
  );
}
