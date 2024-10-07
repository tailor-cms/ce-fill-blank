<template>
  <VForm ref="form" class="tce-root" @submit.prevent="submit">
    <div class="px-2 my-4">{{ parsedQuestion }}</div>
    <VTextField
      v-for="(_, index) in response"
      :key="index"
      v-model="response[index]"
      :readonly="submitted"
      :rules="[requiredRule]"
      class="my-3"
      label="Answer"
    >
      <template #prepend>
        <VAvatar size="small" variant="tonal">{{ index + 1 }}</VAvatar>
      </template>
      <template v-if="submitted" #append>
        <VIcon v-bind="iconProps(index)" />
      </template>
    </VTextField>
    <VAlert
      v-if="submitted"
      :text="userState?.isCorrect ? 'Correct' : 'Incorrect'"
      :type="userState?.isCorrect ? 'success' : 'error'"
      class="mb-3"
      rounded="lg"
      variant="tonal"
    />
    <div class="d-flex justify-end">
      <VBtn v-if="!submitted" type="submit" variant="tonal">Submit</VBtn>
      <VBtn v-else variant="tonal" @click="submitted = false">Try Again</VBtn>
    </div>
  </VForm>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import { ElementData } from '@tailor-cms/ce-fill-blank-manifest';

const BLANK = /(@blank)/g;
const initializeResponse = () =>
  cloneDeep(props.userState?.response) ??
  Array(props.data.question.match(BLANK)?.length ?? 0).fill('');

const props = defineProps<{ id: number; data: ElementData; userState: any }>();
const emit = defineEmits(['interaction']);

const form = ref<HTMLFormElement>();
const submitted = ref('isSubmitted' in (props.userState ?? {}));
const response = ref<string[]>(initializeResponse());

const parsedQuestion = computed(() => {
  let count = 0;
  return props.data.question.replace(BLANK, () => `${++count}______`);
});

const submit = async () => {
  const { valid } = await form.value?.validate();
  if (valid) emit('interaction', { response: response.value });
};

const requiredRule = (val: string | boolean | number) => {
  return !!val || 'You have to enter your answer.';
};

const iconProps = (index: number) => {
  const response = props.userState.response?.[index].toLowerCase();
  const correct = props.userState.correct?.[index].map((it: string) =>
    it.toLowerCase(),
  );
  const isCorrect = correct.includes(response);
  if (isCorrect) return { icon: 'mdi-check-circle', color: 'success' };
  return { icon: 'mdi-close-circle', color: 'error' };
};

watch(
  () => props.userState,
  (state = {}) => {
    response.value = initializeResponse();
    submitted.value = 'isCorrect' in state;
  },
  { deep: true },
);

watch(
  () => props.data,
  () => {
    response.value = initializeResponse();
  },
  { deep: true },
);
</script>

<style scoped>
.tce-root {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 1rem;
}
</style>
