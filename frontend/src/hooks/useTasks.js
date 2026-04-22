import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useState, useEffect } from 'react';

/**
 * useTasks — real-time Firestore listener for the tasks collection.
 * Supports filtering by status and category, ordered by urgencyScore desc.
 *
 * @param {{ status?: string, category?: string }} filters
 */
export function useTasks(filters = {}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const constraints = [];

    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }

    constraints.push(orderBy('urgencyScore', 'desc'));

    const q = query(collection(db, 'tasks'), ...constraints);

    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return unsub;
  }, [filters.status, filters.category]);

  return { tasks, loading };
}
