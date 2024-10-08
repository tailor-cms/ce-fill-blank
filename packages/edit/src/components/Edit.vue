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
    <VInput :model-value="elementData.correct" :rules="[rules.isSynced]">
      <div class="d-flex flex-column w-100">
        <Draggable
          v-model="elementData.correct"
          :disabled="isDisabled"
          animation="150"
          handle=".drag-handle"
          item-key="id"
        >
          <template #item="{ element: group, index: groupIndex }">
            <div>
              <div class="d-flex mb-4">
                <VIcon
                  v-if="!isDisabled"
                  class="drag-handle"
                  color="grey"
                  icon="mdi-drag-vertical"
                />
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
              <VSlideYTransition group>
                <VTextField
                  v-for="(_, answerIndex) in group"
                  :key="`${groupIndex}.${answerIndex}`"
                  v-model="elementData.correct[groupIndex][answerIndex]"
                  :readonly="isDisabled"
                  :rules="[rules.required]"
                  class="my-2"
                  placeholder="Answer..."
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
              </VSlideYTransition>
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
          </template>
        </Draggable>
      </div>
    </VInput>
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
import Draggable from 'vuedraggable/src/vuedraggable';
import isEqual from 'lodash/isEqual';
import pullAt from 'lodash/pullAt';
import size from 'lodash/size';

const BLANK = /(@blank)/g;
const SYNC_ERROR = `
  Question and blanks are out of sync! Please delete unnecessary answer groups
  or add blanks in the question!
`;

const rules = {
  required: (val: string) => !!val || 'The field is required',
  isSynced: (val: string[][]) => val.length === count.value || SYNC_ERROR,
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
  const diff = val - elementData.correct.length;
  if (diff > 0) return elementData.correct.push(...Array(diff).fill(['']));
});
</script>

<style lang="scss" scoped>
.tce-container {
  text-align: left;
}

.drag-handle {
  cursor: pointer;
}
</style>
