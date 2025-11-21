import React, {useState} from 'react';
import Editor from 'react-simple-code-editor';
import {highlight, languages} from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import {Box, Typography} from '@mui/material';

const HtmlEditor = ({
  value,
  onChange,
  label,
  error,
  helperText,
  disabled,
  minHeight = 200,
}) => {
  const [focused, setFocused] = useState(false);

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
          position: 'relative',
          border: error
            ? '1px solid'
            : focused
            ? '2px solid'
            : '1px solid',
          borderColor: error
            ? 'error.main'
            : focused
            ? 'primary.main'
            : 'divider',
          borderRadius: 1,
          backgroundColor: disabled ? 'action.disabledBackground' : 'background.paper',
          minHeight: `${minHeight}px`,
          '&:hover': {
            borderColor: disabled ? 'divider' : error ? 'error.main' : 'primary.main',
          },
          transition: 'border-color 0.2s',
        }}>
        <Editor
          value={value || ''}
          onValueChange={onChange}
          highlight={code => highlight(code, languages.markup)}
          padding={16}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 14,
            minHeight: `${minHeight}px`,
            outline: 'none',
            backgroundColor: 'transparent',
            color: disabled ? 'rgba(0, 0, 0, 0.38)' : 'inherit',
          }}
          textareaClassName="code-textarea"
          preClassName="code-pre"
        />
        <style jsx global>{`
          .code-textarea {
            outline: none !important;
            border: none !important;
            background: transparent !important;
            resize: none !important;
            font-family: 'Fira code', 'Fira Mono', monospace !important;
            font-size: 14px !important;
            min-height: ${minHeight}px !important;
            width: 100% !important;
            padding: 16px !important;
          }
          .code-pre {
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
            font-family: 'Fira code', 'Fira Mono', monospace !important;
            font-size: 14px !important;
          }
          .token.comment,
          .token.prolog,
          .token.doctype,
          .token.cdata {
            color: #90a4ae;
          }
          .token.punctuation {
            color: #999;
          }
          .token.property,
          .token.tag,
          .token.boolean,
          .token.number,
          .token.constant,
          .token.symbol,
          .token.deleted {
            color: #905;
          }
          .token.selector,
          .token.attr-name,
          .token.string,
          .token.char,
          .token.builtin,
          .token.inserted {
            color: #690;
          }
          .token.operator,
          .token.entity,
          .token.url,
          .language-css .token.string,
          .style .token.string {
            color: #a67f59;
            background: hsla(0, 0%, 100%, 0.5);
          }
          .token.atrule,
          .token.attr-value,
          .token.keyword {
            color: #07a;
          }
          .token.function {
            color: #dd4a68;
          }
          .token.regex,
          .token.important,
          .token.variable {
            color: #e90;
          }
          .token.important,
          .token.bold {
            font-weight: bold;
          }
          .token.italic {
            font-style: italic;
          }
          .token.entity {
            cursor: help;
          }
        `}</style>
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

export default HtmlEditor;

