export type NoteFormState = {
	readonly errors: {
		readonly title?: string;
		readonly content?: string;
		readonly form?: string;
	};
};

export const emptyFormState: NoteFormState = { errors: {} };
