import {
	executeScript,
	injectCSS,
	removeInjectedCSS,
} from "@/utils/userScript";

export const useScripting = () => {
	return {
		executeScript,
		injectCSS,
		removeInjectedCSS,
	};
};
