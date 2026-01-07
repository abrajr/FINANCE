
export interface Episode {
  title: string;
  hook: string;
  narrative: string;
  keyScene: string;
  modernLesson: string;
}

export interface Series {
  title: string;
  description: string;
  episodes: Episode[];
}

export interface GenerationResult {
  newSeries: Series[];
}
