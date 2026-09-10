const fail = (code, statusCode) => Object.assign(new Error(code), { code, statusCode })
const allowedReasons = new Set(['fake', 'harassment', 'sexual', 'scam', 'minor', 'child_safety', 'other'])

export default class SafetyService {
  constructor(repository) { this.repository = repository }

  async createReport(reporterUserId, input = {}) {
    const reportedUserId = Number(input.reportedUserId)
    const reasonCode = typeof input.reasonCode === 'string' ? input.reasonCode.trim() : ''
    const note = typeof input.note === 'string' ? input.note.trim() : ''
    if (!Number.isInteger(reportedUserId) || reportedUserId <= 0 || reportedUserId === Number(reporterUserId)) throw fail('INVALID_REPORTED_USER', 400)
    if (!allowedReasons.has(reasonCode) || Array.from(note).length > 500) throw fail('INVALID_SAFETY_REPORT', 400)
    if (!(await this.repository.userExists(reportedUserId))) throw fail('USER_NOT_FOUND', 404)
    return this.repository.createReport(Number(reporterUserId), reportedUserId, reasonCode, note)
  }
}
