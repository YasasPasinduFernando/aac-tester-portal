import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import type { AnimationAction, Group } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

const MODEL_URL = "/models/ask-aac-bot.glb";

export type AvatarMood = "idle" | "talk" | "think" | "listen";

function findClip(
  actions: Record<string, AnimationAction | null | undefined>,
  name: string,
): AnimationAction | null {
  if (actions[name]) return actions[name] ?? null;
  const key = Object.keys(actions).find((item) => item.includes(name));
  return key ? (actions[key] ?? null) : null;
}

function Bot({ mood, lift }: { mood: AvatarMood; lift: number }) {
  const { scene, animations } = useGLTF(MODEL_URL);
  const root = useRef<Group>(null);
  const cloned = useMemo(() => clone(scene), [scene]);
  const { actions } = useAnimations(animations, root);

  useEffect(() => {
    const clipName =
      mood === "talk" ? "Talk" : mood === "think" ? "Think" : mood === "listen" ? "Listen" : "Idle";
    const next = findClip(actions, clipName) ?? findClip(actions, "Idle");
    if (!next) return;
    next.reset().fadeIn(0.2).play();
    return () => {
      next.fadeOut(0.15);
    };
  }, [actions, mood]);

  return <primitive ref={root} object={cloned} position={[0, lift, 0]} scale={1.05} />;
}

export default function AvatarScene({
  mood,
  variant = "panel",
}: {
  mood: AvatarMood;
  variant?: "panel" | "dock";
}) {
  const dock = variant === "dock";
  return (
    <Canvas
      camera={{
        position: dock ? [0.02, 0.42, 2.55] : [0.04, 0.32, 2.9],
        fov: dock ? 32 : 36,
      }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      {dock ? (
        <>
          <color attach="background" args={["#061018"]} />
          <ambientLight intensity={0.42} />
          <pointLight position={[0.2, 1.1, 1.6]} intensity={1.35} color="#7dd3fc" />
          <directionalLight position={[2.2, 3.4, 2]} intensity={0.85} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.98, 0.08]}>
            <circleGeometry args={[0.62, 48]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.38} />
          </mesh>
        </>
      ) : (
        <>
          <ambientLight intensity={0.85} />
          <directionalLight position={[2.2, 3.4, 2]} intensity={1.15} />
          <directionalLight position={[-2, 1.4, -1]} intensity={0.35} />
        </>
      )}
      <Suspense fallback={null}>
        <Bot mood={mood} lift={dock ? -0.82 : -0.95} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
