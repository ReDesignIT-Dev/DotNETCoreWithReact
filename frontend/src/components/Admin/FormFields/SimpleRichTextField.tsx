import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  FormHelperText,
  Paper
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered
} from '@mui/icons-material';
import { FIELD_LIMITS } from 'constants/validation';

interface SimpleRichTextFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  maxLength?: number;
}

export const SimpleRichTextField: React.FC<SimpleRichTextFieldProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  label = "Description",
  required = false,
  maxLength = FIELD_LIMITS.PRODUCT_DESCRIPTION // Use constant instead of hardcoded 10000
}) => {
  const [selectedFormat, setSelectedFormat] = useState<string[]>([]);

  const handleFormatChange = (
    event: React.MouseEvent<HTMLElement>,
    newFormats: string[]
  ) => {
    setSelectedFormat(newFormats);
  };

  const insertFormatting = (tag: string) => {
    const textarea = document.getElementById('rich-text-input') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const beforeText = value.substring(0, start);
      const afterText = value.substring(end);
      
      let newText = '';
      switch (tag) {
        case 'bold':
          newText = `${beforeText}<strong>${selectedText}</strong>${afterText}`;
          break;
        case 'italic':
          newText = `${beforeText}<em>${selectedText}</em>${afterText}`;
          break;
        case 'bullet':
          newText = `${beforeText}<ul><li>${selectedText || 'List item'}</li></ul>${afterText}`;
          break;
        case 'number':
          newText = `${beforeText}<ol><li>${selectedText || 'List item'}</li></ol>${afterText}`;
          break;
        default:
          return;
      }
      
      if (newText.replace(/<[^>]*>/g, '').length <= maxLength) {
        onChange(newText);
      }
    }
  };

  const textLength = value.replace(/<[^>]*>/g, '').length;

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        {label} {required && '*'}
      </Typography>
      
      <Paper variant="outlined" sx={{ p: 1, mb: 1 }}>
        <ToggleButtonGroup
          value={selectedFormat}
          onChange={handleFormatChange}
          size="small"
          disabled={disabled}
        >
          <ToggleButton 
            value="bold" 
            onClick={() => insertFormatting('bold')}
          >
            <FormatBold />
          </ToggleButton>
          <ToggleButton 
            value="italic"
            onClick={() => insertFormatting('italic')}
          >
            <FormatItalic />
          </ToggleButton>
          <ToggleButton 
            value="bullet"
            onClick={() => insertFormatting('bullet')}
          >
            <FormatListBulleted />
          </ToggleButton>
          <ToggleButton 
            value="number"
            onClick={() => insertFormatting('number')}
          >
            <FormatListNumbered />
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>
      
      <TextField
        id="rich-text-input"
        fullWidth
        multiline
        rows={8}
        value={value}
        onChange={(e) => {
          const newValue = e.target.value;
          if (newValue.replace(/<[^>]*>/g, '').length <= maxLength) {
            onChange(newValue);
          }
        }}
        disabled={disabled}
        error={!!error}
        placeholder="Enter product description with HTML formatting..."
        variant="outlined"
      />
      
      <FormHelperText 
        error={!!error}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 1
        }}
      >
        <span>{error || (required ? 'Required field' : 'HTML tags allowed: <strong>, <em>, <ul>, <ol>, <li>')}</span>
        <span style={{ 
          color: textLength > maxLength * 0.9 ? '#d32f2f' : '#666'
        }}>
          {textLength}/{maxLength} chars
        </span>
      </FormHelperText>
    </Box>
  );
};