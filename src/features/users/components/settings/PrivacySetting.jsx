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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const PrivacySetting = ({ privacy, updatePrivacy, userLoading }) => {
  const [privacySetting, setPrivacySetting] = useState(privacy);

  const handlePrivacyUpdate = async () => {
    await updatePrivacy(privacySetting);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy Settings</CardTitle>
        <CardDescription>
          Control who can see your information and activity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Profile Visibility</h3>
            <Separator className="my-2" />
            <div className="grid gap-2">
              <Label htmlFor="profile-visibility">
                Who can see your profile?
              </Label>
              <Select
                value={privacySetting.profile_visibility}
                onValueChange={(value) =>
                  setPrivacySetting({
                    ...privacySetting,
                    profile_visibility: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <span className="hidden sm:inline">
                      Public - Anyone can see your profile
                    </span>
                    <span className="sm:hidden">Public</span>
                  </SelectItem>
                  <SelectItem value="friends">
                    <span className="hidden sm:inline">
                      Friends Only - Only your friends can see your profile
                    </span>
                    <span className="sm:hidden">Friends Only</span>
                  </SelectItem>
                  <SelectItem value="private">
                    <span className="hidden sm:inline">
                      Private - Only you can see your full profile
                    </span>
                    <span className="sm:hidden">Private</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Información Visible</h3>
            <Separator className="my-2" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-email">Show email address</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see your email
                  </p>
                </div>
                <Switch
                  id="show-email"
                  checked={privacySetting.show_email}
                  onCheckedChange={(checked) =>
                    setPrivacySetting({
                      ...privacySetting,
                      show_email: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-activity">Show phone number</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see your phone number.
                  </p>
                </div>
                <Switch
                  id="show-activity"
                  checked={privacySetting.show_number_phone}
                  onCheckedChange={(checked) =>
                    setPrivacySetting({
                      ...privacySetting,
                      show_number_phone: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-stats">Show Statistics</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see your productivity statistics
                  </p>
                </div>
                <Switch
                  id="show-stats"
                  checked={privacySetting.show_stats}
                  onCheckedChange={(checked) =>
                    setPrivacySetting({
                      ...privacySetting,
                      show_stats: checked,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={handlePrivacyUpdate}>
            {userLoading?.updateUserPrivacySettings ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving Privacy...
              </>
            ) : (
              "Save Privacy"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacySetting;
