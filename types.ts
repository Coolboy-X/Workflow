export interface RedemptionCode {
  code: string;
  rewards: string;
  regions: string[];
  expiry: string; // ISO 8601 date string
  firstSeen: string; // ISO 8601 date string
}

export interface GroundingSource {
  web: {
    uri: string;
    title: string;
  };
}

export interface CachedCodes {
  codes: RedemptionCode[];
  sources: GroundingSource[];
}

export interface UpcomingBanner {
  name: string;
  rarity: 5 | 4;
  element: "Pyro" | "Hydro" | "Anemo" | "Electro" | "Dendro" | "Cryo" | "Geo";
  weapon: "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst";
  version: string;
  phase: 1 | 2;
  status: "upcoming" | "active";
}

export interface CachedBanners {
  banners: UpcomingBanner[];
  sources: GroundingSource[];
}

export type SourcesUpdateCallback = (sources: GroundingSource[]) => void;