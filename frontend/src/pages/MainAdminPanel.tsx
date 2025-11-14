import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';
import { ProjectsPanel } from 'components/Admin/Main/ProjectsPanel';
import { ProjectAdd } from 'components/Admin/Main/ProjectAdd';
import { ProjectEdit } from 'components/Admin/Main/ProjectEdit';
import { MainAdminNavigation } from 'components/Admin/Main/MainAdminNavigation';
import { MainAdminHome } from 'components/Admin/Main/MainAdminHome';
import { AdminRoute } from 'components/AdminRoute';
import { 
  MAIN_ADMIN_PROJECTS_PATH,
  MAIN_ADMIN_PROJECTS_ADD_PATH,
  MAIN_ADMIN_PROJECTS_EDIT_PATH,
  MAIN_ADMIN_SETTINGS_PATH,
  MAIN_ADMIN_ANALYTICS_PATH,
  getMainProjectEditPath,
  getMainProjectAddPath
} from '../config';

export const MainAdminPanel: React.FC = () => {
  const navigate = useNavigate();

  const handleAddProject = () => {
    navigate(getMainProjectAddPath()); 
  };

  const handleEditProject = (id: number) => {
    navigate(getMainProjectEditPath(id)); 
  };

  return (
    <AdminRoute>
      <Container maxWidth="xl">
        <Box sx={{ py: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            ReDesignIT Admin Panel
          </Typography>
          
          <MainAdminNavigation />

          <Box sx={{ mt: 3 }}>
            <Routes>
              <Route path="" element={<MainAdminHome />} />
              <Route path={MAIN_ADMIN_PROJECTS_PATH} element={<ProjectsPanel onAdd={handleAddProject} onEdit={handleEditProject} />} />
              <Route path={MAIN_ADMIN_PROJECTS_ADD_PATH} element={<ProjectAdd />} />
              <Route path={MAIN_ADMIN_PROJECTS_EDIT_PATH} element={<ProjectEdit />} />
              <Route path={MAIN_ADMIN_SETTINGS_PATH} element={<div>Site settings coming soon...</div>} />
              <Route path={MAIN_ADMIN_ANALYTICS_PATH} element={<div>Analytics coming soon...</div>} />
              <Route path="*" element={<Navigate to="" replace />} />
            </Routes>
          </Box>
        </Box>
      </Container>
    </AdminRoute>
  );
};