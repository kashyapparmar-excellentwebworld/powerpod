import { Router } from 'express'
import { authenticate } from '@/middlewares/auth.middleware'
import {
  createAndAutoAssignTicketController,
  listSupportTicketsController,
  listStaffAdminsController,
  getTicketAssignmentHistoryController,
  updateTicketStatusController,
  reassignTicketController,
} from './tickets.controller'

const router = Router()

router.use(authenticate)

router.post('/', createAndAutoAssignTicketController)
router.get('/', listSupportTicketsController)
router.get('/staff', listStaffAdminsController)
router.patch('/:id/status', updateTicketStatusController)
router.post('/:id/reassign', reassignTicketController)
router.get('/:id/assignment-history', getTicketAssignmentHistoryController)

export default router
