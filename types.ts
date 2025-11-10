
export interface Character {
  name: string;
  description: string;
}

export interface Story {
  id: string;
  title: string;
  styleInstruction: string;
  script: string;
  characters: Character[];
  createdAt: number;
  duration: string;
}