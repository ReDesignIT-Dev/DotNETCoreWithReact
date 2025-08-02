
interface Project {
  id: number;
  title: string;
  description: string;
  url: string;
  image: ProjectImage;
  thumbnailUrl: string;
}

interface ProjectImage {
  id: number;
  url: string;
  thumbnailUrl: string;
  altText?: string;
}