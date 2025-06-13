export function isUnauthorizedError(error: any): boolean {
  if (!error) return false;
  
  // Check if it's a fetch response error
  if (error.status === 401) return true;
  
  // Check error message patterns
  if (error.message) {
    return /401|Unauthorized|Not authenticated/i.test(error.message);
  }
  
  return false;
}