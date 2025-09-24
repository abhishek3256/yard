import { NextRequest, NextResponse } from 'next/server';
import { dbRun, dbAll, dbGet, dbInsert } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { ensureDatabaseInitialized } from '@/lib/init-db';

// Helper function to verify token and get user info
function getAuthenticatedUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

// GET /api/notes - List all notes for the current tenant
export async function GET(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const notes = await dbAll(
      'SELECT * FROM notes WHERE tenant_id = ? ORDER BY created_at DESC',
      [user.tenantId]
    );

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Check subscription limits for free plan
    const tenant = await dbGet(
      'SELECT subscription_plan FROM tenants WHERE id = ?',
      [user.tenantId]
    );

    if (tenant.subscription_plan === 'free') {
      const noteCount = await dbGet(
        'SELECT COUNT(*) as count FROM notes WHERE tenant_id = ?',
        [user.tenantId]
      );

      if (noteCount.count >= 3) {
        return NextResponse.json(
          { error: 'Free plan limit reached. Upgrade to Pro for unlimited notes.' },
          { status: 403 }
        );
      }
    }

    const result = await dbInsert(
      'INSERT INTO notes (title, content, tenant_id, user_id) VALUES (?, ?, ?, ?)',
      [title, content, user.tenantId, user.userId]
    );

    const newNote = await dbGet(
      'SELECT * FROM notes WHERE id = ?',
      [result.lastID]
    );

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
