import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Globe, Shield, Users } from "lucide-react";

export default function PrivacyFriendsSettings() {
  const [profileVisibility, setProfileVisibility] = useState("friends");
  const [taskSharingPermission, setTaskSharingPermission] = useState("friends");
  const [allowFriendRequests, setAllowFriendRequests] = useState(true);

  const handleSaveSettings = () => {
    alert("Privacy settings saved successfully");
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Friends
          </CardTitle>
          <CardDescription>
            Control who can see your profile and interact with you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Profile Visibility</h3>
              <RadioGroup
                value={profileVisibility}
                onValueChange={setProfileVisibility}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="everyone" id="profile-everyone" />
                  <Label
                    htmlFor="profile-everyone"
                    className="flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    Everyone can see my profile
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="friends" id="profile-friends" />
                  <Label
                    htmlFor="profile-friends"
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Only friends can see my profile
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nobody" id="profile-nobody" />
                  <Label
                    htmlFor="profile-nobody"
                    className="flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Nobody can see my profile
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-3">Task Sharing</h3>
              <div className="space-y-2">
                <Label>Who can share tasks with you?</Label>
                <Select
                  value={taskSharingPermission}
                  onValueChange={setTaskSharingPermission}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="friends">Only friends</SelectItem>
                    <SelectItem value="nobody">Nobody</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="friend-requests">Allow Friend Requests</Label>
                <p className="text-sm text-muted-foreground">
                  Allow other users to send you friend requests
                </p>
              </div>
              <Switch
                id="friend-requests"
                checked={allowFriendRequests}
                onCheckedChange={setAllowFriendRequests}
              />
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={handleSaveSettings}>Save Privacy Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
