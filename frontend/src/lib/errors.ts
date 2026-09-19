export function extractErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string; errors?: Record<string, string> } } }).response;
    if (response?.data?.message) return response.data.message;
    if (response?.data?.errors) {
      return Object.values(response.data.errors).join(", ");
    }
  }
  return "Une erreur inattendue est survenue.";
}
