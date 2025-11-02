import React, { useState } from "react";
import cn from "classnames";
import styles from "./Send.module.sass";
import Icon from "../../../../components/Icon";
import Smile from "../../../../components/Smile";

const Send = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && onSendMessage) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className={styles.send} onSubmit={handleSubmit}>
      <div className={styles.file}>
        <input type="file" />
        <Icon name="file-add" size="24" />
      </div>
      <Smile className={styles.smile} up />
      <div className={styles.form}>
        <input
          className={styles.input}
          type="text"
          name="message"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          required
        />
        <button
          type="submit"
          className={cn("button-small", styles.button)}
          disabled={!message.trim()}
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default Send;
