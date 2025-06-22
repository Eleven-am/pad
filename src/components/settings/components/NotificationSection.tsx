import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { NotificationSettings } from '../hooks/useSettingsState';

interface NotificationSectionProps {
  notifications: NotificationSettings;
  onNotificationsChange: (notifications: NotificationSettings) => void;
  onSave: () => void;
  isLoading: boolean;
}

interface NotificationItemProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const NotificationItem = React.memo<NotificationItemProps>(({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}) => (
  <div className="flex items-center justify-between">
    <div className="space-y-0.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <p className="text-xs text-muted-foreground">
        {description}
      </p>
    </div>
    <Switch
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
    />
  </div>
));

export const NotificationSection = React.memo<NotificationSectionProps>(({
  notifications,
  onNotificationsChange,
  onSave,
  isLoading,
}) => {
  const handleNotificationChange = React.useCallback((key: keyof NotificationSettings) => (checked: boolean) => {
    onNotificationsChange({ ...notifications, [key]: checked });
  }, [notifications, onNotificationsChange]);

  const notificationItems = React.useMemo(() => [
    {
      key: 'emailComments' as const,
      label: 'Comments',
      description: 'When someone comments on your posts',
    },
    {
      key: 'emailFollowers' as const,
      label: 'New followers',
      description: 'When someone follows you',
    },
    {
      key: 'emailWeeklyDigest' as const,
      label: 'Weekly digest',
      description: 'Summary of your content performance',
    },
    {
      key: 'emailNewPosts' as const,
      label: 'New posts',
      description: 'From authors you follow',
    },
  ], []);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-medium mb-4">Email Notifications</h2>
        <div className="space-y-4">
          {notificationItems.map((item) => (
            <NotificationItem
              key={item.key}
              id={item.key}
              label={item.label}
              description={item.description}
              checked={notifications[item.key]}
              onCheckedChange={handleNotificationChange(item.key)}
            />
          ))}

          <Button 
            onClick={onSave} 
            disabled={isLoading}
            size="sm"
          >
            Save Preferences
          </Button>
        </div>
      </section>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';
NotificationSection.displayName = 'NotificationSection';