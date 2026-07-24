const CONNECTION_STATUS = {
  INTERESTED: "interested",
  IGNORED: "ignored",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};

const SEND_ACTIONS = [CONNECTION_STATUS.INTERESTED, CONNECTION_STATUS.IGNORED];
const REVIEW_ACTIONS = [CONNECTION_STATUS.ACCEPTED, CONNECTION_STATUS.REJECTED];
const USER_SAFE_FIELDS = "firstName lastName email age gender photoUrl about skills location createdAt";

module.exports = { CONNECTION_STATUS, SEND_ACTIONS, REVIEW_ACTIONS, USER_SAFE_FIELDS };
