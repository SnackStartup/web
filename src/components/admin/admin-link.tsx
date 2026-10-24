import { ArrowRightIcon } from 'lucide-react'
import { Button } from '#/components/ui/button'

export type AdminLinkProps = {
  render: React.ComponentProps<typeof Button>['render']
}

// Admin-only shortcut into the panel, shown in guest-facing chrome. Red so it
// is easy to spot, small so it does not compete with the venue's own content,
// with the arrow marking it as a link out.
export const AdminLink: React.FC<AdminLinkProps> = ({ render }) => (
  <Button
    variant="ghost"
    size="xs"
    nativeButton={false}
    className="bg-red-600 text-white hover:bg-red-700 hover:text-white"
    render={render}
  >
    Admin
    <ArrowRightIcon data-icon="inline-end" />
  </Button>
)
