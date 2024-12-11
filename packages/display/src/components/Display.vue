<template>
  <QuestionContainer
    :data="data"
    :is-correct="userState.isCorrect"
    :is-graded="isGraded"
    :is-submitted="isSubmitted"
    allowed-retake
    @retry="isSubmitted = false"
    @submit="submit"
  >
    <div class="text-subtitle-2 mb-4">Enter your answer(s):</div>
    <div class="d-flex flex-column ga-2">
      <VTextField
        v-for="index in blankCount"
        :key="index"
        v-model="response[index - 1]"
        :label="`@blank #${index}`"
        :readonly="isSubmitted"
        :rules="[(val: string) => !!val || 'Answer is required']"
        placeholder="Answer..."
        variant="outlined"
      >
        <template v-if="isSubmitted && isGraded" #append>
          <VIcon
            :color="isCorrect(index - 1) ? 'success' : 'error'"
            :icon="`mdi-${isCorrect(index - 1) ? 'check' : 'close'}-circle`"
          />
        </template>
      </VTextField>
    </div>
  </QuestionContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElementData } from '@tailor-cms/ce-fill-blank-manifest';
import { QuestionContainer } from '@tailor-cms/lx-components';
import times from 'lodash/times';

const BLANK = /(@blank)/g;

const props = defineProps<{ id: number; data: ElementData; userState: any }>();
const emit = defineEmits(['interaction']);

const blankCount = computed(() => {
  const { question, embeds } = props.data;
  const questionData = question.map((id: any) => embeds[id].data.content);
  return questionData.toString().match(BLANK)?.length ?? 0;
});

const initializeResponse = () =>
  times(blankCount.value, (index) => props.userState.response?.[index] ?? '');

const isSubmitted = ref(!!props.userState.isSubmitted);
const response = ref<string[]>(initializeResponse());

const isGraded = computed(() => 'isCorrect' in props.userState);

const submit = () => emit('interaction', { response: response.value });

const isCorrect = (index: number) => {
  const response = props.userState.response?.[index]?.toLowerCase();
  const correct = props.userState.correct?.[index]?.map((it: string) =>
    it.toLowerCase(),
  );
  return correct?.includes(response);
};

watch(
  () => props.userState,
  (state = {}) => {
    response.value = initializeResponse();
    isSubmitted.value = !!state.isSubmitted;
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

<style lang="scss" scoped>
.tce-root {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 1rem;
}

:deep(.v-input__control) {
  display: block;
}

.blank {
  display: inline-flex;
  vertical-align: bottom;

  :deep(.v-input__append) {
    margin-inline-start: 0.25rem !important;
  }

  input {
    padding: 0 0.25rem;
  }
}
</style>
