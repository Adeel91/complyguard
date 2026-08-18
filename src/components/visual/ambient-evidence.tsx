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

type SceneNode = {
  kind: NodeKind;
  position: [
    number,
    number,
    number,
  ];
};

const nodes: SceneNode[] = [
  {
    kind: "source",
    position: [-3.8, 2.0, 0.2],
  },
  {
    kind: "source",
    position: [-4.2, 0.45, -0.1],
  },
  {
    kind: "source",
    position: [-3.7, -1.35, 0.15],
  },
  {
    kind: "source",
    position: [-2.7, -2.45, -0.4],
  },

  {
    kind: "risk",
    position: [-0.8, 1.5, 0.25],
  },
  {
    kind: "risk",
    position: [-0.1, 0, 0.1],
  },
  {
    kind: "risk",
    position: [-0.65, -1.75, 0.2],
  },

  {
    kind: "control",
    position: [3.4, 2.15, -0.1],
  },
  {
    kind: "control",
    position: [4.0, 0.35, 0.2],
  },
  {
    kind: "control",
    position: [3.25, -1.65, 0.1],
  },
];

const edges: Array<
  [number, number]
> = [
  [0, 4],
  [1, 4],
  [1, 5],
  [2, 5],
  [2, 6],
  [3, 6],

  [4, 7],
  [4, 8],

  [5, 7],
  [5, 8],
  [5, 9],

  [6, 8],
  [6, 9],
];

const palette: Record<
  NodeKind,
  number
> = {
  source: 0x77acff,
  risk: 0xf27484,
  control: 0xa98cff,
};

