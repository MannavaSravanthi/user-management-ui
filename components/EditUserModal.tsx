import React, { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import { Formik, Field, Form } from 'formik';
import * as yup from 'yup';
import Cookies from 'js-cookie';
import { parsePhoneNumberFromString, AsYouType } from 'libphonenumber-js';

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
  };
  onUpdate: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ open, onClose, user, onUpdate }) => {
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const validationSchema = yup.object().shape({
    phone: yup
      .string()
      .required('Phone number is required')
      .matches(/^\(\d{3}\) \d{3}-\d{4}$/, 'Phone number must match the format (XXX) XXX-XXXX'),
    role: yup.string().required('Role is required'),
  });

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  const formatPhoneNumber = (value: string) => {
    const phone = parsePhoneNumberFromString(value || '', 'US');
    return phone ? phone.formatNational() : value;
  };

  const handleSubmit = async (values: { phone: string; role: string }) => {
    const authToken = Cookies.get('authToken');
    if (!authToken) {
      setToast({ open: true, message: 'Unauthorized: No auth token found.', severity: 'error' });
      return;
    }
  
    try {
      // Format the phone number before sending it in the API request
      const formattedPhone = formatPhoneNumber(values.phone);
  
      const response = await fetch(`http://localhost:5230/api/User/${user.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formattedPhone, // Send the formatted phone number
          role: values.role,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error updating user: ${response.statusText}`);
      }
  
      setToast({ open: true, message: 'User updated successfully.', severity: 'success' });
  
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 2000); 
    } catch (error: any) {
      setToast({ open: true, message: error.message || 'Failed to update user.', severity: 'error' });
    }
  };  

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Editing user <strong>{user.firstName} {user.lastName}</strong>.
          </DialogContentText>
          <Formik
            initialValues={{
              phone: formatPhoneNumber(user.phone),
              role: user.role,
            }}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
              handleSubmit(values);
              setSubmitting(false);
            }}
          >
            {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
              <Form>
                <Field
                  as={TextField}
                  name="phone"
                  label="Phone Number"
                  fullWidth
                  margin="normal"
                  value={values.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10); // Allow only 10 digits
                    const formattedPhone = new AsYouType('US').input(cleaned);
                    setFieldValue('phone', formattedPhone); // Format as user types
                  }}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFieldValue('phone', formatPhoneNumber(e.target.value)) // Final formatting on blur
                  }
                  error={touched.phone && !!errors.phone}
                  helperText={touched.phone && errors.phone}
                />
                <Field
                  as={TextField}
                  select
                  name="role"
                  label="Role"
                  fullWidth
                  margin="normal"
                  value={values.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.role && !!errors.role}
                  helperText={touched.role && errors.role}
                >
                  <MenuItem value="Admin">Administrator</MenuItem>
                  <MenuItem value="Viewer">Viewer</MenuItem>
                </Field>
                <DialogActions>
                  <Button onClick={onClose} color="primary" disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" color="primary" variant="contained" disabled={isSubmitting}>
                    Update
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={2000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleToastClose} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditUserModal;
