import { ref } from 'vue';

// ==========================================================
// DEFINE INTERFACES
// ==========================================================
export interface Athlete {
  id: number;
  name: string;
  avatar: string;
  age: number;
  position?: string;
  group?: string;
}

export interface SkillMetric {
  skill: string;
  weight: number;
}

export interface Task {
  id: number;
  order: number;
  name: string;
  description: string;
  duration: number;
  skillMetrics: SkillMetric[];
}

export interface Session {
  id: number;
  name: string;
  description: string;
  scheduledDate: string;
  status: 'To Do' | 'Complete';
  tasks: Task[];
}

export interface Course {
  id: number;
  image: string;
  title: string;
  description: string;
  status: 'Active' | 'Archive';
  athletes: Athlete[];
  sessions: Session[];
  progressValue: number;
  participants: number;
  startDate: string;
  endDate: string;
}

// EXPORT a master list of all athletes available in the system
export const allAthletes: Athlete[] = [
  { id: 101, name: 'Alex Johnson', age: 22, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', position: 'Guard', group: 'A' },
  { id: 102, name: 'Maria Garcia', age: 24, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d', position: 'Forward', group: 'B' },
  { id: 103, name: 'James Smith', age: 21, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d', position: 'Guard', group: 'A' },
  { id: 104, name: 'Li Wei', age: 25, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707d', position: 'Center', group: 'C' },
  { id: 105, name: 'Chris Lee', age: 23, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026708d', position: 'Center', group: 'C' },
  { id: 106, name: 'Emily Davis', age: 20, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026709d', position: 'Guard', group: 'B' },
  { id: 107, name: 'John Doe', age: 26, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026710d', position: 'Forward', group: 'A' },
  { id: 108, name: 'Sarah Connor', age: 22, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026711d', position: 'Guard', group: 'C' },
  { id: 109, name: 'Michael Brown', age: 27, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026712d', position: 'Forward', group: 'B' },
  { id: 110, name: 'Jessica Lee', age: 24, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026713d', position: 'Center', group: 'A' },
  { id: 111, name: 'David Wilson', age: 21, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026714d', position: 'Guard', group: 'C' },
  { id: 112, name: 'Sophia Martinez', age: 23, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026715d', position: 'Forward', group: 'B' },
];

const coursesData: Course[] = [
  {
    id: 1,
    image: '/course-img.png',
    title: 'Advanced Dribbling',
    description: 'Ball handling drills for all positions.',
    status: 'Active',
    athletes: [allAthletes[0], allAthletes[2], allAthletes[3]],
    sessions: [
      { id: 1001, name: 'Session 1: Foundational Control', description: 'Focus on stationary drills.', scheduledDate: '2025-05-20', status: 'To Do', tasks: [
        { id: 1, order: 1, name: 'Two-Ball Stationary Dribble', description: 'Dribble two balls simultaneously.', duration: 15, skillMetrics: [{ skill: 'Dribbling', weight: 100 }] },
        { id: 2, order: 2, name: 'Figure 8 Dribble', description: 'Weave a single ball through the legs.', duration: 10, skillMetrics: [{ skill: 'Dribbling', weight: 80 }, { skill: 'Basketball IQ', weight: 20 }] },
      ] },
      { id: 1002, name: 'Session 2: Dribbling on the Move', description: 'Applying skills in motion.', scheduledDate: '2025-05-27', status: 'To Do', tasks: [
        { id: 3, order: 1, name: 'Full-Court Speed Dribble', description: 'Dribble the length of the court.', duration: 10, skillMetrics: [{ skill: 'Dribbling', weight: 50 }, { skill: 'Athleticism', weight: 50 }] },
      ] },
    ],
    // Populating the re-added fields
    participants: 5,
    startDate: '2025-05-20',
    endDate: '2025-05-27',
    progressValue: 50, // 1 of 2 sessions is complete
  },
  {
    id: 2,
    image: '/course-img-2.png',
    title: 'Shooting Fundamentals',
    description: 'Improve your jump shot and free throws.',
    status: 'Active',
    athletes: [allAthletes[1], allAthletes[3]],
    sessions: [
      { id: 2001, name: 'Form Shooting', description: 'Breaking down mechanics.', scheduledDate: '2025-04-05', status: 'To Do', tasks: [
        { id: 5, order: 1, name: 'One-Handed Form Shots', description: 'Close-range shots focusing on follow-through.', duration: 20, skillMetrics: [{ skill: 'Shooting', weight: 100 }] },
      ] },
      { id: 2002, name: 'Range and Repetition', description: 'Extending shooting range.', scheduledDate: '2025-04-12', status: 'To Do', tasks: [
        { id: 7, order: 1, name: 'Spot-Up Shooting (5 Spots)', description: 'Take 20 shots from 5 key locations.', duration: 25, skillMetrics: [{ skill: 'Shooting', weight: 90 }, { skill: 'Athleticism', weight: 10 }] },
      ] },
      { id: 2003, name: 'Shooting Off the Dribble', description: 'Creating your own shot.', scheduledDate: '2025-04-19', status: 'To Do', tasks: [] },
    ],
    participants: 2,
    startDate: '2025-04-05',
    endDate: '2025-04-19',
    progressValue: 67, // 2 of 3 sessions are complete
  },
];

export function useCourses() {
  const courses = ref<Course[]>(coursesData);

  const findCourseById = (id: number) => {
    return courses.value.find(course => course.id === id);
  };

  const findSessionById = (courseId: number, sessionId: number) => {
    const course = findCourseById(courseId);
    if (!course) {
      return { course: undefined, session: undefined };
    }
    const session = course.sessions.find(s => s.id === sessionId);
    return { course, session };
  };

  /**
   * NEW: Updates the status of a specific session.
   * @param courseId The ID of the course containing the session.
   * @param sessionId The ID of the session to update.
   * @param newStatus The new status to set ('To Do' or 'Complete').
   */
  const updateSessionStatus = (courseId: number, sessionId: number, newStatus: 'To Do' | 'Complete') => {
    const course = findCourseById(courseId);
    if (course) {
      const session = course.sessions.find(s => s.id === sessionId);
      if (session) {
        session.status = newStatus;
      }
    }
  };

  return {
    courses,
    findCourseById,
    findSessionById,
    updateSessionStatus, // <-- Export the new function
  };
}

// In start.vue or useCourses.ts, make sure to export this
export interface EvaluationData {
  scores: Record<string, number>;
  notes: string;
}
