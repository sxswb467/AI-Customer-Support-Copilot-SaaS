export function seedData(db) {
  db.run(`
    INSERT INTO tenants (id, name, plan) VALUES
      (1, 'BrightPath Finance', 'Growth'),
      (2, 'Northstar Learning', 'Enterprise');

    INSERT INTO tickets (id, tenant_id, customer_name, subject, priority, status, details, created_at) VALUES
      (101, 1, 'Emma Carter', 'Password reset link expired', 'High', 'Open', 'Customer cannot log in after two failed reset attempts.', '2026-03-20T10:00:00Z'),
      (102, 1, 'Lucas Nguyen', 'Billing invoice mismatch', 'Medium', 'Pending', 'User says March invoice shows two seats instead of one.', '2026-03-22T15:45:00Z'),
      (201, 2, 'Olivia Shah', 'Course progress not syncing', 'High', 'Open', 'Progress bar remains stuck at 60 percent across devices.', '2026-03-24T09:15:00Z');

    INSERT INTO kb_articles (id, tenant_id, title, body, tags) VALUES
      (1, 1, 'Password reset troubleshooting', 'If the user reset email is older than 15 minutes, ask them to request a new reset link. Check spam folder and confirm the most recent email was used. Escalate only after two fresh attempts fail.', 'auth,password,reset'),
      (2, 1, 'Billing seat reconciliation', 'Invoices are generated nightly based on active seats. Refund requests for duplicate seats should verify account membership changes within the billing window.', 'billing,invoice,seats'),
      (3, 2, 'Progress sync diagnostics', 'Ask the learner to sign out and back in, then force refresh progress from the course dashboard. If progress is still stale, capture browser, device, and lesson id before escalation.', 'sync,course,progress');

    INSERT INTO chat_messages (ticket_id, role, content, created_at) VALUES
      (101, 'assistant', 'Suggested response: Please request a fresh password reset email and use the most recent link within 15 minutes.', '2026-03-20T10:05:00Z');
  `);
}
