import { Box, Button, TextField } from "@mui/material";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
}

export default function PaginationComponent({ currentPage, totalPages }: PaginationComponentProps) {
  const [pageInput, setPageInput] = useState(currentPage);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Synchronize pageInput with currentPage whenever currentPage changes
  useEffect(() => {
    setPageInput(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const params = new URLSearchParams(searchParams);

      if (newPage === 1) {
        params.delete("page"); // Remove ?page=1 if going to the first page
      } else {
        params.set("page", String(newPage));
      }

      const query = params.toString();
      navigate(query ? `?${query}` : "");
    }
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1} mb={2}>
      <Button variant="outlined" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}>
        ←
      </Button>

      <TextField
        type="number"
        size="small"
        value={pageInput}
        onChange={(e) => setPageInput(Number(e.target.value))}
        onBlur={() => {
          if (pageInput !== currentPage) {
            handlePageChange(pageInput);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur(); // Trigger blur logic
          }
        }}
        slotProps={{
          htmlInput: {
            min: 1,
            max: totalPages,
            style: { textAlign: "center" },
          },
        }}
        sx={{
          width: 80,
          "& input[type=number]": {
            MozAppearance: "textfield",
          },
          "& input[type=number]::-webkit-outer-spin-button": {
            WebkitAppearance: "none",
            margin: 0,
          },
          "& input[type=number]::-webkit-inner-spin-button": {
            WebkitAppearance: "none",
            margin: 0,
          },
        }}
      />

      <Box component="span">of {totalPages}</Box>

      <Button variant="outlined" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
        →
      </Button>
    </Box>
  );
}