import { getSocketServer } from './socket'

export interface ProgressLog {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'success'
  message: string
}

/**
 * TaskProgressContext class providing real-time logging and progress reporting
 * over WebSockets (compatible with MCP context.info and context.report_progress standards).
 */
export class TaskProgressContext {
  public taskId: string
  public taskName: string
  public logs: ProgressLog[] = []
  public currentProgress: number = 0
  public totalProgress: number = 100

  constructor(taskId: string, taskName: string) {
    this.taskId = taskId
    this.taskName = taskName
  }

  /** Send info log message to live WebSocket clients */
  public async info(message: string): Promise<void> {
    this.addLog('info', message)
  }

  /** Send warning log message to live WebSocket clients */
  public async warn(message: string): Promise<void> {
    this.addLog('warn', message)
  }

  /** Send error log message to live WebSocket clients */
  public async error(message: string): Promise<void> {
    this.addLog('error', message)
  }

  /** Send success log message to live WebSocket clients */
  public async success(message: string): Promise<void> {
    this.addLog('success', message)
  }

  /** Report progress step (current / total) with active status message */
  public async report_progress(current: number, total: number = 100, message?: string): Promise<void> {
    this.currentProgress = current
    this.totalProgress = total
    const percentage = Math.round((current / total) * 100)

    if (message) {
      this.addLog('info', `[${percentage}%] ${message}`)
    }

    const io = getSocketServer()
    if (io) {
      io.emit('task:progress', {
        taskId: this.taskId,
        taskName: this.taskName,
        current,
        total,
        percentage,
        message: message || '',
        timestamp: new Date().toISOString(),
      })
    }
  }

  private addLog(level: 'info' | 'warn' | 'error' | 'success', message: string): void {
    const logItem: ProgressLog = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
    }
    this.logs.push(logItem)

    console.log(`[TaskLog][${this.taskName}][${level.toUpperCase()}] ${message}`)

    const io = getSocketServer()
    if (io) {
      io.emit('task:log', {
        taskId: this.taskId,
        taskName: this.taskName,
        log: logItem,
      })
    }
  }

  /** Mark long-running task as 100% completed */
  public async complete(finalMessage: string = 'Task completed successfully'): Promise<void> {
    await this.report_progress(this.totalProgress, this.totalProgress, finalMessage)
    await this.success(finalMessage)

    const io = getSocketServer()
    if (io) {
      io.emit('task:completed', {
        taskId: this.taskId,
        taskName: this.taskName,
        message: finalMessage,
        timestamp: new Date().toISOString(),
      })
    }
  }
}
