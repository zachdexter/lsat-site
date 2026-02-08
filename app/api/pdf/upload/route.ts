import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabaseServer';

// This endpoint handles PDF uploads to Supabase Storage
export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the token and check if user is admin
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const user = await response.json();
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    // Check if user is admin
    const supabase = createServerSupabaseClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const section = formData.get('section') as string;

    if (!file || !title || !section) {
      return NextResponse.json({ error: 'File, title, and section are required' }, { status: 400 });
    }

    // Validate title (max 200 characters, no dangerous characters)
    const titleTrimmed = title.trim();
    if (titleTrimmed.length === 0 || titleTrimmed.length > 200) {
      return NextResponse.json({ error: 'Title must be between 1 and 200 characters' }, { status: 400 });
    }

    // Validate section (must be one of the allowed values)
    const allowedSections = ['introduction', 'lr', 'rc', 'final-tips'];
    if (!allowedSections.includes(section)) {
      return NextResponse.json({ error: 'Invalid section. Must be one of: introduction, lr, rc, final-tips' }, { status: 400 });
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Validate file size (e.g., max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 50MB' }, { status: 400 });
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `pdfs/${section}/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('materials')
      .upload(filePath, file, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading PDF to storage:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload PDF', details: uploadError.message },
        { status: 500 }
      );
    }

    // Create PDF record in database
    const { data: pdf, error: dbError } = await supabase
      .from('pdfs')
      .insert({
        title: titleTrimmed,
        section,
        file_path: filePath,
        file_size: file.size,
        file_name: file.name,
        created_by: user.id,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error creating PDF record:', dbError);
      // Try to delete the uploaded file if database insert fails
      await supabase.storage.from('materials').remove([filePath]);
      return NextResponse.json(
        { error: 'Failed to create PDF record', details: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pdf: {
        id: pdf.id,
        title: pdf.title,
        section: pdf.section,
        file_path: pdf.file_path,
      },
    });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
