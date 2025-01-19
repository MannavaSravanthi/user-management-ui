import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Paper,
  IconButton,
  Container,
  CircularProgress,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useUser } from '../context/user-context';
import { useUserTable, useDeleteUser } from './hooks/use-user-table';
import EditUserModal from '../components/EditUserModal';

const UserTable: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { users, totalCount, loading, error, refetch } = useUserTable(page, rowsPerPage);
  const { deleteUser } = useDeleteUser();
  const { user } = useUser();

  const [editUser, setEditUser] = useState<null | { id: number; firstName: string; lastName: string; phone: string; role: string }>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<null | { id: number; firstName: string; lastName: string }>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Handle dialog open/close
  const handleOpenDialog = (userId: number, firstName: string, lastName: string) => {
    setSelectedUser({ id: userId, firstName, lastName });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  const handleDeleteUser = async () => {
    if (selectedUser) {
      try {
        await deleteUser(selectedUser.id);
        setToast({ open: true, message: 'User deleted successfully.', severity: 'success' });

        // Refetch users after deletion
        refetch();
      } catch (error: any) {
        setToast({ open: true, message: error.message || 'Failed to delete user.', severity: 'error' });
      }
      setDialogOpen(false);
    }
  };

  // Handle pagination changes
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditClick = (userData: { id: number; firstName: string; lastName: string; phone: string; role: string }) => {
    setEditUser(userData);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setEditUser(null);
  };

  return (
    <Container component="main" maxWidth="lg">
      <Paper elevation={6} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
          User List
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ textAlign: 'center' }}>
            {error}
          </Typography>
        ) : (
          <TableContainer component="div">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>First Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Last Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date of Birth</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                  {user?.role === 'Admin' && (
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">
                      Actions
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((userData) => (
                  <TableRow key={userData.id}>
                    <TableCell>{userData.id}</TableCell>
                    <TableCell>{userData.firstName}</TableCell>
                    <TableCell>{userData.lastName}</TableCell>
                    <TableCell>{userData.username}</TableCell>
                    <TableCell>{userData.phone}</TableCell>
                    <TableCell>{new Date(userData.dob).toLocaleDateString()}</TableCell>
                    <TableCell>{userData.role}</TableCell>
                    {user?.role === 'Admin' && (
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => handleEditClick(userData)}>
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() =>
                            handleOpenDialog(userData.id, userData.firstName, userData.lastName)
                          }
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={user?.role === 'Admin' ? 8 : 7} align="center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user{' '}
            {selectedUser?.firstName} {selectedUser?.lastName}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            No
          </Button>
          <Button onClick={handleDeleteUser} color="error">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Message */}
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

      {/* Edit User Modal */}
      {editUser && (
        <EditUserModal
          open={editModalOpen}
          onClose={handleEditModalClose}
          user={editUser}
          onUpdate={() => refetch()} // Refetch users after editing
        />
      )}
    </Container>
  );
};

export default UserTable;
