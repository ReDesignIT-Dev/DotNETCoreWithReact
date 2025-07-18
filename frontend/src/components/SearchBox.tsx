import { useState, ChangeEvent, KeyboardEvent, MouseEvent } from "react";
import { TextField, IconButton, Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { FRONTEND_SEARCH_URL } from "config";
import { useNavigate } from "react-router-dom";

export default function SearchBox() {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const navigate = useNavigate();

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        const encodedSearchTerm = encodeURIComponent(searchTerm.trim());
        navigate(`${FRONTEND_SEARCH_URL}?string=${encodedSearchTerm}`);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleSearchClick(event as unknown as MouseEvent<HTMLButtonElement>);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: "100%",
                maxWidth: 600, 
            }}
        >
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Search"
                value={searchTerm}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                sx={{ flex: 1, backgroundColor: "white" }}
            />
            <IconButton color="primary" onClick={handleSearchClick} sx={{backgroundColor: "white"}}>
                <SearchIcon />
            </IconButton>
        </Box>
    );
}
