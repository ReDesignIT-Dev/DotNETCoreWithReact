import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    Avatar
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { getProjectById, updateProject, ProjectDto, ProjectReadDto } from 'services/adminServices/projectsService';
import { MAIN_ADMIN_PROJECTS_PATH } from 'config';
import { ImageUploadDropzone } from 'components/Admin/FormFields/ImageUploadDropzone';

export const ProjectEdit: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [project, setProject] = useState<ProjectReadDto | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [formData, setFormData] = useState<ProjectDto>({
        title: '',
        url: '',
        description: '',
        image: undefined
    });

    useEffect(() => {
        const fetchProject = async () => {
            if (!id) return;

            try {
                setFetchLoading(true);
                const projectData = await getProjectById(parseInt(id));
                setProject(projectData);
                setFormData({
                    title: projectData.title,
                    url: projectData.url || '',
                    description: projectData.description,
                    image: undefined
                });
            } catch (error) {
                console.error('Failed to fetch project:', error);
                setError('Failed to load project data');
            } finally {
                setFetchLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    const handleInputChange = (field: keyof ProjectDto) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleImageDrop = (files: File[]) => {
        if (files.length > 0) {
            const file = files[0]; // Take only the first file since we only need one image
            setSelectedImage(file);
            setFormData(prev => ({
                ...prev,
                image: file
            }));
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!id || !formData.title.trim() || !formData.description.trim()) {
            setError('Title and description are required');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await updateProject(parseInt(id), formData);
            navigate(`../${MAIN_ADMIN_PROJECTS_PATH}`);
        } catch (error) {
            console.error('Failed to update project:', error);
            setError('Failed to update project. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!project) {
        return (
            <Alert severity="error">
                Project not found
            </Alert>
        );
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Edit Project: {project.title}
            </Typography>

            <Paper sx={{ p: 3 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            label="Title"
                            required
                            fullWidth
                            value={formData.title}
                            onChange={handleInputChange('title')}
                            disabled={loading}
                        />

                        <TextField
                            label="URL"
                            fullWidth
                            value={formData.url}
                            onChange={handleInputChange('url')}
                            disabled={loading}
                            helperText="Optional project URL"
                        />

                        <TextField
                            label="Description"
                            required
                            fullWidth
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={handleInputChange('description')}
                            disabled={loading}
                        />

                        <Box>
                            <Typography variant="body1" gutterBottom>
                                Project Image
                            </Typography>

                            {/* Show current image if exists */}
                            {project.thumbnailUrl && !selectedImage && (
                                <Box sx={{ mb: 2 }}>
                                    <Avatar
                                        src={project.thumbnailUrl}
                                        alt="Current project image"
                                        sx={{ width: 100, height: 100, mb: 1 }}
                                    />
                                    <Typography variant="caption" display="block" color="textSecondary">
                                        Current image
                                    </Typography>
                                </Box>
                            )}

                            {/* Show selected image preview */}
                            {selectedImage && (
                                <Box sx={{ mb: 2 }}>
                                    <Avatar
                                        src={URL.createObjectURL(selectedImage)}
                                        alt="Selected image preview"
                                        sx={{ width: 100, height: 100, mb: 1 }}
                                    />
                                    <Typography variant="caption" display="block" color="textSecondary">
                                        New image selected: {selectedImage.name}
                                    </Typography>
                                </Box>
                            )}

                            <ImageUploadDropzone
                                onDrop={handleImageDrop}
                                disabled={loading}
                                multiple={false}
                                maxSize={10 * 1024 * 1024} // 10MB max for project images
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate(`../${MAIN_ADMIN_PROJECTS_PATH}`)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : null}
                            >
                                {loading ? 'Updating...' : 'Update Project'}
                            </Button>
                        </Box>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};