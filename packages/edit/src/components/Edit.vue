<template>
  <QuestionContainer
    v-bind="{ elementData, embedElementConfig, isDisabled }"
    :show-feedback="false"
    @update="emit('update', $event)"
  >
    <div class="d-flex text-subtitle-2 justify-space-between mb-2">
      <span v-if="isGradable">Answers</span>
      <span v-else-if="!isDisabled">
        {{ blankCount }} {{ pluralize('blank', blankCount) }} detected.
      </span>
      <span v-if="!isDisabled">Type '@blank' when new blank is needed.</span>
    </div>
    <VInput
      v-if="elementData.correct?.length"
      :model-value="elementData.correct"
      :rules="[rules.isSynced]"
      class="mb-4"
    >
      <Draggable
        v-model="elementData.correct"
        :component-data="{ class: 'd-flex flex-column w-100 ga-4' }"
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
                v-for="(_, answerIndex) in group"
                :key="`${groupIndex}.${answerIndex}`"
                v-model="elementData.correct[groupIndex][answerIndex]"
                :readonly="isDisabled"
                :rules="[rules.required]"
                class="my-2"
                placeholder="Answer..."
                variant="outlined"
              >
                <template v-if="!isDisabled && group.length > 1" #append>
                  <VBtn
                    aria-label="Remove answer"
                    color="primary-darken-4"
                    size="x-small"
                    variant="text"
                    icon
                    @click="removeAnswer(groupIndex, answerIndex)"
                  >
                    <VIcon icon="mdi-close" size="large" />
                  </VBtn>
                </template>
              </VTextField>
            </VSlideYTransition>
            <div v-if="!isDisabled" class="d-flex justify-end">
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
import { computed, defineEmits, defineProps, watch } from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import Draggable from 'vuedraggable/src/vuedraggable';
import { Element } from '@tailor-cms/ce-fill-blank-manifest';
import pluralize from 'pluralize';
import pullAt from 'lodash/pullAt';
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
  isFocused: boolean;
  isDisabled: boolean;
}>();
const emit = defineEmits(['save', 'update']);

const elementData = computed(() => props.element.data);
const isGradable = computed(() => elementData.value.isGradable);

const blankCount = computed(() => {
  const { question, embeds } = elementData.value;
  const questionData = question.map((id: any) => embeds[id].data.content);
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
