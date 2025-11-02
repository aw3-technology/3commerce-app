import React, { useState, useRef } from "react";
import cn from "classnames";
import styles from "./Settings.module.sass";
import TooltipGlodal from "../../components/TooltipGlodal";
import Dropdown from "../../components/Dropdown";
import ProfileInformation from "./ProfileInformation";
import Login from "./Login";
import Notifications from "./Notifications";
import Payment from "./Payment";
import { upsertUserProfile, getCurrentUser, updateUserEmail } from "../../services/userService";

const Settings = () => {
  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
    location: "",
    bio: ""
  });
  const [notificationPrefs, setNotificationPrefs] = useState({});
  const [paymentData, setPaymentData] = useState({
    paypalEmail: "",
    paymentMethod: "paypal"
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const navigation = [
    {
      title: "Basics",
      action: () =>
        scrollToProfile.current.scrollIntoView({ behavior: "smooth" }),
    },
    {
      title: "Account",
      action: () =>
        scrollToLogin.current.scrollIntoView({ behavior: "smooth" }),
    },
    {
      title: "Notifications",
      action: () =>
        scrollToNotifications.current.scrollIntoView({ behavior: "smooth" }),
    },
    {
      title: "Payment",
      action: () =>
        scrollToPayment.current.scrollIntoView({ behavior: "smooth" }),
    },
  ];
  const options = [];
  navigation.map((x) => options.push(x.title));
  const [activeTab, setActiveTab] = useState(options[0]);

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollToProfile = useRef(null);
  const scrollToLogin = useRef(null);
  const scrollToNotifications = useRef(null);
  const scrollToPayment = useRef(null);

  const handleClick = (x, index) => {
    setActiveIndex(index);
    x.action();
  };

  // Load user data on component mount
  React.useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      const { data, error } = await getCurrentUser();

      if (!error && data) {
        setUserId(data.id);

        // Load profile data
        if (data.profile) {
          setProfileData({
            displayName: data.profile.display_name || data.user_metadata?.name || "",
            email: data.email || "",
            location: data.profile.location || "",
            bio: data.profile.bio || ""
          });

          // Load notification preferences
          if (data.profile.notification_preferences) {
            setNotificationPrefs(data.profile.notification_preferences);
          }

          // Load payment data
          if (data.profile.paypal_email) {
            setPaymentData({
              paypalEmail: data.profile.paypal_email,
              paymentMethod: "paypal"
            });
          }
        } else {
          // Set defaults from auth metadata
          setProfileData(prev => ({
            ...prev,
            displayName: data.user_metadata?.name || "",
            email: data.email || ""
          }));
        }
      }

      setLoading(false);
    };

    loadUserData();
  }, []);

  const handleSave = async () => {
    if (!userId) {
      alert("User not authenticated. Please log in again.");
      return;
    }

    setSaving(true);
    try {
      // Get current user to check if email changed
      const { data: userData, error: userError } = await getCurrentUser();
      if (userError) {
        console.error("Error getting current user:", userError);
        alert("Failed to get user information");
        setSaving(false);
        return;
      }

      // Update email if changed
      if (profileData.email && profileData.email !== userData.email) {
        const { error: emailError } = await updateUserEmail(profileData.email);
        if (emailError) {
          console.error("Error updating email:", emailError);
          alert("Failed to update email. Please check your new email for verification.");
          setSaving(false);
          return;
        } else {
          alert("Email update initiated. Please check your new email to verify the change.");
        }
      }

      // Save profile data with notification and payment preferences
      const { data, error } = await upsertUserProfile(userId, {
        display_name: profileData.displayName,
        location: profileData.location,
        bio: profileData.bio,
        paypal_email: paymentData.paypalEmail,
        notification_preferences: notificationPrefs
      });

      if (error) {
        console.error("Error saving profile:", error);
        alert("Failed to save profile. Please try again.");
      } else {
        alert("Settings saved successfully!");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.settings}>
        <div className={styles.loading}>Loading settings...</div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.settings}>
        <div className={styles.menu}>
          {navigation.map((x, index) => (
            <button
              className={cn(styles.button, {
                [styles.active]: activeIndex === index,
              })}
              key={index}
              onClick={() => handleClick(x, index)}
            >
              {x.title}
            </button>
          ))}
        </div>
        <div className={styles.wrapper}>
          <Dropdown
            className={styles.dropdown}
            classDropdownHead={styles.dropdownHead}
            value={activeTab}
            setValue={setActiveTab}
            options={options}
          />
          <div className={styles.list}>
            <div
              className={cn(styles.item, {
                [styles.active]: activeTab === options[0],
              })}
            >
              <div className={styles.anchor} ref={scrollToProfile}></div>
              <ProfileInformation
                profileData={profileData}
                setProfileData={setProfileData}
                userId={userId}
              />
            </div>
            <div
              className={cn(styles.item, {
                [styles.active]: activeTab === options[1],
              })}
            >
              <div className={styles.anchor} ref={scrollToLogin}></div>
              <Login />
            </div>
            <div
              className={cn(styles.item, {
                [styles.active]: activeTab === options[2],
              })}
            >
              <div className={styles.anchor} ref={scrollToNotifications}></div>
              <Notifications
                notificationPrefs={notificationPrefs}
                setNotificationPrefs={setNotificationPrefs}
              />
            </div>
            <div
              className={cn(styles.item, {
                [styles.active]: activeTab === options[3],
              })}
            >
              <div className={styles.anchor} ref={scrollToPayment}></div>
              <Payment
                paymentData={paymentData}
                setPaymentData={setPaymentData}
              />
            </div>
          </div>
          <button
            className={cn("button", styles.button)}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
      <TooltipGlodal />
    </>
  );
};

export default Settings;
