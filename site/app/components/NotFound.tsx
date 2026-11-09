import { href } from '../routes'
import { PageTitle } from './Layout'

export const NotFound = () => (
  <>
    <PageTitle>Not found</PageTitle>
    <p>
      <a href={href.home} className="font-medium text-emerald-800 underline underline-offset-2">
        Go home
      </a>
    </p>
  </>
)
