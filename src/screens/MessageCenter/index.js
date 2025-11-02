import React, { useState, useEffect } from "react";
import styles from "./MessageCenter.module.sass";
import cn from "classnames";
import Users from "./Users";
import Messages from "./Messages";
import {
  getConversations,
  getConversationMessages,
  sendMessage,
  markConversationAsRead,
  deleteMessage,
  searchMessages,
  subscribeToMessages,
  unsubscribeFromMessages,
} from "../../services/messageService";
import { getCurrentUser } from "../../services/authService";

const navigation = [
  {
    title: "Customers",
    icon: "profile-circle",
  },
  {
    title: "Everyone",
    icon: "lightning",
  },
];

const MessageCenter = () => {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: user, error: userError } = await getCurrentUser();
      if (userError) {
        setError("Failed to authenticate user");
        setLoading(false);
        return;
      }
      setCurrentUser(user);
    };

    fetchUser();
  }, []);

  // Fetch conversations when user is loaded
  useEffect(() => {
    if (!currentUser) return;

    fetchConversations();

    // Subscribe to real-time messages
    const subscription = subscribeToMessages(currentUser.id, (newMessage) => {
      // Refresh conversations when new message arrives
      fetchConversations();

      // If the message is for the currently selected conversation, add it to messages
      if (
        selectedConversation &&
        (newMessage.sender_id === selectedConversation.partner?.id ||
          newMessage.recipient_id === selectedConversation.partner?.id)
      ) {
        fetchConversationMessages(selectedConversation.partner.id);
      }
    });

    return () => {
      unsubscribeFromMessages(subscription);
    };
  }, [currentUser]);

  // Fetch conversation messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation && currentUser) {
      fetchConversationMessages(selectedConversation.partner.id);
      // Mark conversation as read
      markConversationAsRead(currentUser.id, selectedConversation.partner.id);
    }
  }, [selectedConversation, currentUser]);

  const fetchConversations = async () => {
    if (!currentUser) return;

    setLoading(true);
    const { data, error: convError } = await getConversations(currentUser.id);

    if (convError) {
      setError("Failed to load conversations");
      setLoading(false);
      return;
    }

    // Transform data to match expected format
    const transformedConversations = data?.map((conv) => ({
      id: conv.id,
      man: conv.partner?.raw_user_meta_data?.name || conv.partner?.email || "Unknown User",
      avatar: conv.partner?.raw_user_meta_data?.avatar_url || "/images/content/avatar.jpg",
      time: formatTime(conv.created_at),
      content: conv.content,
      new: conv.unread,
      online: false, // TODO: Add online status tracking
      partnerId: conv.partner?.id,
      partner: conv.partner,
    })) || [];

    setConversations(transformedConversations);
    setLoading(false);
  };

  const fetchConversationMessages = async (partnerId) => {
    if (!currentUser) return;

    const { data, error: msgError } = await getConversationMessages(
      currentUser.id,
      partnerId
    );

    if (msgError) {
      setError("Failed to load messages");
      return;
    }

    // Transform messages to match expected format
    const transformedMessages = data?.map((msg) => ({
      id: msg.id,
      man: msg.sender?.raw_user_meta_data?.name || msg.sender?.email || "Unknown User",
      avatar: msg.sender?.raw_user_meta_data?.avatar_url || "/images/content/avatar.jpg",
      time: formatTime(msg.created_at),
      content: msg.content,
      isSender: msg.sender_id === currentUser.id,
    })) || [];

    setMessages(transformedMessages);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!currentUser || !search.trim()) {
      fetchConversations();
      return;
    }

    const { data, error: searchError } = await searchMessages(currentUser.id, search);

    if (searchError) {
      setError("Failed to search messages");
      return;
    }

    // Transform search results
    const transformedResults = data?.map((msg) => {
      const partner = msg.sender_id === currentUser.id ? msg.recipient : msg.sender;
      return {
        id: msg.id,
        man: partner?.raw_user_meta_data?.name || partner?.email || "Unknown User",
        avatar: partner?.raw_user_meta_data?.avatar_url || "/images/content/avatar.jpg",
        time: formatTime(msg.created_at),
        content: msg.content,
        new: !msg.read && msg.recipient_id === currentUser.id,
        online: false,
        partnerId: partner?.id,
        partner: partner,
      };
    }) || [];

    setConversations(transformedResults);
  };

  const handleSendMessage = async (messageContent) => {
    if (!currentUser || !selectedConversation || !messageContent.trim()) {
      return;
    }

    const { data, error: sendError } = await sendMessage({
      sender_id: currentUser.id,
      recipient_id: selectedConversation.partnerId,
      content: messageContent,
    });

    if (sendError) {
      setError("Failed to send message");
      return;
    }

    // Refresh messages
    fetchConversationMessages(selectedConversation.partnerId);
    // Refresh conversations to update the latest message
    fetchConversations();
  };

  const handleDeleteMessage = async (messageId) => {
    const { error: deleteError } = await deleteMessage(messageId);

    if (deleteError) {
      setError("Failed to delete message");
      return;
    }

    // Refresh messages and conversations
    if (selectedConversation) {
      fetchConversationMessages(selectedConversation.partnerId);
    }
    fetchConversations();
  };

  const handleMarkAsRead = async () => {
    if (!currentUser || !selectedConversation) return;

    await markConversationAsRead(currentUser.id, selectedConversation.partnerId);
    fetchConversations();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const actions = [
    {
      title: "Mark as read",
      icon: "check",
      action: handleMarkAsRead,
    },
    {
      title: "Delete message",
      icon: "trash",
      action: () => {
        if (messages.length > 0) {
          handleDeleteMessage(messages[messages.length - 1].id);
        }
      },
    },
  ];

  const parameters = selectedConversation?.partner?.customer
    ? [
        {
          title: "Customer since",
          content: formatDate(selectedConversation.partner.customer.created_at),
        },
        {
          title: "Purchased",
          content: `${selectedConversation.partner.customer.order_count || 0} items`,
        },
        {
          title: "Lifetime",
          content: `$${selectedConversation.partner.customer.total_spent || 0}`,
        },
      ]
    : [];

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setVisible(true);
  };

  if (loading && !currentUser) {
    return (
      <div className={styles.loading}>
        <p>Loading messages...</p>
      </div>
    );
  }

  if (error && !currentUser) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className={cn(styles.wrapper, { [styles.active]: visible })}>
      <Users
        className={styles.users}
        navigation={navigation}
        items={conversations}
        setVisible={setVisible}
        search={search}
        setSearch={setSearch}
        onSubmit={handleSearch}
        onConversationSelect={handleConversationSelect}
        loading={loading}
      />
      <Messages
        className={styles.messages}
        visible={visible}
        setVisible={setVisible}
        actions={actions}
        parameters={parameters}
        messages={messages}
        onSendMessage={handleSendMessage}
        selectedConversation={selectedConversation}
      />
    </div>
  );
};

export default MessageCenter;
