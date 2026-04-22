import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

/**
 * useMatches — real-time listener for the current volunteer's matches.
 * Admin users can optionally pass a taskId to see all matches for a task.
 *
 * @param {{ taskId?: string }} options
 */
export function useMatches(options = {}) {
  const { user, profile } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const constraints = [];

    if (options.taskId) {
      // All matches for a specific task (admin/NGO view)
      constraints.push(where('taskId', '==', options.taskId));
      constraints.push(orderBy('scoreTotal', 'desc'));
    } else {
      // Volunteer's own matches
      constraints.push(where('volunteerId', '==', user.uid));
      constraints.push(orderBy('createdAt', 'desc'));
    }

    const q = query(collection(db, 'matches'), ...constraints);

    const unsub = onSnapshot(q, (snap) => {
      setMatches(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return unsub;
  }, [user, options.taskId]);

  return { matches, loading };
}
