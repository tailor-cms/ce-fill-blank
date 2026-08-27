<template>
  <div class="tce-fill-blank mb-6">
    <div class="d-flex align-center justify-space-between mb-3">
      <span class="text-label-large">
        <template v-if="isGradable">Answers</template>
        <template v-else-if="!isReadonly">
          {{ blankCount }} {{ pluralize('blank', blankCount) }} detected.
        </template>
      </span>
      <span
        v-if="!isReadonly && !showEmptyState"
        class="text-label-medium text-medium-emphasis"
      >
        Type '@blank' when new blank is needed.
      </span>
    </div>
    <VExpandTransition mode="out-in">
      <VAlert
        v-if="showEmptyState"
        color="surface-container"
        icon="mdi-information-outline"
        prominent
      >
        <template v-if="isReadonly">
          No blanks have been added to this question.
        </template>
        <template v-else>
          Type '@blank' in the question above to add a blank and its answers.
        </template>
      </VAlert>
      <VInput
        v-else-if="hasGroups"
        :model-value="elementData.correct"
        :rules="[rules.isSynced, rules.allFilled]"
        max-errors="2"
      >
        <VExpansionPanels
          ref="panels"
          v-model="expanded"
          class="w-100"
          rounded="lg"
          flat
          multiple
        >
          <VExpandTransition group>
            <VExpansionPanel
              v-for="(group, groupIndex) in groups"
              :key="groupIndex"
              :value="groupIndex"
              class="group-card"
            >
              <VExpansionPanelTitle class="pa-2 pr-4" min-height="50">
                <div class="d-flex align-center w-100 ga-2">
                  <span
                    v-if="!isReadonly"
                    class="drag-handle"
                    @drag.stop.prevent
                  >
                    <VIcon icon="mdi-drag-vertical" />
                  </span>
                  <VChip
                    :text="`Blank ${groupIndex + 1}`"
                    class="font-weight-bold"
                    color="secondary"
                    size="small"
                    variant="tonal"
                  />
                  <VSpacer />
                  <VBtn
                    v-if="!isReadonly && !isSynced"
                    aria-label="Remove group"
                    class="mr-2"
                    color="error"
                    density="comfortable"
                    icon="mdi-trash-can-outline"
                    size="small"
                    variant="text"
                    @click.stop="removeGroup(groupIndex)"
                  />
                </div>
              </VExpansionPanelTitle>
              <VExpansionPanelText class="border-t-thin">
                <VSlideYTransition group>
                  <VTextField
                    v-for="(answer, index) in group"
                    :key="`${groupIndex}.${index}`"
                    :model-value="answer"
                    :readonly="isReadonly"
                    :rules="[rules.required]"
                    class="my-2"
                    density="comfortable"
                    placeholder="Answer..."
                    variant="outlined"
                    hide-details
                    @update:model-value="
                      updateAnswer(groupIndex, index as number, $event)
                    "
                  >
                    <template #prepend>
                      <VAvatar
                        :text="String(index + 1)"
                        class="text-label-medium font-weight-semibold"
                        color="surface-container-highest"
                        rounded="lg"
                        size="small"
                      />
                    </template>
                    <template v-if="!isReadonly" #append>
                      <VBtn
                        :disabled="group.length <= 1"
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
                <div v-if="!isReadonly" class="d-flex justify-center mt-3">
                  <VBtn
                    prepend-icon="mdi-plus"
                    text="Add Answer"
                    variant="text"
                    @click="addAnswer(groupIndex)"
                  />
                </div>
              </VExpansionPanelText>
            </VExpansionPanel>
          </VExpandTransition>
        </VExpansionPanels>
      </VInput>
    </VExpandTransition>
  </div>
</template>

<script lang="ts" setup>
import {
  cloneDeep,
  concat,
  difference,
  map,
  pullAt,
  sortBy,
  times,
  without,
} from 'lodash-es';
import { computed, ref, watch } from 'vue';
import type { Element, ElementData } from '@tailor-cms/ce-fill-blank-manifest';
import pluralize from 'pluralize-esm';
import { useDraggable } from 'vue-draggable-plus';

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
const hasGroups = computed(() => !!elementData.value.correct?.length);
const showEmptyState = computed(() => isGradable.value && !hasGroups.value);
const groupIndices = computed(() => groups.value.map((_, index) => index));
const groups = computed({
  get: () => elementData.value.correct ?? [],
  set: (correct) => emit('update', { correct }),
});

// Tracked as collapsed so groups start open, including ones added later.
const collapsed = ref<number[]>([]);
const expanded = computed({
  get: () => without(groupIndices.value, ...collapsed.value),
  set: (value) => (collapsed.value = difference(groupIndices.value, value)),
});

const panels = ref();

// Panels only render once there is at least one group, so Sortable can't bind
// at setup — start it when the container actually appears.
const { start } = useDraggable(panels, groups, {
  animation: 150,
  handle: '.drag-handle',
  immediate: false,
});

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
  allFilled: (val: string[][]) =>
    val.every((group) => group.every((it) => !!it)) ||
    'All answers are required',
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
  const correct = concat(
    elementData.value.correct,
    times(diff, () => ['']),
  );
  emit('update', { correct });
});

watch(panels, (el) => el && start(), { flush: 'post' });
</script>

<style lang="scss" scoped>
.tce-fill-blank {
  text-align: left;
}

.drag-handle {
  cursor: pointer;
}

.group-card {
  border: thin solid rgba(0, 0, 0, 0.12);
}

:deep(.sortable-ghost) > * {
  visibility: hidden;
}

:deep(.v-btn) {
  --v-hover-opacity: 0.12;
}
</style>
