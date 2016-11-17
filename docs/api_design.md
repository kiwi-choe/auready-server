#Login
local {
name: name,
email: email,
password: password
}

social: {
name: username of social account,
email: email of social account,
password: social access token(or id_token, any signed key things)
}

#Manage friends
Relationship {
fromUserId: user who sent request
toUserId: user who received request
status: [PENDING, ACCEPTED, DECLINED]
}

In userA Client view,
when userA visits userB,
check the relationship with userB using (fromUserId, status)
- (A, 0) Friend request*Pending => Show [CANCEL] button
- (A, 1) Accepted by A => A and B are friends
- (A, 2) Declined by A => this relationship should be removed from DB?
- (B, 0) Received the friend request => Show [Accept][Decline] buttons
- (B, 1) Accepted by B => they are friends
- (B, 2) Declined by B => this relationship should be removed from DB?