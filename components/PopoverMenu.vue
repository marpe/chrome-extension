<script lang="ts" setup>
import { useTemplateRef } from "vue";

const menu = useTemplateRef("menu");

onClickOutside(menu, (e) => {
	if (menu.value) {
		// menu.value.hidePopover();
	}
});

const open = (value?: boolean) => {
	if (menu.value) {
		if (value === undefined || value) {
			menu.value.showPopover();
		} else {
			menu.value.hidePopover();
		}
	}
};
</script>

<template>
  <div>
    <slot :open="open" :anchor-name="'--popover-btn'" />
  </div>
  <div ref="menu" class="popover bg-[var(--surface-3)] rounded-md" popover>
    <div class="flex flex-col popover-wrapper">
      <slot name="menu" :open="open" />
    </div>
  </div>
</template>

<style>
.popover {
  inset: auto;
  margin-block: var(--size-2);
  position-anchor: --popover-btn;
  position-area: block-start span-inline-end;
  position-try-fallbacks: flip-block;
  position-try-order: most-height;
  position-visibility: anchors-visible;

  button {
    gap: 1rem;
    justify-content: start;
    padding: 0.7rem 1rem;

    &:hover {
      background-color: var(--surface-6);
    }
  }

  &,
  &::backdrop {
    opacity: 0;
    transition:
        display .5s allow-discrete,
        overlay .5s allow-discrete,
        transform 1s var(--ease-spring-3),
        opacity .5s;
  }

  &::backdrop {
    background: black;
  }


  &:popover-open {
    opacity: 1;

    &::backdrop {
      opacity: 0.5;
    }
  }

  @starting-style {
    &:popover-open {
      transform: scale(.9);
    }

    &:popover-open,
    &:popover-open::backdrop {
      opacity: 0;
    }
  }
}

</style>
