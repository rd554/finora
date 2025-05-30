import { useStore } from '@/lib/store'
import { UserCircleIcon, LightBulbIcon, ClipboardIcon } from '@heroicons/react/24/outline'

export default function BurnAnalysis() {
  const analysis = useStore((state) => state.analysis)

  if (!analysis.analysis) {
    return null
  }

  // Extract sections from analysis text
  const lines = analysis.analysis.split('\n')
  const overview = lines.find((line) => line.match(/monthly income|burn risk|expenses|EMIs|emergency fund/i)) || ''
  const personaLine = lines.find((line) =>
    line.includes('YOLO Earner') ||
    line.includes('Calculated Climber') ||
    line.includes('Cautious Saver') ||
    line.includes('Balanced Builder')
  )
  const persona = personaLine ? personaLine.match(/"([^"]+)"/)?.[1] : ''
  const personaDesc = personaLine ? personaLine.replace(/^[0-9]+\.\s*/, '') : ''
  const recommendationsStart = lines.findIndex((line) => line.toLowerCase().includes('recommendation'))
  const recommendations = recommendationsStart !== -1 ? lines.slice(recommendationsStart + 1).filter(l => l.trim() && !l.match(/^[0-9]+\./)) : []

  return (
    <div className="mt-8 space-y-6">
      {analysis.error && (
        <div className="p-4 bg-red-50 rounded-md">
          <p className="text-sm text-red-700">{analysis.error}</p>
        </div>
      )}

      {/* Overview Section */}
      <div className="p-6 bg-white rounded-lg shadow flex items-start space-x-4">
        <UserCircleIcon className="h-8 w-8 text-primary-500 mt-1" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Overview</h3>
          <p className="text-gray-700 text-sm">{overview}</p>
        </div>
      </div>

      {/* Persona Section */}
      {persona && (
        <div className="p-6 bg-primary-50 rounded-lg flex items-center space-x-4 border border-primary-200">
          <LightBulbIcon className="h-7 w-7 text-primary-500" />
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold mb-1">{persona}</span>
            <p className="text-primary-900 text-sm">{personaDesc}</p>
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center mb-2">
            <ClipboardIcon className="h-6 w-6 text-success-600 mr-2" />
            <h4 className="text-md font-semibold text-gray-900">Recommendations</h4>
          </div>
          <ul className="list-disc pl-6 space-y-2">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="text-gray-700 text-sm">{rec.replace(/^([a-zA-Z0-9]+\.|-)/, '').trim()}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
} 