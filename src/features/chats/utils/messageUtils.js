export const groupMessagesByDate = (messages) => {
  // Handle invalid input
  if (!messages || !Array.isArray(messages)) return {};

  const groups = {};

  messages.forEach((msg) => {
    const date = new Date(msg.created_at);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey;
    // Determine the appropriate date key
    if (date.toDateString() === today.toDateString()) {
      dateKey = "Hoy";
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = "Ayer";
    } else {
      // Format other dates in Spanish locale
      dateKey = date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    // Create group if it doesn't exist
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }

    // Add message to its date group
    groups[dateKey].push(msg);
  });

  return groups;
};

export const formatTime = (timestamp) => {
  // Handle empty timestamp
  if (!timestamp) return "";

  // Convert timestamp to time in hours:minutes format
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const getUserInitials = (name) => {
  // Handle empty or undefined name
  if (!name) return "U";

  // Return first letter of name in uppercase
  return name.charAt(0).toUpperCase();
};
