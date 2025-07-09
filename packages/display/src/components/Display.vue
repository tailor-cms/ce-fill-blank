<template>
  <QuestionContainer
    :data="parsedData"
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
        :label="`Answer ${index}`"
        :readonly="isSubmitted"
        :rules="[(val: string) => !!val || 'Answer is required']"
        bg-color="white"
        placeholder="Answer..."
        variant="outlined"
      >
        <template v-if="isSubmitted && isGraded" #append-inner>
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
import { cloneDeep, map, mapValues, sortBy, times } from 'lodash-es';
import { computed, ref, watch } from 'vue';
import { Element } from '@tailor-cms/ce-fill-blank-manifest';
import { QuestionContainer } from '@tailor-cms/lx-components';

const BLANK = /(@blank)/g;

const props = defineProps<{ element: Element; userState: any }>();
const emit = defineEmits(['interaction']);

const blankCount = computed(() => {
  const sortedEmbeds = sortBy(props.element.data.embeds, 'position');
  const questionData = map(sortedEmbeds, 'data.content');
  return questionData.toString().match(BLANK)?.length ?? 0;
});

const parsedData = computed(() => {
  const data = cloneDeep(props.element.data);
  mapValues(data.embeds, (embed: any) => {
    embed.data.content = embed.data.content.replace(BLANK, '__________');
  });
  return data;
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
  () => props.element.data,
  () => {
    response.value = initializeResponse();
  },
  { deep: true },
);
</script>

<style lang="scss" scoped>
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
