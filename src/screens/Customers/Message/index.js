import React, { useState, useEffect } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import styles from "./Message.module.sass";
import Card from "../../../components/Card";
import { getConversations } from "../../../services/messageService";
import { getCurrentUser } from "../../../services/authService";

const Message = ({ className }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentMessages();
  }, []);

  const fetchRecentMessages = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: userData } = await getCurrentUser();

      if (userData?.id) {
        // Fetch conversations
        const { data, error } = await getConversations(userData.id);

        if (!error && data) {
          // Transform data to match UI format and limit to 5 messages
          const formattedMessages = data.slice(0, 5).map((conversation) => {
            const partner = conversation.partner || {};
            const metadata = partner.raw_user_meta_data || {};

            return {
              title: metadata.name || partner.email?.split('@')[0] || 'Unknown User',
              login: `@${partner.email?.split('@')[0] || 'username'}`,
              time: getTimeAgo(conversation.created_at),
              content: conversation.content || 'Message goes here <span role="img" aria-label="smile">😊</span>',
              avatar: metadata.avatar_url || "/images/content/avatar.jpg",
              unread: conversation.unread,
            };
          });

          setMessages(formattedMessages);
        } else {
          // No messages or error
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  return (
    <Card
      className={cn(styles.card, className)}
      title="Message"
      classTitle="title-purple"
    >
      <div className={styles.message}>
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6F767E' }}>
            No messages yet. Messages from customers will appear here.
          </div>
        ) : (
          <>
            <div className={styles.list}>
              {messages.map((x, index) => (
                <div className={styles.item} key={index}>
                  <div className={styles.avatar}>
                    <img src={x.avatar} alt="Avatar" />
                  </div>
                  <div className={styles.details}>
                    <div className={styles.line}>
                      <div className={styles.user}>
                        <span className={styles.title}>{x.title}</span>{" "}
                        <span className={styles.login}>{x.login}</span>
                      </div>
                      <div className={styles.time}>{x.time}</div>
                    </div>
                    <div
                      className={styles.content}
                      dangerouslySetInnerHTML={{ __html: x.content }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              className={cn("button-stroke", styles.button)}
              to="/message-center"
            >
              View all message
            </Link>
          </>
        )}
      </div>
    </Card>
  );
};

export default Message;
