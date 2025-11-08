import { Box, Typography, Chip } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

interface SearchTopBarProps {
  searchQuery: string;
  resultsCount?: number;
}

export default function SearchTopBar({ searchQuery, resultsCount }: SearchTopBarProps) {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      gap={1}
      sx={{
        mb: 2, // margin bottom
        pb: 2, // padding bottom
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <SearchIcon color="action" />
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          Search Results
        </Typography>
      </Box>
      
      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
        <Typography variant="body1" color="text.secondary">
          Searching for:
        </Typography>
        <Chip 
          label={`"${searchQuery}"`}
          variant="outlined"
          color="primary"
          size="medium"
        />
        {resultsCount !== undefined && (
          <Typography variant="body2" color="text.secondary">
            ({resultsCount} {resultsCount === 1 ? 'result' : 'results'} found)
          </Typography>
        )}
      </Box>
    </Box>
  );
}