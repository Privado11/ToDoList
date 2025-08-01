import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Calendar, Clock, Users, Mail, Phone } from "lucide-react";

const InfoProfile = ({ user }) => {
  const convertDate = (dateString) => {
    const date = new Date(dateString);
    const monthYear = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    return monthYear;
  };

  const userLanguage = (language) => {
    switch (language) {
      case "en":
        return "English";
      case "es":
        return "Spanish";
      case "fr":
        return "French";
      case "de":
        return "German";
      default:
        return language;
    }
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Email</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {user?.email || "Not available"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Phone</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {user?.phone || "Not available"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Language</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {userLanguage(user?.language)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Member since</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {convertDate(user?.created_at)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfoProfile;
