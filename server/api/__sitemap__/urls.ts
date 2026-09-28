import { cmsPageRoutes } from '#shared/fetchCmsPageSlugs'

export default defineEventHandler(async () => {
  try {
    const routes = await cmsPageRoutes()
    return routes.map(loc => ({ loc }))
  } catch (error) {
    console.error('Failed to fetch CMS routes for sitemap:', error)
    throw error
  }
})
