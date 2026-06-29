export type BpmSource = "spotify-features" | "getsongbpm" | "manual";

export type BpmMatch = {
  bpm: number;
  source: BpmSource;
  title: string;
  artist: string;
};

export type BpmSearchResult = {
  id: string;
  title: string;
  artist: string;
  bpm: number | null;
  source: BpmSource;
};
