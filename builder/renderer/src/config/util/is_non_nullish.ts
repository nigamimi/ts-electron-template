export const isNonNullish = <T>(input: T | null | undefined): input is T => {
    if (typeof input === "boolean") return true;
    return (input ?? false) !== false;
};
