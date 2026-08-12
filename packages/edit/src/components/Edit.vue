<template>
  <div class="tce-fill-blank">
    <div class="d-flex text-title-small justify-space-between mb-2">
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
                color="surface-container-highest"
                size="small"
                variant="flat"
                label
              >
                {{ groupIndex + 1 }}
              </VChip>
              <VSpacer />
              <VBtn
                v-if="!isReadonly && !isSynced"
                aria-label="Remove group"
                color="error"
                icon="mdi-delete-outline"
                size="x-small"
                variant="tonal"
                @click="removeGroup(groupIndex)"
              />
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
                @update:model-value="
                  updateAnswer(groupIndex, index as number, $event)
                "
              >
                <template v-if="!isReadonly && group.length > 1" #append>
                  <VBtn
                    aria-label="Remove answer"
                    density="comfortable"
                    icon="mdi-close"
                    size="small"
                    variant="text"
                    @click="removeAnswer(groupIndex, index as number)"
                  />
                </template>
              </VTextField>
            </VSlideYTransition>
            <div v-if="!isReadonly" class="d-flex justify-end">
              <VBtn
                prepend-icon="mdi-plus"
                text="Add Answer"
                variant="text"
                @click="addAnswer(groupIndex)"
              />
            </div>
          </div>
        </template>
      </Draggable>
    </VInput>
  </div>
</template>

<script lang="ts" setup>
import { cloneDeep, map, pullAt, sortBy } from 'lodash-es';
import { computed, watch } from 'vue';
import type { Element, ElementData } from '@tailor-cms/ce-fill-blank-manifest';
import Draggable from 'vuedraggable/src/vuedraggable';
import pluralize from 'pluralize-esm';

const BLANK = /(@blank)/g;
const SYNC_ERROR = `
  Question and blanks are out of sync! Please delete unnecessary answer groups
  or add blanks in the question!
`;

const props = defineProps<{
  element: Element;
  embedElementConfig: any[];
  isDragged: boolean;
  isFocused: boolean;
  isReadonly: boolean;
}>();

const emit = defineEmits<{
  update: [data: Partial<ElementData>];
}>();

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

const rules = {
  required: (val: string) => !!val || 'The field is required',
  isSynced: (val: string[][]) => val.length === blankCount.value || SYNC_ERROR,
  hasBlanks: (val: string) =>
    !!val.match(BLANK) || 'At least one @blank required.',
};

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
.tce-fill-blank {
  text-align: left;
}

.drag-handle {
  cursor: pointer;
}
</style>
