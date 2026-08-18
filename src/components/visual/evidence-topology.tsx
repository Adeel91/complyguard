"use client";

import {
  useEffect,
  useRef,
} from "react";
import * as THREE from "three";

type NodeKind =
  | "source"
  | "risk"
  | "control";

type NodeDefinition = {
  position: [
    number,
    number,
    number,
  ];
  kind: NodeKind;
};

const nodes: NodeDefinition[] = [
  {
    position: [-3.4, 1.6, 0],
    kind: "source",
  },
  {
    position: [-3.5, 0, 0.2],
    kind: "source",
  },
  {
    position: [-3.0, -1.6, -0.2],
    kind: "source",
  },

  {
    position: [-0.8, 1.2, 0.15],
    kind: "risk",
  },
  {
    position: [-0.5, -0.2, 0],
    kind: "risk",
  },
  {
    position: [-0.7, -1.5, 0.15],
    kind: "risk",
  },

  {
    position: [2.6, 1.55, 0],
    kind: "control",
  },
  {
    position: [3.0, 0, 0.2],
    kind: "control",
  },
  {
    position: [2.4, -1.6, -0.15],
    kind: "control",
  },
];

const edges: Array<
  [number, number]
> = [
  [0, 3],
  [1, 4],
  [1, 5],
  [2, 4],

  [3, 6],
  [3, 7],

  [4, 6],
  [4, 7],
  [4, 8],

  [5, 7],
  [5, 8],
];

const colors = {
  source: 0x79adff,
  risk: 0xef7483,
  control: 0xa992ff,
};

