import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  CardMedia,
  Container,
  Box,
  Grid2,
} from "@mui/material";
import { getAllProjects } from "services/homeServices/apiRequestsHome";
import shopDefaultImage from "assets/images/shop_default_image.jpg";

interface Project {
  id: number;
  title: string;
  description: string;
  url: string;
  image: string;
}

const ProjectsBox: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getAllProjects();
        if (response && response.data) {
          setProjects(response.data);
        }
      } catch (err) {
        setError("Failed to fetch projects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (isLoading) {
    return <Typography align="center">Loading projects...</Typography>;
  }

  if (error) {
    return (
      <Typography align="center" color="error">
        {error}
      </Typography>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h2" align="center" gutterBottom>
        My Projects
      </Typography>
      <Grid2 container spacing={4} sx={{ display: "flex", flexWrap: "wrap" }}>
        {projects.map((project) => (
          <Grid2
            container
            size={{ xs: 12, sm: 6, md: 4 }}
            sx={{ display: "flex" }}
            key={project.id}
          >
            <Card
              component="a"
              href={project.url}
              rel="noopener noreferrer"
              sx={{
                maxWidth: "282px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "auto",
                padding: 2,
                textDecoration: "none",
                color: "inherit", 
                transition: "transform 0.3s, box-shadow 0.3s", 
                "&:hover": {
                  transform: "scale(1.05)", 
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
                  backgroundColor: "#f9f9f9",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <CardMedia
                  component="img"
                  image={project.image || shopDefaultImage}
                  alt={project.title}
                  sx={{
                    maxHeight: "250px",
                    maxWidth: "250px",
                    objectFit: "contain",
                  }}
                />
              </Box>
              <CardContent
                sx={{
                  textAlign: "center",
                  padding: 0,
                }}
              >
                <Typography
                  variant="h5"
                  component="div"
                  sx={{
                    color: "inherit",
                    "&:hover": {
                      color: "inherit",
                    },
                  }}
                >
                  {project.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {project.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid2>
        ))}
      </Grid2>
    </Container>
  );
};

export default ProjectsBox;
