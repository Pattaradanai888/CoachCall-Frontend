// composables/useMockLeaderboardData.ts

import type { LeaderboardAthlete, AthleteDetail, SkillProgressionDetail } from '~/types/leaderboard';

const mockAthletes: LeaderboardAthlete[] = [
  {
    uuid: 'uuid-jamal-johnson',
    name: 'Jamal Johnson',
    position: 'Center',
    profileImageUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&q=80',
    rank: 1,
    currentScore: 88.5,
    improvementSinceDayOne: 12.5,
    improvementSlope: 1.8, // Strong, consistent improvement
  },
  {
    uuid: 'uuid-david-lee',
    name: 'David Lee',
    position: 'Guard',
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    rank: 2,
    currentScore: 85.1,
    improvementSinceDayOne: 25.1, // Huge overall jump
    improvementSlope: 3.5, // Rapidly accelerating, maybe a rookie breakout
  },
  {
    uuid: 'uuid-sarah-chen',
    name: 'Sarah Chen',
    position: 'Forward',
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    rank: 3,
    currentScore: 92.3,
    improvementSinceDayOne: 5.3,
    improvementSlope: 0.2, // Veteran, high score but plateaued
  },
  {
    uuid: 'uuid-marco-rossi',
    name: 'Marco Rossi',
    position: 'Guard',
    profileImageUrl: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&q=80',
    rank: 4,
    currentScore: 78.0,
    improvementSinceDayOne: 8.0,
    improvementSlope: -0.5, // Was improving but is now declining
  },
  {
    uuid: 'uuid-alex-brown',
    name: 'Alex Brown',
    position: 'Forward',
    profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    rank: 5,
    currentScore: 82.3,
    improvementSinceDayOne: 15.3,
    improvementSlope: 2.1,
  },
  {
    uuid: 'uuid-jessica-white',
    name: 'Jessica White',
    position: 'Guard',
    profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    rank: 6,
    currentScore: 79.8,
    improvementSinceDayOne: 11.2,
    improvementSlope: 1.3,
  },
  {
    uuid: 'uuid-mike-davis',
    name: 'Mike Davis',
    position: 'Center',
    profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    rank: 7,
    currentScore: 77.5,
    improvementSinceDayOne: 9.8,
    improvementSlope: 0.8,
  },
  {
    uuid: 'uuid-emma-garcia',
    name: 'Emma Garcia',
    position: 'Forward',
    profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    rank: 8,
    currentScore: 75.2,
    improvementSinceDayOne: 7.1,
    improvementSlope: 0.5,
  },
  {
    uuid: 'uuid-ryan-taylor',
    name: 'Ryan Taylor',
    position: 'Guard',
    profileImageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80',
    rank: 9,
    currentScore: 73.9,
    improvementSinceDayOne: 6.3,
    improvementSlope: 0.3,
  },
  {
    uuid: 'uuid-sophia-martinez',
    name: 'Sophia Martinez',
    position: 'Center',
    profileImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    rank: 10,
    currentScore: 72.1,
    improvementSinceDayOne: 4.9,
    improvementSlope: 0.1,
  },
  {
    uuid: 'uuid-james-wilson',
    name: 'James Wilson',
    position: 'Forward',
    profileImageUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&q=80',
    rank: 11,
    currentScore: 70.8,
    improvementSinceDayOne: 3.2,
    improvementSlope: -0.2,
  },
  {
    uuid: 'uuid-olivia-anderson',
    name: 'Olivia Anderson',
    position: 'Guard',
    profileImageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80',
    rank: 12,
    currentScore: 69.5,
    improvementSinceDayOne: 2.8,
    improvementSlope: -0.3,
  },
  {
    uuid: 'uuid-ethan-thomas',
    name: 'Ethan Thomas',
    position: 'Center',
    profileImageUrl: 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=200&q=80',
    rank: 13,
    currentScore: 68.2,
    improvementSinceDayOne: 1.5,
    improvementSlope: -0.5,
  },
  {
    uuid: 'uuid-isabella-jackson',
    name: 'Isabella Jackson',
    position: 'Forward',
    profileImageUrl: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200&q=80',
    rank: 14,
    currentScore: 67.0,
    improvementSinceDayOne: 0.8,
    improvementSlope: -0.7,
  },
  {
    uuid: 'uuid-noah-harris',
    name: 'Noah Harris',
    position: 'Guard',
    profileImageUrl: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=200&q=80',
    rank: 15,
    currentScore: 65.7,
    improvementSinceDayOne: -0.3,
    improvementSlope: -1.0,
  },
];

const mockAthleteDetails: { [key: string]: AthleteDetail } = {
    'uuid-jamal-johnson': {
        ...mockAthletes[0],
        skillProgression: [
            { skillName: 'Shooting', dayOneScore: 70, currentScore: 88 },
            { skillName: 'Dribbling', dayOneScore: 75, currentScore: 90 },
            { skillName: 'Defense', dayOneScore: 80, currentScore: 85 },
            { skillName: 'Athleticism', dayOneScore: 78, currentScore: 91 },
        ]
    },
    'uuid-david-lee': {
        ...mockAthletes[1],
        skillProgression: [
            { skillName: 'Shooting', dayOneScore: 50, currentScore: 90 },
            { skillName: 'Dribbling', dayOneScore: 60, currentScore: 85 },
            { skillName: 'Defense', dayOneScore: 55, currentScore: 80 },
            { skillName: 'Athleticism', dayOneScore: 75, currentScore: 85 },
        ]
    },
    // ... add details for other athletes
};


export const useMockLeaderboardData = () => {
    const getLeaderboardAthletes = (): LeaderboardAthlete[] => {
        return mockAthletes;
    };

    const fetchAthleteDetail = async (uuid: string): Promise<AthleteDetail | null> => {
        // Simulate API call delay
        await new Promise(res => setTimeout(res, 200));
        return mockAthleteDetails[uuid] || null;
    }

    return { getLeaderboardAthletes, fetchAthleteDetail };
}