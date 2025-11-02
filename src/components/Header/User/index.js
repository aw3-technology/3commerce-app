import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./User.module.sass";
import Icon from "../../Icon";
import { useAuth } from "../../../contexts/AuthContext";

const items = [
    {
        menu: [
            {
                title: "Profile",
                url: "/shop",
            },
            {
                title: "Edit profile",
                url: "/settings",
            },
        ],
    },
    {
        menu: [
            {
                title: "Analytics",
                icon: "bar-chart",
                url: "/customers/overview",
            },
            {
                title: "Affiliate center",
                icon: "ticket",
                url: "/affiliate-center",
            },
            {
                title: "Explore creators",
                icon: "grid",
                url: "/explore-creators",
            },
        ],
    },
    {
        menu: [
            {
                title: "Upgrade to Pro",
                icon: "leaderboard",
                color: true,
                url: "/upgrade-to-pro",
            },
        ],
    },
    {
        menu: [
            {
                title: "Account settings",
                url: "/settings",
            },
            {
                title: "Log out",
            },
        ],
    },
];

const User = ({ className }) => {
    const [visible, setVisible] = useState(false);
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const handleLogout = async () => {
        setVisible(false);
        const result = await logout();
        if (result.success) {
            navigate("/sign-in");
        }
    };

    return (
        <OutsideClickHandler onOutsideClick={() => setVisible(false)}>
            <div
                className={cn(styles.user, className, {
                    [styles.active]: visible,
                })}
            >
                <button
                    className={styles.head}
                    onClick={() => setVisible(!visible)}
                >
                    <img src="/images/content/avatar.jpg" alt="Avatar" />
                </button>
                <div className={styles.body}>
                    {user && (
                        <div className={styles.menu}>
                            <div style={{ padding: "12px 24px", borderBottom: "1px solid #e4e4e4" }}>
                                <div style={{ fontSize: "14px", fontWeight: "600" }}>
                                    {user.user_metadata?.name || "User"}
                                </div>
                                <div style={{ fontSize: "12px", color: "#777", marginTop: "4px" }}>
                                    {user.email}
                                </div>
                            </div>
                        </div>
                    )}
                    {items.map((item, index) => (
                        <div className={styles.menu} key={index}>
                            {item.menu.map((x, index) =>
                                x.url ? (
                                    <NavLink
                                        className={cn(styles.item, {
                                            [styles.color]: x.color,
                                            [styles.active]: pathname === x.url,
                                        })}
                                        to={x.url}
                                        onClick={() => setVisible(false)}
                                        key={index}
                                    >
                                        {x.icon && (
                                            <Icon name={x.icon} size="24" />
                                        )}
                                        {x.title}
                                    </NavLink>
                                ) : (
                                    <button
                                        className={styles.item}
                                        onClick={x.title === "Log out" ? handleLogout : () => setVisible(false)}
                                        key={index}
                                    >
                                        {x.title}
                                    </button>
                                )
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </OutsideClickHandler>
    );
};

export default User;
