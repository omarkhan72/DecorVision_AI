const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

// Initialize admin app if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

/**
 * Cloud Function to delete a user account.
 * This function:
 * 1. Verifies the user is authenticated.
 * 2. Archives user tokens to the 'hash' collection (using SHA-256 of email as ID)
 *    to preserve their balance if they sign up again.
 * 3. Deletes the user's document from the 'users' collection.
 * 4. Deletes the user from Firebase Authentication.
 */
exports.deleteUserAccount = onCall(async (request) => {
    // 1. Verify Authentication
    if (!request.auth) {
        throw new HttpsError(
            "unauthenticated",
            "The function must be called while authenticated."
        );
    }

    const uid = request.auth.uid;
    // Use email from auth context for hashing, fallback to fetching user record if needed
    let email = request.auth.token.email;

    console.log(`Starting account deletion for user: ${uid} (email: ${email})`);

    try {
        // If email is missing in auth token, try fetching via admin SDK
        if (!email) {
            const userRecord = await admin.auth().getUser(uid);
            email = userRecord.email;
        }

        if (!email) {
            throw new HttpsError("failed-precondition", "User must have an email address to archive data.");
        }

        const db = admin.firestore();
        const userRef = db.collection("users").doc(uid);

        // 2. Archive Tokens (Data Persistence)
        // We use SHA-256 of the email as the document ID in 'hash' collection
        // This allows us to restore tokens if the user registers again with the same email.
        const crypto = require('crypto');
        const emailHash = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
        const hashRef = db.collection("hash").doc(emailHash);

        // Fetch current user data to get token balance
        const userDoc = await userRef.get();
        let tokens = { freeTokens: 0, premiumTokens: 0 };

        if (userDoc.exists) {
            const userData = userDoc.data();
            if (userData.tokens) {
                tokens = userData.tokens;
            }
        }

        // Save backup to 'hash' collection
        await hashRef.set({
            tokens: tokens,
            archivedAt: admin.firestore.FieldValue.serverTimestamp(),
            originalUid: uid // verification trail
        });
        console.log(`User tokens archived to hash collection for hash: ${emailHash}`);

        // 3. Delete Firestore Document
        await userRef.delete();
        console.log(`Firestore document deleted for user: ${uid}`);

        // 4. Delete Auth User
        await admin.auth().deleteUser(uid);
        console.log(`Firebase Auth user deleted: ${uid}`);

        return { success: true, message: "Account deleted successfully." };

    } catch (error) {
        console.error("Error deleting user account:", error);
        // Determine if it is a known HttpsError or a generic internal error
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError("internal", "Failed to delete account.", error.message);
    }
});
