import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Delete workflow by ID
 * DELETE /api/admin/workflows/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const isAdmin =
      session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workflowId = params.id;

    // Check if workflow exists
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Delete related records first (due to foreign key constraints)
    await prisma.$transaction([
      // Delete workflow categories
      prisma.workflowCategory.deleteMany({
        where: { workflowId },
      }),
      // Delete workflow tags
      prisma.workflowTag.deleteMany({
        where: { workflowId },
      }),
      // Finally delete the workflow
      prisma.workflow.delete({
        where: { id: workflowId },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Workflow deleted successfully',
    });
  } catch (error) {
    console.error('[WORKFLOW_DELETE]', error);
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}
