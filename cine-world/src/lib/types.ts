export type ClusterId = "solitudo" | "amplitudo" | "domus" | "lacrima";

export interface Cluster {
  id: ClusterId;
  /** Latin name shown on the chart, e.g. "Solitudo" */
  label: string;
  /** What kind of watch this cluster gathers, for captions/UI copy. */
  mood: string;
  /** Fractional anchor position (0-1) within a plate. */
  x: number;
  y: number;
}

export interface Rewatch {
  year: number;
  rating: number;
}

export interface Film {
  id: string;
  title: string;
  director: string;
  year: number;
  country: string;
  /** 1-5, drives star size/brightness. */
  rating: number;
  cluster: ClusterId;
  note?: string;
  rewatches?: Rewatch[];
}
