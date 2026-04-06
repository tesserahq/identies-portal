import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/ui/card'
import { DarkSkeleton, LightSkeleton, SystemSkeleton } from '@/public/images/skeleton'

interface AppearanceProps {
  selectedTheme: 'light' | 'dark' | 'system'
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void
}

export const Appearance = ({ selectedTheme, onThemeChange }: AppearanceProps) => {
  return (
    <Card className="m-5 mb-4 w-full border lg:max-w-5xl">
      <CardHeader className="border-b p-5 pl-12">
        <CardTitle className="text-base font-medium">Appearance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full space-y-6 p-4 md:p-8">
          <div className="flex items-center gap-3">
            <span className="mb-0 w-1/3">Theme mode</span>
            <span className="flex-1">Linden will use your selected theme</span>
          </div>
          <div className="flex gap-3">
            <span className="mb-0 w-1/3">
              Choose how Linden looks to you. Select a single theme, or sync with your system.
            </span>
            <div className="grid grid-cols-3 grid-rows-1 gap-4">
              <button
                onClick={() => onThemeChange('light')}
                className={`group flex w-48 flex-col gap-2 rounded-md border bg-gray-400/30 p-3
                  shadow-card hover:border-foreground/50
                  ${selectedTheme === 'light' ? 'border-foreground/50' : 'border-gray-500/30'}`}>
                <LightSkeleton />
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full border group-hover:border-foreground/50
                      ${selectedTheme === 'light' ? 'border-foreground/50' : 'border-gray-500/30'}
                      flex items-center justify-center`}>
                    <div
                      className={`h-2 w-2 rounded-full
                        ${selectedTheme === 'light' ? 'bg-foreground' : ''}`}
                    />
                  </div>
                  <span>Light</span>
                </div>
              </button>
              <button
                onClick={() => onThemeChange('dark')}
                className={`group flex w-48 flex-col gap-2 rounded-md border bg-gray-400/30 p-3
                  shadow-card hover:border-foreground/50
                  ${selectedTheme === 'dark' ? 'border-foreground/50' : 'border-gray-500/30'}`}>
                <DarkSkeleton />
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full border group-hover:border-foreground/50
                      ${selectedTheme === 'dark' ? 'border-foreground/50' : 'border-gray-500/30'}
                      flex items-center justify-center`}>
                    <div
                      className={`h-2 w-2 rounded-full
                        ${selectedTheme === 'dark' ? 'bg-foreground' : ''}`}
                    />
                  </div>
                  <span>Dark</span>
                </div>
              </button>
              <button
                onClick={() => onThemeChange('system')}
                className={`group flex w-48 flex-col gap-2 rounded-md border bg-gray-400/30 p-3
                  shadow-card hover:border-foreground/50
                  ${selectedTheme === 'system' ? 'border-foreground/50' : 'border-gray-500/30'}`}>
                <SystemSkeleton />
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full border group-hover:border-foreground/50
                      ${selectedTheme === 'system' ? 'border-foreground/50' : 'border-gray-500/30'}
                      flex items-center justify-center`}>
                    <div
                      className={`h-2 w-2 rounded-full
                        ${selectedTheme === 'system' ? 'bg-foreground' : ''}`}
                    />
                  </div>
                  <span>System</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
