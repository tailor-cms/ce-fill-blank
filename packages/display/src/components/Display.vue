<template>
  <div class="tce-fill-blank">
    <div class="text-title-small mb-4">Enter your answer(s):</div>
    <div class="d-flex flex-column ga-2">
      <VTextField
        v-for="index in blankCount"
        :key="index"
        v-model="response[index - 1]"
        :label="`Answer ${index}`"
        :readonly="isSubmitted"
        :rules="[(val: string) => !!val || 'Answer is required']"
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { map, sortBy, times } from 'lodash-es';
import type { Element } from '@tailor-cms/ce-fill-blank-manifest';

const BLANK = /(@blank)/g;

const props = defineProps<{ element: Element; userState: any }>();
const emit = defineEmits<{
  'user-input': [data: { response: string[] }];
}>();

const blankCount = computed(() => {
  const sortedEmbeds = sortBy(props.element.data.embeds, 'position');
  const questionData = map(sortedEmbeds, 'data.content');
  return questionData.toString().match(BLANK)?.length ?? 0;
});

const initializeResponse = () =>
  times(blankCount.value, (index) => props.userState.response?.[index] ?? '');

const isSubmitted = ref(!!props.userState.isSubmitted);
const response = ref<string[]>(initializeResponse());

const isGraded = computed(() => 'isCorrect' in props.userState);

watch(response, (val) => emit('user-input', { response: val }), { deep: true });

const isCorrect = (index: number) => {
  const userResponse = props.userState.response?.[index]?.toLowerCase();
  const correct = props.userState.correct?.[index]?.map((it: string) =>
    it.toLowerCase(),
  );
  return correct?.includes(userResponse);
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
.tce-fill-blank {
  text-align: left;
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
