# Communication System

## Goals

Communication should support both traditional messaging and spatial context from the virtual studio.

## Conversation Types

### Direct
Two members.

### Group
Three or more selected members.

### Room
Conversation associated with a studio room.

## Direct Message Flow

```text
Select avatar
→ Chat
→ existing direct conversation or new direct conversation
```

## Group Chat

Users can create a named group or add members into a group conversation.

Avoid silently converting a private direct conversation into a group while losing context.

Prefer:
- Create Group from Conversation
- copy/select participants
- start a new group context

## Room Chat

Each room may have one room conversation.

Example:
```text
Art Room → Art Room Conversation
```

Users inside the room may receive stronger visibility of room chat, but conversation history can remain available based on permissions.

## Message Features for V1

- text
- timestamp
- reply
- unread state
- basic attachment/link
- typing indicator
- online presence

Optional after core:
- reactions
- edit/delete
- mentions
- pinned messages

## Studio Chat Bubble

Chat bubbles should be lightweight.

Do not display large chat histories over the game world.

Recommended:
- short temporary bubble
- click opens full chat panel

## Realtime

Message persistence:
PostgreSQL.

Message delivery:
Supabase Realtime.

Typing:
temporary realtime event.

Presence:
Supabase Presence.

Do not persist typing state.
