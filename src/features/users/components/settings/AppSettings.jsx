import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Clock,
  CheckCircle,
  Loader2,
  CircleAlert,
} from "lucide-react";
import GenerateReport from "./GenerateReport";
import { toast } from "sonner";

const AppSettings = ({
  language,
  handleLanguageChange,
  tasks,
  userLoading,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const isSameLanguage = language === selectedLanguage;

  const handleLanguageSelect = (newLanguage) => {
    setSelectedLanguage(newLanguage);
  };

  const handleSaveSettings = async () => {
    try {
      await handleLanguageChange(selectedLanguage);
    } catch (error) {
      setSelectedLanguage(language);
    }
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportTasks = async () => {
    setIsExporting(true);

    try {
      const timestamp = new Date().toISOString().split("T")[0];

      const htmlContent = GenerateReport({ tasks });
      downloadFile(htmlContent, `tasks-report-${timestamp}.html`, "text/html");

      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Tasks exported successfully");
    } catch (error) {
      toast.error("Error exporting tasks.", {
        description: "Please try again later.",
        action: {
          label: "Retry",
          onClick: () => handleExportTasks(),
        },
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application</CardTitle>
        <CardDescription>
          Configure app language, data sync, and export options.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">App Language</h3>
            <Select
              value={selectedLanguage}
              onValueChange={handleLanguageSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select app language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es" disabled>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="h-3 w-3" />
                    Español (Coming Soon)
                  </div>
                </SelectItem>
                <SelectItem value="fr" disabled>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="h-3 w-3" />
                    Français (Coming Soon)
                  </div>
                </SelectItem>
                <SelectItem value="de" disabled>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="h-3 w-3" />
                    Deutsch (Coming Soon)
                  </div>
                </SelectItem>
                <SelectItem value="pt" disabled>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="h-3 w-3" />
                    Português (Coming Soon)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-2">
              Additional languages will be available in future updates.
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-3">Export Tasks</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleExportTasks}
                  className="flex items-center gap-2"
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  Export as HTML Report
                </Button>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">
                      Export Features:
                    </p>
                    <ul className="text-blue-700 mt-1 space-y-1">
                      <li>
                        • <strong>HTML Report:</strong> Formatted document with
                        statistics and task details
                      </li>

                      <li>
                        • <strong>Current Data:</strong> Exports {tasks.length}{" "}
                        tasks with full metadata
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button
            onClick={handleSaveSettings}
            disabled={isExporting || isSameLanguage}
          >
            {userLoading?.saveUserLanguage ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving App Settings...
              </>
            ) : (
              "Save App Settings"
            )}
          </Button>
          {!isSameLanguage && (
            <span className="text-sm text-amber-600 flex items-center gap-1">
              <CircleAlert className="h-4 w-4" />
              Unsaved changes
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppSettings;
