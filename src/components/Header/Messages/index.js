import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./Messages.module.sass";
import Icon from "../../Icon";
import Actions from "../../Actions";
import Item from "./Item";
import {
    getConversations,
    getUnreadCount,
    markConversationAsRead,
    deleteMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
} from "../../../services/messageService";
import { getCurrentUser } from "../../../services/authService";

const Messages = ({ className }) => {
    const [visible, setVisible] = useState(false);
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: user } = await getCurrentUser();
            setCurrentUser(user);
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        fetchMessages();
        fetchUnreadCount();

        // Subscribe to real-time messages
        const subscription = subscribeToMessages(currentUser.id, () => {
            fetchMessages();
            fetchUnreadCount();
        });

        return () => {
            unsubscribeFromMessages(subscription);
        };
    }, [currentUser]);

    const fetchMessages = async () => {
        if (!currentUser) return;

        const { data, error } = await getConversations(currentUser.id);
        if (!error && data) {
            // Transform and limit to 5 most recent
            const transformedMessages = data.slice(0, 5).map((conv) => ({
                title: conv.partner?.raw_user_meta_data?.name || conv.partner?.email || "Unknown User",
                content: conv.content || "",
                avatar: conv.partner?.raw_user_meta_data?.avatar_url || "/images/content/avatar.jpg",
                time: formatTime(conv.created_at),
                new: conv.unread,
                online: false,
                url: "/message-center",
            }));
            setMessages(transformedMessages);
        }
    };

    const fetchUnreadCount = async () => {
        if (!currentUser) return;

        const { data: count } = await getUnreadCount(currentUser.id);
        setUnreadCount(count || 0);
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleMarkAsRead = async () => {
        if (!currentUser || messages.length === 0) return;
        // Mark all visible conversations as read
        await Promise.all(
            messages
                .filter((msg) => msg.new)
                .map((msg) => markConversationAsRead(currentUser.id, msg.partnerId))
        );
        fetchMessages();
        fetchUnreadCount();
    };

    const actions = [
        {
            title: "Mark as read",
            icon: "check",
            action: handleMarkAsRead,
        },
    ];

    return (
        <OutsideClickHandler onOutsideClick={() => setVisible(false)}>
            <div
                className={cn(styles.messages, className, {
                    [styles.active]: visible,
                })}
            >
                <button
                    className={cn(styles.head, { [styles.active]: unreadCount > 0 })}
                    onClick={() => setVisible(!visible)}
                >
                    <Icon name="message" size="24" />
                    {unreadCount > 0 && (
                        <span className={styles.badge}>{unreadCount}</span>
                    )}
                </button>
                <div className={styles.body}>
                    <div className={styles.top}>
                        <div className={styles.title}>Message</div>
                        <Actions
                            className={styles.actions}
                            classActionsHead={styles.actionsHead}
                            items={actions}
                            small
                        />
                    </div>
                    <div className={styles.list}>
                        {messages.length === 0 ? (
                            <div className={styles.empty}>No messages</div>
                        ) : (
                            messages.map((x, index) => (
                                <Item
                                    className={cn(styles.item, className)}
                                    item={x}
                                    key={index}
                                    onClose={() => setVisible(false)}
                                />
                            ))
                        )}
                    </div>
                    <Link
                        className={cn("button", styles.button)}
                        to="/message-center"
                        onClick={() => setVisible(false)}
                    >
                        View in message center
                    </Link>
                </div>
            </div>
        </OutsideClickHandler>
    );
};

export default Messages;
