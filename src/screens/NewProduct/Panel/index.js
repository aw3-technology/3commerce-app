import React from "react";
import cn from "classnames";
import styles from "./Panel.module.sass";
import Icon from "../../../components/Icon";
import Actions from "../../../components/Actions";

const Panel = ({
  setVisiblePreview,
  setVisibleSchedule,
  onSaveDraft,
  onPublish,
  onClearData,
  isSaving,
  lastSaved
}) => {
  const actions = [
    {
      title: "Preview",
      icon: "expand",
      action: () => setVisiblePreview(true),
    },
    {
      title: "Schedule product",
      icon: "calendar",
      action: () => setVisibleSchedule(true),
    },
    {
      title: "Get shareable link",
      icon: "link",
      action: () => alert("Shareable link feature coming soon!"),
    },
    {
      title: "Clear data",
      icon: "close",
      action: onClearData,
    },
  ];

  const formatLastSaved = () => {
    if (!lastSaved) return "Not saved yet";

    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000); // difference in seconds

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;

    return lastSaved.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={cn("panel", styles.panel)}>
      <div className={styles.info}>
        <Icon name="check-all" size="24" />
        Last saved <span>{formatLastSaved()}</span>
      </div>
      <div className={styles.btns}>
        <button
          className={cn("button-stroke", styles.button)}
          onClick={onSaveDraft}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Draft"}
        </button>
        <button
          className={cn("button", styles.button)}
          onClick={onPublish}
          disabled={isSaving}
        >
          {isSaving ? "Publishing..." : "Publish now"}
        </button>
        <Actions
          className={styles.actions}
          classActionsHead={styles.actionsHead}
          classActionsBody={styles.actionsBody}
          classActionsOption={styles.actionsOption}
          items={actions}
          up
        />
      </div>
    </div>
  );
};

export default Panel;
