import { isEmpty } from '.';

export const passwordValidator = (password) => {
	const containsLetter = /[A-Za-z]+/.test(password);
	const containsNumber = /[0-9]/.test(password);
	const containsSpace = /\s+/.test(password);
	const hasExactLimit = password?.length >= 8;

	const result =
		!containsSpace && containsLetter && containsNumber && hasExactLimit;
	return result;
};

export const nameValidator = (value) => {
	if (isEmpty(value)) {return true;}
	return /^[A-Za-z\s]+$/.test(String(value));
};

export const minLength = (length) => (value) => {
	if (isEmpty(value)) {return true;}
	return (
		String(value).length >= Number(length) ||
		`Field must be at least ${length} characters`
	);
};
