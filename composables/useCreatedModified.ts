import { useDateFormat } from "@vueuse/core";

export const useFormatCreatedModified = (value: {
	created: number;
	modified: number;
}) => {
	const formattedModifiedDateTime = useDateFormat(
		value.modified,
		"YYYY-MM-DD HH:mm",
	);
	const formattedCreatedDateTime = useDateFormat(
		value.created,
		"YYYY-MM-DD HH:mm",
	);
	return {
		created: formattedCreatedDateTime,
		modified: formattedModifiedDateTime,
	};
};
