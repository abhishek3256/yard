import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbRun } from '@/lib/database';
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

// GET /api/notes/[id] - Retrieve a specific note
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDatabaseInitialized();
    
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const note = await dbGet(
      'SELECT * FROM notes WHERE id = ? AND tenant_id = ?',
      [params.id, user.tenantId]
    );

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/notes/[id] - Update a note
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if note exists and belongs to user's tenant
    const existingNote = await dbGet(
      'SELECT * FROM notes WHERE id = ? AND tenant_id = ?',
      [params.id, user.tenantId]
    );

    if (!existingNote) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    await dbRun(
      'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?',
      [title, content, params.id, user.tenantId]
    );

    const updatedNote = await dbGet(
      'SELECT * FROM notes WHERE id = ?',
      [params.id]
    );

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[id] - Delete a note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDatabaseInitialized();
    
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if note exists and belongs to user's tenant
    const existingNote = await dbGet(
      'SELECT * FROM notes WHERE id = ? AND tenant_id = ?',
      [params.id, user.tenantId]
    );

    if (!existingNote) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    await dbRun(
      'DELETE FROM notes WHERE id = ? AND tenant_id = ?',
      [params.id, user.tenantId]
    );

    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
