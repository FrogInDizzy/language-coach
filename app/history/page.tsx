'use client';

import { useEffect, useState } from 'react';

interface Sample {
  id: string;
  transcript: string;
  created_at: string;
}

export default function HistoryPage() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const res = await fetch('/api/history');
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Error fetching history');
        setSamples(json.samples);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchSamples();
  }, []);
  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">History</h1>
      {error && <p className="text-red-600">{error}</p>}
      {samples.length === 0 && !error && <p>You have not practised yet.</p>}
      <ul className="space-y-4">
        {samples.map((s) => (
          <li key={s.id} className="border p-3 rounded">
            <p className="text-sm text-gray-600">{new Date(s.created_at).toLocaleString()}</p>
            <p className="truncate" title={s.transcript}>{s.transcript}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
