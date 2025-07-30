// composables/useAthleteData.ts
import type { AthleteCreationStatus, AthleteDetail, AthleteListEntry, AthleteListResponse, AthleteResponse, AthleteSelectionInfo, AthleteSkillProgression, AthleteSkillProgressionResponse, SkillProgressionResponsePoint, SkillScore } from '~/types/athlete';

function mapBackendAthleteToFrontend(backendAthlete: AthleteResponse): AthleteDetail {
  return {
    uuid: backendAthlete.uuid,
    userId: backendAthlete.user_id,
    name: backendAthlete.name,
    preferredName: backendAthlete.preferred_name || undefined,
    displayName: backendAthlete.preferred_name
      ? `${backendAthlete.name} (${backendAthlete.preferred_name})`
      : backendAthlete.name,
    age: backendAthlete.age,
    height: backendAthlete.height ?? undefined,
    weight: backendAthlete.weight ?? undefined,
    dominantHand: backendAthlete.dominant_hand ?? 'Not specified',
    dateOfBirth: backendAthlete.date_of_birth
      ? new Date(backendAthlete.date_of_birth).toISOString().split('T')[0]
      : null,
    phoneNumber: backendAthlete.phone_number || undefined,
    emergencyContactName: backendAthlete.emergency_contact_name || undefined,
    emergencyContactPhone: backendAthlete.emergency_contact_phone || undefined,
    notes: backendAthlete.notes || undefined,
    jerseyNumber: backendAthlete.jersey_number ?? undefined,
    profileImageUrl: backendAthlete.profile_image_url || null,
    experienceLevel: backendAthlete.experience_level,
    groups: backendAthlete.groups || [],
    positions: backendAthlete.positions || [],
    skillScores:
      backendAthlete.skill_levels?.map(s => ({
        skillId: s.skill_id,
        // The backend sends Decimal as a string, so we parse it.
        currentScore: Number.parseFloat(s.current_score),
        skillName: s.skill_name || 'Unnamed Skill',
      })) ?? [],
  };
}

/**
 * A composable to manage all athlete-related data fetching and state.
 */
