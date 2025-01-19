import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  FormControlLabel,
  Checkbox,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import * as yup from 'yup';
import { useCreateUser } from './hooks/use-create-user';
import { format } from 'date-fns';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { useRouter } from 'next/router';

interface FormValues {
  firstName: string;
  lastName: string;
  username: string;
  dateOfBirth: Date | null;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  role: string;
}

const CreateUser: React.FC = () => {
  const [disableValidation, setDisableValidation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { createUser } = useCreateUser();
  const router = useRouter();

  const validationSchema = yup.object().shape({
    firstName: yup
      .string()
      .matches(/^[a-zA-Z]+$/, 'First Name must contain only letters')
      .required('First Name is required'),
    lastName: yup
      .string()
      .matches(/^[a-zA-Z]+$/, 'Last Name must contain only letters')
      .required('Last Name is required'),
    username: yup.string().required('Username is required'),
    dateOfBirth: yup
      .date()
      .nullable()
      .required('Date of Birth is required')
      .test('is-adult', 'You must be at least 18 years old', (value) => {
        if (!value) return false;
        const today = new Date();
        const age = today.getFullYear() - value.getFullYear();
        return age > 18 || (age === 18 && today >= new Date(value.setFullYear(value.getFullYear() + 18)));
      }),
    phoneNumber: yup
      .string()
      .required('Phone Number is required')
      .test('is-valid-phone', 'Phone number must be valid', (value) => {
        const phone = parsePhoneNumberFromString(value || '', 'US');
        return phone ? phone.isValid() : false;
      }),
    password: yup
      .string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters long')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/\d/, 'Password must contain at least one number')
      .matches(/[@$!%*?&#]/, 'Password must contain at least one special character'),
    confirmPassword: yup
      .string()
      .required('Confirm Password is required')
      .oneOf([yup.ref('password')], 'Passwords must match'),
    role: yup.string().required('Role is required'),
  });

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={6} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
          Create User
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Formik<FormValues>
          initialValues={{
            firstName: '',
            lastName: '',
            username: '',
            dateOfBirth: null,
            phoneNumber: '',
            password: '',
            confirmPassword: '',
            role: '',
          }}
          validationSchema={disableValidation ? null : validationSchema}
          validateOnBlur={!disableValidation} // Enable field validation on blur
          validateOnChange={!disableValidation} // Enable field validation on change
          onSubmit={async (values, { setSubmitting, validateForm }) => {
            // Validate fields before proceeding
            const errors = await validateForm();
            if (Object.keys(errors).length > 0) {
              setToast({
                open: true,
                message: 'Please fix validation errors before submitting.',
                severity: 'error',
              });
              setSubmitting(false);
              return;
            }

            // Proceed with form submission
            const { firstName, lastName, phoneNumber, dateOfBirth, password, username, role } = values;

            const response = await createUser({
              firstName,
              lastName,
              phone: phoneNumber,
              dob: dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : '',
              password,
              username,
              role,
            });

            if (response.success) {
              setToast({ open: true, message: response.message, severity: 'success' });
              setTimeout(() => {
                setSubmitting(false);
                router.push('/user-list');
              }, 4000);
            } else {
              setToast({ open: true, message: response.message, severity: 'error' });
              setSubmitting(false);
            }
          }}
        >
          {({ setFieldValue, values, errors, touched }) => (
            <Form>
              <Field
                as={TextField}
                name="firstName"
                label="First Name"
                fullWidth
                margin="normal"
                required
                error={touched.firstName && !!errors.firstName}
                helperText={touched.firstName && errors.firstName}
              />
              <Field
                as={TextField}
                name="lastName"
                label="Last Name"
                fullWidth
                margin="normal"
                required
                error={touched.lastName && !!errors.lastName}
                helperText={touched.lastName && errors.lastName}
              />
              <Field
                as={TextField}
                name="username"
                label="Username"
                fullWidth
                margin="normal"
                required
                error={touched.username && !!errors.username}
                helperText={touched.username && errors.username}
              />
              <DatePicker
                label="Date of Birth"
                value={values.dateOfBirth}
                onChange={(value: Date | null) => setFieldValue('dateOfBirth', value)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'normal',
                    required: true,
                    error: touched.dateOfBirth && !!errors.dateOfBirth,
                    helperText: touched.dateOfBirth && errors.dateOfBirth,
                  },
                }}
              />
              <Field
                as={TextField}
                name="phoneNumber"
                label="Phone Number"
                fullWidth
                margin="normal"
                required
                error={touched.phoneNumber && !!errors.phoneNumber}
                helperText={touched.phoneNumber && errors.phoneNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                  const phone = parsePhoneNumberFromString(cleaned, 'US');
                  setFieldValue('phoneNumber', phone ? phone.formatNational() : cleaned);
                }}
              />
              <Field
                as={TextField}
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                required
                error={touched.password && !!errors.password}
                helperText={touched.password && errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Field
                as={TextField}
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                required
                error={touched.confirmPassword && !!errors.confirmPassword}
                helperText={touched.confirmPassword && errors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Field
                as={Select}
                name="role"
                value={values.role}
                fullWidth
                margin="normal"
                error={touched.role && !!errors.role}
                helperText={touched.role && errors.role}
                onChange={(e: React.ChangeEvent<{ value: unknown }>) =>
                  setFieldValue('role', e.target.value)
                }
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Role
                </MenuItem>
                <MenuItem value="Admin">Administrator</MenuItem>
                <MenuItem value="Viewer">Viewer</MenuItem>
              </Field>
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                Create User
              </Button>
            </Form>
          )}        
        </Formik>
        </LocalizationProvider>
        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={handleToastClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleToastClose} severity={toast.severity} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default CreateUser;
