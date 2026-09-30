import { Request, Response, NextFunction } from 'express'
import { sendSuccess } from '@/utils/response'
import * as versionService from './version.service'
import {
  createAppReleaseSchema,
  updateAppReleaseSchema,
  createTranslationSchema,
  toggleForceUpdateSchema,
  toggleMaintenanceSchema,
  configureRolloutSchema,
  queryAppVersionsSchema,
} from './version.validator'

export async function getAppVersions(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = queryAppVersionsSchema.parse(req.query)
    const result = await versionService.getAppVersionsService(query)
    sendSuccess(res, result.data, 'App versions retrieved successfully', 200, result.pagination)
  } catch (error) {
    next(error)
  }
}

export async function getAppVersionById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string
    const version = await versionService.getAppVersionByIdService(id)
    sendSuccess(res, version, 'App version retrieved successfully')
  } catch (error) {
    next(error)
  }
}

export async function createAppRelease(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dto = createAppReleaseSchema.parse(req.body)
    const adminId = (req as any).user?.id || (req as any).admin?.id
    const release = await versionService.createAppReleaseService(dto, adminId)
    sendSuccess(res, release, 'App release created successfully', 201)
  } catch (error) {
    next(error)
  }
}

export async function updateAppRelease(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string
    const dto = updateAppReleaseSchema.parse(req.body)
    const adminId = (req as any).user?.id || (req as any).admin?.id
    const updated = await versionService.updateAppReleaseService(id, dto, adminId)
    sendSuccess(res, updated, 'App release updated successfully')
  } catch (error) {
    next(error)
  }
}

export async function toggleForceUpdate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string
    const dto = toggleForceUpdateSchema.parse(req.body)
    const adminId = (req as any).user?.id || (req as any).admin?.id
    const updated = await versionService.toggleForceUpdateService(id, dto, adminId)
    sendSuccess(
      res,
      updated,
      `Force update ${dto.forceUpdate ? 'enabled' : 'disabled'} successfully`,
    )
  } catch (error) {
    next(error)
  }
}

export async function toggleMaintenanceMode(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string
    const dto = toggleMaintenanceSchema.parse(req.body)
    const adminId = (req as any).user?.id || (req as any).admin?.id
    const updated = await versionService.toggleMaintenanceModeService(id, dto, adminId)
    sendSuccess(
      res,
      updated,
      `Maintenance mode ${dto.maintenanceMode ? 'enabled' : 'disabled'} successfully`,
    )
  } catch (error) {
    next(error)
  }
}

export async function configureRollout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string
    const dto = configureRolloutSchema.parse(req.body)
    const adminId = (req as any).user?.id || (req as any).admin?.id
    const updated = await versionService.configureRolloutService(id, dto, adminId)
    sendSuccess(res, updated, `Rollout percentage set to ${dto.rolloutPercentage}%`)
  } catch (error) {
    next(error)
  }
}

export async function upsertTranslation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string
    const dto = createTranslationSchema.parse(req.body)
    const translation = await versionService.upsertTranslationService(id, dto)
    sendSuccess(res, translation, 'Translation saved successfully')
  } catch (error) {
    next(error)
  }
}

export async function getVersionHistory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const platform = req.query.platform as any
    const history = await versionService.getVersionHistoryService(platform)
    sendSuccess(res, history, 'Version history retrieved successfully')
  } catch (error) {
    next(error)
  }
}

export async function getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const logs = await versionService.getAuditLogsService()
    sendSuccess(res, logs, 'Audit logs retrieved successfully')
  } catch (error) {
    next(error)
  }
}

export async function getDashboardMetrics(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const metrics = await versionService.getDashboardMetricsService()
    sendSuccess(res, metrics, 'Dashboard metrics retrieved successfully')
  } catch (error) {
    next(error)
  }
}
