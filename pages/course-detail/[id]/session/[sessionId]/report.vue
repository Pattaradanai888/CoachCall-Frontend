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
      <header class="flex justify-between items-start mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 flex items-center">
            <Icon name="mdi:chart-box-outline" class="mr-3 text-gray-700" />
            Session Report: {{ sessionReport.session?.name }}
          </h1>
          <ClientOnly>
            <p class="text-gray-500 mt-1 ml-10">
              Completed on {{ completionDate }}
            </p>
            <template #fallback>
              <p class="text-gray-500 mt-1 ml-10 animate-pulse">
                Loading date...
              </p>
            </template>
          </ClientOnly>
        </div>
        <div class="flex items-center space-x-3">
          <NuxtLink :to="backPath" class="px-4 py-2 text-sm font-semibold border bg-white rounded-md hover:bg-gray-100 transition">
            <span v-if="mode === 'course'">Back to Course</span>
            <span v-else>Back to Dashboard</span>
          </NuxtLink>
          <button class="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition">
            Export
          </button>
        </div>
      </header>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-md text-center">
          <p class="text-sm text-gray-500 mb-1">
            Total Time
          </p>
          <p class="text-3xl font-bold text-gray-800">
            {{ formatTime(stats.totalTime) }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md text-center">
          <p class="text-sm text-gray-500 mb-1">
            Evaluations
          </p>
          <p class="text-3xl font-bold text-gray-800">
            <span class="text-red-600">{{ stats.completedEvals }}</span> / {{ stats.totalEvals }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md text-center">
          <p class="text-sm text-gray-500 mb-1">
            Avg Time/Task
          </p>
          <p class="text-3xl font-bold text-gray-800">
            {{ formatTime(stats.avgTimePerTask) }}
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md text-center">
          <p class="text-sm text-gray-500 mb-1">
            Completion
          </p>
          <p class="text-3xl font-bold text-green-600">
            {{ stats.completion }}%
          </p>
        </div>
      </div>

      <main class="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-bold text-gray-800 mb-1">
            Athlete Performance Summary
          </h2>
          <p class="text-sm text-gray-500 mb-4">
            Select an athlete to view details
          </p>
          <div class="space-y-2">
            <button
              v-for="athlete in athleteSummaries"
              :key="athlete.uuid"
              class="w-full flex items-center p-3 rounded-lg text-left transition-colors"
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
                class="w-10 h-10 rounded-full mr-4"
              />
              <div class="flex-grow">
                <p class="font-semibold text-gray-800">
                  {{ athlete.name }}
                  <span v-if="athlete.isGuest" class="ml-2 px-2 py-0.5 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">Guest</span>
                </p>

                <p class="text-xs text-gray-500">
                  {{ athlete.tasksCompleted }} / {{ sessionReport.session?.tasks.length || 0 }} tasks completed
                </p>
              </div>
              <div class="text-right">
                <p class="font-bold text-gray-800">
                  {{ athlete.averageScore.toFixed(0) }}/100
                </p>
                <p class="text-xs text-gray-500 font-mono">
                  {{ formatTime(athlete.totalTime) }}
                </p>
              </div>
            </button>
          </div>
        </div>

        <div class="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-bold text-gray-800 mb-4">
            Skill Impact Assessment
          </h2>
          <div v-if="!selectedAthlete" class="flex items-center justify-center h-full text-gray-500">
            <p>Select an athlete to see their skill breakdown.</p>
          </div>
          <div v-else>
            <div class="mb-8 p-4 bg-gray-50 rounded-lg">
              <div class="h-80 flex items-center justify-center">
                <RadarChart
                  v-if="chartComparisonData.after.length > 0"
                  :skill-data="chartComparisonData"
                  :max-score="100"
                  class="w-full"
                />
                <div v-else class="text-gray-400 text-center">
                  <Icon name="mdi:chart-radar" size="4rem" class="mx-auto mb-2" />
                  <p>No skill data available for this athlete</p>
                </div>
              </div>

              <div class="space-y-4 mt-6">
                <div v-for="(skill, index) in skillComparison.after" :key="skill.skill_id" class="grid grid-cols-6 gap-4 items-center">
                  <p class="col-span-2 font-semibold text-gray-700 text-sm">
                    {{ skill.skill_name }}
                  </p>
                  <div class="col-span-3">
                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                      <div class="bg-red-600 h-2.5 rounded-full" :style="{ width: `${skill.average_score}%` }" />
                    </div>
                  </div>
                  <div class="col-span-1 text-right font-mono text-gray-800 flex items-baseline justify-end">
                    <p class="font-bold">
                      {{ skill.average_score.toFixed(1) }}
                    </p>
                    <span
                      class="text-xs ml-1"
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
        </div>
      </main>

      <section class="mt-8 bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-800">
            Detailed Evaluations
          </h2>
          <select v-model="detailedFilter" class="border rounded-md px-3 py-1.5 text-sm">
            <option value="All">
              All Athletes
            </option>
            <option v-for="athlete in sessionReport.participatingAthletes" :key="athlete.uuid" :value="athlete.uuid">
              {{ athlete.name }}
            </option>
          </select>
        </div>
        <div class="overflow-x-auto">
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
                  <div class="flex flex-wrap gap-2">
                    <span v-for="(score, skillId) in item.evaluation.scores" :key="skillId" class="bg-gray-200 text-gray-800 text-xs font-mono px-2 py-1 rounded-md">
                      {{ getSkillName(Number(skillId)) }}: {{ score }}
                    </span>
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
        const scoreForSkill = evalData.scores[metric.skill_id] || 0;
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

onMounted(() => {
  if (athleteSummaries.value.length > 0) {
    selectedAthleteUuid.value = athleteSummaries.value[0].uuid;
  }
});

useHead({
  title: 'Session Report',
});
</script>
