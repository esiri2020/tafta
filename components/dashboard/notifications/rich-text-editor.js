import React, {useState, useEffect} from 'react';
import dynamic from 'next/dynamic';
import {Box, Typography, Tabs, Tab} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <Box sx={{minHeight: 300, p: 2}}>Loading editor...</Box>,
});

const RichTextEditor = ({
  value,
  onChange,
  label,
  error,
  helperText,
  disabled,
  minHeight = 300,
}) => {
  const [viewMode, setViewMode] = useState('visual'); // 'visual' or 'code'
  const [htmlCode, setHtmlCode] = useState(value || '');

  // Sync external value changes
  useEffect(() => {
    if (value !== undefined && value !== htmlCode) {
      setHtmlCode(value || '');
    }
  }, [value]);

  const handleVisualChange = (content, delta, source, editor) => {
    const html = editor ? editor.getHTML() : content;
    setHtmlCode(html);
    if (onChange) {
      onChange(html);
    }
  };

  const handleCodeChange = (event) => {
    const newCode = event.target.value;
    setHtmlCode(newCode);
    if (onChange) {
      onChange(newCode);
    }
  };

  const handleViewModeChange = (event, newValue) => {
    if (newValue === 'code') {
      // When switching to code view, the htmlCode state should already have the latest content
      // since it's updated on every change in visual mode
      // No need to access the editor directly
    }
    setViewMode(newValue);
  };

  const modules = {
    toolbar: {
      container: [
        [{header: [1, 2, 3, 4, 5, 6, false]}],
        [{font: []}],
        [{size: []}],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [
          {list: 'ordered'},
          {list: 'bullet'},
          {indent: '-1'},
          {indent: '+1'},
        ],
        [{color: []}, {background: []}],
        [{align: []}],
        ['link', 'image', 'video'],
        ['clean'],
      ],
    },
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'video',
    'color',
    'background',
    'align',
  ];

  return (
    <Box
      sx={{
        width: '100%',
        position: 'relative',
      }}>
      {label && (
        <Typography
          variant="body2"
          sx={{
            mb: 1,
            color: error ? 'error.main' : 'text.primary',
            fontWeight: 500,
          }}>
          {label}
        </Typography>
      )}

      <Box
        sx={{
          border: error
            ? '1px solid'
            : '1px solid',
          borderColor: error ? 'error.main' : 'divider',
          borderRadius: 1,
          backgroundColor: disabled ? 'action.disabledBackground' : 'background.paper',
          overflow: 'hidden',
          '&:hover': {
            borderColor: disabled ? 'divider' : error ? 'error.main' : 'primary.main',
          },
          transition: 'border-color 0.2s',
        }}>
        {/* View Mode Tabs */}
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 1,
          }}>
          <Tabs
            value={viewMode}
            onChange={handleViewModeChange}
            sx={{
              minHeight: 'auto',
              '& .MuiTab-root': {
                minHeight: '36px',
                padding: '6px 12px',
                fontSize: '0.875rem',
              },
            }}>
            <Tab
              icon={<VisibilityIcon sx={{fontSize: '18px !important'}} />}
              iconPosition="start"
              label="Visual"
              value="visual"
              disabled={disabled}
            />
            <Tab
              icon={<CodeIcon sx={{fontSize: '18px !important'}} />}
              iconPosition="start"
              label="Code"
              value="code"
              disabled={disabled}
            />
          </Tabs>
        </Box>

        {/* Editor Content */}
        <Box
          sx={{
            minHeight: `${minHeight}px`,
            '& .quill': {
              height: '100%',
            },
            '& .ql-container': {
              minHeight: `${minHeight - 42}px`,
              fontFamily: 'inherit',
            },
            '& .ql-editor': {
              minHeight: `${minHeight - 42}px`,
            },
          }}>
          {viewMode === 'visual' ? (
            <ReactQuill
              theme="snow"
              value={htmlCode}
              onChange={handleVisualChange}
              modules={modules}
              formats={formats}
              readOnly={disabled}
              style={{
                height: '100%',
              }}
            />
          ) : (
            <Box
              component="textarea"
              value={htmlCode}
              onChange={handleCodeChange}
              disabled={disabled}
              sx={{
                width: '100%',
                minHeight: `${minHeight - 42}px`,
                padding: 2,
                border: 'none',
                outline: 'none',
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: '14px',
                backgroundColor: 'transparent',
                resize: 'vertical',
                color: disabled ? 'text.disabled' : 'text.primary',
              }}
            />
          )}
        </Box>
      </Box>

      {(error || helperText) && (
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            color: error ? 'error.main' : 'text.secondary',
            display: 'block',
          }}>
          {error || helperText}
        </Typography>
      )}
    </Box>
  );
};

export default RichTextEditor;

