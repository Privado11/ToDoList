import { Card, CardContent } from "@/components/ui/card";

const TaskDescription = ({ description }) => {
  const formatDescription = (text) => {
    return text?.replace(/\n/g, "<br />") || "No description provided.";
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <p
          className="text-gray-600 text-base sm:text-lg"
          dangerouslySetInnerHTML={{
            __html: formatDescription(description),
          }}
        />
      </CardContent>
    </Card>
  );
}

export default TaskDescription;