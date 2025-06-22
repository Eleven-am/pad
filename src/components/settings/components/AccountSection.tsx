import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { User as UserType } from '@/generated/prisma';

interface AccountSectionProps {
  user: Partial<UserType>;
  onDeleteAccount: () => void;
}

export const AccountSection = React.memo<AccountSectionProps>(({
  user,
  onDeleteAccount,
}) => {
  const formattedDate = React.useMemo(() => {
    return user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '';
  }, [user.createdAt]);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-medium mb-4">Account Information</h2>
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">Email Address</Label>
            <p className="text-sm font-medium mt-1">{user.email}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Account ID</Label>
            <p className="text-sm font-mono mt-1">{user.id}</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Member Since</Label>
            <p className="text-sm font-medium mt-1">{formattedDate}</p>
          </div>
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-medium mb-4">Delete Account</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your account and all of your data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDeleteAccount}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
});

AccountSection.displayName = 'AccountSection';