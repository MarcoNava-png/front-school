import React from "react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface CustomModalDialogProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  title?: string;
  description?: string;
  actionText?: string;
  cancelText?: string;
}

export const CustomModalDialog: React.FC<CustomModalDialogProps> = ({
  open = false,
  setOpen,
  title = "Modal de ejemplo",
  description = "Aquí puedes mostrar información personalizada en el modal.",
  actionText = "Aceptar",
  cancelText = "Cerrar",
}) => (
  <AlertDialog open={open} onOpenChange={setOpen}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{cancelText}</AlertDialogCancel>
        <AlertDialogAction>{actionText}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
