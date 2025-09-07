

export const formatExpiry = (dateString: string): string => {
  const expiryDate = new Date(dateString);
  return expiryDate.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};