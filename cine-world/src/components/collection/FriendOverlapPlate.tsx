"use client";

import { useState } from "react";
import Link from "next/link";
import { OverlapLegend } from "@/components/atlas/OverlapLegend";
import { PlateFrame } from "@/components/atlas/PlateFrame";
import { OverlapCanvas } from "@/components/sky/OverlapCanvas";
import type { FriendProfile } from "@/lib/friends";
import type { Cluster, Film } from "@/lib/types";

interface Twin {
  friend: FriendProfile;
  films: Film[];
}

interface FriendOverlapPlateProps {
  yourFilms: Film[];
  twins: Twin[];
  clusters: Cluster[];
  isNewCollection: boolean;
}

/** Client-side so switching between friends is instant — no page navigation or server round trip. */
export function FriendOverlapPlate({ yourFilms, twins, clusters, isNewCollection }: FriendOverlapPlateProps) {
  const [selected, setSelected] = useState(0);
  const twin = twins[selected];
  const sharedCount = yourFilms.filter((f) => twin.films.some((tf) => tf.id === f.id)).length;

  return (
    <PlateFrame
      roman="II"
      title="two collections, overlaid"
      caption={
        <>
          Of {yourFilms.length} specimens in this survey, {sharedCount} fall in exactly the same place as{" "}
          {twin.friend.email}&rsquo;s own collection — marked <em>coincident</em> above.{" "}
          {isNewCollection ? (
            <>This fills in as you log more — the overlap only shows up once there&rsquo;s something to overlap.</>
          ) : (
            <>That density of overlap, not a percentage on a profile page, is what makes them a taste twin.</>
          )}{" "}
          <Link href={`/friends/${twin.friend.id}`} className="text-oxblood not-italic">
            Open their full sky →
          </Link>
        </>
      }
    >
      {twins.length > 1 && (
        <div className="flex flex-wrap gap-x-5 gap-y-2 border-b border-line px-6 py-3">
          {twins.map((t, i) => (
            <button
              key={t.friend.id}
              type="button"
              onClick={() => setSelected(i)}
              className={`font-mono text-[10px] tracking-[0.08em] uppercase ${
                i === selected ? "border-b border-brass text-oxblood" : "text-ink-soft"
              }`}
            >
              {t.friend.email}
            </button>
          ))}
        </div>
      )}
      <OverlapCanvas yourFilms={yourFilms} theirFilms={twin.films} clusters={clusters} height={340} />
      <OverlapLegend />
    </PlateFrame>
  );
}
