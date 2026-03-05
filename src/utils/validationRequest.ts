export type ValidationRules = {
    [key: string]: {
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        pattern?: RegExp;
        gt?: boolean;
        customValidator?: (value: any) => string | null;
    };
};

export type ValidationErrors = {
    [key: string]: string;
};

export const validationRequest = (
    formData: Record<string, any>,
    validationRules: ValidationRules
): { isValid: boolean; errors: ValidationErrors } => {
    let errors: ValidationErrors = {};

    Object.keys(validationRules).forEach((field) => {
        const value = formData[field];
        const rules = validationRules[field];

        if (rules.minLength && value?.length < rules.minLength) {
            errors[field] = `${field} must be at least ${rules.minLength} characters`;
        }

        if (rules.maxLength && value?.length > rules.maxLength) {
            errors[field] = `${field} must be at most ${rules.maxLength} characters`;
        }

        if (rules.pattern && !rules.pattern.test(value)) {
            errors[field] = `${field} is invalid`;
        }

        if (rules.required && !value) {
            errors[field] = `Field is required`;
        }
        if (rules.gt && !(value > 0)) {
            errors[field] = `Field must be greater than 0.`;
        }


        if (rules.customValidator) {
            const customError = rules.customValidator(value);
            if (customError) {
                errors[field] = customError;
            }
        }
    });

    return { isValid: Object.keys(errors).length === 0, errors };
};
