export function AddHighlight(text: string, regex: RegExp, className: string) {
	return text.replace(
		regex,
		(match: string) => `<span class="${className}">${match}</span>`,
	);
}
export const vHighlight = {
	mounted: (
		el: HTMLElement,
		binding: { value: { regex: RegExp; className: string } },
	) => {
		el.innerHTML = AddHighlight(
			el.innerHTML,
			binding.value.regex,
			binding.value.className,
		);
	},
};
