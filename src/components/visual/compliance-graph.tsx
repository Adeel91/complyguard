"use client";

import {
  useEffect,
  useRef,
} from "react";
import * as THREE from "three";

type GraphNode = {
  position: [
    number,
    number,
    number,
  ];
  kind:
    | "source"
    | "risk"
    | "control";
};

const nodes: GraphNode[] = [
  {
    position: [-2.8, 1.4, 0],
    kind: "source",
  },
  {
    position: [-2.5, -0.4, 0.4],
    kind: "source",
  },
  {
    position: [-1.6, -1.8, -0.1],
    kind: "source",
  },
  {
    position: [-0.5, 0.5, 0.5],
    kind: "risk",
  },
  {
    position: [0.2, -1.2, 0],
    kind: "risk",
  },
  {
    position: [1.4, 1.5, -0.2],
    kind: "control",
  },
  {
    position: [2.4, 0, 0.3],
    kind: "control",
  },
  {
    position: [1.6, -1.6, -0.3],
    kind: "control",
  },
];

const edges: Array<
  [number, number]
> = [
  [0, 3],
  [1, 3],
  [1, 4],
  [2, 4],
  [3, 5],
  [3, 6],
  [4, 6],
  [4, 7],
];

function colorFor(
  kind: GraphNode["kind"],
) {
  if (kind === "source") {
    return 0x6fa8ff;
  }

  if (kind === "risk") {
    return 0xff6b78;
  }

  return 0xb88cff;
}

