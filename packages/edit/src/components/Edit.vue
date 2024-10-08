<template>
  <VForm
    ref="form"
    class="tce-container"
    validate-on="submit"
    @submit.prevent="save"
  >
    <VTextarea
      ref="question"
      v-model="elementData.question"
      :readonly="isDisabled"
      :rules="[rules.required, rules.hasBlanks]"
      class="my-3"
      details="Type '@blank' when new blank is needed."
      label="Question"
      rows="3"
      auto-grow
    >
      <template #details>Type '@blank' when new blank is needed. </template>
    </VTextarea>
    <div class="text-subtitle-2 mb-2">Answers</div>

    <VSlideYTransition group>
      <div v-for="(group, groupIndex) in elementData.correct" :key="groupIndex">
        <div class="d-flex mb-4">
          <VChip
            class="font-weight-bold"
            color="primary-darken-3"
            size="small"
            variant="flat"
            label
          >
            {{ groupIndex + 1 }}
          </VChip>
          <VSpacer />
          <VBtn
            v-if="!isDisabled && !isSynced"
            class="ml-2"
            color="secondary-darken-1"
            prepend-icon="mdi-delete"
            size="small"
            variant="text"
            rounded
            @click="removeGroup(groupIndex)"
          >
            Remove answer group
          </VBtn>
        </div>
        <VTextField
          v-for="(answer, answerIndex) in group"
          :key="`${groupIndex}.${answerIndex}`"
          :model-value="answer"
          :readonly="isDisabled"
          :rules="[rules.required]"
          class="my-2"
          placeholder="Answer..."
          @update:model-value="updateAnswer(groupIndex, answerIndex, $event)"
        >
          <template v-if="!isDisabled && group.length > 1" #append>
            <VBtn
              aria-label="Remove answer"
              density="comfortable"
              icon="mdi-close"
              variant="text"
              @click="removeAnswer(groupIndex, answerIndex)"
            />
          </template>
        </VTextField>
        <div v-if="!isDisabled" class="mb-4 d-flex justify-end">
          <VBtn
            prepend-icon="mdi-plus"
            variant="text"
            rounded
            @click="addAnswer(groupIndex)"
          >
            Add Answer
          </VBtn>
        </div>
      </div>
    </VSlideYTransition>
    <VAlert v-if="!isSynced" border="start" type="error" variant="tonal">
      Question and blanks are out of sync!<br />
      Please delete unnecessary answer groups or add blanks in the question!
    </VAlert>
    <div v-if="!isDisabled" class="d-flex justify-end mt-8">
      <VBtn :disabled="isDirty" variant="text" @click="cancel">Cancel</VBtn>
      <VBtn :disabled="isDirty" class="ml-2" type="submit" variant="tonal">
        Save
      </VBtn>
    </div>
  </VForm>
</template>

<script lang="ts" setup>
import { computed, defineEmits, defineProps, reactive, ref, watch } from 'vue';
import { Element, ElementData } from '@tailor-cms/ce-fill-blank-manifest';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import pullAt from 'lodash/pullAt';
import size from 'lodash/size';

const BLANK = /(@blank)/g;
const rules = {
  required: (val: string) => !!val || 'The field is required',
  hasBlanks: (val: string) =>
    !!val.match(BLANK) || 'At least one @blank required.',
};

const emit = defineEmits(['save']);
const props = defineProps<{
  element: Element;
  isFocused: boolean;
  isDisabled: boolean;
}>();

const form = ref<HTMLFormElement>();
const elementData = reactive<ElementData>(cloneDeep(props.element.data));
const isDirty = computed(() => isEqual(elementData, props.element.data));

const count = computed(() => size(elementData.question.match(BLANK)));
const isSynced = computed(() => count.value === elementData.correct.length);

const addAnswer = (index: number) => {
  elementData.correct[index].push('');
};

const updateAnswer = (groupIndex: number, answerIndex: number, val: string) => {
  elementData.correct[groupIndex][answerIndex] = val;
};

const removeAnswer = (groupIndex: number, answerIndex: number) => {
  pullAt(elementData.correct[groupIndex], answerIndex);
};

const removeGroup = (index: number) => pullAt(elementData.correct, index);

const save = async () => {
  const { valid } = await form.value?.validate();
  if (valid) emit('save', elementData);
};

const cancel = () => {
  Object.assign(elementData, cloneDeep(props.element.data));
  form.value?.resetValidation();
};

watch(
  () => props.element.data,
  (data) => Object.assign(elementData, cloneDeep(data)),
);

watch(count, (val) => {
  if (val > elementData.correct.length) elementData.correct.push(['']);
});
</script>

<style lang="scss" scoped>
.tce-container {
  text-align: left;
}
</style>
