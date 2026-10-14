/**
 * KateringKing — Set Admin Custom Claim
 *
 * Grants the { admin: true } custom claim to the specified Firebase
 * Auth user so the Firestore security rules allow write access.
 *
 * Run ONCE after Firebase setup:
 *
 *   node scripts/set-admin-claim.js
 *
 * Prerequisites:
 *   1. npm install firebase-admin  (in the project root)
 *   2. scripts/serviceAccountKey.json must exist (see seed.js)
 */

const admin = require('firebase-admin');
const path  = require('path');
const fs    = require('fs');

// ─── Admin UID — set during CMS setup ────────────────────────
const ADMIN_UID = 'adH7x4YVAuUkOCu8yiwnsYwjlJ22';

// ─── Initialise ──────────────────────────────────────────────
const keyPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(keyPath)) {
  console.error(
    '\n❌  serviceAccountKey.json not found.\n' +
    '   Download it from Firebase Console → Project Settings → Service Accounts\n' +
    '   and save it as:  scripts/serviceAccountKey.json\n'
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(keyPath)),
});

async function setAdminClaim() {
  console.log('\n🔑  KateringKing — Set Admin Custom Claim');
  console.log('─'.repeat(50));
  console.log(`   UID: ${ADMIN_UID}`);

  try {
    // Set the custom claim
    await admin.auth().setCustomUserClaims(ADMIN_UID, { admin: true });

    // Verify it was applied
    const user = await admin.auth().getUser(ADMIN_UID);
    const claims = user.customClaims || {};

    if (claims.admin === true) {
      console.log('\n✅  Success! Custom claim { admin: true } applied.');
      console.log(`   Email  : ${user.email}`);
      console.log(`   UID    : ${user.uid}`);
      console.log('\n   The user must sign out and sign back in (or wait up to');
      console.log('   1 hour) for the new token to take effect.\n');
    } else {
      console.error('\n❌  Claim was not applied correctly. Please try again.');
    }
  } catch (err) {
    console.error('\n❌  Failed to set custom claim:', err.message);
    process.exit(1);
  }

  process.exit(0);
}

setAdminClaim();
