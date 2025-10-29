<template>
  <div class="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 mt-[4.5rem]">
    <div v-if="pending" class="flex flex-col items-center justify-center h-[70vh]">
      <h1 class="text-2xl font-bold text-gray-700">
        Loading Report...
      </h1>
    </div>

    <div v-else-if="!sessionReport || error" class="flex flex-col items-center justify-center h-[70vh]">
      <h1 class="text-2xl font-bold text-gray-700">
        No Report Data Found
      </h1>
      <p class="text-gray-500 mt-2">
        The report may not have been generated or the session is not complete.
      </p>
      <NuxtLink :to="backPathOnError" class="mt-6 px-4 py-2 text-sm font-semibold border bg-white rounded-md hover:bg-gray-100 transition">
        Back to Course
      </NuxtLink>
    </div>

    <div v-else class="max-w-7xl mx-auto">
      <header class="mb-6 sm:mb-8">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div class="flex-1">
            <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-start sm:items-center">
              <Icon name="mdi:chart-box-outline" class="mr-2 sm:mr-3 text-gray-700 flex-shrink-0 mt-1 sm:mt-0" />
              <span class="leading-tight">Session Report: {{ sessionReport.session?.name }}</span>
            </h1>
            <ClientOnly>
              <p class="text-gray-500 mt-2 ml-6 sm:ml-10 text-sm">
                Completed on {{ completionDate }}
              </p>
              <template #fallback>
                <p class="text-gray-500 mt-2 ml-6 sm:ml-10 animate-pulse text-sm">
                  Loading date...
                </p>
              </template>
            </ClientOnly>
          </div>
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 sm:flex-shrink-0">
            <NuxtLink :to="backPath" class="px-3 sm:px-4 py-2 text-sm font-semibold border bg-white rounded-md hover:bg-gray-100 transition text-center">
              <span v-if="mode === 'course'">Back to Course</span>
              <span v-else>Back to Dashboard</span>
            </NuxtLink>
            <button class="px-3 sm:px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition">
              Export
            </button>
          </div>
        </div>
      </header>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <div class="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-md text-center">
          <p class="text-xs sm:text-sm text-gray-500 mb-1">
            Total Time
          </p>
          <p class="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800">
            {{ formatTime(stats.totalTime) }}
          </p>
        </div>
        <div class="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-md text-center">
          <p class="text-xs sm:text-sm text-gray-500 mb-1">
            Evaluations
          </p>
          <p class="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800">
            <span class="text-red-600">{{ stats.completedEvals }}</span> / {{ stats.totalEvals }}
          </p>
        </div>
        <div class="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-md text-center">
          <p class="text-xs sm:text-sm text-gray-500 mb-1">
            Avg Time/Task
          </p>
          <p class="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800">
            {{ formatTime(stats.avgTimePerTask) }}
          </p>
        </div>
        <div class="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-md text-center">
          <p class="text-xs sm:text-sm text-gray-500 mb-1">
            Completion
          </p>
          <p class="text-lg sm:text-2xl lg:text-3xl font-bold text-green-600">
            {{ stats.completion }}%
          </p>
        </div>
      </div>

      <main class="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-5 lg:gap-8">
        <!-- Mobile: Full width athlete list -->
        <section class="bg-white p-4 sm:p-6 rounded-lg shadow-md lg:col-span-2">
          <h2 class="text-lg sm:text-xl font-bold text-gray-800 mb-1">
            Athlete Performance Summary
          </h2>
          <p class="text-xs sm:text-sm text-gray-500 mb-4">
            Select an athlete to view details
          </p>
          <div class="space-y-2">
            <button
              v-for="athlete in athleteSummaries"
              :key="athlete.uuid"
              class="w-full flex items-center p-2 sm:p-3 rounded-lg text-left transition-colors"
              :class="[selectedAthleteUuid === athlete.uuid ? 'bg-blue-100' : 'hover:bg-gray-50']"
              @click="selectedAthleteUuid = athlete.uuid"
            >
              <NuxtImg
                :src="athlete.profile_image_url"
                :alt="athlete.name"
                format="webp"
                width="40"
                height="40"
                loading="lazy"
                class="w-8 sm:w-10 h-8 sm:h-10 rounded-full mr-3 sm:mr-4"
              />
              <div class="flex-grow">
                <p class="font-semibold text-gray-800 text-sm sm:text-base">
                  {{ athlete.name }}
                  <span v-if="athlete.isGuest" class="ml-2 px-2 py-0.5 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">Guest</span>
                </p>

                <p class="text-xs text-gray-500">
                  {{ athlete.tasksCompleted }} / {{ sessionReport.session?.tasks.length || 0 }} tasks completed
                </p>
              </div>
              <div class="text-right">
                <p class="font-bold text-gray-800 text-sm sm:text-base">
                  {{ athlete.averageScore.toFixed(0) }}/100
                </p>
                <p class="text-xs text-gray-500 font-mono">
                  {{ formatTime(athlete.totalTime) }}
                </p>
              </div>
            </button>
          </div>
        </section>

        <!-- Mobile: Full width skill assessment -->
        <section class="bg-white p-4 sm:p-6 rounded-lg shadow-md lg:col-span-3">
          <h2 class="text-lg sm:text-xl font-bold text-gray-800 mb-4">
            Skill Impact Assessment
          </h2>
          <div v-if="!selectedAthlete" class="flex items-center justify-center h-40 sm:h-60 text-gray-500">
            <p class="text-sm sm:text-base">Select an athlete to see their skill breakdown.</p>
          </div>
          <div v-else>
            <div class="mb-6 sm:mb-8 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div class="h-40 sm:h-60 lg:h-80 flex items-center justify-center">
                <RadarChart
                  v-if="chartComparisonData.after.length > 0"
                  :skill-data="chartComparisonData"
                  :max-score="100"
                  class="w-full"
                />
                <div v-else class="text-gray-400 text-center">
                  <Icon name="mdi:chart-radar" size="3rem sm:4rem" class="mx-auto mb-2" />
                  <p class="text-sm sm:text-base">No skill data available for this athlete</p>
                </div>
              </div>

              <div class="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                <div v-for="(skill, index) in skillComparison.after" :key="skill.skill_id" class="grid grid-cols-12 gap-2 sm:gap-4 items-center">
                  <p class="col-span-4 sm:col-span-3 font-semibold text-gray-700 text-xs sm:text-sm">
                    {{ skill.skill_name }}
                  </p>
                  <div class="col-span-6 sm:col-span-7">
                    <div class="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                      <div class="bg-red-600 h-2 sm:h-2.5 rounded-full" :style="{ width: `${skill.average_score}%` }" />
                    </div>
                  </div>
                  <div class="col-span-2 text-right font-mono text-gray-800 flex items-baseline justify-end">
                    <p class="font-bold text-xs sm:text-sm">
                      {{ skill.average_score.toFixed(1) }}
                    </p>
                    <span
                      class="text-xs ml-1 hidden sm:inline"
                      :class="{
                        'text-green-600': getSkillChange(index) > 0,
                        'text-red-600': getSkillChange(index) < 0,
                        'text-gray-500': getSkillChange(index) === 0,
                      }"
                    >
                      ({{ getSkillChange(index) >= 0 ? '+' : '' }}{{ getSkillChange(index).toFixed(1) }})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Detailed Evaluations Section -->
        <section class="mt-6 sm:mt-8 bg-white p-4 sm:p-6 rounded-lg shadow-md lg:col-span-5">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3 sm:gap-0">
          <h2 class="text-lg sm:text-xl font-bold text-gray-800">
            Detailed Evaluations
          </h2>
          <select v-model="detailedFilter" class="border rounded-md px-3 py-1.5 text-sm w-full sm:w-auto">
            <option value="All">
              All Athletes
            </option>
            <option v-for="athlete in sessionReport?.participatingAthletes" :key="athlete.uuid" :value="athlete.uuid">
              {{ athlete.name }}
            </option>
          </select>
        </div>
        
        <!-- Mobile: Card layout -->
        <div class="block sm:hidden space-y-3">
          <div v-if="filteredDetailedEvaluations.length === 0" class="text-center py-8 text-gray-500">
            No evaluations for this filter.
          </div>
          <div v-for="(item, index) in filteredDetailedEvaluations" :key="index" class="border rounded-lg p-3 hover:bg-gray-50">
            <div class="flex items-center mb-2">
              <NuxtImg
                :src="item.athlete.profile_image_url || '/default-profile.jpg'"
                :alt="item.athlete.name"
                format="webp"
                width="32"
                height="32"
                loading="lazy"
                class="w-8 h-8 rounded-full mr-3"
              />
              <div class="flex-grow">
                <span class="font-medium text-sm">{{ item.athlete.name }}</span>
                <span v-if="item.isGuest" class="ml-2 px-2 py-0.5 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">Guest</span>
              </div>
              <span class="font-mono text-xs text-gray-500">{{ formatTime(item.evaluation.time) }}</span>
            </div>
            <div class="text-sm text-gray-700 mb-2">
              <strong>Task:</strong> {{ item.task.name }}
            </div>
            <div class="mb-2">
              <div class="text-xs text-gray-500 mb-1">Skills Evaluated:</div>
              <div class="space-y-2">
                <div v-for="(score, skillId) in item.evaluation.scores" :key="skillId" class="bg-gray-50 border border-gray-200 rounded-md p-2">
                  <!-- Skill header with final score -->
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-semibold text-gray-700">{{ getSkillName(Number(skillId)) }}</span>
                    <span class="text-xs font-bold text-red-600">{{ formatScore(score) }}</span>
                  </div>
                  
                  <!-- Indicator ratings (if available) -->
                  <div v-if="hasIndicators(score)" class="flex flex-wrap gap-1">
                    <span
                      v-for="(rating, indicatorName) in getIndicators(score)"
                      :key="indicatorName"
                      class="text-xs px-2 py-0.5 rounded-full"
                      :class="getIndicatorBadgeClass(rating)"
                    >
                      {{ indicatorName }}: {{ getRatingLabel(rating) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="item.evaluation.notes" class="text-xs text-gray-500">
              <strong>Notes:</strong> {{ item.evaluation.notes }}
            </div>
          </div>
        </div>

        <!-- Desktop: Table layout -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="border-b text-gray-500">
              <tr>
                <th class="py-2 px-3 font-medium">
                  Athlete
                </th>
                <th class="py-2 px-3 font-medium">
                  Task
                </th>
                <th class="py-2 px-3 font-medium">
                  Score
                </th>
                <th class="py-2 px-3 font-medium">
                  Time
                </th>
                <th class="py-2 px-3 font-medium">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredDetailedEvaluations.length === 0">
                <td colspan="5" class="text-center py-8 text-gray-500">
                  No evaluations for this filter.
                </td>
              </tr>
              <tr v-for="(item, index) in filteredDetailedEvaluations" :key="index" class="border-b hover:bg-gray-50">
                <td class="py-3 px-3 flex items-center">
                  <NuxtImg
                    :src="item.athlete.profile_image_url || '/default-profile.jpg'"
                    :alt="item.athlete.name"
                    format="webp"
                    width="32"
                    height="32"
                    loading="lazy"
                    class="w-8 h-8 rounded-full mr-3"
                  />
                  <span class="font-medium">{{ item.athlete.name }}</span>
                  <span v-if="item.isGuest" class="ml-2 px-2 py-0.5 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">Guest</span>
                </td>
                <td class="py-3 px-3">
                  {{ item.task.name }}
                </td>
                <td class="py-3 px-3">
                  <div class="space-y-2 max-w-md">
                    <div v-for="(score, skillId) in item.evaluation.scores" :key="skillId" class="bg-gray-50 border border-gray-200 rounded-md p-2">
                      <!-- Skill header with final score -->
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-xs font-semibold text-gray-700">{{ getSkillName(Number(skillId)) }}</span>
                        <span class="text-xs font-bold text-red-600">{{ formatScore(score) }}</span>
                      </div>
                      
                      <!-- Indicator ratings (if available) -->
                      <div v-if="hasIndicators(score)" class="flex flex-wrap gap-1">
                        <span
                          v-for="(rating, indicatorName) in getIndicators(score)"
                          :key="indicatorName"
                          class="text-xs px-2 py-0.5 rounded-full"
                          :class="getIndicatorBadgeClass(rating)"
                        >
                          {{ indicatorName }}: {{ getRatingLabel(rating) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-3 font-mono">
                  {{ formatTime(item.evaluation.time) }}
                </td>
                <td class="py-3 px-3 text-gray-500">
                  {{ item.evaluation.notes || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { SessionSkillComparison } from '~/types/analytics';
import type { SkillPoint } from '~/types/athlete';

const { fetchSessionReport } = useCourses();
const route = useRoute();
const mode = computed<'course' | 'quick'>(() => (route.params.id === 'quick' ? 'quick' : 'course'));
const sessionId = computed(() => Number(route.params.sessionId));

const { data: sessionReport, pending, error } = await fetchSessionReport(sessionId.value);

const completionDate = computed(() => {
  if (!sessionReport.value?.session)
    return 'N/A';
  const dateToFormat = sessionReport.value.session.completed_at || sessionReport.value.session.scheduled_date;
  return new Date(dateToFormat).toLocaleString();
});

const selectedAthleteUuid = ref<string | null>(null);
const detailedFilter = ref<string>('All');

const backPath = computed(() => {
  if (mode.value === 'course' && sessionReport.value?.course?.id) {
    return `/course-detail/${sessionReport.value.course.id}`;
  }
  return '/course-management';
});

const backPathOnError = computed(() => backPath.value);

const enrolledAthleteUuids = computed(() => {
  if (mode.value !== 'course' || !sessionReport.value?.course?.attendees) {
    return new Set<string>();
  }
  return new Set(sessionReport.value.course.attendees.map(a => a.uuid));
});

const skillIdToNameMap = computed(() => {
  if (!sessionReport.value || !sessionReport.value.session)
    return new Map<number, string>();

  const skillMap = new Map<number, string>();
  sessionReport.value.session.tasks.forEach((sessionTask) => {
    sessionTask.task.skill_weights.forEach((weight) => {
      skillMap.set(weight.skill_id, weight.skill_name);
    });
  });
  return skillMap;
});

function getSkillName(skillId: number): string {
  return skillIdToNameMap.value.get(skillId) || `Skill #${skillId}`;
}

function formatTime(totalSeconds: number) {
  if (Number.isNaN(totalSeconds) || totalSeconds === null || totalSeconds === undefined)
    return '00:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const stats = computed(() => {
  if (!sessionReport.value)
    return { totalTime: 0, completedEvals: 0, totalEvals: 0, avgTimePerTask: 0, completion: 0 };

  const report = sessionReport.value;
  const completedEvals = Object.keys(report.evaluations).length;
  const totalEvals = report.participatingAthletes.length * (report.session?.tasks.length || 0);
  const totalEvalTime = Object.values(report.evaluations).reduce((sum, evalItem) => sum + evalItem.time, 0);

  return {
    totalTime: report.totalSessionTime,
    completedEvals,
    totalEvals,
    avgTimePerTask: completedEvals > 0 ? Math.round(totalEvalTime / completedEvals) : 0,
    completion: totalEvals > 0 ? Math.round((completedEvals / totalEvals) * 100) : 0,
  };
});

const athleteSummaries = computed(() => {
  if (!sessionReport.value)
    return [];

  return sessionReport.value.participatingAthletes.map((athlete) => {
    const athleteEvalEntries = Object.entries(sessionReport.value!.evaluations)
      .filter(([key]) => key.startsWith(`${athlete.uuid}-`));

    let totalWeightedScoreSum = 0;
    const tasksCompleted = athleteEvalEntries.length;

    athleteEvalEntries.forEach(([key, evalData]) => {
      const lastDashIndex = key.lastIndexOf('-');
      const taskId = Number(key.substring(lastDashIndex + 1));
      const sessionTask = sessionReport.value!.session!.tasks.find(st => st.task.id === taskId);
      if (!sessionTask)
        return;

      const task = sessionTask.task;
      const singleTaskWeightedScore = task.skill_weights.reduce((taskSum, metric) => {
        const scoreValue = evalData.scores[metric.skill_id] as ScoreValue;
        
        // Handle new format (object with final_score) or old format (just a number)
        let scoreForSkill = 0;
        if (hasIndicators(scoreValue)) {
          scoreForSkill = scoreValue.final_score;
        } else if (typeof scoreValue === 'number') {
          scoreForSkill = scoreValue;
        }
        
        const weight = Number.parseFloat(String(metric.weight));
        return taskSum + (scoreForSkill * weight);
      }, 0);
      totalWeightedScoreSum += singleTaskWeightedScore;
    });

    const totalTime = athleteEvalEntries.reduce((sum, [, evalData]) => sum + evalData.time, 0);

    return {
      uuid: athlete.uuid,
      name: athlete.name,
      profile_image_url: athlete.profile_image_url || '/default-profile.jpg',
      tasksCompleted,
      averageScore: tasksCompleted > 0 ? (totalWeightedScoreSum / tasksCompleted) : 0,
      totalTime,
      isGuest: mode.value === 'course' ? !enrolledAthleteUuids.value.has(athlete.uuid) : true,
    };
  });
});

const selectedAthlete = computed(() => {
  if (!selectedAthleteUuid.value || !sessionReport.value)
    return null;
  return sessionReport.value.participatingAthletes.find(a => a.uuid === selectedAthleteUuid.value);
});

const skillComparison = computed<SessionSkillComparison>(() => {
  if (!selectedAthleteUuid.value || !sessionReport.value?.skillComparisonData) {
    return { before: [], after: [] };
  }
  return sessionReport.value.skillComparisonData[selectedAthleteUuid.value] || { before: [], after: [] };
});

const chartComparisonData = computed(() => {
  const data: { [key: string]: SkillPoint[] } = {
    before: skillComparison.value.before.map(s => ({ skillName: s.skill_name, averageScore: s.average_score })),
    after: skillComparison.value.after.map(s => ({ skillName: s.skill_name, averageScore: s.average_score })),
  };
  return data;
});

function getSkillChange(index: number): number {
  const comparison = skillComparison.value;
  if (index < 0 || index >= comparison.after.length)
    return 0;

  const afterScore = comparison.after[index].average_score;
  const beforeScore = comparison.before[index].average_score;
  return afterScore - beforeScore;
}

const filteredDetailedEvaluations = computed(() => {
  if (!sessionReport.value)
    return [];

  const report = sessionReport.value;
  return Object.entries(report.evaluations)
    .map(([key, evaluation]) => {
      const lastDashIndex = key.lastIndexOf('-');
      const athleteUuid = key.substring(0, lastDashIndex);
      const taskId = Number(key.substring(lastDashIndex + 1));

      const athlete = report.participatingAthletes.find(a => a.uuid === athleteUuid);
      const sessionTask = report.session?.tasks.find(st => st.task.id === taskId);

      if (!athlete || !sessionTask)
        return null;

      return {
        athlete,
        task: sessionTask.task,
        evaluation,
        athleteUuid,
        isGuest: mode.value === 'course' ? !enrolledAthleteUuids.value.has(athleteUuid) : true,
      };
    })
    .filter((item): item is NonNullable<typeof item> => {
      if (!item)
        return false;
      return detailedFilter.value === 'All' || item.athleteUuid === detailedFilter.value;
    });
});

// Helper functions for indicator-based score display
type ScoreValue = number | { indicators: Record<string, number>; final_score: number };

function hasIndicators(score: ScoreValue): score is { indicators: Record<string, number>; final_score: number } {
  return typeof score === 'object' && score !== null && 'indicators' in score;
}

function getIndicators(score: ScoreValue): Record<string, number> {
  if (hasIndicators(score)) {
    return score.indicators || {};
  }
  return {};
}

function formatScore(score: ScoreValue): string {
  if (hasIndicators(score)) {
    // New format: { indicators: {...}, final_score: 66.67 }
    return `${score.final_score.toFixed(1)}%`;
  }
  // Old format: just a number
  if (typeof score === 'number') {
    return `${score.toFixed(1)}%`;
  }
  return 'N/A';
}

function getRatingLabel(rating: number): string {
  if (rating === 1) return 'Needs Work';
  if (rating === 2) return 'Developing';
  if (rating === 3) return 'Proficient';
  return 'N/A';
}

function getIndicatorBadgeClass(rating: number): string {
  if (rating === 1) {
    // Red - Needs Improvement
    return 'bg-red-100 text-red-800 border border-red-200';
  } else if (rating === 2) {
    // Yellow - Developing
    return 'bg-yellow-100 text-yellow-900 border border-yellow-200';
  } else if (rating === 3) {
    // Green - Proficient
    return 'bg-green-100 text-green-800 border border-green-200';
  }
  return 'bg-gray-100 text-gray-800 border border-gray-200';
}

onMounted(() => {
  if (athleteSummaries.value.length > 0) {
    selectedAthleteUuid.value = athleteSummaries.value[0].uuid;
  }
});

useHead({
  title: 'Session Report',
});
</script>
