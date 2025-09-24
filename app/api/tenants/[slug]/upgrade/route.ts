import { NextRequest, NextResponse } from 'next/server';
import { dbGetWithParams, dbRun } from '@/lib/database';
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

// POST /api/tenants/[slug]/upgrade - Upgrade tenant to Pro plan
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
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

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get tenant by slug
    const tenant = await dbGetWithParams(
      'SELECT * FROM tenants WHERE slug = ?',
      [params.slug]
    );

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Check if user belongs to this tenant
    if (tenant.id !== user.tenantId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if already on Pro plan
    if (tenant.subscription_plan === 'pro') {
      return NextResponse.json(
        { error: 'Tenant is already on Pro plan' },
        { status: 400 }
      );
    }

    // Upgrade to Pro plan
    await dbRun(
      'UPDATE tenants SET subscription_plan = ? WHERE id = ?',
      ['pro', tenant.id]
    );

    const updatedTenant = await dbGetWithParams(
      'SELECT * FROM tenants WHERE id = ?',
      [tenant.id]
    );

    return NextResponse.json({
      message: 'Tenant upgraded to Pro plan successfully',
      tenant: updatedTenant,
    });
  } catch (error) {
    console.error('Error upgrading tenant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
