import React from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmColor?: "primary" | "error" | "inherit" | "secondary" | "success" | "info" | "warning";
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
  confirmColor = "error",
}) => {
  return (
    <Dialog open={open} onClose={onCancel} aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-description">
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">{cancelText}</Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained" disabled={loading}>
          {loading ? "Processing..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};