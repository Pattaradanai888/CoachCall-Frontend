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
      <NuxtLink :to="courseId ? `/course-detail/${courseId}` : '/course-management'" class="mt-6 px-4 py-2 text-sm font-semibold border bg-white rounded-md hover:bg-gray-100 transition">
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
          <p class="text-gray-500 mt-1 ml-10">
            Completed on {{ new Date(sessionReport.session.scheduled_date).toLocaleString() }}
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <NuxtLink :to="`/course-detail/${sessionReport.course?.id}`" class="px-4 py-2 text-sm font-semibold border bg-white rounded-md hover:bg-gray-100 transition">
            Back to Course
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
              <NuxtImg :src="athlete.profile_image_url" :alt="athlete.name" class="w-10 h-10 rounded-full mr-4" />
              <div class="flex-grow">
                <p class="font-semibold text-gray-800">
                  {{ athlete.name }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ athlete.tasksCompleted }} / {{ sessionReport.session?.tasks.length }} tasks completed
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
            Skill Assessment
          </h2>
          <div v-if="!selectedAthlete" class="flex items-center justify-center h-full text-gray-500">
            <p>Select an athlete to see their skill breakdown.</p>
          </div>
          <div v-else>
            <div class="mb-8 p-4 bg-gray-50 rounded-lg">
              <p class="text-center font-semibold text-gray-600">
                Radar Chart Visualization
              </p>
              <p class="text-center text-sm text-gray-400 mt-2">
                (A library like Chart.js + vue-chartjs would be used here)
              </p>
              <div class="h-48 flex items-center justify-center">
                <Icon name="mdi:chart-radar" size="4rem" class="text-gray-300" />
              </div>
            </div>

            <div class="space-y-4">
              <div v-for="skill in skillAssessment" :key="skill.name" class="grid grid-cols-6 gap-4 items-center">
                <p class="col-span-1 font-semibold text-gray-700 text-sm">
                  {{ skill.name }}
                </p>
                <div class="col-span-4">
                  <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div class="bg-red-600 h-2.5 rounded-full" :style="{ width: `${skill.averageScore}%` }" />
                  </div>
                </div>
                <p class="col-span-1 text-right font-mono font-bold text-gray-800">
                  {{ skill.averageScore.toFixed(1) }}
                </p>
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
                  <img :src="item.athlete.profile_image_url || '/public/default-profile.jpg'" :alt="item.athlete.name" class="w-8 h-8 rounded-full mr-3">
                  <span class="font-medium">{{ item.athlete.name }}</span>
                </td>
                <td class="py-3 px-3">
                  {{ item.task.name }}
                </td>
                <td class="py-3 px-3">
                  <div class="flex flex-wrap gap-2">
                    <span v-for="(score, skill) in item.evaluation.scores" :key="skill" class="bg-gray-200 text-gray-800 text-xs font-mono px-2 py-1 rounded-md">
                      {{ skill }}: {{ score }}
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
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useCourses } from '~/composables/useCourses';

const { fetchSessionReport } = useCourses();
const route = useRoute();
const courseId = computed(() => Number(route.params.id));
const sessionId = computed(() => Number(route.params.sessionId));

const { data: sessionReport, pending, error } = await fetchSessionReport(sessionId.value);

const selectedAthleteUuid = ref<string | null>(null);
const detailedFilter = ref<string>('All');

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

  const report = sessionReport.value;
  return report.participatingAthletes.map((athlete) => {
    const athleteEvalEntries = Object.entries(report.evaluations)
      .filter(([key]) => key.startsWith(`${athlete.uuid}-`));

    let totalWeightedScoreSum = 0;
    const tasksCompleted = athleteEvalEntries.length;

    athleteEvalEntries.forEach(([key, evalData]) => {
      const lastDashIndex = key.lastIndexOf('-');
      const taskId = Number(key.substring(lastDashIndex + 1));
      const sessionTask = report.session!.tasks.find(st => st.task.id === taskId);
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
      profile_image_url: athlete.profile_image_url || '/public/default-profile.jpg',
      tasksCompleted,
      averageScore: tasksCompleted > 0 ? (totalWeightedScoreSum / tasksCompleted) : 0,
      totalTime,
    };
  });
});

const selectedAthlete = computed(() => {
  if (!selectedAthleteUuid.value || !sessionReport.value)
    return null;
  return sessionReport.value.participatingAthletes.find(a => a.uuid === selectedAthleteUuid.value);
});

const skillAssessment = computed(() => {
  if (!selectedAthleteUuid.value || !sessionReport.value)
    return [];

  const report = sessionReport.value;
  const athleteEvals = Object.entries(report.evaluations)
    .filter(([key]) => key.startsWith(`${selectedAthleteUuid.value}-`))
    .map(([, evalData]) => evalData);

  const skillTotals: Record<string, { total: number; count: number; name: string }> = {};

  athleteEvals.forEach((evalItem) => {
    Object.entries(evalItem.scores).forEach(([skillId, score]) => {
      let skillName = `Skill #${skillId}`;
      const foundSkill = report.session.tasks
        .flatMap(st => st.task.skill_weights)
        .find(sw => sw.skill_id === Number(skillId));

      if (foundSkill) {
        skillName = foundSkill.skill_name;
      }

      if (!skillTotals[skillId]) {
        skillTotals[skillId] = { total: 0, count: 0, name: skillName };
      }
      skillTotals[skillId].total += score;
      skillTotals[skillId].count++;
    });
  });

  return Object.values(skillTotals).map(data => ({
    name: data.name,
    averageScore: data.count > 0 ? data.total / data.count : 0,
  }));
});

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
      const sessionTask = report.session!.tasks.find(st => st.task.id === taskId);

      if (!athlete || !sessionTask) {
        return null;
      }

      return {
        athlete,
        task: sessionTask.task,
        evaluation,
        athleteUuid,
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