export function AmbientEvidence() {
  const rootRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  useEffect(() => {
    const root =
      rootRef.current;

    if (!root) {
      return;
    }

    const scene =
      new THREE.Scene();

    const camera =
      new THREE.PerspectiveCamera(
        43,
        1,
        0.1,
        100,
      );

    camera.position.set(
      0,
      0,
      10,
    );

    const renderer =
      new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference:
          "high-performance",
      });

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        1.75,
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

    const nodeMeshes:
      THREE.Mesh[] = [];

    nodes.forEach(
      (
        node,
        index,
      ) => {
        const size =
          node.kind === "risk"
            ? 0.17
            : 0.105;

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

        const material =
          new THREE.MeshBasicMaterial({
            color:
              palette[
                node.kind
              ],
            transparent: true,
            opacity: 0.95,
          });

        const mesh =
          new THREE.Mesh(
            geometry,
            material,
          );

        mesh.position.set(
          ...node.position,
        );

        world.add(mesh);
        nodeMeshes.push(mesh);

        const glow =
          new THREE.Mesh(
            new THREE.SphereGeometry(
              size *
                (
                  node.kind ===
                  "risk"
                    ? 3.5
                    : 3
                ),
              20,
              20,
            ),
            new THREE.MeshBasicMaterial({
              color:
                palette[
                  node.kind
                ],
              transparent: true,
              opacity:
                node.kind ===
                "risk"
                  ? 0.08
                  : 0.045,
              blending:
                THREE.AdditiveBlending,
              depthWrite: false,
            }),
          );

        glow.position.copy(
          mesh.position,
        );

        world.add(glow);

        const ring =
          new THREE.Mesh(
            new THREE.RingGeometry(
              size * 2.4,
              size * 2.48,
              32,
            ),
            new THREE.MeshBasicMaterial({
              color:
                palette[
                  node.kind
                ],
              transparent: true,
              opacity:
                0.1 +
                (
                  index % 2
                    ? 0.04
                    : 0
                ),
              side:
                THREE.DoubleSide,
            }),
          );

        ring.position.copy(
          mesh.position,
        );

        ring.rotation.x =
          Math.PI / 2.4;

        world.add(ring);
      },
    );

    const curves:
      THREE.QuadraticBezierCurve3[] =
      [];

    edges.forEach(
      (
        [
          fromIndex,
          toIndex,
        ],
        edgeIndex,
      ) => {
        const from =
          new THREE.Vector3(
            ...nodes[
              fromIndex
            ].position,
          );

        const to =
          new THREE.Vector3(
            ...nodes[
              toIndex
            ].position,
          );

        const middle =
          from
            .clone()
            .lerp(
              to,
              0.5,
            );

        middle.y +=
          (
            edgeIndex % 2 ===
            0
              ? 0.45
              : -0.42
          );

        middle.z +=
          (
            edgeIndex % 3
          ) *
            0.08;

        const curve =
          new THREE.QuadraticBezierCurve3(
            from,
            middle,
            to,
          );

        curves.push(curve);

        const geometry =
          new THREE.BufferGeometry()
            .setFromPoints(
              curve.getPoints(
                42,
              ),
            );

        const line =
          new THREE.Line(
            geometry,
            new THREE.LineBasicMaterial({
              color:
                edgeIndex <
                6
                  ? 0x64799a
                  : 0x776a92,
              transparent: true,
              opacity: 0.22,
            }),
          );

        world.add(line);
      },
    );

    const pulses =
      curves.map(
        (
          curve,
          index,
        ) => {
          const material =
            new THREE.MeshBasicMaterial({
              color:
                index < 6
                  ? 0x7fe1cf
                  : 0xa98cff,
              transparent: true,
              opacity: 0.85,
              blending:
                THREE.AdditiveBlending,
            });

          const pulse =
            new THREE.Mesh(
              new THREE.SphereGeometry(
                0.035,
                12,
                12,
              ),
              material,
            );

          pulse.position.copy(
            curve.getPoint(
              0,
            ),
          );

          world.add(pulse);

          return pulse;
        },
      );

    const particleCount =
      160;

    const positions =
      new Float32Array(
        particleCount * 3,
      );

    for (
      let index = 0;
      index < particleCount;
      index += 1
    ) {
      positions[index * 3] =
        (
          Math.random() -
          0.5
        ) *
        15;

      positions[
        index * 3 + 1
      ] =
        (
          Math.random() -
          0.5
        ) *
        10;

      positions[
        index * 3 + 2
      ] =
        -1 -
        Math.random() *
          5;
    }

    const starGeometry =
      new THREE.BufferGeometry();

    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3,
      ),
    );

    const starMaterial =
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.014,
        transparent: true,
        opacity: 0.22,
      });

    const stars =
      new THREE.Points(
        starGeometry,
        starMaterial,
      );

    scene.add(stars);

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    const clock =
      new THREE.Clock();

    let mouseX = 0;
    let mouseY = 0;

    function onPointerMove(
      event: PointerEvent,
    ) {
      mouseX =
        (
          event.clientX /
          window.innerWidth -
          0.5
        ) *
        2;

      mouseY =
        (
          event.clientY /
          window.innerHeight -
          0.5
        ) *
        2;
    }

    window.addEventListener(
      "pointermove",
      onPointerMove,
      {
        passive: true,
      },
    );

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

    renderer.setAnimationLoop(
      () => {
        const elapsed =
          clock.getElapsedTime();

        if (
          !reducedMotion
        ) {
          world.rotation.y +=
            (
              mouseX *
                0.055 -
              world.rotation.y
            ) *
            0.018;

          world.rotation.x +=
            (
              -mouseY *
                0.025 -
              world.rotation.x
            ) *
            0.018;

          nodeMeshes.forEach(
            (
              mesh,
              index,
            ) => {
              mesh.position.y =
                nodes[
                  index
                ].position[1] +
                Math.sin(
                  elapsed *
                    0.85 +
                    index *
                      0.7,
                ) *
                  0.045;

              mesh.rotation.y +=
                0.004;
            },
          );

          pulses.forEach(
            (
              pulse,
              index,
            ) => {
              const progress =
                (
                  elapsed *
                    (
                      0.12 +
                      (
                        index %
                        3
                      ) *
                        0.018
                    ) +
                  index *
                    0.071
                ) %
                1;

              pulse.position.copy(
                curves[
                  index
                ].getPoint(
                  progress,
                ),
              );
            },
          );

          stars.rotation.z =
            elapsed *
            0.0025;

          stars.rotation.y =
            Math.sin(
              elapsed *
                0.05,
            ) *
            0.025;
        }

        renderer.render(
          scene,
          camera,
        );
      },
    );

    return () => {
      renderer.setAnimationLoop(
        null,
      );

      observer.disconnect();

      window.removeEventListener(
        "pointermove",
        onPointerMove,
      );

      scene.traverse(
        (
          object,
        ) => {
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
                (
                  item,
                ) =>
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
    <div
      ref={rootRef}
      className="absolute inset-0"
      aria-hidden="true"
    />
  );
}
