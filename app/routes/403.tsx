import EmptyContent from '@/components/empty-content/empty-content'
import { Button } from '@shadcn/ui/button'
import { useNavigate } from 'react-router'

export default function ForbiddenPage() {
  const navigate = useNavigate()

  return (
    <main className="flex w-full flex-col items-center page-content">
      <EmptyContent
        image="/images/empty-api-keys.png"
        title="Access Denied"
        description="You do not have permission to access this resource.">
        <Button variant="black" onClick={() => navigate('/logout')}>
          Log Out
        </Button>
      </EmptyContent>
    </main>
  )
}
