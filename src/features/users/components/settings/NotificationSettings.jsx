import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

const NotificationSettings = ({
  preferences,
  onUpdatePreferences,
  loading,
}) => {
  const [notificationsPreferences, setnotificationsPreferences] =
    useState(preferences);

  const isPushDisabled = !notificationsPreferences.push;


  const handleSavePreferences = () => {
    try {
      onUpdatePreferences(notificationsPreferences);
    } catch (error) {}
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Configure how and when you want to receive notifications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Notification Channels</h3>
            <Separator className="my-2" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications in your browser
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notificationsPreferences.push}
                  onCheckedChange={(checked) =>
                    setnotificationsPreferences({
                      ...notificationsPreferences,
                      push: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notificationsPreferences">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Coming soon - Email notificationsPreferences are not yet
                    available
                  </p>
                </div>
                <Switch
                  id="email-notificationsPreferences"
                  checked={false}
                  disabled={true}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="mobile-notifications">
                    Mobile Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Coming soon - Mobile notifications are not yet
                    available
                  </p>
                </div>
                <Switch
                  id="mobile-notifications"
                  checked={false}
                  disabled={true}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Push Notification Types</h3>
            <Separator className="my-2" />
            <div className="space-y-4">
              <div
                className={`flex items-center justify-between ${
                  isPushDisabled ? "opacity-50" : ""
                }`}
              >
                <div>
                  <Label
                    htmlFor="task-reminders"
                    className={isPushDisabled ? "text-muted-foreground" : ""}
                  >
                    Task Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send push notifications for upcoming tasks
                  </p>
                </div>
                <Switch
                  id="task-reminders"
                  checked={
                    notificationsPreferences.task_reminders && !isPushDisabled
                  }
                  disabled={isPushDisabled}
                  onCheckedChange={(checked) =>
                    setnotificationsPreferences({
                      ...notificationsPreferences,
                      task_reminders: checked,
                    })
                  }
                />
              </div>

              <div
                className={`flex items-center justify-between ${
                  isPushDisabled ? "opacity-50" : ""
                }`}
              >
                <div>
                  <Label
                    htmlFor="friend-requests"
                    className={isPushDisabled ? "text-muted-foreground" : ""}
                  >
                    Friend Requests
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send push notifications for friend requests
                  </p>
                </div>
                <Switch
                  id="friend-requests"
                  checked={
                    notificationsPreferences.friend_requests && !isPushDisabled
                  }
                  disabled={isPushDisabled}
                  onCheckedChange={(checked) =>
                    setnotificationsPreferences({
                      ...notificationsPreferences,
                      friend_requests: checked,
                    })
                  }
                />
              </div>

              <div
                className={`flex items-center justify-between ${
                  isPushDisabled ? "opacity-50" : ""
                }`}
              >
                <div>
                  <Label
                    htmlFor="task-comments"
                    className={isPushDisabled ? "text-muted-foreground" : ""}
                  >
                    Task Comments
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send push notifications when someone comments on
                    your tasks
                  </p>
                </div>
                <Switch
                  id="task-comments"
                  checked={
                    notificationsPreferences.task_comments && !isPushDisabled
                  }
                  disabled={isPushDisabled}
                  onCheckedChange={(checked) =>
                    setnotificationsPreferences({
                      ...notificationsPreferences,
                      task_comments: checked,
                    })
                  }
                />
              </div>

              <div
                className={`flex items-center justify-between ${
                  isPushDisabled ? "opacity-50" : ""
                }`}
              >
                <div>
                  <Label
                    htmlFor="task-updates"
                    className={isPushDisabled ? "text-muted-foreground" : ""}
                  >
                    Task Updates
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send push notifications when shared tasks are
                    updated
                  </p>
                </div>
                <Switch
                  id="task-updates"
                  checked={
                    notificationsPreferences.task_updates && !isPushDisabled
                  }
                  disabled={isPushDisabled}
                  onCheckedChange={(checked) =>
                    setnotificationsPreferences({
                      ...notificationsPreferences,
                      task_updates: checked,
                    })
                  }
                />
              </div>

              <div
                className={`flex items-center justify-between ${
                  isPushDisabled ? "opacity-50" : ""
                }`}
              >
                <div>
                  <Label
                    htmlFor="shared-tasks"
                    className={isPushDisabled ? "text-muted-foreground" : ""}
                  >
                    Shared Tasks
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send push notifications when someone shares a
                    task with you
                  </p>
                </div>
                <Switch
                  id="shared-tasks"
                  checked={
                    notificationsPreferences.shared_tasks && !isPushDisabled
                  }
                  disabled={isPushDisabled}
                  onCheckedChange={(checked) =>
                    setnotificationsPreferences({
                      ...notificationsPreferences,
                      shared_tasks: checked,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={handleSavePreferences} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving Preferences...
              </>
            ) : (
              " Save Preferences"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