export function useAthleteData() {
  const { $api } = useNuxtApp();

  // --- State ---
  const athletes = ref<AthleteListEntry[]>([]);
  const stats = ref<AthleteCreationStatus | null>(null);
  const latestAthlete = ref<AthleteListEntry | null>(null);
  const selectedAthlete = ref<AthleteDetail | null>(null);
  const page = ref(1);
  const pageSize = 5;
  const hasNextPage = ref(false);
  const isLoading = ref(true);
  const isListLoading = ref(false);
  const isDetailsLoading = ref(false);
  const error = ref<string | null>(null);

  // --- API Functions ---
  async function fetchStats() {
    try {
      stats.value = await $api<AthleteCreationStatus>('/analytics/athletes/stats');
    }
    catch (e) {
      console.error('Failed to fetch stats:', e);
    }
  }

  async function fetchLatestAthlete() {
    try {
      const raw = await $api<AthleteListResponse | null>('/athlete/latest');
      if (raw) {
        latestAthlete.value = {
          uuid: raw.uuid,
          name: raw.name,
          age: raw.age,
          preferredName: raw.preferred_name,
          position: raw.position || 'Not specified',
          profileImageUrl: raw.profile_image_url,
        };
      }
      else {
        latestAthlete.value = null;
      }
    }
    catch (e) {
      console.error('Failed to fetch latest athlete:', e);
    }
  }

  async function fetchAthleteList(pageNum: number = page.value) {
    isListLoading.value = true;
    try {
      const skip = (pageNum - 1) * pageSize;
      const rawList = await $api<AthleteListResponse[]>(`/athlete?skip=${skip}&limit=${pageSize}`);
      athletes.value = rawList.map(raw => ({
        uuid: raw.uuid,
        name: raw.name,
        age: raw.age,
        preferredName: raw.preferred_name,
        position: raw.position || 'Not specified',
        profileImageUrl: raw.profile_image_url,
      }));
      hasNextPage.value = rawList.length === pageSize;
    }
    catch {
      error.value = 'Could not load the list of athletes.';
      athletes.value = [];
    }
    finally {
      isListLoading.value = false;
    }
  }

  async function selectAthlete(uuid: string) {
    if (selectedAthlete.value?.uuid === uuid && !isDetailsLoading.value)
      return;

    isDetailsLoading.value = true;
    error.value = null;
    try {
      const raw = await $api<AthleteResponse>(`/athlete/${uuid}`);
      selectedAthlete.value = mapBackendAthleteToFrontend(raw);
    }
    catch {
      error.value = 'Could not load athlete details.';
      selectedAthlete.value = null;
    }
    finally {
      isDetailsLoading.value = false;
    }
  }

  async function fetchAllData() {
    isLoading.value = true;
    error.value = null;
    page.value = 1;

    await Promise.all([fetchStats(), fetchLatestAthlete(), fetchAthleteList(1)]);

    if (athletes.value.length > 0 && !selectedAthlete.value) {
      await selectAthlete(athletes.value[0].uuid);
    }
    isLoading.value = false;
  }

  // --- Actions ---
  async function prevPage() {
    if (page.value > 1) {
      page.value--;
      await fetchAthleteList(page.value);
    }
  }

  async function nextPage() {
    if (hasNextPage.value) {
      page.value++;
      await fetchAthleteList(page.value);
    }
  }

  async function deleteSelectedAthlete() {
    const uuid = selectedAthlete.value?.uuid;
    if (!uuid)
      return;

    try {
      await $api(`/athlete/${uuid}`, { method: 'DELETE' });
      selectedAthlete.value = null; // Clear selection immediately
      await fetchAllData(); // Refresh all data
    }
    catch {
      error.value = 'Could not delete the athlete.';
    }
  }

  const fetchAllAthleteSelectionInfo = () => {
    return useAsyncData<AthleteSelectionInfo[]>(
      'all-athlete-selection-info',
      () => $api('/athlete/all'), // This will now work!
      { default: () => [] },
    );
  };

  const fetchAthleteSkillProgression = (athleteUuid: globalThis.Ref<string | null | undefined>) => {
    const key = computed(() =>
      athleteUuid.value ? `athlete-skill-progression-${athleteUuid.value}` : 'athlete-skill-progression-empty',
    );

    return useAsyncData(
      key,
      () => {
        if (!athleteUuid.value) {
          return Promise.resolve({
            day_one: [],
            current: []
          } as AthleteSkillProgressionResponse);
        }
        return $api<AthleteSkillProgressionResponse>(`/athlete/${athleteUuid.value}/skill-progression`);
      },
      {
        default: () => ({ dayOne: [], current: [] }),
        transform(data: AthleteSkillProgressionResponse): AthleteSkillProgression {
          if (!data || !data.day_one || !data.current)
            return { dayOne: [], current: [] };

          const toSkillScore = (point: SkillProgressionResponsePoint): SkillScore => ({
            skillId: point.skill_id,
            skillName: point.skill_name || 'Unnamed Skill',
            // The key must be 'currentScore' to match the SkillScore interface.
            currentScore: Number.parseFloat(String(point.average_score || '0')),
          });

          return {
            dayOne: data.day_one.map(toSkillScore),
            current: data.current.map(toSkillScore),
          };
        },
        watch: [athleteUuid],
      },
    );
  };

  return {
    athletes,
    stats,
    latestAthlete,
    selectedAthlete,
    page,
    hasNextPage,
    isLoading,
    isListLoading,
    isDetailsLoading,
    error,
    fetchAllData,
    selectAthlete,
    prevPage,
    nextPage,
    deleteSelectedAthlete,
    fetchAllAthleteSelectionInfo,
    fetchAthleteSkillProgression,
  };
}
