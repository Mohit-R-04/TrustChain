-- TrustChain Database Flush Script
-- This script will delete all data from all tables while preserving the schema
-- WARNING: This action cannot be undone!

-- Disable triggers temporarily to avoid constraint issues
SET session_replication_role = 'replica';

-- Truncate all tables (CASCADE will handle foreign key constraints)
TRUNCATE TABLE audit_log CASCADE;
TRUNCATE TABLE donation CASCADE;
TRUNCATE TABLE receipt CASCADE;
TRUNCATE TABLE invoice CASCADE;
TRUNCATE TABLE ngo_vendor CASCADE;
TRUNCATE TABLE transaction CASCADE;
TRUNCATE TABLE community_need CASCADE;
TRUNCATE TABLE manage CASCADE;
TRUNCATE TABLE scheme CASCADE;
TRUNCATE TABLE blockchain_event CASCADE;
TRUNCATE TABLE demo_donor_contribution CASCADE;
TRUNCATE TABLE demo_scheme_balance CASCADE;
TRUNCATE TABLE demo_escrow_state CASCADE;
TRUNCATE TABLE kyc_records CASCADE;
TRUNCATE TABLE pan_records CASCADE;
TRUNCATE TABLE donor CASCADE;
TRUNCATE TABLE ngo CASCADE;
TRUNCATE TABLE vendor CASCADE;
TRUNCATE TABLE auditor CASCADE;
TRUNCATE TABLE government CASCADE;
TRUNCATE TABLE users CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Display confirmation
SELECT 'Database flushed successfully! All data has been deleted.' AS status;
