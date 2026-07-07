import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/** Remplace window.confirm() par une boîte de dialogue MUI ; retourne une promesse résolue à true/false. */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm doit être utilisé dans un ConfirmDialogProvider');
  return ctx;
}

interface PendingConfirm {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    const normalized = typeof options === 'string' ? { title: options } : options;
    return new Promise<boolean>((resolve) => {
      setPending({ options: normalized, resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    pending?.resolve(result);
    setPending(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog open={!!pending} onClose={() => handleClose(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{pending?.options.title}</DialogTitle>
        {pending?.options.description && (
          <DialogContent>
            <DialogContentText>{pending.options.description}</DialogContentText>
          </DialogContent>
        )}
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => handleClose(false)}>{pending?.options.cancelLabel ?? 'Annuler'}</Button>
          <Button
            onClick={() => handleClose(true)}
            variant="contained"
            color={pending?.options.destructive ? 'error' : 'primary'}
            autoFocus
          >
            {pending?.options.confirmLabel ?? 'Confirmer'}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  );
}
