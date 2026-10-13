/** Resolves a file in public/ against the deploy base, so the build works at any path. */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
