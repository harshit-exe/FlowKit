import BundleCard from "./BundleCard"

interface BundleGridProps {
  bundles: any[]
}

export function BundleGrid({ bundles }: BundleGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bundles.map((bundle) => (
        <BundleCard key={bundle.id} bundle={bundle} />
      ))}
    </div>
  )
}
