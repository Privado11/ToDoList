import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BlockedProfile = ({ viewedProfile }) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="mx-auto py-2 px-0">
      <div className="p-1 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 px-3 py-1 rounded-md border border-gray-300 hover:border-gray-400"
          >
            <span className="text-sm font-medium">Go to Dashboard</span>
          </button>
        </div>
      </div>

      <Card className="w-full mx-auto">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <UserX className="h-8 w-8 text-gray-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                User not available
              </h2>
              <p className="text-gray-600 max-w-md">
                This profile is currently unavailable. This may be due to
                privacy restrictions or blocking
              </p>
            </div>

            <Alert className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{viewedProfile?.message}</AlertDescription>
            </Alert>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlockedProfile;
