import Text "mo:core/Text";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";



actor {
  type ChatId = Text;
  type InviteToken = Text;
  type GroupId = Text;

  type Chat = {
    id : ChatId;
    encryptedMessages : [EncryptedMessage];
    participants : [Text];
    inviteToken : InviteToken;
    linkUsed : Bool;
    createdAt : Int;
  };

  type EncryptedMessage = {
    id : Text;
    ciphertext : Text;
    senderId : Text;
    timestamp : Int;
  };

  type Group = {
    id : GroupId;
    name : Text;
    inviteToken : InviteToken;
    participants : [Text];
    messages : [GroupMessage];
    createdAt : Int;
  };

  type GroupMessage = {
    id : Text;
    content : Text;
    senderId : Text;
    timestamp : Int;
  };

  let chatMap = Map.empty<ChatId, Chat>();
  let groupMap = Map.empty<GroupId, Group>();

  public shared ({ caller }) func createChat(username : Text) : async (ChatId, InviteToken) {
    let chatId = "0123456789abcdef";
    let inviteToken = "InvitationToken";
    let chat : Chat = {
      id = chatId;
      encryptedMessages = [];
      participants = [username];
      inviteToken;
      linkUsed = false;
      createdAt = Time.now();
    };
    chatMap.add(chatId, chat);
    (chatId, inviteToken);
  };

  public shared ({ caller }) func joinChat(inviteToken : InviteToken, username : Text) : async ChatId {
    var chatFound : ?Chat = null;
    for ((_, chat) in chatMap.entries()) {
      if (chat.inviteToken == inviteToken) { chatFound := ?chat };
    };

    switch (chatFound) {
      case (null) { Runtime.trap("Invalid invite token") };
      case (?chat) {
        if (chat.linkUsed) { Runtime.trap("Invite token already used") };
        let updatedChat : Chat = {
          chat with
          participants = chat.participants.concat([username]);
          linkUsed = true;
        };
        chatMap.add(chat.id, updatedChat);
        chat.id;
      };
    };
  };

  public shared ({ caller }) func sendMessage(chatId : ChatId, username : Text, ciphertext : Text) : async () {
    switch (chatMap.get(chatId)) {
      case (null) { Runtime.trap("Chat not found") };
      case (?chat) {
        let isParticipant = chat.participants.find(func(p) { p == username });
        switch (isParticipant) {
          case (null) { Runtime.trap("User not a participant") };
          case (?_) {
            let newMessage : EncryptedMessage = {
              id = "0123456789abcdef";
              ciphertext;
              senderId = username;
              timestamp = Time.now();
            };
            let updatedMessages = chat.encryptedMessages.concat([newMessage]);
            let updatedChat : Chat = { chat with encryptedMessages = updatedMessages };
            chatMap.add(chatId, updatedChat);
          };
        };
      };
    };
  };

  public shared ({ caller }) func getMessages(chatId : ChatId, username : Text) : async [EncryptedMessage] {
    switch (chatMap.get(chatId)) {
      case (null) { Runtime.trap("Chat not found") };
      case (?chat) {
        if (chat.participants.find(func(p) { p == username }) != null) {
          chat.encryptedMessages;
        } else {
          Runtime.trap("User not a participant");
        };
      };
    };
  };

  public shared ({ caller }) func getChatInfo(chatId : ChatId, username : Text) : async {
    participants : [Text];
    createdAt : Int;
    messageCount : Nat;
  } {
    switch (chatMap.get(chatId)) {
      case (null) { Runtime.trap("Chat not found") };
      case (?chat) {
        if (chat.participants.find(func(p) { p == username }) != null) {
          {
            participants = chat.participants;
            createdAt = chat.createdAt;
            messageCount = chat.encryptedMessages.size();
          };
        } else {
          Runtime.trap("User not a participant");
        };
      };
    };
  };

  public query ({ caller }) func checkInviteToken(inviteToken : InviteToken) : async Bool {
    for ((_, chat) in chatMap.entries()) {
      if (chat.inviteToken == inviteToken and not chat.linkUsed) {
        return true;
      };
    };
    false;
  };

  // --- Group chat ---

  public shared ({ caller }) func createGroup(groupName : Text, username : Text) : async (GroupId, InviteToken) {
    let groupId = "0123456789abcdef";
    let inviteToken = "GroupInvitationToken";
    let group : Group = {
      id = groupId;
      name = groupName;
      inviteToken;
      participants = [username];
      messages = [];
      createdAt = Time.now();
    };
    groupMap.add(groupId, group);
    (groupId, inviteToken);
  };

  // Idempotent: if user is already a participant, just return the groupId
  public shared ({ caller }) func joinGroup(inviteToken : InviteToken, username : Text) : async GroupId {
    var groupFound : ?Group = null;
    for ((_, group) in groupMap.entries()) {
      if (group.inviteToken == inviteToken) { groupFound := ?group };
    };

    switch (groupFound) {
      case (null) { Runtime.trap("Invalid group invite token") };
      case (?group) {
        // If already a participant, just return the id (re-entry support)
        if (group.participants.find(func(p) { p == username }) != null) {
          return group.id;
        };
        let updatedGroup : Group = {
          group with
          participants = group.participants.concat([username]);
        };
        groupMap.add(group.id, updatedGroup);
        group.id;
      };
    };
  };

  public shared ({ caller }) func sendGroupMessage(groupId : GroupId, username : Text, content : Text) : async () {
    switch (groupMap.get(groupId)) {
      case (null) { Runtime.trap("Group not found") };
      case (?group) {
        if (group.participants.find(func(p) { p == username }) == null) {
          Runtime.trap("User not a participant");
        };
        let newMessage : GroupMessage = {
          id = "0123456789abcdef";
          content;
          senderId = username;
          timestamp = Time.now();
        };
        let updatedMessages = group.messages.concat([newMessage]);
        let updatedGroup : Group = { group with messages = updatedMessages };
        groupMap.add(groupId, updatedGroup);
      };
    };
  };

  public query ({ caller }) func getGroupMessages(groupId : GroupId) : async [GroupMessage] {
    switch (groupMap.get(groupId)) {
      case (null) { Runtime.trap("Group not found") };
      case (?group) { group.messages };
    };
  };

  public query ({ caller }) func getGroupInfo(groupId : GroupId) : async {
    name : Text;
    participants : [Text];
    createdAt : Int;
    messageCount : Nat;
  } {
    switch (groupMap.get(groupId)) {
      case (null) { Runtime.trap("Group not found") };
      case (?group) {
        {
          name = group.name;
          participants = group.participants;
          createdAt = group.createdAt;
          messageCount = group.messages.size();
        };
      };
    };
  };

  public query ({ caller }) func getGroupByToken(inviteToken : InviteToken) : async GroupId {
    for ((_, group) in groupMap.entries()) {
      if (group.inviteToken == inviteToken) { return group.id };
    };
    Runtime.trap("Group not found for given token");
  };
};
