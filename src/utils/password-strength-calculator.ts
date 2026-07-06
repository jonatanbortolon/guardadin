export function passwordStrengthCalculator(password: string) {
	return {
		minLength: password.length >= 8,
		hasUpperCase: password.match(/[A-Z]/),
		hasLowerCase: password.match(/[a-z]/),
		hasNumber: password.match(/\d/),
		hasSpecialCharacter: password.match(/[^a-zA-Z0-9]/),
	};
}

export function isStrongPassword(password: string) {
	return Object.values(passwordStrengthCalculator(password)).every(Boolean);
}
