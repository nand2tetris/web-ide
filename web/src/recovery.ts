/** Startup default for the application; parser defaults remain strict. */
export const recoveryConfiguration = {
  attemptRecovery: import.meta.env.VITE_PARSER_RECOVERY === "true",
};
