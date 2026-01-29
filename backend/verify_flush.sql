-- Verify database flush - Count rows in all tables
SELECT 'audit_log' as table_name, COUNT(*) as row_count FROM audit_log
UNION ALL
SELECT 'donation', COUNT(*) FROM donation
UNION ALL
SELECT 'receipt', COUNT(*) FROM receipt
UNION ALL
SELECT 'invoice', COUNT(*) FROM invoice
UNION ALL
SELECT 'ngo_vendor', COUNT(*) FROM ngo_vendor
UNION ALL
SELECT 'transaction', COUNT(*) FROM transaction
UNION ALL
SELECT 'community_need', COUNT(*) FROM community_need
UNION ALL
SELECT 'manage', COUNT(*) FROM manage
UNION ALL
SELECT 'scheme', COUNT(*) FROM scheme
UNION ALL
SELECT 'blockchain_event', COUNT(*) FROM blockchain_event
UNION ALL
SELECT 'demo_donor_contribution', COUNT(*) FROM demo_donor_contribution
UNION ALL
SELECT 'demo_scheme_balance', COUNT(*) FROM demo_scheme_balance
UNION ALL
SELECT 'demo_escrow_state', COUNT(*) FROM demo_escrow_state
UNION ALL
SELECT 'kyc_records', COUNT(*) FROM kyc_records
UNION ALL
SELECT 'pan_records', COUNT(*) FROM pan_records
UNION ALL
SELECT 'donor', COUNT(*) FROM donor
UNION ALL
SELECT 'ngo', COUNT(*) FROM ngo
UNION ALL
SELECT 'vendor', COUNT(*) FROM vendor
UNION ALL
SELECT 'auditor', COUNT(*) FROM auditor
UNION ALL
SELECT 'government', COUNT(*) FROM government
UNION ALL
SELECT 'users', COUNT(*) FROM users
ORDER BY table_name;
