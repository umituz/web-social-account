
export const shouldRetryOnStatus = (status: number): boolean => {
  if (status >= 500) return true;
  if (status === 429) return true;
  return false;
};

export const isClientError = (status: number): boolean =>
  status >= 400 && status < 500 && status !== 429;

export const isServerError = (status: number): boolean => status >= 500;
