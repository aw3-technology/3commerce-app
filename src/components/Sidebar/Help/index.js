import { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Help.module.sass";
import { Link } from "react-router-dom";
import Icon from "../../Icon";
import Item from "./Item";
import { getHelpResources, incrementResourceViewCount } from "../../../services/helpService";
import { getCurrentUser } from "../../../services/authService";
import { getUnreadCount } from "../../../services/messageService";

const Help = ({ className, visible, setVisible, onClose }) => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: user } = await getCurrentUser();
            setCurrentUser(user);
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (visible) {
            fetchHelpResources();
            fetchUnreadCount();
        }
    }, [visible]);

    const fetchHelpResources = async () => {
        setLoading(true);
        const { data, error } = await getHelpResources({ limit: 5 });

        if (!error && data) {
            const transformedResources = data.map((resource) => ({
                id: resource.id,
                title: resource.title,
                image: resource.image_url || '/images/content/product-pic-1.jpg',
                image2x: resource.thumbnail_url || resource.image_url || '/images/content/product-pic-1@2x.jpg',
                statusText: resource.is_new ? 'New' : null,
                statusColor: resource.is_new ? 'purple' : null,
                avatar: resource.author?.raw_user_meta_data?.avatar_url || '/images/content/avatar-1.jpg',
                time: resource.duration_minutes ? `${resource.duration_minutes} mins` : null,
                category: resource.category,
                videoUrl: resource.video_url,
            }));
            setResources(transformedResources);
        }
        setLoading(false);
    };

    const fetchUnreadCount = async () => {
        if (!currentUser) return;

        const { data: count } = await getUnreadCount(currentUser.id);
        setUnreadMessages(count || 0);
    };

    const handleResourceClick = async (resourceId) => {
        // Track view in background
        if (resourceId) {
            await incrementResourceViewCount(resourceId);
        }
    };

    const menu = [
        {
            title: "Upgrade to Pro",
            icon: "lightning",
            arrow: true,
            url: "/upgrade-to-pro",
        },
        {
            title: "Download desktop app",
            icon: "download",
            url: "/",
        },
        {
            title: "Message center",
            icon: "message",
            counter: unreadMessages,
            url: "/message-center",
        },
    ];

    const handleClose = () => {
        onClose();
        setVisible(false);
    };

    return (
        <>
            <div
                className={cn(styles.help, className, {
                    [styles.active]: visible,
                })}
            >
                <div className={styles.head}>
                    <Icon name="help" size="24" />
                    Help & getting started
                    <button
                        className={styles.close}
                        onClick={() => setVisible(false)}
                    >
                        <Icon name="close" size="24" />
                    </button>
                </div>
                <div className={styles.list}>
                    {loading ? (
                        <div className={styles.loading}>Loading resources...</div>
                    ) : resources.length === 0 ? (
                        <div className={styles.empty}>No help resources available</div>
                    ) : (
                        resources.map((x, index) => (
                            <div key={index} onClick={() => handleResourceClick(x.id)}>
                                <Item className={styles.item} item={x} />
                            </div>
                        ))
                    )}
                </div>
                <div className={styles.menu}>
                    {menu.map((x, index) => (
                        <Link
                            className={styles.link}
                            to={x.url}
                            key={index}
                            onClick={() => handleClose()}
                        >
                            <Icon name={x.icon} size="24" />
                            {x.title}
                            {x.arrow && (
                                <div className={styles.arrow}>
                                    <Icon name="arrow-next" size="24" />
                                </div>
                            )}
                            {x.counter > 0 && (
                                <div className={styles.counter}>{x.counter}</div>
                            )}
                        </Link>
                    ))}
                </div>
            </div>
            <div
                className={cn(styles.overlay, { [styles.active]: visible })}
                onClick={() => setVisible(false)}
            ></div>
        </>
    );
};

export default Help;
