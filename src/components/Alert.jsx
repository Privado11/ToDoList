import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import "../styles/Alert.css";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function Alert({
  isOpen,
  handleConfirmDelete,
  handleCancelDelete,
}) {
  const handleClose = () => {
    handleCancelDelete();
  };

  const handleDelete = () => {
    handleConfirmDelete();
  };

  return (
    <React.Fragment>
      <Dialog
        open={isOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle
          id="alert-dialog-title"
          style={{ fontSize: "1.8rem", fontWeight: "900" }}
        >
          {"Confirm Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText style={{ fontSize: "1.5rem" }}>
            Are you sure you want to delete this item? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            style={{ fontSize: "1.5rem", fontWeight: "900" }}
            onClick={handleClose}
            color="info" 
          >
            Cancel
          </Button>
          <Button
            style={{ fontSize: "1.5rem", fontWeight: "900" }}
            onClick={handleDelete}
            autoFocus
            color="error" 
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export { Alert };
