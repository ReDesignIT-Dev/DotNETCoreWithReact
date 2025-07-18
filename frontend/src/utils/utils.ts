import apiClient from "services/axiosConfig";

export function getIdFromSlug(slug: string): number | null {
    const idMatch = slug.match(/(\d+)$/); // Matches the last group of digits in the slug
    return idMatch ? parseInt(idMatch[1], 10) : null;
  }
  
export const getHeaders = (additionalHeaders?: Record<string, string>): Record<string, string> => {
  return {
    ...apiClient.defaults.headers as Record<string, string>,
    ...additionalHeaders
  };
};