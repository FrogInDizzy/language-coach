import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * POST /api/upload-audio
 *
 * Expects a multipart/form-data body with a single field `file` containing the audio
 * to upload. Returns a signed URL for the stored object. The Supabase storage
 * bucket `audio` must exist beforehand.
 */
export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  // Debug logging
  console.log('Auth check:', { 
    hasUser: !!user, 
    userId: user?.id, 
    authError: authError?.message,
    cookies: req.cookies.getAll()
  });
  
  if (authError || !user) {
    return NextResponse.json({ 
      error: 'Unauthorized', 
      debug: { 
        hasUser: !!user, 
        authError: authError?.message 
      } 
    }, { status: 401 });
  }

  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Content type must be multipart/form-data' }, { status: 400 });
  }

  const formData = await req.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file field' }, { status: 400 });
  }

  // Construct a path within the storage bucket using current timestamp and user ID
  const fileExt = file.name.split('.').pop();
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('audio')
    .upload(path, file, { contentType: file.type });
  
  console.log('Storage upload result:', { data, error });
  
  if (error || !data) {
    return NextResponse.json({ 
      error: error?.message ?? 'Upload failed', 
      details: error,
      path: path,
      fileType: file.type,
      fileName: file.name
    }, { status: 500 });
  }

  // Generate a signed URL valid for 7 days.
  const { data: signed, error: signErr } = await supabase.storage
    .from('audio')
    .createSignedUrl(data.path, 60 * 60 * 24 * 7);
  if (signErr || !signed) {
    return NextResponse.json({ error: signErr?.message ?? 'Could not create signed URL' }, { status: 500 });
  }
  return NextResponse.json({ audio_url: signed.signedUrl });
}
