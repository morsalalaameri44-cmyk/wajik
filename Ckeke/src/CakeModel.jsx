import { useMemo } from 'react';
import * as THREE from 'three';
import { useOrderStore } from './store';

// مكون فرعي يمثل طبقة الكيك الواحدة باحترافية
function CakeLayer({ layer, index }) {
  // استخدام useMemo لضمان عدم إعادة رسم المجسم إلا إذا تغير الحجم
  const geometry = useMemo(() => {
    // 1. نرسم شكل دائرة مثالية
    const shape = new THREE.Shape();
    // نطرح 0.05 من نصف القطر لنعوض مساحة الحافة الناعمة (Bevel)
    shape.absarc(0, 0, layer.radius - 0.05, 0, Math.PI * 2, false);
    
    // 2. نبثق الدائرة لتصبح أسطوانة مع تفعيل الحواف الناعمة
    return new THREE.ExtrudeGeometry(shape, {
      depth: layer.height - 0.1, // نطرح سماكة الحواف العلوية والسفلية من الارتفاع الإجمالي
      bevelEnabled: true,        // تفعيل النعومة
      bevelSegments: 16,         // دقة النعومة العالية
      steps: 1,
      bevelSize: 0.05,           // عرض الحافة الناعمة
      bevelThickness: 0.05,      // سماكة الحافة الناعمة
      curveSegments: 128         // دقة استدارة الكيكة
    });
  }, [layer.radius, layer.height]);

  // حسابات رياضية دقيقة: الطبقة السفلية تبدأ من 0.05 (سطح القاعدة الذهببة)
  // وكل طبقة تالية ترتفع بمقدار 1.2 بدقة متناهية
  const yPos = (index * 1.2) + 0.05; 

  return (
    <mesh 
      position={[0, yPos, 0]} 
      // نبطح المجسم على المحور السيني لأن الـ Extrude افتراضياً يبني على المحور العيني
      rotation={[-Math.PI / 2, 0, 0]} 
      geometry={geometry}
      castShadow 
      receiveShadow
    >
      <meshStandardMaterial 
        color={layer.color} 
        roughness={0.85} // ملمس مطفي يحاكي عجينة السكر الحقيقية
        metalness={0.02} 
      />
    </mesh>
  );
}

export default function CakeModel() {
  const layers = useOrderStore((state) => state.layers);

  return (
    <group position={[0, -1.2, 0]}> 
      
      {/* قاعدة الكيك الفاخرة (Cake Board) */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.7, 2.7, 0.1, 128]} />
        <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* بناء الطبقات باستدعاء المكون الاحترافي */}
      {layers.map((layer, index) => (
        <CakeLayer key={layer.id} layer={layer} index={index} />
      ))}
      
    </group>
  );
}
