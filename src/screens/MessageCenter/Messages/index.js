import React from "react";
import cn from "classnames";
import styles from "./Messages.module.sass";
import Panel from "./Panel";
import Message from "./Message";
import Send from "./Send";

const Messages = ({
  className,
  visible,
  setVisible,
  actions,
  parameters,
  messages,
  onSendMessage,
  selectedConversation,
}) => {
  return (
    <div className={cn(className, styles.messages, { [styles.show]: visible })}>
      <Panel
        actions={actions}
        parameters={parameters}
        setVisible={setVisible}
        selectedConversation={selectedConversation}
      />
      <div className={styles.wrapper}>
        {!selectedConversation ? (
          <div className={styles.empty}>
            <p>Select a conversation to view messages</p>
          </div>
        ) : messages.length === 0 ? (
          <div className={styles.empty}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            <div className={styles.list}>
              {messages.map((x, index) => (
                <Message item={x} key={index} />
              ))}
            </div>
          </>
        )}
        <Send onSendMessage={onSendMessage} />
      </div>
    </div>
  );
};

export default Messages;
