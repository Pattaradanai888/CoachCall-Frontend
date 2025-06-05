// composables/useAthleteForm.ts
import type { Athlete, NewAthleteForm } from '~/types/athlete';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { ref, watch } from 'vue';
import { athleteSchema } from '~/types/athlete';

export function useAthleteForm() {
  const previewUrl = ref<string | null>(null);
  const fileInput = ref<HTMLInputElement>();

  const { handleSubmit, resetForm, values, setFieldValue, errors } = useForm<NewAthleteForm>({ // Added 'errors'
    validationSchema: toTypedSchema(athleteSchema),
    initialValues: {
      name: '',
      preferredName: '',
      dateOfBirth: '',
      age: 0,
      phoneNumber: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      weight: null,
      height: null,
      position: '',
      dominantHand: '',
      experienceLevel: '',
      group: '',
      jerseyNumber: null,
      notes: '',
      profileImageFile: null,
      profileImageUrl: null,
    },
  });

  // Auto-calculate age when date of birth changes
  watch(() => values.dateOfBirth, (dob) => {
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFieldValue('age', age);
    }
    else {
      setFieldValue('age', 0); // Reset age if DOB is cleared
    }
  });

  const triggerFileInput = () => fileInput.value?.click();

  const onFileChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files?.[0]) {
      const file = input.files[0];
      setFieldValue('profileImageFile', file);

      const reader = new FileReader();
      reader.onload = (ev) => {
        previewUrl.value = ev.target?.result as string;
        setFieldValue('profileImageUrl', previewUrl.value); // Store the Data URL
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFieldValue('profileImageFile', null);
    setFieldValue('profileImageUrl', null);
    previewUrl.value = null;
    if (fileInput.value) {
      fileInput.value.value = ''; // Clear the file input
    }
  };

  const createAthlete = (formValues: NewAthleteForm): Athlete => {
    const displayName = formValues.preferredName?.trim()
      ? `${formValues.name} (${formValues.preferredName})`
      : formValues.name;

    return {
      id: Math.floor(Math.random() * 100000) + 1, // Ensure more unique ID for demo
      name: formValues.name,
      preferredName: formValues.preferredName,
      displayName,
      position: formValues.position || 'Not specified',
      age: formValues.age,
      height: formValues.height,
      weight: formValues.weight,
      dominantHand: formValues.dominantHand || 'Not specified',
      experienceLevel: formValues.experienceLevel || 'Not specified',
      dateOfBirth: formValues.dateOfBirth,
      phoneNumber: formValues.phoneNumber,
      emergencyContactName: formValues.emergencyContactName,
      emergencyContactPhone: formValues.emergencyContactPhone,
      profileImageUrl: formValues.profileImageUrl, // Use the stored URL (Data URL or remote URL)
      group: formValues.group || 'Unassigned',
      jerseyNumber: formValues.jerseyNumber,
      notes: formValues.notes,
      totalPowerRate: 0,
      developmentRate: 0,
      lastAssessmentDate: null,
      skillScores: [
        { name: 'Shooting', value: 0 },
        { name: 'Dribbling', value: 0 },
        { name: 'Defense', value: 0 },
        { name: 'Athleticism', value: 0 },
        { name: 'Basketball IQ', value: 0 },
        { name: 'Rebounding', value: 0 },
      ],
      createdAt: new Date().toISOString(),
    };
  };

  const resetFormData = () => {
    resetForm(); // This resets to initialValues
    previewUrl.value = null;
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  };

  return {
    handleSubmit,
    resetFormData,
    values,
    setFieldValue,
    errors, // Return errors
    previewUrl,
    fileInput,
    triggerFileInput,
    onFileChange,
    removePhoto,
    createAthlete,
  };
}
