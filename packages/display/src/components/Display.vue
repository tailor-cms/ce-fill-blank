<!-- eslint-disable vue/no-v-html -->
<template>
  <VForm ref="form" class="tce-root" @submit.prevent="submit">
    <div class="mb-4">
      <template v-for="(it, i) in parsedQuestion" :key="i">
        <template v-if="typeof it === 'number'">
          <VInput
            :model-value="response[it]"
            :rules="[requiredRule]"
            class="blank"
            hide-details
          >
            <template #default="{ isValid }">
              <VField :error="isValid.value === false" variant="outlined">
                <input
                  v-model="response[it]"
                  :readonly="submitted"
                  class="px-1"
                />
              </VField>
            </template>
            <template v-if="submitted" #append>
              <VIcon v-bind="iconProps(it)" />
            </template>
          </VInput>
        </template>
        <span v-else>{{ it }}</span>
      </template>
    </div>
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
  let index = 0;
  return props.data.question
    .split(/(@blank)/g)
    .map((it) => (it === '@blank' ? index++ : it));
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

<style lang="scss" scoped>
.tce-root {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 1rem;
}

.blank {
  display: inline-flex;
  vertical-align: bottom;

  :deep(.v-input__append) {
    margin-inline-start: 0.25rem !important;
  }
}
</style>