export function ComplianceGraph() {
  const mountRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  useEffect(() => {
    const mount =
      mountRef.current;

    if (!mount) {
      return;
    }

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    const scene =
      new THREE.Scene();

    const camera =
      new THREE.PerspectiveCamera(
        48,
        mount.clientWidth /
          Math.max(
            mount.clientHeight,
            1,
          ),
        0.1,
        100,
      );

    camera.position.set(
      0,
      0,
      8.7,
    );

    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2,
      ),
    );

    renderer.setSize(
      mount.clientWidth,
      mount.clientHeight,
    );

    renderer.setClearColor(
      0x000000,
      0,
    );

    mount.appendChild(
      renderer.domElement,
    );

    const group =
      new THREE.Group();

    scene.add(group);

    const nodeMeshes:
      THREE.Mesh[] = [];

    for (const node of nodes) {
      const geometry =
        node.kind === "risk"
          ? new THREE.OctahedronGeometry(
              0.17,
              0,
            )
          : new THREE.SphereGeometry(
              node.kind ===
                "control"
                ? 0.14
                : 0.11,
              20,
              20,
            );

      const material =
        new THREE.MeshBasicMaterial({
          color:
            colorFor(
              node.kind,
            ),
          transparent: true,
          opacity:
            node.kind ===
            "risk"
              ? 1
              : 0.9,
        });

      const mesh =
        new THREE.Mesh(
          geometry,
          material,
        );

      mesh.position.set(
        ...node.position,
      );

      group.add(mesh);
      nodeMeshes.push(mesh);

      const halo =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            node.kind ===
              "risk"
              ? 0.32
              : 0.24,
            16,
            16,
          ),
          new THREE.MeshBasicMaterial({
            color:
              colorFor(
                node.kind,
              ),
            transparent:
              true,
            opacity:
              node.kind ===
              "risk"
                ? 0.08
                : 0.04,
          }),
        );

      halo.position.copy(
        mesh.position,
      );

      group.add(halo);
    }

    for (const [
      from,
      to,
    ] of edges) {
      const geometry =
        new THREE.BufferGeometry().setFromPoints(
          [
            new THREE.Vector3(
              ...nodes[from]
                .position,
            ),
            new THREE.Vector3(
              ...nodes[to]
                .position,
            ),
          ],
        );

      const material =
        new THREE.LineBasicMaterial({
          color: 0x6b6680,
          transparent: true,
          opacity: 0.32,
        });

      const line =
        new THREE.Line(
          geometry,
          material,
        );

      group.add(line);
    }

    const starGeometry =
      new THREE.BufferGeometry();

    const starCount = 80;

    const positions =
      new Float32Array(
        starCount * 3,
      );

    for (
      let index = 0;
      index < starCount;
      index += 1
    ) {
      positions[
        index * 3
      ] =
        (Math.random() -
          0.5) *
        10;

      positions[
        index * 3 +
          1
      ] =
        (Math.random() -
          0.5) *
        7;

      positions[
        index * 3 +
          2
      ] =
        -1 -
        Math.random() * 2;
    }

    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3,
      ),
    );

    const stars =
      new THREE.Points(
        starGeometry,
        new THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.015,
          transparent: true,
          opacity: 0.35,
        }),
      );

    scene.add(stars);

    let frame = 0;

    const clock =
      new THREE.Clock();

    function render() {
      const elapsed =
        clock.getElapsedTime();

      if (!reducedMotion) {
        group.rotation.y =
          Math.sin(
            elapsed * 0.18,
          ) * 0.12;

        group.rotation.x =
          Math.cos(
            elapsed * 0.13,
          ) * 0.035;

        nodeMeshes.forEach(
          (
            mesh,
            index,
          ) => {
            const base =
              nodes[index]
                .position[1];

            mesh.position.y =
              base +
              Math.sin(
                elapsed *
                  1.2 +
                  index,
              ) *
                0.035;
          },
        );

        stars.rotation.z =
          elapsed * 0.006;
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

    function resize() {
      if (!mount) {
        return;
      }

      camera.aspect =
        mount.clientWidth /
        Math.max(
          mount.clientHeight,
          1,
        );

      camera.updateProjectionMatrix();

      renderer.setSize(
        mount.clientWidth,
        mount.clientHeight,
      );
    }

    const observer =
      new ResizeObserver(
        resize,
      );

    observer.observe(
      mount,
    );

    return () => {
      cancelAnimationFrame(
        frame,
      );

      observer.disconnect();

      renderer.dispose();

      starGeometry.dispose();

      group.traverse(
        (object) => {
          if (
            object instanceof
            THREE.Mesh
          ) {
            object.geometry.dispose();

            if (
              object.material instanceof
              THREE.Material
            ) {
              object.material.dispose();
            }
          }

          if (
            object instanceof
            THREE.Line
          ) {
            object.geometry.dispose();

            if (
              object.material instanceof
              THREE.Material
            ) {
              object.material.dispose();
            }
          }
        },
      );

      if (
        renderer.domElement
          .parentNode ===
        mount
      ) {
        mount.removeChild(
          renderer.domElement,
        );
      }
    };
  }, []);

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0b0b11] md:h-[520px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_55%_45%,rgba(148,101,246,0.09),transparent_42%)]" />

      <div
        ref={mountRef}
        className="absolute inset-0"
      />

      <div className="pointer-events-none absolute left-5 top-5 rounded-lg border border-white/[0.08] bg-[#0a0a0f]/80 px-3 py-2 backdrop-blur">
        <div className="cg-mono text-[9px] uppercase tracking-[0.14em] text-white/32">
          live evidence graph
        </div>

        <div className="mt-1 flex items-center gap-2 text-[11px] text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-[#76e6d3] shadow-[0_0_8px_#76e6d3]" />
          deterministic pipeline
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-5 right-5 grid grid-cols-3 gap-2">
        {[
          [
            "SOURCE",
            "AST evidence",
            "#6fa8ff",
          ],
          [
            "RISK",
            "Root signal",
            "#ff6b78",
          ],
          [
            "CONTROL",
            "Mapped",
            "#b88cff",
          ],
        ].map(
          ([
            label,
            detail,
            color,
          ]) => (
            <div
              key={label}
              className="rounded-lg border border-white/[0.07] bg-[#0a0a0f]/80 px-3 py-2 backdrop-blur"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background:
                      color,
                    boxShadow: `0 0 8px ${color}`,
                  }}
                />

                <span className="cg-mono text-[8px] tracking-[0.13em] text-white/35">
                  {label}
                </span>
              </div>

              <div className="mt-1 text-[10px] text-white/55">
                {detail}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
