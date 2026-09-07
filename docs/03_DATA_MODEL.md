# Data Model

This document describes the logical model. Exact SQL may evolve during implementation.

## Core Entities

### profiles
```text
id
display_name
username
avatar_config
discipline
status_message
created_at
updated_at
```

### workspaces
```text
id
name
slug
owner_id
created_at
updated_at
```

### workspace_members
```text
workspace_id
user_id
role
joined_at
```

Roles:
- owner
- lead
- member
- guest

### projects
```text
id
workspace_id
name
description
status
created_by
created_at
updated_at
```

### project_members
```text
project_id
user_id
project_role
joined_at
```

## Planning

### milestones
```text
id
project_id
title
description
status
start_date
due_date
progress
created_at
updated_at
```

### goals
```text
id
milestone_id
project_id
title
description
owner_id
status
progress
priority
due_date
created_at
updated_at
```

### tasks
```text
id
goal_id
title
description
assignee_id
status
priority
due_date
completed_at
created_at
updated_at
```

Recommended task status:
- not_started
- in_progress
- review
- blocked
- done

## Progress Reporting

### progress_reports
```text
id
project_id
goal_id
author_id
progress_percent
summary
blockers
next_target
status
created_at
```

### report_evidence
```text
id
report_id
type
url
label
metadata
created_at
```

Types:
- link
- embed
- commit
- pull_request
- image
- document
- other

## External Work

### external_resources
```text
id
project_id
goal_id nullable
owner_id nullable
provider
url
title
embed_type
embed_url nullable
metadata
created_at
updated_at
```

Possible providers:
- figma
- figjam
- github
- notion
- google_docs
- youtube
- generic

## Communication

### conversations
```text
id
workspace_id
project_id nullable
type
name nullable
room_id nullable
created_by
created_at
```

Types:
- direct
- group
- room

### conversation_members
```text
conversation_id
user_id
joined_at
last_read_at
```

### messages
```text
id
conversation_id
sender_id
content
reply_to_id nullable
created_at
edited_at nullable
deleted_at nullable
```

### message_attachments
```text
id
message_id
type
url
metadata
```

## Studio

### studio_rooms
```text
id
workspace_id
project_id nullable
name
room_type
map_key
created_at
```

### studio_objects
```text
id
room_id
object_key
object_type
x
y
interaction_type
interaction_target
metadata
```

Do not create a database row for every movement tick.

If persistent last position is needed:

### member_studio_state
```text
user_id
project_id
room_id
last_x
last_y
updated_at
```

Update conservatively, not every frame.

## Activity

### activity_events
```text
id
workspace_id
project_id
actor_id
event_type
entity_type
entity_id
metadata
created_at
```

Keep activity useful. Do not log meaningless high-frequency UI events.
