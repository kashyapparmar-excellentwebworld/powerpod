import { prisma } from '@/core/prisma'
import { TaskProgressContext } from '@/core/progressContext'

export interface CandidateScoreResult {
  adminId: string
  adminName: string
  adminEmail: string
  totalScore: number
  workloadScore: number
  skillScore: number
  availabilityScore: number
  assignedReason: string
}

/**
 * Multi-Factor Smart Auto-Assignment Engine with real-time TaskProgressContext logging:
 * Total Score = (Workload * 0.45) + (Skill * 0.35) + (Availability * 0.20)
 * 
 * Workload Factor = 1 / (1 + Active Workload)
 * Skill Factor = min(Resolved Category Count / 10, 1.0)
 * Availability Factor = ONLINE (100), BUSY (40), OFFLINE (0)
 */
export async function executeAutoTicketAssignment(
  ticketId: string,
  departmentCode: string,
  category: string,
  priority: string,
  ctx?: TaskProgressContext
): Promise<{
  assignedAdminId: string
  assignedAdminName: string
  scoreResult: CandidateScoreResult
  slaDueDate: Date
}> {
  if (ctx) {
    await ctx.info(`Initializing AI Auto-Assignment Engine for ticket: ${ticketId}`)
    await ctx.report_progress(40, 100, `Mapping department code '${departmentCode}'...`)
  }

  // 1. Fetch department details
  let department = await prisma.supportDepartment.findUnique({
    where: { code: departmentCode },
  })

  if (!department) {
    department = await prisma.supportDepartment.findFirst()
  }

  if (ctx) {
    await ctx.info(`Matched Target Department: ${department?.name || 'General Support'}`)
    await ctx.report_progress(60, 100, 'Evaluating specialist candidate matrix...')
  }

  // 2. Fetch all admin candidates
  const admins = await prisma.admin.findMany({
    where: { deletedAt: null, isActive: true },
  })

  if (admins.length === 0) {
    if (ctx) await ctx.error('No active specialist staff available for ticket assignment')
    throw new Error('No active staff available for ticket assignment')
  }

  // 3. Compute multi-factor score for each candidate staff member
  const candidatesScored: CandidateScoreResult[] = await Promise.all(
    admins.map(async (admin) => {
      // Active Workload W: Count open/in-progress tickets assigned to admin
      const activeWorkload = await prisma.supportTicket.count({
        where: {
          assignedAdminId: admin.id,
          status: { in: ['OPEN', 'IN_PROGRESS', 'ASSIGNED'] },
        },
      })
      // Workload Factor = 1 / (1 + activeWorkload) -> scaled 0 to 100
      const workloadScore = parseFloat(((1 / (1 + activeWorkload)) * 100).toFixed(1))

      // Skill Factor S: Count resolved tickets in matching category
      const resolvedCategoryCount = await prisma.supportTicket.count({
        where: {
          assignedAdminId: admin.id,
          category,
          status: 'RESOLVED',
        },
      })
      // Skill Factor = min(resolvedCategoryCount / 10, 1.0) -> scaled 0 to 100
      const skillScore = parseFloat((Math.min(resolvedCategoryCount / 10, 1.0) * 100).toFixed(1)) || 50.0

      // Availability Factor A: Check online status or skill record
      const skillRecord = await prisma.staffSkill.findFirst({
        where: {
          adminId: admin.id,
          ...(department?.id ? { departmentId: department.id } : {}),
        },
      })

      const isAvailable = skillRecord?.isAvailable ?? true
      // ONLINE = 100, BUSY = 40, OFFLINE = 0
      const availabilityScore = isAvailable ? 100.0 : 40.0

      // Combined Weighted Score: (W * 0.45) + (S * 0.35) + (A * 0.20)
      const totalScore = parseFloat(
        (0.45 * workloadScore + 0.35 * skillScore + 0.20 * availabilityScore).toFixed(1)
      )

      const reason = `Assigned via Multi-Factor Engine (Workload: ${workloadScore}%, Skill: ${skillScore}%, Availability: ${availabilityScore}%)`

      if (ctx) {
        await ctx.info(`Scored Candidate ${admin.fullName || admin.email}: Matrix Score ${totalScore}% (W:${workloadScore}%, S:${skillScore}%, A:${availabilityScore}%)`)
      }

      return {
        adminId: admin.id,
        adminName: admin.fullName || admin.email,
        adminEmail: admin.email,
        totalScore,
        workloadScore,
        skillScore,
        availabilityScore,
        assignedReason: reason,
      }
    })
  )

  // 4. Select candidate with highest total score
  candidatesScored.sort((a, b) => b.totalScore - a.totalScore)
  const bestCandidate = candidatesScored[0]

  if (ctx) {
    await ctx.report_progress(85, 100, `Selected Top Candidate: ${bestCandidate.adminName} (Score: ${bestCandidate.totalScore}%)`)
  }

  // 5. Compute SLA Due Date based on priority
  const now = new Date()
  let hoursToResolve = 24
  if (priority === 'CRITICAL') hoursToResolve = 2
  else if (priority === 'HIGH') hoursToResolve = 6
  else if (priority === 'MEDIUM') hoursToResolve = 24
  else if (priority === 'LOW') hoursToResolve = 48

  const slaDueDate = new Date(now.getTime() + hoursToResolve * 60 * 60 * 1000)

  // 6. Update ticket record in DB
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      assignedAdminId: bestCandidate.adminId,
      departmentId: department?.id || null,
      slaDueDate,
      status: 'ASSIGNED',
    },
  })

  // 7. Save Ticket Assignment History log
  await prisma.ticketAssignmentHistory.create({
    data: {
      ticketId,
      assignedAdminId: bestCandidate.adminId,
      candidateScore: bestCandidate.totalScore,
      workloadScore: bestCandidate.workloadScore,
      skillScore: bestCandidate.skillScore,
      availabilityScore: bestCandidate.availabilityScore,
      assignedReason: bestCandidate.assignedReason,
    },
  })

  if (ctx) {
    await ctx.complete(`Successfully assigned ticket to ${bestCandidate.adminName} (${bestCandidate.totalScore}% matrix score)`)
  }

  return {
    assignedAdminId: bestCandidate.adminId,
    assignedAdminName: bestCandidate.adminName,
    scoreResult: bestCandidate,
    slaDueDate,
  }
}
