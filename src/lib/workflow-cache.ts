import { cache } from 'react'
import { prisma } from '@/lib/prisma'

const workflowSelect = {
    id: true,
    name: true,
    description: true,
    slug: true,
    difficulty: true,
    icon: true,
    thumbnail: true,
    featured: true,
    indiaBadge: true,
    nodeCount: true,
    views: true,
    downloads: true,
    createdAt: true,
    updatedAt: true,
    author: true,
    authorUrl: true,
    videoUrl: true,
    documentLink: true,
    useCases: true,
    setupSteps: true,
    credentialsRequired: true,
    categories: {
        include: { category: true },
    },
    tags: {
        include: { tag: true },
    },
    _count: {
        select: {
            savedBy: true,
        }
    },
    votes: {
        select: {
            type: true,
        }
    }
}

export const getCachedWorkflow = cache(async (slug: string) => {
    // @ts-ignore
    const workflow = await prisma.workflow.findUnique({
        where: { slug, published: true },
        // @ts-ignore
        select: workflowSelect,
    })

    if (!workflow) {
        return null
    }

    return workflow as any
})
