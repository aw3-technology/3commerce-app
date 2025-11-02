import React, { useState } from "react";
import cn from "classnames";
import styles from "./Login.module.sass";
import Item from "../Item";
import TextInput from "../../../components/TextInput";
import { updateUserPassword } from "../../../services/userService";

const Login = ({ className }) => {
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [updating, setUpdating] = useState(false);

  const handleInputChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdatePassword = async () => {
    // Validate passwords
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      alert("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    setUpdating(true);

    const { error } = await updateUserPassword(passwordData.newPassword);

    if (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password: " + (error.message || "Unknown error"));
    } else {
      alert("Password updated successfully!");
      // Clear the form
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    }

    setUpdating(false);
  };

  return (
    <Item
      className={cn(styles.card, className)}
      title="Login"
      classTitle="title-purple"
    >
      <div className={styles.fieldset}>
        <TextInput
          className={styles.field}
          label="Old password"
          name="old-password"
          type="password"
          value={passwordData.oldPassword}
          onChange={(e) => handleInputChange("oldPassword", e.target.value)}
          tooltip="Maximum 100 characters. No HTML or emoji allowed"
          required
        />
        <div className={styles.row}>
          <TextInput
            className={styles.field}
            label="New password"
            name="new-password"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => handleInputChange("newPassword", e.target.value)}
            tooltip="Maximum 100 characters. No HTML or emoji allowed"
            required
          />
          <TextInput
            className={styles.field}
            label="Confirm new password"
            name="confirm-password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            tooltip="Maximum 100 characters. No HTML or emoji allowed"
            required
          />
        </div>
        <button
          className={cn("button-stroke", styles.button)}
          onClick={handleUpdatePassword}
          disabled={updating}
        >
          {updating ? "Updating..." : "Update password"}
        </button>
      </div>
    </Item>
  );
};

export default Login;
