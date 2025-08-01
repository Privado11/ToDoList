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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Moon, Sun, Palette, Lock } from "lucide-react";

const AppearanceSettings = () => {
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");

  const handleUnavailableFeature = () => {
    alert("This feature is not yet available. Coming soon in a future update.");
  };

  return (
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of the application. (Features in
            development)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 opacity-60">
            <div>
              <h3 className="text-lg font-medium">Theme</h3>
              <Separator className="my-2" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                <div
                  onClick={handleUnavailableFeature}
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 cursor-not-allowed bg-muted/20"
                >
                  <Sun className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Light</span>
                  <Lock className="h-3 w-3 mt-1" />
                </div>

                <div
                  onClick={handleUnavailableFeature}
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 cursor-not-allowed bg-muted/20"
                >
                  <Moon className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Dark</span>
                  <Lock className="h-3 w-3 mt-1" />
                </div>

                <div
                  onClick={handleUnavailableFeature}
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 cursor-not-allowed bg-muted/20"
                >
                  <div className="flex gap-1 mb-2">
                    <Sun className="h-3 w-3" />
                    <Moon className="h-3 w-3" />
                  </div>
                  <span className="text-sm font-medium">System</span>
                  <Lock className="h-3 w-3 mt-1" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Theme selection not yet available
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium">Custom Colors</h3>
              <Separator className="my-2" />
              <div className="relative mt-3">
                <Button
                  onClick={handleUnavailableFeature}
                  variant="outline"
                  className="w-full cursor-not-allowed"
                  disabled
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Customize Color Palette
                  <Lock className="h-3 w-3 ml-auto" />
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Color customization not yet available
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Button
              onClick={handleUnavailableFeature}
              variant="outline"
              className="cursor-not-allowed opacity-60"
              disabled
            >
              <Lock className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              All features are in development and will be available soon
            </p>
          </div>
        </CardContent>
      </Card>
  );
};

export default AppearanceSettings;
