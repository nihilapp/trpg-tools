<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
  isRolling: boolean;
  errorMessage: string | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'submit': [];
}>();

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement | null;

  emit('update:modelValue', target?.value ?? props.modelValue);
}
</script>

<template>
  <form class='space-y-4' @submit.prevent="$emit('submit')">
    <div>
      <label for='dice-expression' class='mb-2 block text-sm font-semibold text-black-900'>
        주사위식
      </label>
      <input
        id='dice-expression'
        :value='modelValue'
        type='text'
        placeholder='예: 2d20 5D20 2ㅇ30 d20+(2d6+3)'
        class='w-full rounded-2xl border border-black-200 px-4 py-3 text-base text-black-900 outline-none transition placeholder:text-black-400 focus:border-blue-500'
        @input='handleInput'
      >
      <p class='mt-2 text-xs text-black-500'>
        `d / D / ㅇ`, 여러 식 공백 구분, 괄호와 보정값을 그대로 입력할 수 있습니다.
      </p>
    </div>

    <div class='flex flex-wrap gap-3'>
      <button
        type='submit'
        class='rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-black-300'
        :disabled='isRolling'
      >
        굴리기
      </button>

      <p v-if='errorMessage' class='self-center text-sm text-red-600'>
        {{ errorMessage }}
      </p>
    </div>
  </form>
</template>
