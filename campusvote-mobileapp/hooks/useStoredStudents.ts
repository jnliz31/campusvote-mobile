import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
  hasVoted: boolean;
  createdAt: string;
}

export function useStoredStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem('cv_students');
      setStudents(raw ? JSON.parse(raw) : []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteStudent = async (id: string) => {
    const updated = students.filter(s => s.id !== id);
    await AsyncStorage.setItem('cv_students', JSON.stringify(updated));
    setStudents(updated);
  };

  return { students, loading, refresh: load, deleteStudent };
}
