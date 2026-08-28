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

function Bot({ mood }: { mood: AvatarMood }) {
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

  return <primitive ref={root} object={cloned} position={[0, -0.95, 0]} scale={1.05} />;
}

export default function AvatarScene({ mood }: { mood: AvatarMood }) {
  return (
    <Canvas
      camera={{ position: [0.04, 0.32, 2.9], fov: 36 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[2.2, 3.4, 2]} intensity={1.15} />
      <directionalLight position={[-2, 1.4, -1]} intensity={0.35} />
      <Suspense fallback={null}>
        <Bot mood={mood} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
