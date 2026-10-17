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

// ─── Admin UIDs — all accounts below have admin access ─────────
// owner:    thadishettisindhu@gmail.com
const OWNER_UID    = 'adH7x4YVAuUkOCu8yiwnsYwjlJ22';

// admin:    kateringkingservices@gmail.com
const ADMIN_UID    = 'ejP4zmeiSzYyRg6oX9Ftix4xVme2';

// harshitha: mandadiharshithareddy@gmail.com
const HARSHITHA_UID = 'Jf8BTqkFJPbJtdXYYCWbOAcxShI2';

const UIDS_TO_GRANT = [OWNER_UID, ADMIN_UID, HARSHITHA_UID];

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
  console.log('\n🔑  KateringKing — Set Admin Custom Claims');
  console.log('─'.repeat(50));

  for (const uid of UIDS_TO_GRANT) {
    console.log(`\n   Processing UID: ${uid}`);
    try {
      await admin.auth().setCustomUserClaims(uid, { admin: true });
      const user   = await admin.auth().getUser(uid);
      const claims = user.customClaims || {};
      if (claims.admin === true) {
        console.log(`✅  Success! { admin: true } applied to ${user.email}`);
      } else {
        console.error(`❌  Claim not applied for ${uid}`);
      }
    } catch (err) {
      console.error(`❌  Failed for ${uid}:`, err.message);
    }
  }

  console.log('\n   Users must sign out and back in for the new token to take effect.\n');
  process.exit(0);
}

setAdminClaim();
