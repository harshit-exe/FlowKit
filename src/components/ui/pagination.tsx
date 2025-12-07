import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  totalItems?: number
  itemsPerPage?: number
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showPages = 5
    
    if (totalPages <= showPages) {
      // Show all pages if total is less than showPages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      if (currentPage > 3) {
        pages.push("...")
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (currentPage < totalPages - 2) {
        pages.push("...")
      }
      
      // Always show last page
      pages.push(totalPages)
    }
    
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 pt-6">
      {/* Info Text */}
      {totalItems && itemsPerPage && (
        <div className="text-sm text-muted-foreground font-mono">
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} workflows
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Link
          href={currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}` : "#"}
          className={currentPage === 1 ? "pointer-events-none" : ""}
        >
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            className="rounded-none border-2 font-mono"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            PREV
          </Button>
        </Link>

        {/* Page Numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((page, idx) => {
            if (page === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                  ...
                </span>
              )
            }

            const pageNum = page as number
            const isActive = pageNum === currentPage

            return (
              <Link key={pageNum} href={`${baseUrl}?page=${pageNum}`}>
                <Button
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={`rounded-none border-2 font-mono w-10 ${
                    isActive ? "bg-primary text-primary-foreground" : ""
                  }`}
                >
                  {pageNum}
                </Button>
              </Link>
            )
          })}
        </div>

        {/* Mobile: Current Page Indicator */}
        <div className="sm:hidden px-3 py-1 border-2 rounded-none font-mono text-sm">
          {currentPage} / {totalPages}
        </div>

        {/* Next Button */}
        <Link
          href={currentPage < totalPages ? `${baseUrl}?page=${currentPage + 1}` : "#"}
          className={currentPage === totalPages ? "pointer-events-none" : ""}
        >
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            className="rounded-none border-2 font-mono"
          >
            NEXT
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
