import type { AthleteDetail, AthleteFormValues, AthleteResponse } from '~/types/athlete';
// composables/useAthleteForm.ts
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { athleteSchema } from '~/types/athlete';

function mapFormToApiPayload(formValues: AthleteFormValues) {
  return {
    name: formValues.name,
    preferred_name: formValues.preferredName || null,
    date_of_birth: formValues.dateOfBirth,
    height: formValues.height ?? null,
    weight: formValues.weight ?? null,
    dominant_hand: formValues.dominantHand || null, // Handles "" by sending null
    phone_number: formValues.phoneNumber || null,
    emergency_contact_name: formValues.emergencyContactName || null,
    emergency_contact_phone: formValues.emergencyContactPhone || null,
    notes: formValues.notes || null,
    jersey_number: formValues.jerseyNumber ?? null,
    experience_level_id: formValues.experienceLevelId ? Number(formValues.experienceLevelId) : null,
    group_ids: formValues.groupIds?.map(Number) ?? [],
    position_ids: formValues.positionIds?.map(Number) ?? [],
  };
}

function getFormValuesFromAthlete(athlete: AthleteDetail | null): AthleteFormValues {
// For a new athlete, return a completely empty form structure.
  if (!athlete) {
    return {
      name: '',
      preferredName: '',
      dateOfBirth: '',
      age: undefined,
      height: undefined,
      weight: undefined,
      dominantHand: '',
      phoneNumber: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      notes: '',
      jerseyNumber: undefined,
      experienceLevelId: '',
      groupIds: [],
      positionIds: [],
      profileImageFile: null,
    };
  }

  return {
    name: athlete.name ?? '',
    preferredName: athlete.preferredName ?? '',
    dateOfBirth: athlete.dateOfBirth ?? '',
    age: athlete.age ?? undefined,
    height: athlete.height ?? undefined,
    weight: athlete.weight ?? undefined,
    // FIX: Handle dominantHand properly - convert null/undefined to empty string, but preserve actual values
    dominantHand: athlete.dominantHand === null || athlete.dominantHand === undefined || athlete.dominantHand === 'Not specified' ? '' : athlete.dominantHand,
    phoneNumber: athlete.phoneNumber ?? '',
    emergencyContactName: athlete.emergencyContactName ?? '',
    emergencyContactPhone: athlete.emergencyContactPhone ?? '',
    notes: athlete.notes ?? '',
    jerseyNumber: athlete.jerseyNumber ?? undefined,
    experienceLevelId: athlete.experienceLevel?.id.toString() ?? '',
    groupIds: athlete.groups?.map(g => g.id.toString()) ?? [],
    positionIds: athlete.positions?.map(p => p.id.toString()) ?? [],
    profileImageFile: null,
  };
}

export function useAthleteForm(athlete: MaybeRef<AthleteDetail | null>) {
  const { $api } = useNuxtApp();
  const isSubmitting = ref(false);
  const submissionError = ref<string | null>(null);
  const previewUrl = ref<string | null>(null);
  const isEditMode = computed(() => !!unref(athlete));

  const { handleSubmit, values, setFieldValue, setValues, resetForm: veeResetForm } = useForm<AthleteFormValues>({
    validationSchema: toTypedSchema(athleteSchema),
    // Initialize with values from the prop, if available.
    initialValues: getFormValuesFromAthlete(unref(athlete)),
  });

  watch(() => unref(athlete), (newAthlete) => {
    const formValues = getFormValuesFromAthlete(newAthlete);
    setValues(formValues);
    previewUrl.value = newAthlete?.profileImageUrl ?? null;
  }, { deep: true, immediate: true });

  // Age calculation logic remains the same.
  watch(() => values.dateOfBirth, (dob) => {
    if (!dob) {
      setFieldValue('age', undefined);
      return;
    }
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFieldValue('age', age >= 0 ? age : undefined);
    }
    catch {
      setFieldValue('age', undefined);
    }
  }, { immediate: true });

  async function uploadImage(athleteUuid: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    await $api(`/athlete/${athleteUuid}/upload-image`, { method: 'POST', body: formData });
  }

  function handlePhotoUpload(file: File) {
    previewUrl.value = URL.createObjectURL(file);
    setFieldValue('profileImageFile', file);
  }

  async function handlePhotoRemove() {
    const currentUrl = previewUrl.value;
    previewUrl.value = null;
    setFieldValue('profileImageFile', null);
    if (isEditMode.value && unref(athlete)?.uuid && currentUrl) {
      try {
        await $api(`/athlete/${unref(athlete)!.uuid}/image`, { method: 'DELETE' });
      }
      catch (error) {
        console.error('Failed to delete image on server:', error);
      }
    }
  }

  const submit = handleSubmit(async (formValues) => {
    isSubmitting.value = true;
    submissionError.value = null;
    try {
      const apiPayload = mapFormToApiPayload(formValues);
      let athleteUuid: string;
      if (isEditMode.value) {
        athleteUuid = unref(athlete)!.uuid;
        await $api(`/athlete/${athleteUuid}`, { method: 'PUT', body: apiPayload });
      }
      else {
        const newAthlete = await $api<AthleteResponse>('/athlete', { method: 'POST', body: apiPayload });
        athleteUuid = newAthlete.uuid;
      }
      if (formValues.profileImageFile) {
        await uploadImage(athleteUuid, formValues.profileImageFile);
      }
      return true;
    }
    catch (error: any) {
      submissionError.value = error.data?.detail || 'An unexpected error occurred.';
      return false;
    }
    finally {
      isSubmitting.value = false;
    }
  });

  function resetForm() {
    const formValues = getFormValuesFromAthlete(unref(athlete));
    veeResetForm({ values: formValues }); // Use VeeValidate's reset with new values
    previewUrl.value = unref(athlete)?.profileImageUrl ?? null;
    submissionError.value = null;
  }

  return {
    values,
    isEditMode,
    isSubmitting,
    submissionError,
    submit,
    resetForm, // Expose our custom reset function
    previewUrl,
    handlePhotoUpload,
    handlePhotoRemove,
    setFieldValue,
  };
}
