import apiClient from "services/axiosConfig";
import { apiErrorHandler } from "../apiErrorHandler";
import { API_PROJECTS_ALL_URL } from "config";
import { AxiosResponse } from "axios";

export async function getAllProjects(): Promise<AxiosResponse | undefined> {
  try {
    const response = await apiClient.get(`${API_PROJECTS_ALL_URL}`);
    return response;
  } catch (error) {
    apiErrorHandler(error);
  }
}
