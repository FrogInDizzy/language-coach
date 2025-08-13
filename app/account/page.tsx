'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function AccountPage() {
  const { user } = useAuth();

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Account</h1>
      
      {user && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-2">Profile Information</h2>
          <p className="mb-2"><strong>Email:</strong> {user.email}</p>
          <p className="mb-2"><strong>User ID:</strong> {user.id}</p>
          <p className="mb-2"><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-2">Features</h2>
        <p className="mb-4">User profile management and data export will be implemented here.</p>
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
