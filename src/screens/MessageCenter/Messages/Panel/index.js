import React from "react";
import styles from "./Panel.module.sass";
import Actions from "../../../../components/Actions";
import Icon from "../../../../components/Icon";

const Panel = ({ actions, parameters, setVisible, selectedConversation }) => {
    return (
        <div className={styles.panel}>
            <div className={styles.line}>
                <div className={styles.man}>
                    {selectedConversation?.man || "Select a conversation"}
                </div>
                <Actions
                    className={styles.actions}
                    classActionsHead={styles.actionsHead}
                    classActionsBody={styles.actionsBody}
                    items={actions}
                />
                <button
                    className={styles.close}
                    onClick={() => setVisible(false)}
                >
                    <Icon name="close" size="24" />
                </button>
            </div>
            {parameters.length > 0 && (
                <div className={styles.parameters}>
                    {parameters.map((x, index) => (
                        <div className={styles.parameter} key={index}>
                            {x.title}: <span>{x.content}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Panel;
