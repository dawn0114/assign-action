import * as github from '@actions/github'
import * as core from '@actions/core'
import { Context } from '@actions/github/lib/context'

interface Label {
  color: string
  default: boolean
  description: string
  name: string
  node_id: string
  url: string
}

export class PullRequest {
  private client: github.GitHub
  private context: Context

  constructor(client: github.GitHub, context: Context) {
    this.client = client
    this.context = context
  }

  async addReviewers(reviewers: string[]): Promise<void> {
    const { owner, repo, number: pull_number } = this.context.issue
    const result = await this.client.pulls.createReviewRequest({
      owner,
      repo,
      pull_number,
      reviewers,
    })
    core.debug(JSON.stringify(result))
  }

  async addAssignees(assignees: string[]): Promise<void> {
    const { owner, repo, number: issue_number } = this.context.issue
    const result = await this.client.issues.addAssignees({
      owner,
      repo,
      issue_number,
      assignees,
    })
    core.debug(JSON.stringify(result))
  }

  hasAnyLabel(labels: string[]): boolean {
    if (!this.context.payload.pull_request) {
      return false
    }
    const { labels: pullRequestLabels = [] } = this.context.payload.pull_request
    return pullRequestLabels.some(label => labels.includes(label.name))
  }

  getLabels(): string[] {
    let labelStringArray: string[] = []
    if (!this.context.payload.pull_request) {
      return []
    }
    const labels: Label[] = this.context.payload.pull_request.labels
    for (const label of labels) {
      core.info(`pr label name : ${label.name}`)
      labelStringArray.push(label.name)
    }
    return labelStringArray
  }
}
