import React from 'react';
import { Typography } from '@mui/material';
import { ErrorMessage, ErrorMessageProps } from 'formik';

const ErrorText: React.FC<ErrorMessageProps> = (props) => (
  <ErrorMessage
    {...props}
    render={(msg) => (
      <Typography color="error" variant="body2" sx={{ mt: 0.5 }}>
        {msg}
      </Typography>
    )}
  />
);

export default ErrorText;
