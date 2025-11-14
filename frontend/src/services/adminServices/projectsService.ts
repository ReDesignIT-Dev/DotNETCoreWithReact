import axios from 'axios';
import { API_ADMIN_PROJECTS_URL } from 'config';
import { getValidatedToken } from 'utils/cookies';

export interface ProjectDto {
  id?: number;
  title: string;
  url?: string;
  description: string;
  image?: File;
}

export interface ProjectReadDto {
  id: number;
  title: string;
  url?: string;
  description: string;
  image?: {
    id: number;
    url: string;
    thumbnailUrl: string;
  };
  thumbnailUrl?: string;
}

export const getAllProjects = async (): Promise<ProjectReadDto[]> => {
  const response = await axios.get(`${API_ADMIN_PROJECTS_URL}`, {
    headers: {
          'Authorization': `Bearer ${getValidatedToken()}`
    }
  });
  return response.data;
};

export const getProjectById = async (id: number): Promise<ProjectReadDto> => {
  const response = await axios.get(`${API_ADMIN_PROJECTS_URL}/${id}`, {
    headers: {
          'Authorization': `Bearer ${getValidatedToken()}`
    }
  });
  return response.data;
};

export const createProject = async (projectData: ProjectDto): Promise<ProjectReadDto> => {
  const formData = new FormData();
  formData.append('title', projectData.title);
  formData.append('description', projectData.description);
  
  if (projectData.url) {
    formData.append('url', projectData.url);
  }
  
  if (projectData.image) {
    formData.append('image', projectData.image);
  }

  const response = await axios.post(`${API_ADMIN_PROJECTS_URL}`, formData, {
    headers: {
          'Authorization': `Bearer ${getValidatedToken()}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updateProject = async (id: number, projectData: ProjectDto): Promise<void> => {
  const formData = new FormData();
  formData.append('title', projectData.title);
  formData.append('description', projectData.description);
  
  if (projectData.url) {
    formData.append('url', projectData.url);
  }
  
  if (projectData.image) {
    formData.append('image', projectData.image);
  }

  await axios.put(`${API_ADMIN_PROJECTS_URL}/${id}`, formData, {
    headers: {
          'Authorization': `Bearer ${getValidatedToken()}`,
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const deleteProject = async (id: number): Promise<void> => {
  await axios.delete(`${API_ADMIN_PROJECTS_URL}/${id}`, {
    headers: {
          'Authorization': `Bearer ${getValidatedToken()}`
    }
  });
};