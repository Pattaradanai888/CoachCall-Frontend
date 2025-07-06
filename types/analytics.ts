export interface SkillScore {
  skill_id: number;
  skill_name: string;
  average_score: number;
}

export interface SessionSkillComparison {
  before: SkillScore[];
  after: SkillScore[];
}
