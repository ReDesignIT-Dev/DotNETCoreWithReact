import React, { useRef, useEffect } from 'react';
import {
    Box,
    Typography,
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
    maxLength = FIELD_LIMITS.PRODUCT_DESCRIPTION
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isUpdating = useRef(false);

    // Sync prop value to editor content when it changes externally
    useEffect(() => {
        if (editorRef.current && !isUpdating.current) {
            if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value || '';
            }
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            isUpdating.current = true;
            const html = editorRef.current.innerHTML;
            const textOnly = editorRef.current.innerText || '';

            if (textOnly.length <= maxLength) {
                onChange(html);
            } else {
                // Revert if exceeds max length
                editorRef.current.innerHTML = value;
            }

            setTimeout(() => {
                isUpdating.current = false;
            }, 0);
        }
    };

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput(); // Update the state after command
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        // Ctrl+B for Bold
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            execCommand('bold');
        }
        // Ctrl+I for Italic
        else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            execCommand('italic');
        }
        // Ctrl+Shift+L for Bullet list
        else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
            e.preventDefault();
            execCommand('insertUnorderedList');
        }
        // Ctrl+Shift+N for Numbered list
        else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
            e.preventDefault();
            execCommand('insertOrderedList');
        }
    };

    const textLength = editorRef.current?.innerText?.length || 0;

    return (
        <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
                {label} {required && '*'}
            </Typography>

            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                Shortcuts: Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+Shift+L (Bullet List), Ctrl+Shift+N (Numbered List)
            </Typography>

            <Paper variant="outlined" sx={{ p: 1, mb: 1 }}>
                <ToggleButtonGroup
                    size="small"
                    disabled={disabled}
                >
                    <ToggleButton
                        value="bold"
                        onClick={() => execCommand('bold')}
                        title="Bold (Ctrl+B)"
                        disabled={disabled}
                    >
                        <FormatBold />
                    </ToggleButton>
                    <ToggleButton
                        value="italic"
                        onClick={() => execCommand('italic')}
                        title="Italic (Ctrl+I)"
                        disabled={disabled}
                    >
                        <FormatItalic />
                    </ToggleButton>
                    <ToggleButton
                        value="bullet"
                        onClick={() => execCommand('insertUnorderedList')}
                        title="Bullet List (Ctrl+Shift+L)"
                        disabled={disabled}
                    >
                        <FormatListBulleted />
                    </ToggleButton>
                    <ToggleButton
                        value="number"
                        onClick={() => execCommand('insertOrderedList')}
                        title="Numbered List (Ctrl+Shift+N)"
                        disabled={disabled}
                    >
                        <FormatListNumbered />
                    </ToggleButton>
                </ToggleButtonGroup>
            </Paper>

            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    minHeight: 200,
                    maxHeight: 400,
                    overflow: 'auto',
                    backgroundColor: disabled ? '#f5f5f5' : 'white',
                    border: error ? '1px solid #d32f2f' : '1px solid rgba(0, 0, 0, 0.23)',
                    '&:hover': {
                        border: error ? '1px solid #d32f2f' : '1px solid rgba(0, 0, 0, 0.87)',
                    },
                    '&:focus-within': {
                        border: error ? '2px solid #d32f2f' : '2px solid #1976d2',
                        outline: 'none',
                    }
                }}
            >
                <Box
                    ref={editorRef}
                    contentEditable={!disabled}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    suppressContentEditableWarning
                    sx={{
                        minHeight: 180,
                        outline: 'none',
                        '& strong, & b': { fontWeight: 'bold' },
                        '& em, & i': { fontStyle: 'italic' },
                        '& ul': { paddingLeft: 2, marginTop: 1, marginBottom: 1 },
                        '& ol': { paddingLeft: 2, marginTop: 1, marginBottom: 1 },
                        '& li': { marginBottom: 0.5 },
                        '&:empty:before': {
                            content: '"Enter product description..."',
                            color: 'rgba(0, 0, 0, 0.38)',
                            fontStyle: 'italic',
                        }
                    }}
                />
            </Paper>

            <FormHelperText
                error={!!error}
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 1
                }}
            >
                <span>{error || (required ? 'Required field' : 'Format your text using the toolbar or keyboard shortcuts')}</span>
                <span style={{
                    color: textLength > maxLength * 0.9 ? '#d32f2f' : '#666'
                }}>
                    {textLength}/{maxLength} chars
                </span>
            </FormHelperText>
        </Box>
    );
};