export function EvidenceTopology() {
  const ref =
    useRef<HTMLDivElement | null>(
      null,
    );

  useEffect(() => {
    const root = ref.current;

    if (!root) {
      return;
    }

    const scene =
      new THREE.Scene();

    const camera =
      new THREE.PerspectiveCamera(
        42,
        1,
        0.1,
        100,
      );

    camera.position.z = 9;

    const renderer =
      new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2,
      ),
    );

    renderer.setClearColor(
      0x000000,
      0,
    );

    root.appendChild(
      renderer.domElement,
    );

    const world =
      new THREE.Group();

    scene.add(world);

    const meshes:
      THREE.Mesh[] = [];

    for (const node of nodes) {
      const size =
        node.kind === "risk"
          ? 0.18
          : 0.13;

      const geometry =
        node.kind === "risk"
          ? new THREE.OctahedronGeometry(
              size,
              0,
            )
          : new THREE.SphereGeometry(
              size,
              24,
              24,
            );

      const mesh =
        new THREE.Mesh(
          geometry,
          new THREE.MeshBasicMaterial({
            color:
              colors[
                node.kind
              ],
          }),
        );

      mesh.position.set(
        ...node.position,
      );

      world.add(mesh);
      meshes.push(mesh);

      const glow =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            size * 2.1,
            20,
            20,
          ),
          new THREE.MeshBasicMaterial({
            color:
              colors[
                node.kind
              ],
            transparent: true,
            opacity: 0.06,
          }),
        );

      glow.position.copy(
        mesh.position,
      );

      world.add(glow);
    }

    const edgeObjects: Array<{
      from: THREE.Vector3;
      to: THREE.Vector3;
    }> = [];

    for (const [
      fromIndex,
      toIndex,
    ] of edges) {
      const from =
        new THREE.Vector3(
          ...nodes[fromIndex]
            .position,
        );

      const to =
        new THREE.Vector3(
          ...nodes[toIndex]
            .position,
        );

      const geometry =
        new THREE.BufferGeometry()
          .setFromPoints([
            from,
            to,
          ]);

      const material =
        new THREE.LineBasicMaterial({
          color: 0x8d8797,
          transparent: true,
          opacity: 0.25,
        });

      world.add(
        new THREE.Line(
          geometry,
          material,
        ),
      );

      edgeObjects.push({
        from,
        to,
      });
    }

    const pulses =
      edgeObjects.map(
        (
          edge,
          index,
        ) => {
          const pulse =
            new THREE.Mesh(
              new THREE.SphereGeometry(
                0.045,
                12,
                12,
              ),
              new THREE.MeshBasicMaterial({
                color:
                  index < 4
                    ? colors.risk
                    : colors.control,
                transparent: true,
                opacity: 0.9,
              }),
            );

          pulse.position.copy(
            edge.from,
          );

          world.add(pulse);

          return pulse;
        },
      );

    const starsCount = 100;

    const positions =
      new Float32Array(
        starsCount * 3,
      );

    for (
      let index = 0;
      index < starsCount;
      index += 1
    ) {
      positions[index * 3] =
        (Math.random() - 0.5) *
        11;

      positions[
        index * 3 + 1
      ] =
        (Math.random() - 0.5) *
        7;

      positions[
        index * 3 + 2
      ] =
        -1 -
        Math.random() * 3;
    }

    const particlesGeometry =
      new THREE.BufferGeometry();

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3,
      ),
    );

    const particlesMaterial =
      new THREE.PointsMaterial({
        size: 0.013,
        color: 0xffffff,
        transparent: true,
        opacity: 0.24,
      });

    const particles =
      new THREE.Points(
        particlesGeometry,
        particlesMaterial,
      );

    scene.add(particles);

    const reduced =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    const clock =
      new THREE.Clock();

    let frame = 0;

    function resize() {
      if (!root) {
        return;
      }

      const width =
        Math.max(
          root.clientWidth,
          1,
        );

      const height =
        Math.max(
          root.clientHeight,
          1,
        );

      renderer.setSize(
        width,
        height,
        false,
      );

      camera.aspect =
        width / height;

      camera.updateProjectionMatrix();
    }

    const observer =
      new ResizeObserver(
        resize,
      );

    observer.observe(root);

    resize();

    function render() {
      const time =
        clock.getElapsedTime();

      if (!reduced) {
        world.rotation.y =
          Math.sin(
            time * 0.16,
          ) * 0.09;

        world.rotation.x =
          Math.cos(
            time * 0.12,
          ) * 0.025;

        meshes.forEach(
          (
            mesh,
            index,
          ) => {
            const original =
              nodes[index]
                .position[1];

            mesh.position.y =
              original +
              Math.sin(
                time * 1.05 +
                  index,
              ) *
                0.035;
          },
        );

        pulses.forEach(
          (
            pulse,
            index,
          ) => {
            const edge =
              edgeObjects[index];

            const progress =
              (
                time * 0.27 +
                index * 0.13
              ) % 1;

            pulse.position.lerpVectors(
              edge.from,
              edge.to,
              progress,
            );
          },
        );

        particles.rotation.z =
          time * 0.003;
      }

      renderer.render(
        scene,
        camera,
      );

      frame =
        requestAnimationFrame(
          render,
        );
    }

    render();

    return () => {
      cancelAnimationFrame(
        frame,
      );

      observer.disconnect();

      scene.traverse(
        (object) => {
          if (
            object instanceof
              THREE.Mesh ||
            object instanceof
              THREE.Line ||
            object instanceof
              THREE.Points
          ) {
            object.geometry.dispose();

            const material =
              object.material;

            if (
              Array.isArray(
                material,
              )
            ) {
              material.forEach(
                (item) =>
                  item.dispose(),
              );
            } else {
              material.dispose();
            }
          }
        },
      );

      renderer.dispose();

      if (
        renderer.domElement
          .parentNode ===
        root
      ) {
        root.removeChild(
          renderer.domElement,
        );
      }
    };
  }, []);

  return (
    <div className="relative min-h-[520px] overflow-hidden border-l border-white/[0.08] bg-[#0c0b0f]">
      <div className="cg-grid pointer-events-none absolute inset-0 opacity-30" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(143,111,231,0.10),transparent_52%)]" />

      <div
        ref={ref}
        className="absolute inset-0"
      />

      <div className="absolute left-7 top-7 flex items-center gap-3 text-[12px] text-white/45">
        <span className="cg-status-dot bg-[#82dfcf] shadow-[0_0_12px_rgba(130,223,207,0.7)]" />
        live evidence topology
      </div>

      <div className="absolute bottom-7 left-7 right-7 grid grid-cols-3 border border-white/[0.08] bg-[#0a090d]/80 backdrop-blur-md">
        <Legend
          label="Source"
          value="AST evidence"
          color="#79adff"
        />

        <Legend
          label="Risk"
          value="Correlated"
          color="#ef7483"
          middle
        />

        <Legend
          label="Control"
          value="Mapped"
          color="#a992ff"
        />
      </div>
    </div>
  );
}

function Legend({
  label,
  value,
  color,
  middle = false,
}: {
  label: string;
  value: string;
  color: string;
  middle?: boolean;
}) {
  return (
    <div
      className={`px-5 py-4 ${
        middle
          ? "border-x border-white/[0.08]"
          : ""
      }`}
    >
      <div className="flex items-center gap-2 text-[11px] text-white/42">
        <span
          className="h-2 w-2 rounded-full"
          style={{
            background:
              color,
            boxShadow:
              `0 0 9px ${color}`,
          }}
        />

        {label}
      </div>

      <div className="mt-2 text-[13px] font-semibold text-white/78">
        {value}
      </div>
    </div>
  );
}
