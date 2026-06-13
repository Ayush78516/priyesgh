import EmailLog from "../models/EmailLog.js";
import TermsAgreementLog from "../models/TermsAgreementLog.js";

function persist(model, payload) {
  void model.create(payload).catch(() => {
    // Activity logs must not affect request flow.
  });
}

export function recordEmailLog({
  source,
  action,
  to = null,
  subject = null,
  status,
  requestId = null,
  userId = null,
  meta = undefined,
  error = null
}) {
  persist(EmailLog, {
    source,
    action,
    to,
    subject,
    status,
    requestId,
    userId,
    meta,
    error
  });
}

export function recordTermsAgreementLog({
  source,
  action,
  accepted = true,
  termsVersion = null,
  requestId = null,
  userId = null,
  ip = null,
  userAgent = null,
  meta = undefined
}) {
  persist(TermsAgreementLog, {
    source,
    action,
    accepted,
    termsVersion,
    requestId,
    userId,
    ip,
    userAgent,
    meta
  });
}
