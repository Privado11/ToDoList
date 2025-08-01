import { Button } from "../ui/button";

const getButtonConfig = (user) => {
  if (user.has_pending_request) {
    return user.i_sent_request
      ? { action: "cancelFriendRequest", text: "Cancel" }
      : { action: "acceptFriendRequest", text: "Accept" };
  } else {
    return !user.is_friend
      ? { action: "addFriend", text: "Add to friends" }
      : { action: "message", text: "Message" };
  }
};


const UserActionButtons = ({ user, handleAction }) => {
  if (user.has_pending_request && !user.i_sent_request) {
    return (
      <div className="w-full flex gap-2 mt-2 pl-11 pr-2">
        <Button
          size="base"
          className="h-8 px-2 py-0 text-sm w-1/2  hover:bg-blue-700 transition-colors duration-150"
          onClick={(e) => {
            e.stopPropagation();
            handleAction(user, "acceptFriendRequest");
          }}
        >
          Accept
        </Button>
        <Button
          size="sm"
          className="h-8 px-2 py-0 text-sm w-1/2 bg-red-600 hover:bg-red-700 transition-colors duration-150"
          onClick={(e) => {
            e.stopPropagation();
            handleAction(user, "rejectFriendRequest");
          }}
        >
          Reject
        </Button>
      </div>
    );
  }

 
  return (
    <div className="w-full flex mt-2 pl-11 pr-2">
      <Button
        size="lg"
        className="h-8 px-2 py-0 text-sm w-full hover:bg-blue-900 transition-colors duration-150"
        onClick={(e) => {
          e.stopPropagation();
          handleAction(user, getButtonConfig(user).action);
        }}
      >
        {getButtonConfig(user).text}
      </Button>
    </div>
  );
};

export default UserActionButtons;

