import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Paper, Grid2 } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Web as ProjectsIcon, 
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon 
} from '@mui/icons-material';
import { getAllProjects } from 'services/adminServices/projectsService';

export const MainAdminHome: React.FC = () => {
  const navigate = useNavigate();
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const projects = await getAllProjects();
        setProjectsCount(projects.length);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const adminModules = [
    {
      title: 'Projects',
      description: 'Manage your portfolio projects, add new projects, update descriptions and images',
      icon: <ProjectsIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      path: 'projects',
      color: '#1976d2'
    },
    {
      title: 'Settings',
      description: 'Configure site settings, manage global preferences and system configurations',
      icon: <SettingsIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
      path: 'settings',
      color: '#dc004e',
      disabled: true // Future feature
    },
    {
      title: 'Analytics',
      description: 'View site analytics, visitor statistics and performance insights',
      icon: <AnalyticsIcon sx={{ fontSize: 48, color: 'success.main' }} />,
      path: 'analytics',
      color: '#2e7d32',
      disabled: true // Future feature
    }
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to ReDesignIT Admin Panel
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your portfolio website and projects
      </Typography>

      <Grid2 container spacing={3}>
        {adminModules.map((module) => (
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={module.title}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: module.disabled ? 'not-allowed' : 'pointer',
                opacity: module.disabled ? 0.6 : 1,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': module.disabled ? {} : {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => !module.disabled && navigate(module.path)}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  {module.icon}
                </Box>
                
                <Typography variant="h6" component="h2" gutterBottom>
                  {module.title}
                  {module.disabled && (
                    <Typography component="span" variant="caption" color="text.secondary">
                      {' '}(Coming Soon)
                    </Typography>
                  )}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {module.description}
                </Typography>
                
                <Button 
                  variant="contained" 
                  fullWidth
                  disabled={module.disabled}
                  sx={{ 
                    backgroundColor: module.disabled ? undefined : module.color,
                    '&:hover': {
                      backgroundColor: module.disabled ? undefined : `${module.color}dd`
                    }
                  }}
                >
                  {module.disabled ? 'Coming Soon' : `Manage ${module.title}`}
                </Button>
              </CardContent>
            </Card>
          </Grid2>
        ))}
      </Grid2>

      {/* Quick Stats Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Quick Overview
        </Typography>
        
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {loading ? '--' : projectsCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Projects
              </Typography>
            </Paper>
          </Grid2>
          
          <Grid2 size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="secondary">
                --
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Page Views (Coming Soon)
              </Typography>
            </Paper>
          </Grid2>
          
          <Grid2 size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                --
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visitors (Coming Soon)
              </Typography>
            </Paper>
          </Grid2>
        </Grid2>
      </Box>
    </Box>
  );
};