<template>
  <QuestionContainer
    v-bind="{ elementData, embedElementConfig, isReadonly }"
    :show-feedback="false"
    @update="emit('update', $event)"
  >
    <div class="d-flex text-subtitle-2 justify-space-between mb-2">
      <span v-if="isGradable">Answers</span>
      <span v-else-if="!isReadonly">
        {{ blankCount }} {{ pluralize('blank', blankCount) }} detected.
      </span>
      <span v-if="!isReadonly">Type '@blank' when new blank is needed.</span>
    </div>
    <VInput
      v-if="elementData.correct?.length"
      :model-value="elementData.correct"
      :rules="[rules.isSynced]"
      class="mb-4"
    >
      <Draggable
        :component-data="{ class: 'd-flex flex-column w-100 ga-4' }"
        :disabled="isReadonly"
        :model-value="elementData.correct"
        animation="150"
        handle=".drag-handle"
        item-key="index"
        @update:model-value="emit('update', { correct: $event })"
      >
        <template #item="{ element: group, index: groupIndex }">
          <div>
            <div class="d-flex mb-4">
              <VIcon
                v-if="!isReadonly"
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
                v-if="!isReadonly && !isSynced"
                color="secondary-lighten-1"
                size="x-small"
                variant="tonal"
                icon
                @click="removeGroup(groupIndex)"
              >
                <VIcon icon="mdi-delete-outline" size="large" />
              </VBtn>
            </div>
            <VSlideYTransition group>
              <VTextField
                v-for="(answer, index) in group"
                :key="`${groupIndex}.${index}`"
                :model-value="answer"
                :readonly="isReadonly"
                :rules="[rules.required]"
                class="my-2"
                placeholder="Answer..."
                variant="outlined"
                @update:model-value="updateAnswer(groupIndex, index, $event)"
              >
                <template v-if="!isReadonly && group.length > 1" #append>
                  <VBtn
                    aria-label="Remove answer"
                    color="primary-darken-4"
                    size="x-small"
                    variant="text"
                    icon
                    @click="removeAnswer(groupIndex, index)"
                  >
                    <VIcon icon="mdi-close" size="large" />
                  </VBtn>
                </template>
              </VTextField>
            </VSlideYTransition>
            <div v-if="!isReadonly" class="d-flex justify-end">
              <VBtn
                color="primary-darken-4"
                prepend-icon="mdi-plus"
                variant="text"
                @click="addAnswer(groupIndex)"
              >
                Add Answer
              </VBtn>
            </div>
          </div>
        </template>
      </Draggable>
    </VInput>
  </QuestionContainer>
</template>

<script lang="ts" setup>
import { cloneDeep, map, pullAt, sortBy } from 'lodash-es';
import { computed, defineEmits, defineProps, watch } from 'vue';
import Draggable from 'vuedraggable/src/vuedraggable';
import { Element } from '@tailor-cms/ce-fill-blank-manifest';
import pluralize from 'pluralize-esm';
import { QuestionContainer } from '@tailor-cms/core-components';

const BLANK = /(@blank)/g;
const SYNC_ERROR = `
  Question and blanks are out of sync! Please delete unnecessary answer groups
  or add blanks in the question!
`;

const rules = {
  required: (val: string) => !!val || 'The field is required',
  isSynced: (val: string[][]) => val.length === blankCount.value || SYNC_ERROR,
  hasBlanks: (val: string) =>
    !!val.match(BLANK) || 'At least one @blank required.',
};

const props = defineProps<{
  element: Element;
  embedElementConfig: any[];
  isDragged: boolean;
  isFocused: boolean;
  isReadonly: boolean;
}>();
const emit = defineEmits(['save', 'update']);

const elementData = computed(() => props.element.data);
const isGradable = computed(() => elementData.value.isGradable);

const blankCount = computed(() => {
  const sortedEmbeds = sortBy(elementData.value.embeds, 'position');
  const questionData = map(sortedEmbeds, 'data.content');
  return questionData.toString().match(BLANK)?.length ?? 0;
});

const isSynced = computed(() => {
  const correct = elementData.value.correct;
  return !correct || blankCount.value === correct.length;
});

const addAnswer = (index: number) => {
  const correct = cloneDeep(elementData.value.correct);
  if (!correct) return;
  correct[index].push('');
  emit('update', { correct });
};

const updateAnswer = (groupIndex: number, answerIndex: number, val: string) => {
  const correct = cloneDeep(elementData.value.correct);
  if (!correct) return;
  correct[groupIndex][answerIndex] = val;
  emit('update', { correct });
};

const removeAnswer = (groupIndex: number, answerIndex: number) => {
  const correct = cloneDeep(elementData.value.correct);
  if (!correct) return;
  pullAt(correct[groupIndex], answerIndex);
  emit('update', { correct });
};

const removeGroup = (index: number) => {
  const correct = cloneDeep(elementData.value.correct);
  if (!correct) return;
  pullAt(correct, index);
  emit('update', { correct });
};

watch(blankCount, (val) => {
  if (!isGradable.value || !elementData.value.correct) return;
  const diff = val - elementData.value.correct.length;
  if (diff <= 0) return;
  const correct = cloneDeep(elementData.value.correct);
  correct.push(...Array(diff).fill(['']));
  emit('update', { correct });
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
