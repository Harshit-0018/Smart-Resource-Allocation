/**
 * Cloud Functions for Smart Resource Allocation
 *
 * Functions:
 *   - onMatchCreated:  FCM notification when a new match is created
 *   - onNearbyTask:    FCM notification to nearby volunteers when a new task is created
 *   - onFormSubmit:    (reserved) webhook for Google Forms pipeline ingestion
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Trigger: Firestore document created in matches/{matchId}
 * Action: Send FCM push notification to the matched volunteer.
 */
exports.onMatchCreated = functions.firestore
  .document('matches/{matchId}')
  .onCreate(async (snap, context) => {
    const match = snap.data();

    const [volDoc, taskDoc] = await Promise.all([
      admin.firestore().doc(`users/${match.volunteerId}`).get(),
      admin.firestore().doc(`tasks/${match.taskId}`).get(),
    ]);

    const token = volDoc.data()?.fcmToken;
    if (!token) return null;

    return admin.messaging().send({
      token,
      notification: {
        title: 'New task match!',
        body: `You have been matched to "${taskDoc.data()?.title}"`,
      },
      data: {
        matchId: context.params.matchId,
        taskId: match.taskId,
        type: 'match_created',
      },
    });
  });

/**
 * Trigger: Firestore document created in tasks/{taskId}
 * Action: Notify volunteers within rough bounding box of task location.
 */
exports.onNearbyTask = functions.firestore
  .document('tasks/{taskId}')
  .onCreate(async (snap) => {
    const task = snap.data();

    // TODO: Implement GeoPoint bounding box query
    // Query volunteers within ~30km of task.location
    // Send FCM to each volunteer with fcmToken
    console.log(`New task created: ${task.title} — nearby notification pending implementation`);

    return null;
  });
