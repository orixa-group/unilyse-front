"use client";

import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { shapes } from "@dicebear/collection";
import { cn } from "@/lib/utils/cn";

/** Palette pastel désaturée — moins voyante que les couleurs par défaut DiceBear. */
const MUTED_BACKGROUND_COLORS = [
  "dbeafe", // blue-100
  "dbeafe",
  "e0f2fe", // sky-100
  "dbeafe",
  "e0e7ff", // indigo-100
  "ede9fe", // violet-100
  "cffafe", // cyan-100
  "ccfbf1", // teal-100
] as const;

const MUTED_SHAPE_COLORS = [
 "2563eb", // blue-600
  "1d4ed8", // blue-700
  "0284c7", // sky-600
  "4f46e5", // indigo-600
  "4338ca", // indigo-700
  "7c3aed", // violet-600
  "0891b2", // cyan-600
  "0f766e", // teal-700
] as const;

export function ProjectCoverArt({
  projectId,
  className,
}: {
  projectId: string;
  className?: string;
}) {
  const dataUri = useMemo(() => {
    return createAvatar(shapes, {
      seed: projectId,
      size: 320,
      backgroundColor: [...MUTED_BACKGROUND_COLORS],
      shape1Color: [...MUTED_SHAPE_COLORS],
      shape2Color: [...MUTED_SHAPE_COLORS],
      shape3Color: [...MUTED_SHAPE_COLORS],
    }).toDataUri();
  }, [projectId]);

  return (
    <div
      className={cn(
        "bg-muted relative aspect-[3/1] w-full overflow-hidden rounded-t-xl",
        className,
      )}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG data URI généré localement par DiceBear */}
      <img
        src={dataUri}
        alt=""
        className="h-full w-full object-cover opacity-75 saturate-[0.65]"
        draggable={false}
      />
    </div>
  );
}
