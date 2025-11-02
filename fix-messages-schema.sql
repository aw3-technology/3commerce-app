-- Fix messages table to add missing columns
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS subject VARCHAR(255);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);

-- Add index for read status queries
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_read ON messages(conversation_id, read);

-- Update RLS policies for the messages table
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON messages;

-- Create more specific policies
CREATE POLICY "Users can view their sent messages" ON messages
    FOR SELECT USING (auth.uid() = sender_id);

CREATE POLICY "Users can view their received messages" ON messages
    FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

-- Make sure RLS is enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

SELECT 'Messages table schema fixed successfully!' AS status;
